/* =========================================
   UI NAVIGATION (TAB SWITCHING)
   ========================================= */

const tabOtp = document.getElementById('tab_otp');
const tabPin = document.getElementById('tab_pin');
const modeOtp = document.getElementById('mode_otp');
const modePin = document.getElementById('mode_pin');

tabOtp.addEventListener('click', () => {
    tabOtp.classList.add('active');
    tabPin.classList.remove('active');
    modeOtp.style.display = 'block';
    modePin.style.display = 'none';
});

tabPin.addEventListener('click', () => {
    tabPin.classList.add('active');
    tabOtp.classList.remove('active');
    modePin.style.display = 'block';
    modeOtp.style.display = 'none';
});

/* =========================================
   HELPER: INJECT DATA & SHOW RESULT CARD
   ========================================= */

function showResultCard(apiData) {
    // 1. Hide the input forms and toggle switch for a clean UI
    document.querySelector('.toggle-container').style.display = 'none';
    modeOtp.style.display = 'none';
    modePin.style.display = 'none';

    // 2. Map backend data to UI elements 
    // (Note: Adjust 'apiData.name' to 'apiData.full_name' etc., based on your exact Python JSON keys)
    document.getElementById('student_name').innerText = apiData.name || apiData.full_name || 'Verified Student';
    document.getElementById('student_dob').innerText = "DOB: " + (apiData.dob || 'Confidential');
    
    if (apiData.board_score) {
        document.getElementById('student_score').innerText = apiData.board_score + '%';
    }
    if (apiData.jee_rank || apiData.jee_adv_rank) {
        document.getElementById('student_rank').innerText = apiData.jee_rank || apiData.jee_adv_rank;
    }
    
    // Format parents' names if provided
    if (apiData.father_name && apiData.mother_name) {
        document.getElementById('student_parents').innerText = `${apiData.father_name} & ${apiData.mother_name}`;
    }

    // Optional: Update profile photo if your API returns a URL
    if (apiData.photo_url || apiData.profile_pic) {
        document.getElementById('student_photo').src = apiData.photo_url || apiData.profile_pic;
    }

    // 3. Reveal the green success card
    document.getElementById('result_card').style.display = 'block';
}

/* =========================================
   API INTEGRATION FUNCTIONS
   ========================================= */

async function requestOTP() {
    const apaarId = document.getElementById('apaarInput').value;
    const btn = document.getElementById('send_otp_btn');
    
    btn.innerText = "Sending...";
    btn.disabled = true;

    try {
        const response = await fetch('http://127.0.0.1:5000/api/otp/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apaar_id: apaarId })
        });

        const data = await response.json();
        
        // Show OTP entry area if successful
        btn.innerText = "Sent!";
        document.getElementById('otp_entry_area').style.display = 'block';
        
    } catch (error) {
        alert("Error requesting OTP: " + error.message);
        btn.innerText = "Send OTP";
        btn.disabled = false;
    }
}

async function testRemoteVerification() {
    const apaarId = document.getElementById('apaarInput').value;
    const userOtp = document.getElementById('otpInput').value;
    
    // Find the button that was clicked (inside the OTP entry area)
    const verifyBtn = event.target;
    verifyBtn.innerText = "Verifying...";

    try {
        const response = await fetch('http://127.0.0.1:5000/api/verify/remote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                apaar_id: apaarId,
                otp: userOtp
            })
        });

        const data = await response.json();
        
        // Assuming your Flask backend returns { success: true, data: {...} } or similar
        if (response.ok) {
            // Pass the inner data object to the UI populator
            const studentData = data.student_data || data.data || data; 
            showResultCard(studentData);
        } else {
            alert("Verification Failed: " + (data.message || "Invalid OTP"));
            verifyBtn.innerText = "Verify";
        }
    } catch (error) {
        alert("Error verifying OTP: " + error.message);
        verifyBtn.innerText = "Verify";
    }
}

async function testSSIVerification() {
    const apaarId = document.getElementById('apaarInput').value;
    const userPin = document.getElementById('pinInput').value;
    
    const allowCore = document.getElementById('checkCore').checked;
    const allowAcademic = document.getElementById('checkAcademic').checked;

    const unlockBtn = event.target;
    unlockBtn.innerText = "Unlocking...";

    try {
        const response = await fetch('http://127.0.0.1:5000/api/verify/ssi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                apaar_id: apaarId,
                pin: userPin,
                permissions: {
                    core_identity: allowCore,
                    academic_records: allowAcademic
                }
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            const studentData = data.student_data || data.data || data;
            showResultCard(studentData);
        } else {
            alert("Unlock Failed: " + (data.message || "Invalid PIN"));
            unlockBtn.innerText = "Unlock";
        }
    } catch (error) {
        alert("Error verifying SSI PIN: " + error.message);
        unlockBtn.innerText = "Unlock";
    }
}