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
    // 1. Hide the input forms
    document.querySelector('.toggle-container').style.display = 'none';
    document.getElementById('mode_otp').style.display = 'none';
    document.getElementById('mode_pin').style.display = 'none';

    // 2. Map Core Identity
    const fullName = apiData.full_name || apiData.name || 'Restricted Access';
    document.getElementById('student_name').innerText = fullName;
    document.getElementById('student_dob').innerText = "DOB: " + (apiData.dob || 'XXX') + (apiData.category ? " • " + apiData.category : "");
    
    if (apiData.father_name && apiData.mother_name) {
        document.getElementById('student_parents').innerText = `${apiData.father_name} & ${apiData.mother_name}`;
    } else {
        document.getElementById('student_parents').innerText = "Restricted Access";
    }

// 3. Handle Profile Photo gracefully (with error fallback)
   // 3. Handle Profile Photo gracefully (with error fallback)
    const photoEl = document.getElementById('student_photo');
    
    photoEl.onerror = function() {
        console.error("Image failed to load:", this.src);
        this.onerror = null; 
        this.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=e8f5ec&color=1b5e20&size=150`;
    };

    let providedPic = apiData.profile_pic || apiData.photo_url;
    if (providedPic && providedPic !== "null" && providedPic.trim() !== "") {
        // Point explicitly to the Flask server
        if (providedPic.startsWith('/static')) {
            providedPic = 'http://127.0.0.1:5000' + providedPic; 
        }
        // Cache-buster: forces the browser to fetch the image fresh every single time
        photoEl.src = providedPic + "?v=" + new Date().getTime();
    } else {
        photoEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=e8f5ec&color=1b5e20&size=150`;
    }
    // 4. Default credential states
    document.getElementById('student_score').innerText = '--%';
    document.getElementById('student_rank').innerText = '--';

    // 5. Bulletproof Credential Extraction
    if (apiData.credentials && apiData.credentials.length > 0) {
        apiData.credentials.forEach(cred => {
            const cat = (cred.category || "").toLowerCase();
            const name = (cred.name || "").toLowerCase();

            // Catch any variation of Board / ICSE / CBSE
            if (cat.includes('board') || name.includes('board') || name.includes('icse') || name.includes('cbse')) {
                const val = cred.value.toString();
                document.getElementById('student_score').innerText = val.includes('%') ? val : val + '%';
            }
            
            // Catch any variation of Engineering / JEE
            if (cat.includes('engineering') || name.includes('jee')) {
                document.getElementById('student_rank').innerText = cred.value;
            }
        });
    }

    // 6. Reveal the green success card
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
        
        if (response.ok && data.success) {
            btn.innerText = "Sent!";
            document.getElementById('otp_entry_area').style.display = 'block';
        } else {
            throw new Error(data.message || "Failed to generate OTP");
        }
    } catch (error) {
        alert("Error requesting OTP: " + error.message);
        btn.innerText = "Send OTP";
        btn.disabled = false;
    }
}

async function testRemoteVerification() {
    const apaarId = document.getElementById('apaarInput').value;
    const userOtp = document.getElementById('otpInput').value;
    
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
        
        if (response.ok && data.success) {
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
        
        if (response.ok && data.success) {
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