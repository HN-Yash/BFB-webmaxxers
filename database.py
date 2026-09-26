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

# 4. Table 2: The Dynamic Credential Ledger (Added Audit Fields & Categories)
cursor.execute('''
    CREATE TABLE credentials_ledger (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id TEXT,
        issuer_name TEXT,
        credential_name TEXT,
        credential_category TEXT,
        credential_value TEXT,
        verification_status TEXT DEFAULT 'Verified',
        issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(student_id)
    )
''')

# 5. Insert Core Identity Data (Updated to APAAR IDs)
sample_students = [
    ('APAAR1001', 'Aarav Sharma', '2002-05-14', 'Rajesh Sharma', 'Sunita Sharma', 'General', '+919876543210', 'aarav.sharma@example.com', "/static/apaar1001.png", 'O+', '123 MG Road, Jaipur', '45 Park Street, Delhi', 'Rajasthan', '302001', 'Male', 'Indian'),
    ('APAAR1002', 'Priya Patel', '2001-11-20', 'Suresh Patel', 'Meena Patel', 'OBC', '+919876543211', 'priya.patel@example.com', "/static/apaar1002.png", 'A+', '78 Station Road, Ahmedabad', '78 Station Road, Ahmedabad', 'Gujarat', '380001', 'Female', 'Indian'),
    ('APAAR1003', 'Rohan Verma', '2003-01-08', 'Anil Verma', 'Kavita Verma', 'SC', '+919876543212', 'rohan.verma@example.com', "/static/apaar1003.png", 'B+', '12 Civil Lines, Lucknow', '88 Knowledge Park, Greater Noida', 'Uttar Pradesh', '226001', 'Male', 'Indian'),
    ('APAAR1004', 'Ananya Iyer', '2002-08-30', 'Subramanian Iyer', 'Lakshmi Iyer', 'General', '+919876543213', 'ananya.iyer@example.com', "/static/apaar1004.png", 'AB+', '45 Anna Nagar, Chennai', '12 Indiranagar, Bengaluru', 'Tamil Nadu', '600040', 'Female', 'Indian'),
    ('APAAR1005', 'Vikram Singh', '2000-12-12', 'Mahendra Singh', 'Pushpa Kanwar', 'General', '+919876543214', 'vikram.singh@example.com', "/static/apaar1005.png", 'O-', '56 Mall Road, Shimla', '56 Mall Road, Shimla', 'Himachal Pradesh', '171001', 'Male', 'Indian'),
    ('APAAR1006', 'Sanya Gupta', '2003-03-25', 'Ramesh Gupta', 'Rekha Gupta', 'General', '+919876543215', 'sanya.gupta@example.com', "/static/apaar1006.png", 'A-', '89 Sector 17, Chandigarh', '89 Sector 17, Chandigarh', 'Punjab', '160017', 'Female', 'Indian'),
    ('APAAR1007', 'Rahul Das', '2001-07-19', 'Bimal Das', 'Aparna Das', 'ST', '+919876543216', 'rahul.das@example.com', "/static/apaar1007.png", 'B-', '34 Salt Lake, Kolkata', '34 Salt Lake, Kolkata', 'West Bengal', '700091', 'Male', 'Indian'),
    ('APAAR1008', 'Meera Nair', '2002-10-05', 'Unnikrishnan Nair', 'Sridevi Nair', 'General', '+919876543217', 'meera.nair@example.com', "/static/apaar1008.png", 'AB-', '101 MG Road, Kochi', '22 Koramangala, Bengaluru', 'Kerala', '682011', 'Female', 'Indian'),
    ('APAAR1009', 'Aditya Joshi', '2003-04-17', 'Prakash Joshi', 'Shalini Joshi', 'General', '+919876543218', 'aditya.joshi@example.com', "/static/apaar1009.png", 'O+', '67 FC Road, Pune', '67 FC Road, Pune', 'Maharashtra', '411004', 'Male', 'Indian'),
    ('APAAR1010', 'Neha Reddy', '2002-02-14', 'Venkat Reddy', 'Padma Reddy', 'OBC', '+919876543219', 'neha.reddy@example.com', "/static/apaar1010.png", 'A+', '15 Jubilee Hills, Hyderabad', '15 Jubilee Hills, Hyderabad', 'Telangana', '500033', 'Female', 'Indian'),
    ('APAAR1011', 'Karan Mehta', '2001-09-09', 'Dinesh Mehta', 'Sita Mehta', 'General', '+919876543220', 'karan.mehta@example.com', "/static/apaar1011.png", 'B+', '90 Marine Drive, Mumbai', '90 Marine Drive, Mumbai', 'Maharashtra', '400020', 'Male', 'Indian'),
    ('APAAR1012', 'Pooja Choudhury', '2003-06-30', 'Debajit Choudhury', 'Runu Choudhury', 'OBC', '+919876543221', 'pooja.c@example.com', "/static/apaar1012.png", 'O+', '23 GS Road, Guwahati', '12 Hostels, NIT Silchar', 'Assam', '781005', 'Female', 'Indian'),
    ('APAAR1013', 'Devendra Yadav', '2002-01-22', 'Ramakant Yadav', 'Urmila Yadav', 'OBC', '+919876543222', 'dev.yadav@example.com', "/static/apaar1013.png", 'A+', '11 Kanti Factory Road, Patna', '11 Kanti Factory Road, Patna', 'Bihar', '800020', 'Male', 'Indian'),
    ('APAAR1014', 'Tanvi Bhat', '2003-11-11', 'Ganesh Bhat', 'Sudha Bhat', 'General', '+919876543223', 'tanvi.bhat@example.com', "/static/apaar1014.png", 'B+', '56 Car Street, Mangaluru', '56 Car Street, Mangaluru', 'Karnataka', '575001', 'Female', 'Indian'),
    ('APAAR1015', 'Mohammed Zaid', '2001-04-03', 'Tariq Zaid', 'Fatima Zaid', 'General', '+919876543224', 'zaid.m@example.com', "/static/apaar1015.png", 'O+', '88 MG Marg, Prayagraj', '42 Jamia Nagar, Delhi', 'Uttar Pradesh', '211001', 'Male', 'Indian')
]
cursor.executemany("INSERT INTO students VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", sample_students)

# 6. Insert Dynamic Credentials (Fully categorized for filtering)
sample_credentials = [
    # Aarav Sharma (Engineering focus)
    ("APAAR1001", "CBSE", "10th Board Score", "Board Exam", "95.4%", "Verified"),
    ("APAAR1001", "CBSE", "12th Board Score", "Board Exam", "96.2%", "Verified"),
    ("APAAR1001", "NTA", "JEE Mains Percentile", "National Engineering", "98.1", "Verified"),
    ("APAAR1001", "IIT JAB", "JEE Advanced Rank", "National Engineering", "4521", "Verified"),
    
    # Priya Patel (Medical focus)
    ("APAAR1002", "GSEB", "10th Board Score", "Board Exam", "92.1%", "Verified"),
    ("APAAR1002", "GSEB", "12th Board Score", "Board Exam", "94.5%", "Verified"),
    ("APAAR1002", "NTA", "NEET UG Rank", "Medical", "8502", "Verified"),
    
    # Rohan Verma (Arts/Science focus)
    ("APAAR1003", "UP Board", "12th Board Score", "Board Exam", "88.5%", "Verified"),
    ("APAAR1003", "NTA", "CUET Percentile", "National Arts/Science", "99.1", "Verified"),

    # Ananya Iyer (Engineering + State)
    ("APAAR1004", "TN State Board", "12th Board Score", "Board Exam", "99.0%", "Verified"),
    ("APAAR1004", "Anna University", "TNEA Rank", "State Engineering", "112", "Verified"),
    ("APAAR1004", "NTA", "JEE Mains Percentile", "National Engineering", "94.5", "Verified"),

    # Vikram Singh (Basic Boards)
    ("APAAR1005", "HPBOSE", "12th Board Score", "Board Exam", "85.2%", "Verified"),

    # Sanya Gupta (Medical + State)
    ("APAAR1006", "CBSE", "12th Board Score", "Board Exam", "97.1%", "Verified"),
    ("APAAR1006", "NTA", "NEET UG Rank", "Medical", "3201", "Verified"),
    
    # Rahul Das (Engineering)
    ("APAAR1007", "WBCHSE", "12th Board Score", "Board Exam", "91.8%", "Verified"),
    ("APAAR1007", "WBJEEB", "WBJEE Rank", "State Engineering", "890", "Verified"),

    # Meera Nair (Arts/Science)
    ("APAAR1008", "Kerala DHSE", "12th Board Score", "Board Exam", "96.5%", "Verified"),
    ("APAAR1008", "NTA", "CUET Percentile", "National Arts/Science", "98.8", "Verified"),

    # Aditya Joshi (Engineering)
    ("APAAR1009", "Maharashtra HSC", "12th Board Score", "Board Exam", "93.4%", "Verified"),
    ("APAAR1009", "State CET Cell", "MHT CET Percentile", "State Engineering", "99.4", "Verified"),
    ("APAAR1009", "NTA", "JEE Mains Percentile", "National Engineering", "97.2", "Verified"),

    # Neha Reddy (Medical)
    ("APAAR1010", "TSBIE", "12th Board Score", "Board Exam", "98.5%", "Verified"),
    ("APAAR1010", "NTA", "NEET UG Rank", "Medical", "1540", "Verified"),

    # Karan Mehta (Commerce/Management)
    ("APAAR1011", "CBSE", "12th Board Score", "Board Exam", "94.2%", "Verified"),
    ("APAAR1011", "NTA", "CUET Percentile", "National Arts/Science", "96.5", "Verified"),

    # Pooja Choudhury (Engineering)
    ("APAAR1012", "AHSEC", "12th Board Score", "Board Exam", "89.9%", "Verified"),
    ("APAAR1012", "DTE Assam", "Assam CEE Rank", "State Engineering", "450", "Verified"),

    # Devendra Yadav (Medical)
    ("APAAR1013", "BSEB", "12th Board Score", "Board Exam", "87.6%", "Verified"),
    ("APAAR1013", "NTA", "NEET UG Rank", "Medical", "12450", "Verified"),

    # Tanvi Bhat (Engineering Focus - Karnataka)
    ("APAAR1014", "Karnataka PU Board", "10th Board Score", "Board Exam", "95.0%", "Verified"),
    ("APAAR1014", "Karnataka PU Board", "12th Board Score", "Board Exam", "97.5%", "Verified"),
    ("APAAR1014", "KEA", "KCET Rank", "State Engineering", "850", "Verified"),
    ("APAAR1014", "COMEDK", "COMEDK UGET Rank", "State Engineering", "1205", "Verified"),

    # Mohammed Zaid (Engineering)
    ("APAAR1015", "UP Board", "12th Board Score", "Board Exam", "92.3%", "Verified"),
    ("APAAR1015", "NTA", "JEE Mains Percentile", "National Engineering", "96.8", "Verified")
]

cursor.executemany('''
    INSERT INTO credentials_ledger 
    (student_id, issuer_name, credential_name, credential_category, credential_value, verification_status) 
    VALUES (?, ?, ?, ?, ?, ?)
''', sample_credentials)

conn.commit()
conn.close()

print("Enterprise Vault rebuilt with Secure Dynamic Ledger and Categorized Data!")