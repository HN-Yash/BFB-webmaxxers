import random
import smtplib
import sqlite3
import time
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from flask import Flask, jsonify, request
from flask_cors import CORS
# The new, secure way
import os
from dotenv import load_dotenv

load_dotenv()
print(f"DEBUG EMAIL: '{os.getenv('SENDER_EMAIL')}'")
print(f"DEBUG PASS: '{os.getenv('SENDER_PASSWORD')}'")
# This pulls the data out of the file securely
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")

app = Flask(__name__)
CORS(app)

active_otps = {}
active_pins={}

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

@app.route("/api/otp/generate", methods=["POST"])
def generate_otp():
    data = request.get_json()
    apaar_id = data.get("apaar_id") if data else None

    if not apaar_id:
        return jsonify(
            {"success": False, "message": "APAAR ID is required"}
        ), 400

    conn = get_db_connection()
    student = conn.execute(
        "SELECT full_name, email_id FROM students WHERE student_id = ?",
        (apaar_id,),
    ).fetchone()
    conn.close()

    if not student:
        return jsonify(
            {"success": False, "message": "Student record not found"}
        ), 404

    recipient_email = student["email_id"]
    student_name = student["full_name"]

    otp = str(random.randint(100000, 999999))
    
    # Store OTP with a 5-minute (300 seconds) expiration timestamp
    active_otps[apaar_id] = {
        "otp": otp,
        "expires_at": time.time() + 300
    }

    print(f"\n==========================================")
    print(f"[TERMINAL BACKUP] OTP for {apaar_id}: {otp}")
    print(f"==========================================\n")

    sent = send_otp_email(recipient_email, student_name, otp)

    if sent:
        return jsonify({
            "success": True,
            "message": f"OTP successfully sent to {recipient_email}",
        }), 200
    else:
        return jsonify({
            "success": True,
            "message": f"Email dispatch failed. OTP printed to terminal console for testing.",
        }), 200

@app.route("/api/verify/remote", methods=["POST"])
def verify_remote():
    data = request.get_json()
    apaar_id = data.get("apaar_id") if data else None
    user_otp = data.get("otp") if data else None

    if not apaar_id or not user_otp:
        return jsonify(
            {"success": False, "message": "Missing APAAR ID or OTP"}
        ), 400

    stored_data = active_otps.get(apaar_id)

    if not stored_data:
        return jsonify(
            {"success": False, "message": "No active OTP found. Please request a new one."}
        ), 401

    # Check if the current time has passed the expiration timestamp
    if time.time() > stored_data["expires_at"]:
        del active_otps[apaar_id] # Clean up the expired OTP
        return jsonify(
            {"success": False, "message": "OTP has expired. Please request a new one."}
        ), 401

    if stored_data["otp"] != user_otp:
        return jsonify(
            {"success": False, "message": "Invalid OTP"}
        ), 401

    profile = fetch_student_full_profile(apaar_id)

    if profile is None:
        return jsonify(
            {"success": False, "message": "Student record not found"}
        ), 404

    del active_otps[apaar_id]

    return jsonify(
        {"success": True, "mode": "Remote OTP Verified", "data": profile}
    ), 200

@app.route("/api/wallet/generate_pin", methods=["POST"])
def wallet_generate_pin():
    """Triggered by the student's mobile wallet to create a temporary access PIN."""
    data = request.get_json()
    apaar_id = data.get("apaar_id") if data else None
    permissions = data.get("permissions", {}) if data else {}

    if not apaar_id:
        return jsonify({"success": False, "message": "Missing APAAR ID"}), 400

    profile = fetch_student_full_profile(apaar_id)
    if not profile:
        return jsonify({"success": False, "message": "Student record not found"}), 404

    # Generate a random 6-digit PIN
    pin = str(random.randint(100000, 999999))
    
    # Store the PIN and the permissions the student authorized
    active_pins[apaar_id] = {
        "pin": pin,
        "permissions": permissions
    }

    return jsonify({
        "success": True, 
        "pin": pin, 
        "message": "PIN generated successfully"
    }), 200

@app.route("/api/verify/ssi", methods=["POST"])
def verify_ssi():
    """Triggered by the desktop node to verify the PIN and fetch authorized data."""
    data = request.get_json()
    apaar_id = data.get("apaar_id") if data else None
    pin = data.get("pin") if data else None

    if not apaar_id or not pin:
        return jsonify({"success": False, "message": "Missing APAAR ID or Wallet PIN"}), 400

    stored_data = active_pins.get(apaar_id)

    if not stored_data or stored_data["pin"] != pin:
        return jsonify({"success": False, "message": "Invalid or expired PIN"}), 401

    full_profile = fetch_student_full_profile(apaar_id)

    # Use the permissions strictly dictated by the student's wallet
    wallet_permissions = stored_data["permissions"]
    filtered_data = {}

    if wallet_permissions.get("core_identity", True):
        filtered_data["student_id"] = full_profile["student_id"]
        filtered_data["full_name"] = full_profile["full_name"]
        filtered_data["dob"] = full_profile["dob"]
        filtered_data["category"] = full_profile["category"]
        filtered_data["domicile_state"] = full_profile["domicile_state"]
        filtered_data["profile_pic"] = full_profile.get("profile_pic")
        filtered_data["father_name"] = full_profile.get("father_name")
        filtered_data["mother_name"] = full_profile.get("mother_name")

    if wallet_permissions.get("academic_records", True):
        filtered_data["credentials"] = full_profile["credentials"]
    else:
        filtered_data["credentials"] = []

    # Consume the PIN so it cannot be reused
    del active_pins[apaar_id]

    return jsonify({
        "success": True,
        "mode": "SSI Wallet PIN Verified",
        "data": filtered_data,
    }), 200
if __name__ == "__main__":
    app.run(port=5000, debug=True)