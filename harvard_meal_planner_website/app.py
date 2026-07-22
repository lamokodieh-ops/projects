# FeedMe (Harvard Meal Planner) - CS50 Final Project
# A web-based meal planning app with Harvard HUDS dining integration
# See README.md for usage and DESIGN.md for technical details


# IMPORTS

# Flask web framework and utilities
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify, make_response

# Password hashing for secure authentication
from werkzeug.security import generate_password_hash, check_password_hash

# SQLite database interface
import sqlite3

# Operating system utilities (for random key generation)
import os

# Date and time handling
from datetime import datetime, timedelta

# Decorator utilities (for preserving function metadata)
from functools import wraps

# HTTP requests library (for HUDS menu scraping)
import requests

# HTML parsing library (for extracting menu items from HUDS website)
from bs4 import BeautifulSoup

# Validation by checking patterns
import re


# APPLICATION CONFIGURATION

# Initialize Flask application
app = Flask(__name__)

# Secret key for session encryption (set SECRET_KEY in production)
app.secret_key = os.environ.get("SECRET_KEY", "dev-only-change-me")

# SQLite database file path
DATABASE = 'meal_planner.db'


# VALIDATION HELPER FUNCTIONS

def is_valid_email(email):
    # Check if email matches standard format (user@domain.tld)
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def is_valid_username(username):
    # Validate: 3-20 chars, alphanumeric + underscore, must start with letter
    if len(username) < 3:
        return False, "Username must be at least 3 characters long."
    if len(username) > 20:
        return False, "Username cannot be longer than 20 characters."
    if not username[0].isalpha():
        return False, "Username must start with a letter."
    if not re.match(r'^[a-zA-Z][a-zA-Z0-9_]*$', username):
        return False, "Username can only contain letters, numbers, and underscores."
    return True, None

def validate_password(password):
    # Check password meets minimum length requirement
    if len(password) < 6:
        return False, "Password must be at least 6 characters long."
    return True, None

# DATABASE HELPER FUNCTIONS

def get_db():
    # Create database connection with Row factory for dict-like access
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    # Create all tables and run schema migrations
    conn = get_db()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            notifications_enabled INTEGER DEFAULT 1
        )
    ''')
    
    # Meals table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS meals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            meal_type TEXT NOT NULL,
            meal_name TEXT NOT NULL,
            meal_date DATE NOT NULL,
            description TEXT,
            is_favorite INTEGER DEFAULT 0,
            rating INTEGER DEFAULT 0,
            feedback TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # HUDS Menu table (cache for scraped menus)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS huds_menu (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            location TEXT NOT NULL,
            meal_type TEXT NOT NULL,
            item_name TEXT NOT NULL,
            menu_date DATE NOT NULL,
            category TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Favorite HUDS Items table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS favorite_huds_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            item_name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(user_id, item_name)
        )
    ''')
    
    # Notifications table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            notification_type TEXT DEFAULT 'info',
            is_read INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Schema migrations (add columns if they don't exist)
    try:
        cursor.execute('ALTER TABLE meals ADD COLUMN is_favorite INTEGER DEFAULT 0')
    except sqlite3.OperationalError:
        pass  # Column already exists, ignore the error
    
    try:
        cursor.execute('ALTER TABLE meals ADD COLUMN rating INTEGER DEFAULT 0')
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute('ALTER TABLE meals ADD COLUMN feedback TEXT')
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute('ALTER TABLE users ADD COLUMN notifications_enabled INTEGER DEFAULT 1')
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute('ALTER TABLE meals ADD COLUMN is_eaten INTEGER DEFAULT 0')
    except sqlite3.OperationalError:
        pass
    
    conn.commit()
    conn.close()

# AUTHENTICATION DECORATOR

def login_required(f):
    # Decorator that redirects to login if user is not authenticated
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# ROUTES - PUBLIC (No authentication required)

@app.route('/')
def index():
    # Home page - redirect to dashboard if logged in, else to login
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    # User registration with validation
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        
        # Check for empty fields with specific messages
        if not username:
            flash('Please enter a username.', 'error')
            return render_template('register.html')
        
        if not email:
            flash('Please enter your email address.', 'error')
            return render_template('register.html')
        
        if not password:
            flash('Please enter a password.', 'error')
            return render_template('register.html')
        
        if not confirm_password:
            flash('Please confirm your password.', 'error')
            return render_template('register.html')
        
        # Validate username format
        is_valid, error_msg = is_valid_username(username)
        if not is_valid:
            flash(error_msg, 'error')
            return render_template('register.html')
        
        # Validate email format
        if not is_valid_email(email):
            flash('Please enter a valid email address (e.g., user@example.com).', 'error')
            return render_template('register.html')
        
        # Validate password
        is_valid, error_msg = validate_password(password)
        if not is_valid:
            flash(error_msg, 'error')
            return render_template('register.html')
        
        # Check passwords match
        if password != confirm_password:
            flash('Passwords do not match. Please try again.', 'error')
            return render_template('register.html')
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if username already exists
        cursor.execute('SELECT id FROM users WHERE username = ?', (username,))
        if cursor.fetchone():
            flash(f'The username "{username}" is already taken. Please choose another.', 'error')
            conn.close()
            return render_template('register.html')
        
        # Check if email already exists
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        if cursor.fetchone():
            flash('An account with this email already exists. Try logging in instead.', 'error')
            conn.close()
            return render_template('register.html')
        
        # Create new user
        password_hash = generate_password_hash(password)
        cursor.execute(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            (username, email, password_hash)
        )
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        
        session['user_id'] = user_id
        session['username'] = username
        flash(f'Welcome, {username}! Your account has been created successfully.', 'success')
        return redirect(url_for('dashboard'))
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    # User login (generic error message for security)
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        
        # Check for empty fields with specific messages
        if not username:
            flash('Please enter your username.', 'error')
            return render_template('login.html')
        
        if not password:
            flash('Please enter your password.', 'error')
            return render_template('login.html')
        
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT id, username, password_hash FROM users WHERE username = ?', (username,))
        user = cursor.fetchone()
        conn.close()
        
        if user and check_password_hash(user['password_hash'], password):
            session['user_id'] = user['id']
            session['username'] = user['username']
            flash(f'Welcome back, {user["username"]}!', 'success')
            return redirect(url_for('dashboard'))
        else:
            # Generic message for security (don't reveal if username exists)
            flash('Incorrect username or password. Please check your credentials and try again.', 'error')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    # Clear session and redirect to login
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('login'))

# ROUTES - PROTECTED (Authentication required)

@app.route('/dashboard')
@login_required
def dashboard():
    # Main dashboard - displays weekly meal plan (Sun-Sat)
    user_id = session['user_id']
    
    # Get current week's dates (Sunday to Saturday)
    today = datetime.now().date()
    # weekday() returns 0=Monday, so Sunday is 6. We want to start from Sunday.
    days_since_sunday = (today.weekday() + 1) % 7
    start_of_week = today - timedelta(days=days_since_sunday)
    week_dates = [start_of_week + timedelta(days=i) for i in range(7)]
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Get meals for the week, organized by date and meal type
    meals_by_date_type = {}
    meal_types = ['breakfast', 'lunch', 'dinner', 'brunch', 'snacks']
    
    for date in week_dates:
        meals_by_date_type[date] = {}
        for meal_type in meal_types:
            cursor.execute('''
                SELECT id, meal_type, meal_name, description, is_favorite, rating, is_eaten
                FROM meals
                WHERE user_id = ? AND meal_date = ? AND meal_type = ?
                ORDER BY created_at
            ''', (user_id, date, meal_type))
            meals_by_date_type[date][meal_type] = cursor.fetchall()
    
    # Get unread notifications count
    cursor.execute('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0', (user_id,))
    unread_count = cursor.fetchone()['count']
    
    conn.close()
    
    return render_template('dashboard.html', 
                         week_dates=week_dates, 
                         meals_by_date_type=meals_by_date_type,
                         meal_types=meal_types,
                         unread_count=unread_count)

@app.route('/add_meal', methods=['GET', 'POST'])
@login_required
def add_meal():
    # Add a new meal with validation
    if request.method == 'POST':
        meal_type = request.form.get('meal_type', '').strip()
        meal_name = request.form.get('meal_name', '').strip()
        meal_date = request.form.get('meal_date', '').strip()
        description = request.form.get('description', '').strip()
        is_favorite = 1 if request.form.get('is_favorite') else 0
        rating = int(request.form.get('rating', 0))
        
        # Specific validation messages
        if not meal_type:
            flash('Please select a meal type (breakfast, lunch, dinner, etc.).', 'error')
            return redirect(url_for('add_meal'))
        
        if not meal_name:
            flash('Please enter a name for your meal.', 'error')
            return redirect(url_for('add_meal'))
        
        if len(meal_name) > 100:
            flash('Meal name is too long. Please keep it under 100 characters.', 'error')
            return redirect(url_for('add_meal'))
        
        if not meal_date:
            flash('Please select a date for this meal.', 'error')
            return redirect(url_for('add_meal'))
        
        # Validate rating is within range
        if rating < 0 or rating > 5:
            rating = 0
        
        user_id = session['user_id']
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO meals (user_id, meal_type, meal_name, meal_date, description, is_favorite, rating)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (user_id, meal_type, meal_name, meal_date, description, is_favorite, rating))
        
        conn.commit()
        conn.close()
        
        flash(f'"{meal_name}" has been added to your {meal_type} plan!', 'success')
        return redirect(url_for('dashboard'))
    
    # Get pre-filled values from query parameters
    default_date = request.args.get('date', datetime.now().date().isoformat())
    default_meal_type = request.args.get('meal_type', '')
    default_meal_name = request.args.get('meal_name', '')
    meal_types = ['breakfast', 'lunch', 'dinner', 'brunch', 'snacks']
    
    return render_template('add_meal.html', 
                         default_date=default_date, 
                         default_meal_type=default_meal_type,
                         default_meal_name=default_meal_name,
                         meal_types=meal_types)

@app.route('/add_multiple_meals', methods=['POST'])
@login_required
def add_multiple_meals():
    # Add multiple meals at once from HUDS menu (AJAX)
    user_id = session['user_id']
    
    # Get JSON data from request
    data = request.get_json()
    
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'})
    
    items = data.get('items', [])
    meal_type = data.get('meal_type', '')
    meal_date = data.get('meal_date', datetime.now().date().isoformat())
    
    # Validate inputs
    if not items:
        return jsonify({'success': False, 'error': 'No items selected'})
    
    if not meal_type:
        return jsonify({'success': False, 'error': 'No meal type specified'})
    
    valid_meal_types = ['breakfast', 'lunch', 'dinner', 'brunch', 'snacks']
    if meal_type not in valid_meal_types:
        return jsonify({'success': False, 'error': 'Invalid meal type'})
    
    # Add all meals to database
    conn = get_db()
    cursor = conn.cursor()
    
    count = 0
    for item_name in items:
        cursor.execute('''
            INSERT INTO meals (user_id, meal_type, meal_name, meal_date, description, is_favorite, rating)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (user_id, meal_type, item_name, meal_date, '', 0, 0))
        count += 1
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'count': count})

@app.route('/edit_meal/<int:meal_id>', methods=['GET', 'POST'])
@login_required
def edit_meal(meal_id):
    # Edit an existing meal
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()
    
    # Get meal and verify ownership
    cursor.execute('SELECT * FROM meals WHERE id = ? AND user_id = ?', (meal_id, user_id))
    meal = cursor.fetchone()
    
    if not meal:
        conn.close()
        flash('Meal not found or you don\'t have permission to edit it.', 'error')
        return redirect(url_for('dashboard'))
    
    if request.method == 'POST':
        meal_type = request.form.get('meal_type', '').strip()
        meal_name = request.form.get('meal_name', '').strip()
        meal_date = request.form.get('meal_date', '').strip()
        description = request.form.get('description', '').strip()
        is_favorite = 1 if request.form.get('is_favorite') else 0
        rating = int(request.form.get('rating', 0))
        feedback = request.form.get('feedback', '').strip()
        
        # Specific validation messages
        if not meal_type:
            flash('Please select a meal type.', 'error')
            conn.close()
            return redirect(url_for('edit_meal', meal_id=meal_id))
        
        if not meal_name:
            flash('Please enter a name for your meal.', 'error')
            conn.close()
            return redirect(url_for('edit_meal', meal_id=meal_id))
        
        if len(meal_name) > 100:
            flash('Meal name is too long. Please keep it under 100 characters.', 'error')
            conn.close()
            return redirect(url_for('edit_meal', meal_id=meal_id))
        
        if not meal_date:
            flash('Please select a date for this meal.', 'error')
            conn.close()
            return redirect(url_for('edit_meal', meal_id=meal_id))
        
        # Validate rating is within range
        if rating < 0 or rating > 5:
            rating = 0
        
        cursor.execute('''
            UPDATE meals
            SET meal_type = ?, meal_name = ?, meal_date = ?, description = ?, 
                is_favorite = ?, rating = ?, feedback = ?
            WHERE id = ? AND user_id = ?
        ''', (meal_type, meal_name, meal_date, description, is_favorite, rating, feedback, meal_id, user_id))
        
        conn.commit()
        conn.close()
        
        flash(f'"{meal_name}" has been updated!', 'success')
        return redirect(url_for('dashboard'))
    
    conn.close()
    meal_types = ['breakfast', 'lunch', 'dinner', 'brunch', 'snacks']
    
    return render_template('edit_meal.html', meal=meal, meal_types=meal_types)

@app.route('/delete_meal/<int:meal_id>', methods=['POST'])
@login_required
def delete_meal(meal_id):
    # Delete a meal
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()
    
    # Get meal name before deleting for better feedback
    cursor.execute('SELECT meal_name FROM meals WHERE id = ? AND user_id = ?', (meal_id, user_id))
    meal = cursor.fetchone()
    
    if meal:
        cursor.execute('DELETE FROM meals WHERE id = ? AND user_id = ?', (meal_id, user_id))
        conn.commit()
        flash(f'"{meal["meal_name"]}" has been removed from your meal plan.', 'success')
    else:
        flash('Meal not found or you don\'t have permission to delete it.', 'error')
    
    conn.close()
    return redirect(url_for('dashboard'))

@app.route('/toggle_favorite/<int:meal_id>', methods=['POST'])
@login_required
def toggle_favorite(meal_id):
    # Toggle favorite status of a meal
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('SELECT is_favorite FROM meals WHERE id = ? AND user_id = ?', (meal_id, user_id))
    meal = cursor.fetchone()
    
    if meal:
        new_status = 0 if meal['is_favorite'] else 1
        cursor.execute('UPDATE meals SET is_favorite = ? WHERE id = ? AND user_id = ?', 
                      (new_status, meal_id, user_id))
        conn.commit()
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            conn.close()
            return jsonify({'success': True, 'is_favorite': new_status})
    
    conn.close()
    return redirect(request.referrer or url_for('dashboard'))

@app.route('/rate_meal/<int:meal_id>', methods=['POST'])
@login_required
def rate_meal(meal_id):
    # Rate a meal (0-5 stars)
    user_id = session['user_id']
    rating = int(request.form.get('rating', 0))
    
    if rating < 0 or rating > 5:
        rating = 0
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('UPDATE meals SET rating = ? WHERE id = ? AND user_id = ?', 
                  (rating, meal_id, user_id))
    conn.commit()
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        conn.close()
        return jsonify({'success': True, 'rating': rating})
    
    conn.close()
    flash('Rating updated!', 'success')
    return redirect(request.referrer or url_for('dashboard'))

@app.route('/toggle_eaten/<int:meal_id>', methods=['POST'])
@login_required
def toggle_eaten(meal_id):
    # Toggle eaten status of a meal
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('SELECT is_eaten FROM meals WHERE id = ? AND user_id = ?', (meal_id, user_id))
    meal = cursor.fetchone()
    
    if meal:
        new_status = 0 if meal['is_eaten'] else 1
        cursor.execute('UPDATE meals SET is_eaten = ? WHERE id = ? AND user_id = ?', 
                      (new_status, meal_id, user_id))
        conn.commit()
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            conn.close()
            return jsonify({'success': True, 'is_eaten': new_status})
    
    conn.close()
    return redirect(request.referrer or url_for('dashboard'))

@app.route('/history')
@login_required
def history():
    # View meal history
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()
    
    # Get all meals ordered by date (most recent first)
    cursor.execute('''
        SELECT id, meal_type, meal_name, meal_date, description, is_favorite, rating, feedback, created_at
        FROM meals
        WHERE user_id = ?
        ORDER BY meal_date DESC, created_at DESC
        LIMIT 100
    ''', (user_id,))
    
    meals = cursor.fetchall()
    conn.close()
    
    return render_template('history.html', meals=meals)

@app.route('/favorites')
@login_required
def favorites():
    # View favorite meals
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, meal_type, meal_name, meal_date, description, rating, feedback
        FROM meals
        WHERE user_id = ? AND is_favorite = 1
        ORDER BY meal_name
    ''', (user_id,))
    
    meals = cursor.fetchall()
    conn.close()
    
    return render_template('favorites.html', meals=meals)

# STATISTICS AND ANALYTICS

@app.route('/statistics')
@login_required
def statistics():
    # Display eating habits and statistics (only counts eaten meals)
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()
    
    # Total meals (only eaten meals count for statistics)
    cursor.execute('SELECT COUNT(*) as count FROM meals WHERE user_id = ? AND is_eaten = 1', (user_id,))
    total_meals = cursor.fetchone()['count']
    
    # Meals by type (only eaten)
    cursor.execute('''
        SELECT meal_type, COUNT(*) as count
        FROM meals
        WHERE user_id = ? AND is_eaten = 1
        GROUP BY meal_type
        ORDER BY count DESC
    ''', (user_id,))
    meals_by_type = cursor.fetchall()
    
    # Top rated meals (only eaten)
    cursor.execute('''
        SELECT meal_name, rating, COUNT(*) as times_eaten
        FROM meals
        WHERE user_id = ? AND is_eaten = 1 AND rating > 0
        GROUP BY meal_name
        ORDER BY rating DESC, times_eaten DESC
        LIMIT 10
    ''', (user_id,))
    top_rated = cursor.fetchall()
    
    # Most frequent meals (only eaten)
    cursor.execute('''
        SELECT meal_name, COUNT(*) as count, AVG(rating) as avg_rating
        FROM meals
        WHERE user_id = ? AND is_eaten = 1
        GROUP BY meal_name
        ORDER BY count DESC
        LIMIT 10
    ''', (user_id,))
    most_frequent = cursor.fetchall()
    
    # Meals per day of week (only eaten) - Sunday to Saturday order
    cursor.execute('''
        SELECT 
            CASE CAST(strftime('%w', meal_date) AS INTEGER)
                WHEN 0 THEN 'Sunday'
                WHEN 1 THEN 'Monday'
                WHEN 2 THEN 'Tuesday'
                WHEN 3 THEN 'Wednesday'
                WHEN 4 THEN 'Thursday'
                WHEN 5 THEN 'Friday'
                WHEN 6 THEN 'Saturday'
            END as day_name,
            CAST(strftime('%w', meal_date) AS INTEGER) as day_num,
            COUNT(*) as count
        FROM meals
        WHERE user_id = ? AND is_eaten = 1
        GROUP BY strftime('%w', meal_date)
        ORDER BY day_num
    ''', (user_id,))
    meals_by_day = cursor.fetchall()
    
    # Average rating (only eaten)
    cursor.execute('''
        SELECT AVG(rating) as avg_rating
        FROM meals
        WHERE user_id = ? AND is_eaten = 1 AND rating > 0
    ''', (user_id,))
    avg_rating_row = cursor.fetchone()
    avg_rating = round(avg_rating_row['avg_rating'], 1) if avg_rating_row['avg_rating'] else 0
    
    # Favorite count (only eaten)
    cursor.execute('SELECT COUNT(*) as count FROM meals WHERE user_id = ? AND is_eaten = 1 AND is_favorite = 1', (user_id,))
    favorite_count = cursor.fetchone()['count']
    
    # Recent activity (last 30 days, only eaten)
    cursor.execute('''
        SELECT DATE(meal_date) as date, COUNT(*) as count
        FROM meals
        WHERE user_id = ? AND is_eaten = 1 AND meal_date >= DATE('now', '-30 days')
        GROUP BY DATE(meal_date)
        ORDER BY date
    ''', (user_id,))
    recent_activity = cursor.fetchall()
    
    conn.close()
    
    return render_template('statistics.html',
                         total_meals=total_meals,
                         meals_by_type=meals_by_type,
                         top_rated=top_rated,
                         most_frequent=most_frequent,
                         meals_by_day=meals_by_day,
                         avg_rating=avg_rating,
                         favorite_count=favorite_count,
                         recent_activity=recent_activity)

@app.route('/huds_menu')
@login_required
def huds_menu():
    # View HUDS dining hall menu
    user_id = session['user_id']
    selected_date = request.args.get('date', datetime.now().date().isoformat())
    selected_location = request.args.get('location', 'all')
    selected_meal = request.args.get('meal_type', 'all')
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Build query based on filters
    query = 'SELECT * FROM huds_menu WHERE menu_date = ?'
    params = [selected_date]
    
    if selected_location != 'all':
        query += ' AND location = ?'
        params.append(selected_location)
    
    if selected_meal != 'all':
        query += ' AND meal_type = ?'
        params.append(selected_meal)
    
    query += '''
        ORDER BY 
            location,
            CASE meal_type
                WHEN 'breakfast' THEN 1
                WHEN 'lunch' THEN 2
                WHEN 'dinner' THEN 3
                ELSE 4
            END,
            category,
            item_name
    '''
    
    cursor.execute(query, params)
    menu_items = cursor.fetchall()
    
    # Get user's favorite HUDS items
    cursor.execute('SELECT item_name FROM favorite_huds_items WHERE user_id = ?', (user_id,))
    favorite_items = [row['item_name'] for row in cursor.fetchall()]
    
    # Get unique locations and meal types for filters
    cursor.execute('SELECT DISTINCT location FROM huds_menu ORDER BY location')
    locations = [row['location'] for row in cursor.fetchall()]
    
    conn.close()
    
    # Group menu items by location and meal type
    grouped_menu = {}
    for item in menu_items:
        loc = item['location']
        meal = item['meal_type']
        if loc not in grouped_menu:
            grouped_menu[loc] = {}
        if meal not in grouped_menu[loc]:
            grouped_menu[loc][meal] = []
        grouped_menu[loc][meal].append(item)
    
    return render_template('huds_menu.html',
                         grouped_menu=grouped_menu,
                         favorite_items=favorite_items,
                         selected_date=selected_date,
                         selected_location=selected_location,
                         selected_meal=selected_meal,
                         locations=locations)



# HUDS MENU SCRAPING

@app.route('/scrape_huds', methods=['POST'])
@login_required
def scrape_huds():
    # Scrape HUDS menu from Harvard dining website for next 7 days
    
    # Configuration for dining halls to scrape
    # Location 30 = Annenberg (the freshman dining hall)
    # Additional locations can be added here (e.g., upperclassman houses)
    locations_config = [
        {'name': 'Annenberg', 'locationNum': '30'},
    ]
    
    today = datetime.now().date()
    menu_items_to_add = []
    base_url = "https://www.foodpro.huds.harvard.edu/foodpro/"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
    }
    
    def is_valid_food_item(text):
        # Filter out non-food text (navigation, copyright, serving sizes, etc.)
        if not text or len(text) < 3 or len(text) > 100:
            return False
        
        # Skip non-food text - patterns to filter out
        skip_patterns = [
            'select a', 'click here', 'subject to change', 'copyright', 
            'consumer responsibility', 'legend -', 'carbon footprint',
            'harvard university', 'dining services', 'no data available',
            'return to', 'back to', 'week\'s menus', '.gif', '.png',
            'breakfast menu', 'lunch menu', 'dinner menu', 'menus subject', 
            'accessibility', 'digital accessibility', 'info practices',
            'vegan', 'vegetarian', 'halal',
        ]
        text_lower = text.lower()
        if any(skip in text_lower for skip in skip_patterns):
            return False
        
        # Skip lines that look like category headers (all caps with dashes)
        stripped = text.strip()
        if (
            stripped.startswith(('-', '–')) and stripped.endswith(('-', '–'))
            and 'menu' not in text_lower
        ):
            return False
        if text.isupper() and ' ' in text and 'menu' not in text_lower:
            # Likely a category name like "BREAKFAST ENTREES"
            return False

        # Skip serving sizes like "3 OZ", "1/2 Cup" (but only if that's the whole item)
        if any(text_lower.endswith(u) for u in [' oz', ' cup', ' each', ' tbsp', ' tsp']):
            if len(text.split()) <= 2:
                return False
        
        # Skip pure numbers
        if text.replace(' ', '').replace('/', '').replace('.', '').isdigit():
            return False
        
        return True
    
    # Scrape menu for next 7 days
    for day_offset in range(7):
        menu_date = today + timedelta(days=day_offset)
        date_str = menu_date.strftime('%m/%d/%Y')
        date_encoded = date_str.replace('/', '%2f')
        
        for loc_config in locations_config:
            location_name = loc_config['name']
            location_num = loc_config['locationNum']
            
            # Fetch the 3-column page
            main_url = f"{base_url}shtmenu.aspx?sName=HARVARD+UNIVERSITY+DINING+SERVICES&locationNum={location_num}&locationName=Dining+Hall&naFlag=1&WeeksMenus=This+Week%27s+Menus&myaction=read&dtdate={date_encoded}"
            
            try:
                response = requests.get(main_url, headers=headers, timeout=30)
                if response.status_code != 200:
                    continue
                
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Get all text content and parse sequentially
                # The page structure: Breakfast Menu header, then items, then Lunch Menu header, then items, etc.
                full_text = soup.get_text('\n', strip=True)
                lines = full_text.split('\n')
                
                current_meal = None
                current_category = 'Entrees'
                items_by_meal = {'breakfast': [], 'lunch': [], 'dinner': []}
                
                for line in lines:
                    line = line.strip()
                    if not line:
                        continue
                    
                    line_lower = line.lower()
                    
                    # Detect meal type transitions
                    if 'breakfast menu' in line_lower:
                        current_meal = 'breakfast'
                        current_category = 'Entrees'
                        continue
                    elif 'lunch menu' in line_lower:
                        current_meal = 'lunch'
                        current_category = 'Entrees'
                        continue
                    elif 'dinner menu' in line_lower:
                        current_meal = 'dinner'
                        current_category = 'Entrees'
                        continue
                    
                    if not current_meal:
                        continue
                    
                    # Category headers: lines like "– BREAKFAST ENTREES –" or "-- BREAKFAST ENTREES --"
                    stripped = line.strip()
                    if (
                        (stripped.startswith(('-', '–')) and stripped.endswith(('-', '–')))
                        and 'menu' not in line_lower
                        and len(stripped) < 60
                    ):
                        # Clean off dashes and spaces
                        cleaned = stripped.strip('-- ').strip()
                        current_category = cleaned.title()
                        continue
                    
                    # Check if valid food item
                    item_name = line.replace('\xa0', ' ')
                    item_name = ' '.join(item_name.split())
                    
                    if is_valid_food_item(item_name):
                    # Decide which meal this item should belong to
                        meal_for_item = current_meal
                        cat_lower = (current_category or '').lower()

                        # Brain Break items should count as LUNCH
                        if cat_lower == 'brain break':
                            meal_for_item = 'lunch'

                        # (Optional) If you still want “Breakfast Entrees/Meats”
                        # that appear under Lunch to count as breakfast instead:
                        if meal_for_item == 'lunch' and 'breakfast' in cat_lower:
                            meal_for_item = 'breakfast'

                        items_by_meal[meal_for_item].append({
                            'location': location_name,
                            'meal_type': meal_for_item,
                            'item_name': item_name,
                            'menu_date': menu_date,
                            'category': current_category
                        })
                
                # Add items from each meal type
                for meal_type in ['breakfast', 'lunch', 'dinner']:
                    menu_items_to_add.extend(items_by_meal[meal_type])
                
            except Exception:
                continue
    
    # Now do the database operations in one go
    conn = get_db()
    cursor = conn.cursor()
    
    # Clear old menu data
    cursor.execute('DELETE FROM huds_menu')
    
    # Insert all collected items (dedupe by checking before insert)
    items_added = 0
    seen = set()
    
    for item in menu_items_to_add:
        key = (item['location'], item['meal_type'], item['item_name'], str(item['menu_date']))
        if key not in seen:
            seen.add(key)
            cursor.execute('''
                INSERT INTO huds_menu (location, meal_type, item_name, menu_date, category)
                VALUES (?, ?, ?, ?, ?)
            ''', (item['location'], item['meal_type'], item['item_name'], item['menu_date'], item['category']))
            items_added += 1
    
    conn.commit()
    conn.close()
    
    if items_added > 0:
        flash(f'HUDS menu refreshed! Added {items_added} menu items.', 'success')
    else:
        flash('Could not fetch menu items. The dining website may be unavailable.', 'warning')
    
    return redirect(url_for('huds_menu'))

@app.route('/toggle_huds_favorite/<item_name>', methods=['POST'])
@login_required
def toggle_huds_favorite(item_name):
    # Toggle a HUDS item as favorite
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if already favorite
    cursor.execute('SELECT id FROM favorite_huds_items WHERE user_id = ? AND item_name = ?', 
                  (user_id, item_name))
    existing = cursor.fetchone()
    
    if existing:
        cursor.execute('DELETE FROM favorite_huds_items WHERE user_id = ? AND item_name = ?', 
                      (user_id, item_name))
        is_favorite = False
    else:
        cursor.execute('INSERT INTO favorite_huds_items (user_id, item_name) VALUES (?, ?)', 
                      (user_id, item_name))
        is_favorite = True
    
    conn.commit()
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        conn.close()
        return jsonify({'success': True, 'is_favorite': is_favorite})
    
    conn.close()
    return redirect(request.referrer or url_for('huds_menu'))

@app.route('/notifications')
@login_required
def notifications():
    # View user notifications (marks all as read)
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, message, notification_type, is_read, created_at
        FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 50
    ''', (user_id,))
    
    notifications_list = cursor.fetchall()
    
    # Mark all as read
    cursor.execute('UPDATE notifications SET is_read = 1 WHERE user_id = ?', (user_id,))
    conn.commit()
    conn.close()
    
    return render_template('notifications.html', notifications=notifications_list)


# NOTIFICATION SYSTEM

# Check if favorite HUDS items are available today
@app.route('/check_huds_favorites')
@login_required
def check_huds_favorites():

    user_id = session['user_id']
    today = datetime.now().date().isoformat()
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if user has notifications enabled
    cursor.execute('SELECT notifications_enabled FROM users WHERE id = ?', (user_id,))
    user = cursor.fetchone()
    
    if not user or not user['notifications_enabled']:
        conn.close()
        return jsonify({'notifications': 0})
    
    # Find favorite items available today
    cursor.execute('''
        SELECT DISTINCT h.item_name, h.location, h.meal_type
        FROM huds_menu h
        INNER JOIN favorite_huds_items f ON h.item_name = f.item_name
        WHERE f.user_id = ? AND h.menu_date = ?
    ''', (user_id, today))
    
    available_favorites = cursor.fetchall()
    new_notifications = 0
    
    for item in available_favorites:
        # Check if notification already exists for this item today
        cursor.execute('''
            SELECT id FROM notifications
            WHERE user_id = ? AND message LIKE ? AND DATE(created_at) = DATE('now')
        ''', (user_id, f'%{item["item_name"]}%'))
        
        if not cursor.fetchone():
            message = f"🍽️ Your favorite '{item['item_name']}' is available at {item['location']} for {item['meal_type']} today!"
            cursor.execute('''
                INSERT INTO notifications (user_id, message, notification_type)
                VALUES (?, ?, 'huds_favorite')
            ''', (user_id, message))
            new_notifications += 1
    
    conn.commit()
    conn.close()
    
    return jsonify({'notifications': new_notifications})

# Settings (enable/disable notifications)
@app.route('/settings', methods=['GET', 'POST'])
@login_required
def settings():
    # User settings page
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()
    
    if request.method == 'POST':
        notifications_enabled = 1 if request.form.get('notifications_enabled') else 0
        
        cursor.execute('UPDATE users SET notifications_enabled = ? WHERE id = ?', 
                      (notifications_enabled, user_id))
        conn.commit()
        
        if notifications_enabled:
            flash('Settings saved! You\'ll be notified when your favorite HUDS items are available.', 'success')
        else:
            flash('Settings saved! HUDS notifications have been turned off.', 'success')
    
    cursor.execute('SELECT username, email, notifications_enabled FROM users WHERE id = ?', (user_id,))
    user = cursor.fetchone()
    
    # Get favorite HUDS items
    cursor.execute('SELECT item_name FROM favorite_huds_items WHERE user_id = ? ORDER BY item_name', (user_id,))
    favorite_huds = cursor.fetchall()
    
    conn.close()
    
    return render_template('settings.html', 
                         notifications_enabled=user['notifications_enabled'],
                         username=user['username'],
                         email=user['email'],
                         favorite_huds=favorite_huds)

        
 # Clear Notifications
@app.route('/clear_notifications', methods=['POST'])
@login_required
def clear_notifications():
    # Clear all notifications
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()
    
    # Get count before deleting for better feedback
    cursor.execute('SELECT COUNT(*) as count FROM notifications WHERE user_id = ?', (user_id,))
    count = cursor.fetchone()['count']
    
    cursor.execute('DELETE FROM notifications WHERE user_id = ?', (user_id,))
    conn.commit()
    conn.close()
    
    if count > 0:
        flash(f'Cleared {count} notification{"s" if count != 1 else ""}. You\'re all caught up!', 'info')
    else:
        flash('No notifications to clear.', 'info')
    return redirect(url_for('notifications'))


# Delete a single notification
@app.route('/delete_notification/<int:notification_id>', methods=['POST'])
@login_required
def delete_notification(notification_id):
    
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()
    
    # Delete only if the notification belongs to the current user
    cursor.execute('DELETE FROM notifications WHERE id = ? AND user_id = ?', 
                  (notification_id, user_id))
    conn.commit()
    
    success = cursor.rowcount > 0
    conn.close()
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({'success': success})
    
    if success:
        flash('Notification deleted.', 'info')
    return redirect(url_for('notifications'))


# Delete multiple notifications at once
@app.route('/delete_multiple_notifications', methods=['POST'])
@login_required
def delete_multiple_notifications():

    user_id = session['user_id']
    
    # Get JSON data from request
    data = request.get_json()
    
    if not data or 'notification_ids' not in data:
        return jsonify({'success': False, 'error': 'No notifications specified'})
    
    notification_ids = data.get('notification_ids', [])
    
    if not notification_ids:
        return jsonify({'success': False, 'error': 'No notifications selected'})
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Delete each notification 
    deleted_count = 0
    for notification_id in notification_ids:
        cursor.execute('DELETE FROM notifications WHERE id = ? AND user_id = ?', 
                      (notification_id, user_id))
        deleted_count += cursor.rowcount
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'deleted_count': deleted_count})


# Export all meal feedback to a text file
@app.route('/export_feedback')
@login_required
def export_feedback():
    
    user_id = session['user_id']
    conn = get_db()
    cursor = conn.cursor()
    
    # Get all meals with feedback
    cursor.execute('''
        SELECT meal_name, meal_date, meal_type, feedback, rating
        FROM meals
        WHERE user_id = ? AND feedback IS NOT NULL AND feedback != ''
        ORDER BY meal_date DESC
    ''', (user_id,))
    meals_with_feedback = cursor.fetchall()
    conn.close()
    
    # Build the text content
    lines = []
    lines.append("=" * 50)
    lines.append("MEAL FEEDBACK EXPORT")
    lines.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    lines.append("=" * 50)
    lines.append("")
    
    if meals_with_feedback:
        for meal in meals_with_feedback:
            lines.append(f"Meal: {meal['meal_name']}")
            lines.append(f"Date: {meal['meal_date']}")
            lines.append(f"Type: {meal['meal_type'].title()}")
            if meal['rating']:
                lines.append(f"Rating: {'★' * meal['rating']}{'☆' * (5 - meal['rating'])}")
            lines.append(f"Feedback: {meal['feedback']}")
            lines.append("-" * 40)
            lines.append("")
    else:
        lines.append("No feedback found. Add feedback to your meals to see it here!")
    
    # Create response with text file
    content = "\n".join(lines)
    response = make_response(content)
    response.headers['Content-Type'] = 'text/plain; charset=utf-8'
    response.headers['Content-Disposition'] = 'attachment; filename=meal_feedback.txt'
    
    return response

# APPLICATION ENTRY POINT

# Ensure DB exists when started via gunicorn / production servers
init_db()

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("FLASK_DEBUG") == "1")
