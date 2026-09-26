import sqlite3 as sq

conn = sq.connect("students.db")
cursor = conn.cursor()

# 1. Force SQLite to respect Foreign Keys
cursor.execute('PRAGMA foreign_keys = ON')

# 2. Clear old tables to start fresh
cursor.execute('DROP TABLE IF EXISTS credentials_ledger')
cursor.execute('DROP TABLE IF EXISTS students')

# 3. Table 1: Core Identity (Agnostic to exams)
cursor.execute('''
    CREATE TABLE students (
        student_id TEXT PRIMARY KEY,
        full_name TEXT,
        dob TEXT,
        father_name TEXT,
        mother_name TEXT,
        category TEXT,
        phone_number TEXT,
        email_id TEXT,
        profile_pic TEXT,
        blood_group TEXT,
        permanent_address TEXT,
        current_address TEXT,
        domicile_state TEXT,
        pincode TEXT,
        gender TEXT,
        nationality TEXT
    )
''')
