# 🛡️ Zero Verification Node

A lightweight, dual-mode identity verification system designed to streamline physical and remote onboarding (e.g., university admissions, hostel reporting). It replaces manual paperwork with a secure, API-driven architecture featuring granular Self-Sovereign Identity (SSI) inspired data consent.

## ✨ Core Features

* **Dual-Mode Routing:** 
  * **Remote (Cloud OTP):** Traditional centralized verification via email OTP using SMTP.
  * **In-Person (Edge SSI):** Cryptographic PIN-based verification for physical desks.
* **Granular Privacy Controls:** Students control their data payload via the mobile wallet, choosing to share "Core Identity" only, or including "Academic Records" (Zero-Knowledge principles).
* **Time-Sensitive Access:** Edge PINs auto-expire after 5 minutes with a dynamic UI state.
* **Frictionless UI:** Glassmorphic mobile wallet design with native-feeling interactions and a dark-mode optimized verification node dashboard.

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, Vanilla JavaScript (No heavy frameworks)
* **Backend:** Python, Flask, Flask-CORS
* **Database:** SQLite3
* **Protocols:** SMTP (App Passwords), RESTful APIs

## 📁 Repository Structure

├── app.py              # Flask server and REST routing logic
├── database.py         # Schema creation and mock database seeder
├── students.db         # SQLite relational database
├── index.html          # Verification desk operator dashboard
├── student.html        # Simulated mobile student wallet interface
├── script.js           # Desk verification logic and UI renderer
├── style.css           # Custom styling and vector animations
└── README.md           # Project documentation

## 🚀 Getting Started

### Prerequisites
* Python 3.x installed
* A Gmail account with an App Password generated (for OTP routing)
* A modern browser (Chrome, Edge, Firefox, or Safari)
* Active internet access for email delivery (or use the built-in terminal fallback)

### Installation
1. Clone the repository:
  Bash:-
  git clone <your-repository-url>
  cd <your-repository-directory>

2. Install backend dependencies:
  Bash:-
  pip install Flask flask-cors python-dotenv

### Database Initialization

* Build the relational schema and populate the database with mock records:   
Bash:-
  python database.py

* This script enforces SQLite foreign keys, clears old tables, creates the students and credentials_ledger schemas, and seeds 15 pre-configured student identities.

### Running the System

1. Start the Flask backend server:   
  Bash:-
  python app.py
* The backend service starts at [http://127.0.0.1:5000](http://127.0.0.1:5000) with debug mode enabled.  

2. Launch the User Interfaces:
* Verification Desk: 
    * * Open index.html in any web browser.  
* Student Wallet Simulator: 
    * * Open student.html in a separate browser tab or mobile emulation window. 

## 🔄 Verification Workflows

1. Remote Verification (Cloud OTP Mode)

* The desk operator enters the student's APAAR ID in index.html under the Remote (OTP) tab and clicks Send OTP to Email.
* The server creates a 6-digit OTP valid for 5 minutes and dispatches it via Gmail SMTP through /api/otp/generate.
* The student shares the OTP received in their inbox.
* The operator enters the code in index.html and clicks Verify via /api/verify/remote.
* The master credential record renders with an option to download or print a physical verification copy.

2. In-Person Verification (SSI Edge Mode)

* The student opens student.html, inputs their APAAR ID, and selects data permissions for Core Identity and Academic Records.
* Clicking Approve & Verification Request calls /api/wallet/generate_pin to create a 6-digit PIN with a 5-minute countdown.
* The student provides the generated PIN to the verification desk.
* The desk operator selects In-Person (PIN) in index.html, inputs the APAAR ID and PIN, and clicks Unlock.
* The backend validates /api/verify/ssi, permanently burns the PIN to avoid reuse, and displays only the authorized profile fields.   

## 📡 API Reference
1. POST /api/otp/generate
Dispatches a 5-minute OTP to the student's registered email address.
* Request Body:
JSON
{
  "apaar_id": "APAAR1001"
}
* Success Response (200 OK):
JSON
{
  "success": true,
  "message": "OTP successfully sent to aarav.sharma@example.com"
}

2. POST /api/verify/remote
Validates an email OTP and returns the complete profile and credentials.
* Request Body:
JSON
{
  "apaar_id": "APAAR1001",
  "otp": "123456"
}
* Success Response (200 OK):
JSON
{
  "success": true,
  "mode": "Remote OTP Verified",
  "data": {
    "student_id": "APAAR1001",
    "full_name": "Aarav Sharma",
    "dob": "2002-05-14",
    "category": "General",
    "domicile_state": "Rajasthan",
    "credentials": [
      {
        "issuer": "CBSE",
        "name": "10th Board Score",
        "category": "Board Exam",
        "value": "95.4%",
        "status": "Verified",
        "issued_at": "2026-09-26 22:10:07"
      }
    ]
  }
}
3. POST /api/wallet/generate_pin
Generates a temporary access PIN scoped to student-authorized permissions.
* Request Body:
JSON
{
  "apaar_id": "APAAR1001",
  "permissions": {
    "core_identity": true,
    "academic_records": false
  }
}
* Success Response (200 OK):
JSON
{
  "success": true,
  "pin": "654321",
  "message": "PIN generated successfully"
}
4. POST /api/verify/ssi
Consumes the wallet PIN and returns filtered records according to student consent.
* Request Body:
JSON
{
  "apaar_id": "APAAR1001",
  "pin": "654321"
}
* Success Response (200 OK):
JSON
{
  "success": true,
  "mode": "SSI Wallet PIN Verified",
  "data": {
    "student_id": "APAAR1001",
    "full_name": "Aarav Sharma",
    "dob": "2002-05-14",
    "category": "General",
    "domicile_state": "Rajasthan",
    "credentials": []
  }
}

## 🧪 Demo Test IDs

APAAR ID's:-
1. APAAR1001
2. APAAR1002
3. APAAR1003
4. APAAR1004
5. APAAR1005
6. APAAR1006
7. APAAR1007
8. APAAR1008
9. APAAR1009
10. APAAR1010
11. APAAR1011
12. APAAR1012
13. APAAR1013
14. APAAR1014
15. APAAR1015

## 🛡️ Demo & Offline Fail-Safe
1. Terminal Console Fallback:
* If internet access is restricted or SMTP port 587 is blocked, app.py logs the code directly to the active terminal as [TERMINAL BACKUP] OTP for <APAAR_ID>: <OTP> and returns a valid status so testing continues uninterrupted.
2. Self-Contained Setup: The project runs entirely out of the box with zero external configuration files or dependency setups required. 