# FeedMe (Harvard Meal Planner)

#### Video Demo: https://youtu.be/gQS6CYNJGTA

## What is FeedMe?

FeedMe is a web application designed for Harvard students to plan, organize, and track their meals throughout the week. The app integrates with Harvard University Dining Services (HUDS) menus, allowing you to browse what's being served at Annenberg dining hall and add those items directly to your personal meal plan.

**At a glance:**
- Plan meals for the whole week (Sunday–Saturday)
- Pull real HUDS menus and add items with one click
- Track favorites, ratings, and meals you've actually eaten
- View statistics: most eaten meals, favorite days, and more

---

## Table of Contents

1. [Installation and Setup](#installation-and-setup)
2. [Getting Started](#getting-started)
3. [Features Overview](#features-overview)
4. [How to Use the Application](#how-to-use-the-application)
5. [Troubleshooting](#troubleshooting)
6. [Current Limitations](#current-limitations)
7. [Credits](#credits)

---

## Installation and Setup

### Prerequisites

Before you begin, make sure you have:
- **Python 3.7 or higher** installed on your computer
- **pip** (Python package manager, usually included with Python)
- A modern web browser (Chrome, Firefox, Safari, or Edge)

### Step 1: Download the Project

Download or clone the project files to your computer:

```bash
git clone https://github.com/lamokodieh-ops/projects.git
cd projects/harvard_meal_planner_website
```

### Step 2: Install Dependencies

Open a terminal or command prompt in the project folder and run:

```bash
pip install -r requirements.txt
```

This installs the required packages:
- **Flask**: The web framework that powers the application
- **Werkzeug**: Security utilities for password hashing
- **requests**: HTTP library for fetching HUDS menus
- **beautifulsoup4**: HTML parsing for menu scraping

### Step 3: Run the Application

Start the Flask development server:

```bash
python app.py
```

You should see output similar to:

```
 * Running on http://127.0.0.1:5000
```

### Deploy for display (Render)

This is a Flask app — use a Python host (not GitHub Pages).

1. Create a free [Render](https://render.com) **Web Service** from this repo.
2. Settings:
   - **Root Directory:** `harvard_meal_planner_website`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
3. Set env var `SECRET_KEY` to a long random string.

Or use the included [`render.yaml`](./render.yaml) Blueprint.

**Video demo:** https://youtu.be/gQS6CYNJGTA

### Step 4: Access the Application

Open your web browser and navigate to:

```
http://localhost:5000
```

The database (`meal_planner.db`) will be created automatically on first run.

---

## Getting Started

### Creating Your Account

1. When you first open the app, you'll see the login page
2. Click **"Register"** to create a new account
3. Enter your desired username, email, and password
   - Username must be 3-20 characters, start with a letter, and use only letters, numbers, or underscores
   - Password must be at least 6 characters
4. Click **"Create Account"**
5. You'll be automatically logged in and taken to your Dashboard

### Your First Login

After registration or when returning to the app:
1. Enter your username (not email) and password
2. Click **"Login"**
3. You'll see the weekly Dashboard showing the current week

### Navigating the App

The navigation bar at the top provides access to all features:
- **Dashboard**: Your weekly meal plan view (home page)
- **Add Meal**: Create a new meal entry
- **HUDS Menu**: Browse Harvard dining hall menus
- **History**: View all your past meals
- **Favorites**: See meals you've marked as favorites
- **Statistics**: View analytics about your eating habits
- **Notifications**: Check alerts for your favorite HUDS items
- **Settings**: Manage your preferences

On smaller screens, the navigation collapses into a hamburger menu (☰).

---

## Features Overview

### Weekly Meal Planning Dashboard

The Dashboard is your main view:
- See your entire week at a glance (Sunday to Saturday)
- Organize by 5 meal types: Breakfast, Lunch, Dinner, Brunch, and Snacks
- Click on any meal type to quickly add a meal for that day
- Visual indicators show favorites (♥), ratings (★), and eaten status (strikethrough)

### Rating and Favorites System

Keep track of your favorite meals:
- **5-Star Rating**: Rate each meal from 1-5 stars directly on the dashboard
- **Favorites**: Click the heart (♥) to mark meals you love
- **Instant Updates**: Changes save immediately without page reloads

### Eaten Tracking

Track whether you've actually eaten the meals you planned:
- Check the box next to any meal to mark it as eaten
- Eaten meals appear with a strikethrough effect
- Only eaten meals count toward your statistics

### Statistics and Analytics

Gain insights into your eating habits:
- Total meals logged, average rating, and favorites count
- Bar charts showing meals by type (breakfast, lunch, dinner, etc.)
- Meals by day of week analysis
- Top-rated and most frequently eaten meals
- 30-day activity visualization

### HUDS Menu Integration

Browse real Harvard dining hall menus:
- Click **"Refresh Menu"** to fetch the latest menu data
- View menus for up to 7 days in advance
- Filter by date, dining location, and meal type
- Click the heart (♥) to save favorite HUDS items
- Click the plus (+) button to add any item directly to your meal plan

### Notifications

Get notified when your favorite HUDS items are being served:
- A red badge appears on the Notifications link when you have unread alerts
- View all notifications in the Notification Center
- Clear all notifications with one click

### Theme Support

- Click the eye icon (👁) next to the logo to toggle between light and dark modes
- Your preference is saved automatically in your browser

### Export Your Data

- Go to History and click **"Export Feedback"**
- Download a text file containing all your meal feedback and notes

---

## How to Use the Application

### Adding Meals

There are three ways to add meals to your plan:

**Method 1: From the Dashboard**
1. Find the day and meal type you want (e.g., Monday Lunch)
2. Click on the meal type header (a "+" icon appears on hover)
3. Fill in the meal name and optionally add a description and rating
4. Click **"Add Meal"**

**Method 2: From Navigation**
1. Click **"Add Meal"** in the navigation bar
2. Select the date, meal type, and enter meal details
3. Click **"Add Meal"**

**Method 3: From HUDS Menu**
1. Go to **"HUDS Menu"** from the navigation
2. Click **"Refresh Menu"** to load the latest menu
3. Browse the available items
4. Click the **"+"** button next to any item to add it to your plan

### Rating and Managing Meals

Once a meal is in your plan:
- **Rate it**: Click the stars (★) under the meal to rate 1-5 stars
- **Favorite it**: Click the heart (♥) to mark as a favorite
- **Mark as eaten**: Click the checkbox to indicate you ate the meal
- **Edit it**: Click the edit icon to modify meal details
- **Delete it**: Click the delete icon to remove the meal

### Using HUDS Menu Features

**Refreshing the Menu:**
1. Go to **"HUDS Menu"**
2. Click **"Refresh Menu"** and wait a few seconds
3. The menu for the next 7 days will be loaded

**Filtering the Menu:**
- **Date**: Select a specific date to view
- **Location**: Filter by dining hall (currently Annenberg only)
- **Meal Type**: Show only breakfast, lunch, or dinner

**Saving HUDS Favorites:**
1. Click the heart next to any menu item
2. The item will be saved to your favorites list
3. You'll receive notifications when this item is served in the future

### Viewing Your History

1. Click **"History"** in the navigation (may be under "More" dropdown)
2. See all your past meals sorted by date
3. View ratings, feedback, and favorite status for each meal
4. Edit or delete any meal from the history view

### Checking Your Statistics

1. Click **"Statistics"** in the navigation
2. View summary cards showing total meals, average rating, and favorites
3. Explore charts showing your eating patterns
4. See your top-rated and most frequently eaten meals

### Managing Notifications

**Viewing Notifications:**
1. Look for the notification badge in the navigation
2. A red number indicates unread notifications
3. Click to view all notifications
4. Notifications are marked as read when you view them

**Adjusting Notification Settings:**
1. Go to **"Settings"**
2. Toggle **"Enable Notifications"** on or off
3. View and manage your favorite HUDS items

### Exporting Your Data

1. Go to **"History"**
2. Click the **"Export Feedback"** button
3. A text file will download containing all your meal feedback

---

## Troubleshooting

### "Database is locked" Error

This can happen if another process is accessing the database.
- Close any other applications that might be using the database
- If running multiple instances of the app, close the extras
- Try restarting the application

### HUDS Menu Not Loading

1. Make sure you have an internet connection
2. Click **"Refresh Menu"** to fetch new data
3. The Harvard dining website may occasionally be unavailable—try again later. Visit HUDS website via the link and manually add the meal if necessary.

### Login Issues

- Make sure you're entering your **username** (not your email)
- Passwords are case-sensitive —check your caps lock
- If you forgot your password, you'll need to create a new account (no password reset currently available)

### Meals Not Appearing on Dashboard

- Make sure you selected the correct date when adding the meal
- The Dashboard shows only the current week (Sunday to Saturday)
- Check **"History"** to find meals from other weeks

### Page Not Loading or Errors

- Try refreshing the page
- Clear your browser cache
- Make sure the Flask server is still running in your terminal
- Check the terminal for error messages

---

## Current Limitations

- **Annenberg Only**: Only Annenberg dining hall menus are currently supported (no upperclass houses yet)
- **Scraping Dependency**: HUDS menus are fetched from the public website; if Harvard changes their page layout, the scraping may temporarily break
- **No Password Reset**: If you forget your password, you'll need to create a new account
- **No Email Verification**: Accounts are created without email confirmation
- **Single User Sessions**: Logging in from another browser will not log you out of the first

---

## Credits

- **Framework**: Flask (Python)
- **Database**: SQLite
- **Styling**: Custom CSS with Harvard Crimson theme
- **Icons**: Emoji icons for universal compatibility
- **Menu Data**: Harvard University Dining Services (HUDS)

---

Thank you for using Harvard Meal Planner!
