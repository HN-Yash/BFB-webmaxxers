# 🛡️ Zero Verification Node (2AM Purus)

A lightweight, dual-mode identity verification system designed to streamline physical and remote onboarding (e.g., university admissions, hostel reporting). It replaces manual paperwork with a secure, API-driven architecture featuring granular Self-Sovereign Identity (SSI) data consent.

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

## 🚀 Getting Started

### Prerequisites
* Python 3.x installed
* A Gmail account with an App Password generated (for OTP routing)

