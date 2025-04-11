import sqlite3
from datetime import datetime, timedelta
import random

# Kết nối đến database (hoặc tạo mới nếu chưa có)
conn = sqlite3.connect("data.db")
cursor = conn.cursor()

# Tạo bảng user_info
cursor.execute("""
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
""")

# Tạo bảng calories_log để lưu lượng calo hàng ngày
cursor.execute("""
    CREATE TABLE IF NOT EXISTS calories_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        calories INTEGER
    )
""")

# Chèn một dòng dữ liệu mặc định (nếu chưa có)
cursor.execute("SELECT COUNT(*) FROM user_info")
if cursor.fetchone()[0] == 0:
    cursor.execute("INSERT INTO user_info (height, weight, gender, age) VALUES (170, 65, 'Male', 19)")

# Chèn dữ liệu mẫu vào bảng calories_log
cursor.execute("SELECT COUNT(*) FROM calories_log")
if cursor.fetchone()[0] == 0:
    today = datetime.today()
    for i in range(60):  # Chèn dữ liệu 60 ngày trước
        date = (today - timedelta(days=i)).strftime("%Y-%m-%d")
        calories = random.randint(1800, 2500)  # Giá trị ngẫu nhiên
        cursor.execute("INSERT INTO calories_log (date, calories) VALUES (?, ?)", (date, calories))

# Lưu và đóng kết nối
conn.commit()
conn.close()

print("Database đã được khởi tạo thành công!")
