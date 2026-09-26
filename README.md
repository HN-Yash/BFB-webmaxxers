# 🛡️ Zero Verification Node (2AM Purus)

A frictionless "verification layer" designed to eliminate physical document verification during institutional reporting (e.g., university admissions, hostel onboarding). By leveraging the **APAAR ID** as the central anchor, this system dynamically fetches atomic, government-verified data points to instantly prove student eligibility.

## 💡 The Philosophy: Data Minimization

Traditional physical reporting requires students to carry vulnerable original documents, which authorities must manually cross-reference. The Zero Verification Node replaces that outdated workflow by extracting only the exact data required:

* **DOB Verification:** Instead of inspecting a physical 10th-grade marksheet just to verify age, the node securely fetches *only* the government-verified Date of Birth.
* **Academic Eligibility:** Instead of manually reviewing a 12th-grade marksheet, the node retrieves *only* the verified board exam scores directly from the National Academic Depository (NAD).

The authority sees a definitive, tamper-proof dashboard, drastically speeding up the queue and eliminating physical paper trails.

## ✨ Core Features

* **APAAR-Driven Architecture:** The Automated Permanent Academic Account Registry (APAAR) ID acts as the master key, seamlessly linking the student to their verified educational ledger.
* **Dual-Mode Routing:** 
  * **In-Person (Edge SSI):** Cryptographic PIN-based verification designed specifically for fast-moving physical admission desks.
  * **Remote (Cloud OTP):** Traditional centralized verification via email OTP using SMTP.
* **Granular Privacy Controls:** Students control their data payload via a mobile wallet interface, choosing to share "Core Identity" only, or enabling "Academic Records" based on what the desk requires.
* **Time-Sensitive Access:** Edge PINs auto-expire after 5 minutes, ensuring the verification window remains secure.

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, Vanilla JavaScript (Zero heavy frameworks for maximum speed)
* **Backend:** Python, Flask, Flask-CORS
* **Database:** SQLite3 (Local ledger simulating NAD/DigiLocker API responses)
* **Protocols:** SMTP, RESTful API