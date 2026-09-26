import random
import smtplib
import sqlite3
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from flask import Flask, jsonify, request
from flask_cors import CORS

SENDER_EMAIL = "chinmayjois223@gmail.com"
SENDER_PASSWORD = "odbmcktvjgumdaty"  # 16-character app password without spaces
app = Flask(__name__)
CORS(app)

active_otps = {}

def send_otp_email(recipient_email, student_name, otp):
    """Sends an OTP email via Gmail SMTP."""
    try:
        msg = MIMEMultipart()
        msg["From"] = SENDER_EMAIL
        msg["To"] = recipient_email
        msg["Subject"] = f"Zero Document Verification Node - OTP: {otp}"

        body = f"""
Hello {student_name},

Your one-time authorization code for academic credential verification is:

{otp}

This code is valid for 5 minutes. If you did not request this, please ignore this email.

Regards,
Zero Document Verification Node
"""
        msg.attach(MIMEText(body, "plain"))

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.send_message(msg)
        server.close()
        return True
    except Exception as e:
        print(f"[SMTP ERROR] Could not send email to {recipient_email}: {e}")
        return False
def get_db_connection():
    conn = sqlite3.connect("students.db")
    conn.row_factory = sqlite3.Row
    return conn

def fetch_student_full_profile(student_id):
    """Performs relational join between core profile and credentials ledger."""
    conn = get_db_connection()

    student = conn.execute(
        "SELECT * FROM students WHERE student_id = ?", (student_id,)
    ).fetchone()
    if not student:
        conn.close()
        return None

    credentials_rows = conn.execute(
        "SELECT * FROM credentials_ledger WHERE student_id = ?", (student_id,)
    ).fetchall()
    conn.close()

    credentials = []
    for row in credentials_rows:
        credentials.append({
            "issuer": row["issuer_name"],
            "name": row["credential_name"],
            "category": row["credential_category"],
            "value": row["credential_value"],
            "status": row["verification_status"],
            "issued_at": row["issued_at"],
        })

    profile = dict(student)
    profile["credentials"] = credentials
    return profile
if __name__ == "__main__":
    app.run(port=5000, debug=True)