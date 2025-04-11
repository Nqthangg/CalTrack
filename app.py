from flask import Flask, render_template, request, redirect, url_for, session, jsonify, g
from flask_cors import CORS
import sqlite3
import pandas as pd
import numpy as np
import os
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta

# -------------------- APP INITIALIZATION --------------------

app = Flask(__name__)
CORS(app, resources={r"/update_info": {"origins": "*"}})
app.secret_key = "supersecretkey" # Needed for session management
DB_PATH = os.path.join(os.path.dirname(__file__), "data.db")

# Fixed login credentials
USERNAME = "abcdef"
PASSWORD = "123456"

# File upload settings
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'xlsx', 'xls', 'csv'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# -------------------- DATABASE FUNCTIONS --------------------

def get_db():
    try:
        conn = sqlite3.connect("data.db", detect_types=sqlite3.PARSE_DECLTYPES)
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as e:
        print(f"Database connection error: {e}")
        return None

@app.teardown_appcontext
def close_db(exception):
    db = g.pop('db', None)
    if db is not None:
        try:
            db.close()
        except sqlite3.Error as e:
            print(f"Error closing database: {e}")

def execute_query(query, args=(), fetchone=False, commit=False):
    with sqlite3.connect("data.db") as conn:
        cur = conn.cursor()
        cur.execute(query, args)

        if commit:
            conn.commit()
        if fetchone:
            return cur.fetchone()
        return cur.fetchall()

def init_db():
    try:
        conn = sqlite3.connect("data.db")
        cursor = conn.cursor()

        # User info table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_info (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                height REAL,
                weight REAL,
                age INTEGER,
                gender TEXT,
                activity_level TEXT,
                bmr REAL,
                tdee REAL
            )
        ''')

        # Check if user_info is empty
        cursor.execute("SELECT COUNT(*) FROM user_info")
        count = cursor.fetchone()[0]

        if count == 0:
            cursor.execute('''
                INSERT INTO user_info (height, weight, age, gender, activity_level, bmr, tdee)
                VALUES (170, 70, 30, 'Nam', 'ModeratelyActive', 1700, 2635)
            ''')

        # Calories log table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS calories_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT,
                calories INTEGER
            )
        ''')

        # Achievement table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS achievement (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                burned_calories INTEGER,
                active_hours INTEGER,
                completed_tasks INTEGER,
                ongoing_tasks INTEGER
            )
        ''')

        cursor.execute("SELECT COUNT(*) FROM achievement")
        count = cursor.fetchone()[0]

        if count == 0:
            cursor.execute('''
                INSERT INTO achievement (burned_calories, active_hours, completed_tasks, ongoing_tasks)
                VALUES (0, 0, 0, 0)
            ''')

            from datetime import datetime, timedelta
            import random

            # Insert sample data for the last 30 days
            today = datetime.now()
            for i in range(30):
                date = (today - timedelta(days=i)).strftime("%Y-%m-%d")
                calories = random.randint(1500, 2500)
                cursor.execute('''
                    INSERT INTO calories_log (date, calories) 
                    VALUES (?, ?)
                ''', (date, calories))

        # Detailed calories log table (ensures table exists for later operations)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS detailed_calories_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT UNIQUE,
                net_calories REAL,
                intake REAL,
                burned_tasks REAL,
                burned_accelerometer REAL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Accelerometer calories table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS accelerometer_calories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT,
                calories_burned REAL,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP           
            )
        ''')

        conn.commit()
        conn.close()
        print("Database initialized successfully")

    except sqlite3.Error as e:
        print(f"Database initialization error: {e}")

# Initialize database when app starts
init_db()

# -------------------- HELPER FUNCTIONS --------------------

def get_user_info():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM user_info LIMIT 1")
    user_info = cursor.fetchone()
    conn.close()
    return user_info

def calculate_bmr(weight, height, age, gender):
    """Calculate BMR based on gender using Mifflin-St Jeor formula."""
    try:
        weight = float(weight)
        height = float(height)
        age = int(age)

        if gender.lower() in ["male", "nam"]:
            return round((10 * weight) + (6.25 * height) - (5 * age) + 5)
        elif gender.lower() in ["female", "nữ"]:
            return round((10 * weight) + (6.25 * height) - (5 * age) - 161)
        else:
            # Default to average of male and female formulas
            male_bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5
            female_bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161
            return round((male_bmr + female_bmr) / 2)
    except (ValueError, TypeError):
        return 0
    
def calculate_tdee(bmr, activity_level):
    """Calculate TDEE based on activity level."""
    activity_mapping = {
        "Sedentary": 1.2,
        "LightlyActive": 1.375,
        "ModeratelyActive": 1.55,
        "VeryActive": 1.725,
        "ExtraActive": 1.9
    }

    level_lower = activity_level.lower().replace(" ", "")
    factor = activity_mapping.get(level_lower, 1.2)
    return round(bmr * factor)

def get_obesity_level(bmi):
    if bmi < 18.5:
        return "Underweight"
    elif 18.5 <= bmi < 24.9:
        return "Normal weight"
    elif 25 <= bmi < 29.9:
        return "Overweight"
    else:
        return "Obese"
    
def update_user_achievement(calories_burned):
    """Update the user's achievement data with the new calories burned"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if we should use 'users' or 'achievement' table
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='achievement'")
    achievement_table_exists = cursor.fetchone() is not None
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='archievement'")
    archievement_table_exists = cursor.fetchone() is not None
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
    users_table_exists = cursor.fetchone() is not None
    
    # Determine which table to use
    if achievement_table_exists:
        table_name = 'achievement'
    elif archievement_table_exists:
        table_name = 'archievement'
    elif users_table_exists:
        table_name = 'users'
    else:
        # If no table exists, create the correct one
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS achievement (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                burned_calories INTEGER,
                active_hours INTEGER,
                completed_tasks INTEGER,
                ongoing_tasks INTEGER
            )
        ''')
        cursor.execute('''
            INSERT INTO achievement (burned_calories, active_hours, completed_tasks, ongoing_tasks)
            VALUES (0, 0, 0, 0)
        ''')
        conn.commit()
        table_name = 'achievement'
    
    # Get current burned_calories
    cursor.execute(f"SELECT burned_calories FROM {table_name} WHERE id = 1")
    result = cursor.fetchone()
    current_calories = result[0] if result and result[0] is not None else 0
    
    # Update with new calories
    new_total = current_calories + calories_burned
    cursor.execute(f"UPDATE {table_name} SET burned_calories = ? WHERE id = 1", (new_total,))
    
    conn.commit()
    conn.close()

def get_calories_today(include_accelerometer=True):
    conn = get_db()
    cursor = conn.cursor()
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Get regular calories data
    cursor.execute("SELECT SUM(calories) FROM calories_log WHERE strftime('%Y-%m-%d', date) = ?",
                    (today,))
    result = cursor.fetchone()
    regular_calories = result[0] if result and result[0] is not None else 0
    
    if include_accelerometer:
        # Get accelerometer calories data
        try:
            cursor.execute("SELECT SUM(calories_burned) FROM accelerometer_calories WHERE date = ?",
                            (today,))
            result = cursor.fetchone()
            accelerometer_calories = result[0] if result and result[0] is not None else 0
        except sqlite3.OperationalError as e:
            print(f"Error getting accelerometer calories: {e}")
            accelerometer_calories = 0
    else:
        accelerometer_calories = 0

    conn.close()
    return regular_calories, accelerometer_calories

def get_calories_by_year():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT SUM(calories) FROM calories_log WHERE strftime('%Y', date) = ?", 
                   (datetime.now().strftime('%Y'),))
    result = cursor.fetchone()
    yearly_calories = result[0] if result and result[0] is not None else 0
    conn.close()
    return yearly_calories

def get_calories_chart():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT date, SUM(calories) FROM calories_log GROUP BY date ORDER BY date ASC")
    data = cursor.fetchall()
    conn.close()
    
    labels = [row[0] for row in data]  # Dates
    values = [row[1] for row in data]  # Calorie amounts
    
    return labels, values

def save_detailed_calories(calories, intake=0, burned_tasks=0, burned_accelerometer=0):
    """Save detailed calorie information to the database"""
    conn = get_db()
    cursor = conn.cursor()

    # Get today's date
    today = datetime.now().strftime("%Y-%m-%d")
    
    net_calories = intake - (burned_tasks + burned_accelerometer)

    # Insert or replace record for today
    cursor.execute('''
        INSERT OR REPLACE INTO detailed_calories_log 
        (date, net_calories, intake, burned_tasks, burned_accelerometer)
        VALUES (?, ?, ?, ?, ?)
    ''', (today, calories, intake, burned_tasks, burned_accelerometer))
    
    # Also update the original calories_log table for backward compatibility
    cursor.execute('''
        INSERT OR REPLACE INTO calories_log (date, calories) 
        VALUES (?, ?)
    ''', (today, calories))
    
    conn.commit()
    conn.close()

def save_accelerometer_calories(calories_burned, date=None):
    """Save accelerometer-based calories to the database"""
    if date is None:
        date = datetime.now().strftime('%Y-%m-%d')
    
    conn = get_db()
    cursor = conn.cursor()

    # Insert or update the record for the date
    cursor.execute('''
        INSERT OR REPLACE INTO accelerometer_calories (date, calories_burned)
        VALUES (?, ?)
    ''', (date, calories_burned))
    
    conn.commit()
    conn.close()

def read_axis_file(filepath):
    """Read axis data from a file"""
    if filepath.endswith('.csv'):
        df = pd.read_csv(filepath)
    else:
        df = pd.read_excel(filepath)
    
    # Standardize column names
    if 'time' in df.columns or 'Time' in df.columns:
        time_col = 'time' if 'time' in df.columns else 'Time'
        value_col = 'value' if 'value' in df.columns else 'Value'
        
        # Create a copy with standardized column names
        result_df = pd.DataFrame()
        result_df['time'] = df[time_col]
        result_df['value'] = df[value_col]
        return result_df
    
    # Debug column names if not found
    print(f"Column names in file {os.path.basename(filepath)}: {df.columns.tolist()}")
    
    raise ValueError(f"Could not find expected 'time' and 'value' columns in {os.path.basename(filepath)}")

def merge_axis_data(x_df, y_df, z_df):
    """Merge X, Y, Z axis data into a single DataFrame"""
    # Step 1: Standardize time format if needed
    for df in [x_df, y_df, z_df]:
        if pd.api.types.is_object_dtype(df['time']):
            try:
                df['time'] = pd.to_datetime(df['time'])
            except:
                pass
    
    # Step 2: Create a combined DataFrame with the first time column
    combined = pd.DataFrame()
    combined['time'] = x_df['time']
    combined['x'] = x_df['value']
    
    # Step 3: Merge Y data
    if len(y_df) == len(x_df):  # If they have the same length, assume they're aligned
        combined['y'] = y_df['value'].values
    else:
        # Try to align based on time
        merged = pd.merge_asof(combined, 
                             y_df.rename(columns={'value': 'y'}),
                             on='time',
                             direction='nearest')
        combined = merged[['time', 'x', 'y']]
    
    # Step 4: Merge Z data
    if len(z_df) == len(x_df):  # If they have the same length, assume they're aligned
        combined['z'] = z_df['value'].values
    else:
        # Try to align based on time
        merged = pd.merge_asof(combined, 
                             z_df.rename(columns={'value': 'z'}),
                             on='time',
                             direction='nearest')
        combined = merged[['time', 'x', 'y', 'z']]
    
    # Handle any missing values
    combined.fillna(method='ffill', inplace=True)
    combined.fillna(method='bfill', inplace=True)
    
    return combined

def calculate_calories_from_accelerometer(df):
    """
    Calculate calories burned based on accelerometer data.
    
    The algorithm:
    1. Identify x, y, z columns (handle various naming conventions)
    2. Calculate the magnitude of acceleration at each point
    3. Determine activity intensity based on magnitude variations
    4. Estimate calories burned based on intensity over time
    """
    # Check if the dataframe has any data
    if df.empty:
        raise ValueError("Uploaded file contains no data")
    
    # Try to identify x, y, z columns from various naming conventions
    # This adds flexibility to handle different accelerometer data formats
    column_mappings = {
        'x': ['x', 'X', 'accel_x', 'accel x', 'accelerometer_x', 'accelerometer x', 'x-axis', 'x axis'],
        'y': ['y', 'Y', 'accel_y', 'accel y', 'accelerometer_y', 'accelerometer y', 'y-axis', 'y axis'],
        'z': ['z', 'Z', 'accel_z', 'accel z', 'accelerometer_z', 'accelerometer z', 'z-axis', 'z axis']
    }
    # Map column names to standardized x, y, z
    axis_columns = {}
    for axis, possible_names in column_mappings.items():
        for column in df.columns:
            col_lower = str(column).lower().strip()
            if any(name == col_lower or name in col_lower for name in possible_names):
                axis_columns[axis] = column
                break

    # Check if we found all three axes
    missing_axes = set(['x', 'y', 'z']) - set(axis_columns.keys())
    if missing_axes:
        # If we're missing axes data, show more helpful error
        found_columns = ", ".join(df.columns.tolist())
        raise ValueError(f"Could not identify columns for axes: {', '.join(missing_axes)}. Found columns: {found_columns}")

    # Create a working copy with standardized column names
    processed_df = pd.DataFrame()
    for axis, column in axis_columns.items():
        # Convert data to numeric, coerce errors to NaN
        processed_df[axis] = pd.to_numeric(df[column], errors='coerce')
    
    # Drop rows with NaN values
    processed_df.dropna(inplace=True)
    
    if processed_df.empty:
        raise ValueError("No valid numeric data found in accelerometer columns")
    
    # Calculate acceleration magnitude (Euclidean norm)
    processed_df['magnitude'] = np.sqrt(processed_df['x']**2 + processed_df['y']**2 + processed_df['z']**2)
    
    # Calculate the variance of magnitude in windows to determine intensity
    window_size = min(100, len(processed_df) // 10) if len(processed_df) > 10 else len(processed_df)
    processed_df['variance'] = processed_df['magnitude'].rolling(window=window_size).var().fillna(0)
    
    # Classify activity intensity based on variance
    conditions = [
        (processed_df['variance'] < 0.1),  # Sedentary
        (processed_df['variance'] < 0.5),  # Light activity
        (processed_df['variance'] < 2.0),  # Moderate activity
        (processed_df['variance'] >= 2.0)  # Vigorous activity
    ]
    
    # MET values (Metabolic Equivalent of Task)
    met_values = [1.0, 2.0, 5.0, 8.0]
    
    processed_df['met'] = np.select(conditions, met_values, default=1.0)
    
    # Try to detect sampling rate based on timestamp columns if available
    # Default assumption: 50 Hz if no timestamp data is available
    sampling_rate = 50
    time_columns = [col for col in df.columns if 'time' in str(col).lower() or 'timestamp' in str(col).lower()]
    
    if time_columns and len(time_columns) > 0:
        try:
            # Convert to datetime if possible
            time_col = time_columns[0]
            if pd.api.types.is_numeric_dtype(df[time_col]):
                # If it's numeric, assume milliseconds since epoch
                times = pd.to_datetime(df[time_col], unit='ms')
            else:
                # Otherwise try parsing as a datetime string
                times = pd.to_datetime(df[time_col])
            
            # Calculate time differences and median sampling rate
            time_diffs = times.diff().dropna()
            if not time_diffs.empty:
                # Convert to seconds and get the median time difference
                median_diff_seconds = time_diffs.dt.total_seconds().median()
                if median_diff_seconds > 0:
                    sampling_rate = 1 / median_diff_seconds
        except:
            # If anything fails, stick with the default
            sampling_rate = 50

    # Estimate time in hours based on sampling rate
    duration_hours = len(processed_df) / (sampling_rate * 3600)

    # Get user weight from database (default to 70kg if not available)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT weight FROM user_info WHERE id = 1")
    result = cursor.fetchone()
    weight_kg = result[0] if result else 70
    conn.close()
    
    # Calories calculation formula: METs * weight (kg) * duration (hours)
    avg_met = processed_df['met'].mean()
    calories_burned = avg_met * weight_kg * duration_hours
    
    # Add some logging for debugging
    print(f"Processed {len(processed_df)} data points")
    print(f"Average MET: {avg_met}")
    print(f"Duration: {duration_hours} hours")
    print(f"User weight: {weight_kg} kg")
    print(f"Calculated calories: {calories_burned}")
    
    return round(calories_burned, 2)

# -------------------- LOGIN/LOGOUT ROUTES --------------------


@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        if username == USERNAME and password == PASSWORD:
            session["username"] = username # Save login to session
            return redirect(url_for("home"))  # Redirect to home page
        else:
            return render_template("login.html", error="Incorrect username or password!")

    return render_template("login.html")

@app.route("/logout")
def logout():
    session.pop("username", None)  # Remove login session
    return redirect(url_for("login"))

# -------------------- BASE ROUTE (Dashboard) --------------------


@app.route("/base")
def base():
    if "username" not in session:
        return redirect(url_for("login"))
    
    user_info = get_user_info()
    regular_calories, accelerometer_calories = get_calories_today()
    daily_calories = regular_calories
    yearly_calories = get_calories_by_year()
    chart_labels, chart_data = get_calories_chart()

    # Get user data or use default values
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('SELECT burned_calories, active_hours, completed_tasks, ongoing_tasks FROM achievement WHERE id = 1')
    result = cursor.fetchone()
    conn.close()

    if result:
        user_data = {
            'burned_calories': result[0],
            'active_hours': result[1],
            'completed_tasks': result[2],
            'ongoing_tasks': result[3]
        }
    else:
        user_data = {
            'burned_calories': 0,
            'active_hours': 0,
            'completed_tasks': 0,
            'ongoing_tasks': 0
        }

    return render_template("base.html",
                           username=session["username"],
                           user_info=user_info,
                           daily_calories=daily_calories,
                           yearly_calories=yearly_calories,
                           chart_labels=chart_labels,
                           chart_data=chart_data,
                           user_data=user_data)

# -------------------- HOME ROUTE --------------------


@app.route('/home')
def home():
    if "username" not in session:
        return redirect(url_for("login"))
    

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('SELECT burned_calories, active_hours, completed_tasks, ongoing_tasks FROM achievement WHERE id = ?', (1,))
    user_data = cursor.fetchone()

    if user_data:
        user_info = {
            'burned_calories': user_data[0],
            'active_hours': user_data[1],
            'completed_tasks': user_data[2],
            'ongoing_tasks': user_data[3]
        }
    else:
        user_info = {
            'burned_calories': 0,
            'active_hours': 0,
            'completed_tasks': 0,
            'ongoing_tasks': 0
        }

    conn.close()
    return render_template('home.html', user_data=user_info)

@app.route('/update_counters', methods=['POST'])
def update_counters():
    """Update the user's achievement counters."""
    if "username" not in session:
        return jsonify({'success': False, 'error': 'Not authenticated'}), 403
    
    # Get data from the request
    burned_calories = float(request.form.get('burned_calories', 0))
    active_hours = float(request.form.get('active_hours', 0))
    completed_tasks = int(request.form.get('completed_tasks', 0))
    ongoing_tasks = int(request.form.get('ongoing_tasks', 0))
    
    try:
        # Connect to database
        conn = get_db()
        cursor = conn.cursor()
        
        # Update the counters in achievement table
        cursor.execute('''
            UPDATE achievement 
            SET burned_calories = ?, active_hours = ?, completed_tasks = ?, ongoing_tasks = ? 
            WHERE id = 1
        ''', (burned_calories, active_hours, completed_tasks, ongoing_tasks))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True})
    except sqlite3.Error as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# -------------------- PROFILE ROUTE ----------------------


@app.route('/profile', methods=['GET', 'POST'])
def profile():
    if "username" not in session:
        return redirect(url_for("login"))
    
    user_info = get_user_info() # Fetch user info from database

    # Calculate BMI to ensure it's available for the template
    bmi = 0
    if user_info and len(user_info) >= 3:
        try:
            height_in_meters = user_info[1] / 100
            bmi = round(user_info[2] / (height_in_meters * height_in_meters), 2)
        except (IndexError, TypeError, ZeroDivisionError):
            pass
    
    return render_template("profile.html", user_info=user_info, bmi=bmi)

@app.route("/update_info", methods=['POST'])
def update_info():
    if "username" not in session:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({"error": "You must be logged in to update your profile"}), 403
        return redirect(url_for("login"))
    
    height = request.form.get("height")
    weight = request.form.get("weight")
    age = request.form.get("age")
    gender = request.form.get("gender")
    activity_level = request.form.get("activity_level")

    if not all([height, weight, age, gender, activity_level]):
        return jsonify({"success": False, "error": "Please fill in all information!"}), 400
    
    try:
        height = float(height)
        weight = float(weight)
        age = int(age)
    except ValueError:
        return jsonify({"success": False, "error": "Height and weight must be real numbers and age must be an integer!"}), 400
    
    height_in_meters = height / 100
    bmi = round(weight / (height_in_meters * height_in_meters), 2)

    bmr = calculate_bmr(weight, height, age, gender)
    tdee = calculate_tdee(bmr, activity_level)

    # Update database
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE user_info 
        SET height = ?, weight = ?, age = ?, gender = ?, activity_level = ?, bmr = ?, tdee = ? 
        WHERE id = 1
    """, (height, weight, age, gender, activity_level, bmr, tdee))
    conn.commit()
    conn.close()

    updated_user_info = {
        "height": height,
        "weight": weight,
        "age": age,
        "gender": gender,
        "activity_level": activity_level,
        "bmi": bmi,
        "bmr": bmr,
        "tdee": tdee
    }
    return jsonify({"success": True, "user_info": updated_user_info})

# -------------------- CALORIES ROUTES --------------------


@app.route('/calories')
def calories():
    if "username" not in session:
        return redirect(url_for("login"))
    
    # Get user info first
    user_info = get_user_info()

    # Calculate BMI
    bmi = 0
    obesity_level = "Unknown"

    if user_info and len(user_info) >= 3:
        try:
            height_in_meters = user_info[1] / 100
            bmi = round(user_info[2] / (height_in_meters * height_in_meters), 2)
            obesity_level = get_obesity_level(bmi)
        except (IndexError, TypeError, ZeroDivisionError):
            pass

    # Get connection for calorie data
    conn = get_db()
    if conn is None:
        return "Database connection error", 500

    # Get regular calories and accelerometer calories data
    today = datetime.now().strftime("%Y-%m-%d")

    try:
        cursor = conn.cursor()

        # Get regular calories
        cursor.execute("SELECT SUM(calories) FROM calories_log WHERE strftime('%Y-%m-%d', date) = ?",
                       (today,))
        result = cursor.fetchone()
        regular_calories = result[0] if result and result[0] is not None else 0
    
        # Get accelerometer calories
        try:
            cursor.execute("SELECT SUM(calories_burned) FROM accelerometer_calories WHERE date = ?",
                          (today,))
            result = cursor.fetchone()
            accelerometer_calories = result[0] if result and result[0] is not None else 0
        except sqlite3.OperationalError:
            accelerometer_calories = 0
        
        daily_calories = regular_calories

        # Get detailed calorie info
        cursor.execute('''
            SELECT intake, burned_tasks, burned_accelerometer 
            FROM detailed_calories_log 
            WHERE date = ?
        ''', (today,))
    
        detailed_calories = cursor.fetchone()
    
        if detailed_calories:
            intake = detailed_calories[0]
            burned_tasks = detailed_calories[1]
            burned_accelerometer = detailed_calories[2]
        else:
            intake = 0
            burned_tasks = 0
            burned_accelerometer = accelerometer_calories

    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return "Database error", 500
    finally:
        # Close the connection when done
        conn.close()

    return render_template("calories.html",
                           user_info=user_info,
                           bmi=bmi,
                           obesity_level=obesity_level,
                           daily_calories=daily_calories,
                           intake=intake,
                           burned_tasks=burned_tasks,
                           burned_accelerometer=burned_accelerometer)

@app.route("/update_calories", methods=["POST"])
def update_calories():
    if "username" not in session:
        return jsonify({"success": False, "error": "Not authenticated"}), 403
    
    calories = request.form.get("calories")
    intake = request.form.get("intake", 0)
    burned_tasks = request.form.get("burned_tasks", 0)
    burned_accelerometer = request.form.get("burned_accelerometer", 0)
    
    if calories:
        try:
            calories_value = float(calories)
            intake_value = float(intake)
            burned_tasks_value = float(burned_tasks)
            burned_accelerometer_value = float(burned_accelerometer)
            
            # Save detailed calorie data
            save_detailed_calories(
                calories_value, 
                intake_value,
                burned_tasks_value,
                burned_accelerometer_value
            )
            
            return jsonify({
                "success": True, 
                "calories": calories_value,
                "intake": intake_value,
                "burned_tasks": burned_tasks_value,
                "burned_accelerometer": burned_accelerometer_value
            })
        except ValueError:
            return jsonify({"success": False, "error": "Invalid calories value"})
    
    return jsonify({"success": False, "error": "No calories data provided"})

@app.route("/calories/month")
def get_monthly_calories():
    if "username" not in session:
        return jsonify([]), 401
    
    try:
        # Use a direct connection instead of get_db()
        conn = sqlite3.connect("data.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='detailed_calories_log'")
        if not cursor.fetchone():
            # If table doesn't exist, use original calories_log
            cursor.execute("""
                SELECT date, calories FROM calories_log 
                ORDER BY date DESC LIMIT 30
            """)
        else:
            # If new table exists, try to use it but handle possible missing columns
            cursor.execute("""
                SELECT date, net_calories FROM detailed_calories_log 
                ORDER BY date DESC LIMIT 30
            """)

        # Fetch all rows 
        data = cursor.fetchall()
        conn.close()

        formatted_data = []
        for row in data:
            try:
                date_str = row[0]
                value = row[1] if row[1] is not None else 0
                
                # Try to format the date nicely
                try:
                    date_obj = datetime.strptime(date_str, '%Y-%m-%d')
                    formatted_date = date_obj.strftime('%b %d')
                except (ValueError, TypeError):
                    formatted_date = date_str
                
                formatted_data.append([formatted_date, float(value)])
            except Exception as e:
                print(f"Error formatting row {row}: {e}")
                continue

        print(f"Returning {len(formatted_data)} data points")
        return jsonify(formatted_data)

    except Exception as e:
        import traceback
        print(f"Error in get_monthly_calories: {e}")
        print(traceback.format_exc())
        return jsonify([])
    
# Additional diagnostic route
@app.route('/debug/db')
def debug_db():
    if "username" not in session:
        return "Not authorized", 401
        
    try:
        conn = sqlite3.connect("data.db")
        cursor = conn.cursor()
        
        # Get all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        
        result = {"tables": []}
        
        # For each table, get structure and sample data
        for table in tables:
            table_name = table[0]
            cursor.execute(f"PRAGMA table_info({table_name})")
            columns = cursor.fetchall()
            
            cursor.execute(f"SELECT * FROM {table_name} LIMIT 5")
            sample_data = cursor.fetchall()
            
            result["tables"].append({
                "name": table_name,
                "columns": [col[1] for col in columns],
                "sample_data": sample_data
            })
            
        conn.close()
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": str(e)})

@app.route('/upload_accelerometer_data', methods=['POST'])
def upload_accelerometer_data():
    if 'username' not in session:
        return jsonify({"success": False, "error": "Not authenticated"}), 403
    
    print("Request files:", list(request.files.keys()))
    
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "No file part"}), 400
    
    main_file = request.files['file']
    
    if main_file.filename == '':
        return jsonify({"success": False, "error": "No X-axis file selected"}), 400
    
    # Check for Y and Z axis files
    y_file = request.files.get('file_y')
    if not y_file or y_file.filename == '':
        return jsonify({"success": False, "error": "No Y-axis file selected"}), 400
    
    z_file = request.files.get('file_z')
    if not z_file or z_file.filename == '':
        return jsonify({"success": False, "error": "No Z-axis file selected"}), 400
    
    # Check file types
    if not all(allowed_file(f.filename) for f in [main_file, y_file, z_file]):
        return jsonify({"success": False, "error": "One or more files have invalid file types"}), 400
    
    # Process the separate axis files
    try:
        # Create temporary file paths
        x_filepath = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(main_file.filename))
        y_filepath = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(y_file.filename))
        z_filepath = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(z_file.filename))
        
        # Save the files temporarily
        main_file.save(x_filepath)
        y_file.save(y_filepath)
        z_file.save(z_filepath)
        
        # Read the data
        x_data = read_axis_file(x_filepath)
        y_data = read_axis_file(y_filepath)
        z_data = read_axis_file(z_filepath)
        
        # Merge the data
        combined_df = merge_axis_data(x_data, y_data, z_data)
        
        # Calculate calories
        calories_burned = calculate_calories_from_accelerometer(combined_df)
        
        # Save to user's record
        date = request.form.get('date', datetime.now().strftime('%Y-%m-%d'))
        save_accelerometer_calories(calories_burned, date)
        
        # Update user achievement stats
        update_user_achievement(calories_burned)
        
        return jsonify({
            "success": True, 
            "calories_burned": calories_burned,
            "message": "Successfully processed X, Y, and Z axis data"
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        # Clean up the files
        for filepath in [x_filepath, y_filepath, z_filepath]:
            if os.path.exists(filepath):
                os.remove(filepath)

def process_separate_axes_files(x_file, y_file, z_file):
    """Process separate X, Y, Z accelerometer files and combine them into one dataset"""
    if not all(allowed_file(f.filename) for f in [x_file, y_file, z_file]):
        return jsonify({"success": False, "error": "One or more invalid file types"}), 400
    
    # Create temporary file paths
    x_filepath = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(x_file.filename))
    y_filepath = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(y_file.filename))
    z_filepath = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(z_file.filename))
    
    try:
        # Save the files temporarily
        x_file.save(x_filepath)
        y_file.save(y_filepath)
        z_file.save(z_filepath)
        
        # Read the data
        x_data = read_axis_file(x_filepath)
        y_data = read_axis_file(y_filepath)
        z_data = read_axis_file(z_filepath)
        
        # Merge the data
        combined_df = merge_axis_data(x_data, y_data, z_data)
        
        # Calculate calories
        calories_burned = calculate_calories_from_accelerometer(combined_df)
        
        # Save to user's record
        date = request.form.get('date', datetime.now().strftime('%Y-%m-%d'))
        save_accelerometer_calories(calories_burned, date)
        
        # Update user achievement stats
        update_user_achievement(calories_burned)
        
        return jsonify({
            "success": True, 
            "calories_burned": calories_burned,
            "message": "Successfully processed X, Y, and Z axis data"
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        # Clean up the files
        for filepath in [x_filepath, y_filepath, z_filepath]:
            if os.path.exists(filepath):
                os.remove(filepath)

@app.route('/get_accelerometer_calories', methods=['GET'])
def get_accelerometer_calories():
    if "username" not in session:
        return jsonify({"success": False, "error": "Not authenticated"}), 403
    
    conn = get_db()
    cursor = conn.cursor()
    today = datetime.now().strftime("%Y-%m-%d")
    
    try:
        cursor.execute("SELECT calories_burned FROM accelerometer_calories WHERE date = ?", (today,))
        result = cursor.fetchone()
        calories_burned = result[0] if result else 0
    except sqlite3.OperationalError:
        # Table doesn't exist yet
        calories_burned = 0
    
    conn.close()
    
    return jsonify({
        "success": True, 
        "date": today,
        "calories_burned": calories_burned
    })

@app.route("/calories/year")
def calories_year():
    if "username" not in session:
        return jsonify({"success": False, "error": "Not authenticated"}), 403
        
    total_calories = get_calories_by_year()
    return jsonify({"year": datetime.today().strftime("%Y"), "total_calories": total_calories})

# -------------------- GOAL ROUTE --------------------


@app.route('/goal')
def goal():
    if "username" not in session:
        return redirect(url_for("login"))

    return render_template("goal.html")

# -------------------- ABOUT ROUTE --------------------


@app.route('/about')
def about():
    if "username" not in session:
        return redirect(url_for("login"))
    
    return render_template("about.html")

# -------------------- CONTACT ROUTE --------------------


@app.route('/contact')
def contact():
    if "username" not in session:
        return redirect(url_for("login"))
    
    return render_template("contact.html")

# -------------------- ADMIN --------------------

@app.route('/admin')
def admin():
    if "username" not in session:
        return redirect(url_for("login"))
    
    # Only allow the predefined admin user
    if session["username"] != USERNAME:
        return redirect(url_for("home"))
    
    return render_template("admin.html")

@app.route('/reset_achievement', methods=['POST'])
def reset_achievement():
    if "username" not in session or session["username"] != USERNAME:
        return jsonify({"success": False, "error": "Unauthorized access"}), 403
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE achievement 
            SET burned_calories = 0, active_hours = 0, completed_tasks = 0, ongoing_tasks = 0 
            WHERE id = 1
        ''')
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Achievement statistics reset successfully"})
    except sqlite3.Error as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/reset_calories_log', methods=['POST'])
def reset_calories_log():
    if "username" not in session or session["username"] != USERNAME:
        return jsonify({"success": False, "error": "Unauthorized access"}), 403
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Clear the calories_log table
        cursor.execute("DELETE FROM calories_log")
        
        # Clear the detailed_calories_log table if it exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='detailed_calories_log'")
        if cursor.fetchone():
            cursor.execute("DELETE FROM detailed_calories_log")
        
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Calories log reset successfully"})
    except sqlite3.Error as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/reset_today_data', methods=['POST'])
def reset_today_data():
    if "username" not in session or session["username"] != USERNAME:
        return jsonify({"success": False, "error": "Unauthorized access"}), 403
    
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        conn = get_db()
        cursor = conn.cursor()
        
        # Delete today's entries from calories_log
        cursor.execute("DELETE FROM calories_log WHERE date = ?", (today,))
        
        # Delete today's entries from detailed_calories_log if it exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='detailed_calories_log'")
        if cursor.fetchone():
            cursor.execute("DELETE FROM detailed_calories_log WHERE date = ?", (today,))
        
        # Delete today's entries from accelerometer_calories if it exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='accelerometer_calories'")
        if cursor.fetchone():
            cursor.execute("DELETE FROM accelerometer_calories WHERE date = ?", (today,))
        
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Today's data reset successfully"})
    except sqlite3.Error as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/reset_accelerometer_data', methods=['POST'])
def reset_accelerometer_data():
    if "username" not in session or session["username"] != USERNAME:
        return jsonify({"success": False, "error": "Unauthorized access"}), 403
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if the accelerometer_calories table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='accelerometer_calories'")
        if cursor.fetchone():
            cursor.execute("DELETE FROM accelerometer_calories")
            
            # Also update the burned_accelerometer field in detailed_calories_log if it exists
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='detailed_calories_log'")
            if cursor.fetchone():
                cursor.execute("UPDATE detailed_calories_log SET burned_accelerometer = 0")
        
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Accelerometer data reset successfully"})
    except sqlite3.Error as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/reset_all_data', methods=['POST'])
def reset_all_data():
    if "username" not in session or session["username"] != USERNAME:
        return jsonify({"success": False, "error": "Unauthorized access"}), 403
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Reset achievement data
        cursor.execute('''
            UPDATE achievement 
            SET burned_calories = 0, active_hours = 0, completed_tasks = 0, ongoing_tasks = 0 
            WHERE id = 1
        ''')
        
        # Clear all logs
        cursor.execute("DELETE FROM calories_log")
        
        # Clear detailed_calories_log if it exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='detailed_calories_log'")
        if cursor.fetchone():
            cursor.execute("DELETE FROM detailed_calories_log")
        
        # Clear accelerometer_calories if it exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='accelerometer_calories'")
        if cursor.fetchone():
            cursor.execute("DELETE FROM accelerometer_calories")
        
        # Reset user_info to default values (optional, uncomment if needed)
        # cursor.execute('''
        #     UPDATE user_info 
        #     SET height = 170, weight = 70, age = 30, gender = 'Nam', 
        #         activity_level = 'ModeratelyActive', bmr = 1700, tdee = 2635
        #     WHERE id = 1
        # ''')
        
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "All data reset successfully"})
    except sqlite3.Error as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)