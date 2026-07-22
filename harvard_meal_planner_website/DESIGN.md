# DESIGN.md — Technical Design Document

## Overview

Harvard Meal Planner is a full-stack web application built using Flask (Python) with a SQLite database backend and a custom HTML/CSS/JavaScript frontend. This document explains the technical architecture, key design decisions, and implementation details.

---

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [Project Structure](#project-structure)
3. [Database Schema](#database-schema)
4. [API Endpoints Reference](#api-endpoints-reference)
5. [Authentication System](#authentication-system)
6. [Frontend Architecture](#frontend-architecture)
7. [HUDS Menu Scraping](#huds-menu-scraping)
8. [Statistics Implementation](#statistics-implementation)
9. [Notification System](#notification-system)
10. [Error Handling](#error-handling)
11. [Security Considerations](#security-considerations)
12. [Future Improvements](#future-improvements)
13. [Lessons Learned](#lessons-learned)

---

## Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Backend | Flask 3.0.0 | Lightweight Python framework — easy to learn and well-documented. |
| Database | SQLite | File-based, no server required, portable, built into Python. |
| Frontend | HTML5/CSS3/JS | Universal browser support, no build tools needed. |
| Templating | Jinja2 | Comes with Flask, powerful template inheritance. |
| Password Security | Werkzeug | Industry-standard password hashing (PBKDF2). |
| Web Scraping | BeautifulSoup4 | Reliable HTML parsing for HUDS menu extraction. |
| HTTP Client | Requests | Simple, human-friendly HTTP library. |

### Architectural Decision:

The application uses a single `app.py` file containing all routes, database operations, and business logic. This was a deliberate choice:

1. **Simplicity**: Easy to understand and navigate for a project of this size
2. **Deployment**: Single file is easier to deploy and test

---

## Project Structure

```
harvard_meal_planner_website/
├── app.py                 # Main Flask application (all routes and logic)
├── requirements.txt       # Python package dependencies
├── meal_planner.db        # SQLite database (created on first run)
├── README.md              # User documentation
├── DESIGN.md              # This technical design document
├── templates/             # HTML templates (Jinja2)
│   ├── index.html         # Base template with navigation and layout
│   ├── login.html         # Login page
│   ├── register.html      # Registration page
│   ├── dashboard.html     # Weekly meal plan view
│   ├── add_meal.html      # Add new meal form
│   ├── edit_meal.html     # Edit existing meal form
│   ├── history.html       # Meal history list
│   ├── favorites.html     # Favorite meals grid
│   ├── statistics.html    # Analytics and charts
│   ├── huds_menu.html     # HUDS dining menu browser
│   ├── notifications.html # Notification center
│   └── settings.html      # User settings page
└── static/                # Static assets
    ├── css/
    │   └── style.css      # Main stylesheet (all CSS)
    ├── js/
    │   └── main.js        # JavaScript (theme, menu, AJAX)
    └── images/
        ├── Harvard_logo.png    # App logo
        ├── Harvard_logo_2.png  # Alternative logo
        └── Harvard_logo_3.png  # Favicon
```

---

## Database Schema

The application uses SQLite with 5 main tables.

### Users Table

Stores user account information.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key, auto-increment |
| username | TEXT | Unique username |
| email | TEXT | Unique email address |
| password_hash | TEXT | Securely hashed password |
| notifications_enabled | INTEGER | 1=enabled, 0=disabled |
| created_at | TIMESTAMP | Account creation time |

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    notifications_enabled INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Design Decisions:**
- `AUTOINCREMENT` ensures IDs are never reused, important for referential integrity
- Both `username` and `email` are unique to prevent duplicates
- `password_hash` stores the hash, never the plaintext password
- `notifications_enabled` uses INTEGER (0/1) because SQLite doesn't have a native BOOLEAN type

### Meals Table

Stores all user-created meals.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| user_id | INTEGER | Foreign key to users |
| meal_type | TEXT | breakfast, lunch, dinner, brunch, or snacks |
| meal_name | TEXT | Name of the meal |
| meal_date | DATE | When the meal is planned |
| description | TEXT | Optional notes about the meal |
| is_favorite | INTEGER | 1=favorite, 0=not |
| rating | INTEGER | 0-5 star rating |
| feedback | TEXT | Personal feedback/notes |
| is_eaten | INTEGER | 1=eaten, 0=not |
| created_at | TIMESTAMP | When the meal was added |

```sql
CREATE TABLE meals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    meal_type TEXT NOT NULL,
    meal_name TEXT NOT NULL,
    meal_date DATE NOT NULL,
    description TEXT,
    is_favorite INTEGER DEFAULT 0,
    rating INTEGER DEFAULT 0,
    feedback TEXT,
    is_eaten INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
)
```

**Design Decisions:**
- `meal_type` is TEXT rather than a foreign key to a types table for simplicity
- `is_favorite` and `is_eaten` are INTEGER flags (0/1) for boolean values
- `rating` is INTEGER 0-5, where 0 means "not rated"
- `feedback` is nullable TEXT for optional user notes

### HUDS Menu Table

Caches scraped dining hall menu items.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| location | TEXT | Dining hall name |
| meal_type | TEXT | breakfast, lunch, or dinner |
| item_name | TEXT | Name of the dish |
| menu_date | DATE | Date the item is served |
| category | TEXT | Food category (Entrees, Sides, etc.) |
| created_at | TIMESTAMP | When the item was scraped |

```sql
CREATE TABLE huds_menu (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    location TEXT NOT NULL,
    meal_type TEXT NOT NULL,
    item_name TEXT NOT NULL,
    menu_date DATE NOT NULL,
    category TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### Favorite HUDS Items Table

Stores users' favorite dining hall items for notifications.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| user_id | INTEGER | Foreign key to users |
| item_name | TEXT | Name of the favorite item |
| created_at | TIMESTAMP | When favorited |

### Notifications Table

Stores user notifications.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| user_id | INTEGER | Foreign key to users |
| message | TEXT | Notification message |
| notification_type | TEXT | Type of notification |
| is_read | INTEGER | 1=read, 0=unread |
| created_at | TIMESTAMP | When created |

### Schema Migration Strategy

The database uses `ALTER TABLE` statements wrapped in try/except blocks to handle schema migrations:

```python
try:
    cursor.execute('ALTER TABLE meals ADD COLUMN is_eaten INTEGER DEFAULT 0')
except sqlite3.OperationalError:
    pass  # Column already exists
```

This approach was chosen because:
- SQLite doesn't support `IF NOT EXISTS` for `ALTER TABLE`
- It allows adding new features without breaking existing installations
- It's simple and doesn't require a migration framework

---

## API Endpoints Reference

### Authentication Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Redirects to login or dashboard |
| `/register` | GET, POST | User registration |
| `/login` | GET, POST | User login |
| `/logout` | GET | User logout |

### Meal Management Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/dashboard` | GET | Weekly meal plan view |
| `/add_meal` | GET, POST | Add new meal |
| `/edit_meal/<id>` | GET, POST | Edit existing meal |
| `/delete_meal/<id>` | POST | Delete a meal |
| `/toggle_favorite/<id>` | POST | Toggle meal favorite status (AJAX) |
| `/rate_meal/<id>` | POST | Rate a meal 1-5 stars (AJAX) |
| `/toggle_eaten/<id>` | POST | Toggle eaten status (AJAX) |

### View Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/history` | GET | View meal history |
| `/favorites` | GET | View favorite meals |
| `/statistics` | GET | View analytics |

### HUDS Menu Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/huds_menu` | GET | Browse HUDS menu |
| `/scrape_huds` | POST | Refresh HUDS menu data |
| `/toggle_huds_favorite/<name>` | POST | Toggle HUDS item favorite |

### Notification Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/notifications` | GET | View notifications |
| `/check_huds_favorites` | GET | Check for favorite item alerts (AJAX) |
| `/clear_notifications` | POST | Delete all notifications |

### Settings and Export Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/settings` | GET, POST | User settings |
| `/export_feedback` | GET | Download feedback file |

---

## Authentication System

### Password Security

Passwords are hashed using Werkzeug's secure functions:

```python
from werkzeug.security import generate_password_hash, check_password_hash

# Registration
password_hash = generate_password_hash(password)

# Login verification
if check_password_hash(user['password_hash'], password):
    # Correct password
```

**Why Werkzeug?**
- Uses PBKDF2 by default with automatic salt generation
- Industry-standard security
- Comes bundled with Flask

### Session Management

Flask's built-in session system with a random secret key:

```python
app.secret_key = os.urandom(24)
```

**Session Data Stored:**
- `user_id`: Database ID of the logged-in user
- `username`: Display name for the UI

**Note:** The secret key is generated randomly on each app restart, which logs out all users. In production, this would be an environment variable.

### Login Required Decorator

A custom decorator protects authenticated routes:

```python
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function
```

---

## Frontend Architecture

### Template Inheritance

All pages inherit from `index.html`, which provides:
- Navigation bar with responsive hamburger menu
- Flash message display
- Theme toggle
- Footer
- Common scripts

```html
{% extends "index.html" %}
{% block title %}Page Title{% endblock %}
{% block content %}
    <!-- Page content here -->
{% endblock %}
```

### CSS Architecture

The stylesheet uses CSS Custom Properties for theming:

```css
:root {
    --primary-color: #A51C30;  /* Harvard Crimson */
    --card-bg: #FFFFFF;
    --text-color: #1A1A1A;
}

[data-theme="dark"] {
    --primary-color: #A51C30;
    --card-bg: #2D2D2D;
    --text-color: #F5F5F5;
}
```

**Why CSS Variables?**
- Theme switching without JavaScript DOM manipulation
- Consistent colors throughout the application
- Easy to modify and maintain

### Responsive Navigation

The navigation uses a dynamic hamburger menu system that measures actual content width:

```javascript
function checkNavbarFit() {
    const containerWidth = navbarContainer.offsetWidth;
    const navLinksWidth = navLinks.scrollWidth;
    
    if (navLinksWidth > availableWidth) {
        // Show hamburger menu
    } else {
        // Show full navigation
    }
}
```

**Design Decision:** Instead of fixed breakpoints, the navbar measures content and switches to hamburger mode when items overflow. This provides better UX across all screen sizes.

### AJAX for Interactive Features

Star ratings, favorites, and eaten status use AJAX for instant feedback:

```javascript
function toggleFavorite(mealId, button) {
    fetch('/toggle_favorite/' + mealId, {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update button appearance
        }
    });
}
```

The server detects AJAX requests and returns JSON:

```python
if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
    return jsonify({'success': True, 'is_favorite': new_status})
```

---

## HUDS Menu Scraping

### Web Scraping Implementation

The application scrapes Harvard's dining services website:

```python
def scrape_huds():
    base_url = "https://www.foodpro.huds.harvard.edu/foodpro/"
    for day_offset in range(7):
        menu_date = today + timedelta(days=day_offset)
        response = requests.get(main_url, headers=headers, timeout=30)
        soup = BeautifulSoup(response.text, 'html.parser')
        # Parse HTML and extract food items
```

### Parsing Strategy

The Harvard menu page uses a 3-column layout. The scraper:
1. Fetches the full page HTML
2. Extracts all text content
3. Parses line-by-line looking for meal type headers
4. Identifies food items vs. categories vs. metadata
5. Stores valid items in the database

**Validation Function:**

```python
def is_valid_food_item(text):
    """Check if text looks like a valid food item"""
    if not text or len(text) < 3 or len(text) > 100:
        return False
    
    skip_patterns = ['select a', 'click here', 'copyright', ...]
    if any(skip in text_lower for skip in skip_patterns):
        return False
    
    return True
```

### Caching Strategy

- Old data is deleted when refreshing (`DELETE FROM huds_menu`)
- New data is inserted in one transaction
- No automatic refresh to avoid rate-limiting concerns

---

## Statistics Implementation

### SQL Queries for Analytics

**Meals by Type:**

```sql
SELECT meal_type, COUNT(*) as count
FROM meals
WHERE user_id = ? AND is_eaten = 1
GROUP BY meal_type
ORDER BY count DESC
```

**Day of Week Analysis:**

```sql
SELECT 
    CASE CAST(strftime('%w', meal_date) AS INTEGER)
        WHEN 0 THEN 'Sunday'
        WHEN 1 THEN 'Monday'
        -- ... etc
    END as day_name,
    COUNT(*) as count
FROM meals
WHERE user_id = ? AND is_eaten = 1
GROUP BY strftime('%w', meal_date)
```

**Why `strftime`?** SQLite doesn't have native day-of-week functions, so `strftime('%w', date)` extracts the day number (0=Sunday through 6=Saturday).

### Design Decision: Eaten-Only Statistics

Statistics only count meals marked as "eaten" because:
- Planning a meal doesn't mean you ate it
- More accurate reflection of actual eating habits
- Incentivizes users to mark meals as eaten

---

## Notification System

### Favorite Item Alerts

When a user's favorite HUDS item is on today's menu, they receive a notification:

```python
@app.route('/check_huds_favorites')
def check_huds_favorites():
    cursor.execute('''
        SELECT DISTINCT h.item_name, h.location, h.meal_type
        FROM huds_menu h
        INNER JOIN favorite_huds_items f ON h.item_name = f.item_name
        WHERE f.user_id = ? AND h.menu_date = ?
    ''', (user_id, today))
```

**Trigger Mechanism:**
- Called via AJAX on every page load (when logged in)
- Checks if notification already exists to prevent duplicates
- Runs in the background without blocking page load

### Deduplication

```python
cursor.execute('''
    SELECT id FROM notifications
    WHERE user_id = ? AND message LIKE ? AND DATE(created_at) = DATE('now')
''', (user_id, f'%{item["item_name"]}%'))

if not cursor.fetchone():
    # Create new notification
```

---

## Error Handling

### User-Friendly Error Messages

The application prioritizes specific, actionable error messages:

| Generic (Bad) | Specific (Good) |
|---------------|-----------------|
| "All fields required" | "Please enter your username" |
| "Invalid input" | "Username must start with a letter" |
| "Error occurred" | "The username 'john' is already taken" |

**Security Note:** Login errors use a generic message ("Incorrect username or password") to avoid revealing whether an account exists.

### Flash Messages

```python
flash('Meal added successfully!', 'success')  # Green
flash('Please fill in all required fields.', 'error')  # Red
flash('You have been logged out.', 'info')  # Crimson
```

Messages auto-dismiss after 5 seconds using JavaScript.

### Graceful Degradation

- AJAX operations fall back to redirects if JavaScript is disabled
- HUDS scraping failures show a warning but don't crash the app
- Database operations use try/except for schema migrations

---

## Security Considerations

### Input Validation

All user inputs are validated server-side:

**Email Validation:**
- Regex pattern: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`

**Username Validation:**
- 3-20 characters
- Must start with a letter
- Only letters, numbers, and underscores

**Password Validation:**
- Minimum 6 characters

**Other Validations:**
- Meal names limited to 100 characters
- Ratings constrained to 0-5 range
- All string inputs are trimmed
- Emails normalized to lowercase

### SQL Injection Prevention

All SQL queries use parameterized statements:

```python
cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
```

### CSRF Considerations

The application currently relies on:
- Session-based authentication
- Same-origin policy
- AJAX requests with custom headers

For production, Flask-WTF CSRF tokens should be added.

### Password Storage

- Never stored in plaintext
- Werkzeug uses PBKDF2 with salt
- Hashes are unique even for identical passwords

---

## Future Improvements

1. **Authentication Enhancements**
   - Password reset via email
   - Two-factor authentication
   - OAuth (Google/Harvard login)

2. **Calendar Integration**
   - Export to Google Calendar
   - iCal feed for meal plans

3. **Social Features**
   - Share meal plans with friends
   - Meal recommendations

4. **Advanced Analytics**
   - Nutritional tracking
   - Budget tracking

5. **Mobile App**
   - Progressive Web App (PWA)
   - Native iOS/Android apps

6. **Production Deployment**
   - PostgreSQL database
   - Redis for session storage
   - Gunicorn/Nginx
   - Docker containerization

---

## Lessons Learned

1. **SQLite Limitations**: No native boolean type, no `IF NOT EXISTS` for `ALTER TABLE`, requires workarounds

2. **Web Scraping is Fragile**: HTML structure can change, requiring scraper updates

3. **CSS Variables**: Extremely useful for theming, should be used from the start

4. **AJAX UX**: AJAX significantly improves user experience

5. **Template Inheritance**: Jinja2's block system is powerful for DRY templates

---

## Conclusion

This project demonstrates a full-stack web application with real-world features including authentication, CRUD operations, web scraping, analytics, and a responsive frontend. The design prioritizes simplicity and maintainability while providing a polished user experience.
