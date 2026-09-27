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


// Global variable to hold the current profile's credentials for quick filtering
let currentStudentCredentials = [];

/* =========================================
   HELPER: INJECT DATA & SHOW RESULT CARD
   ========================================= */

// Add 'mode' to the function signature
function showResultCard(apiData, mode) {
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

    // 3. Handle Profile Photo gracefully
    const photoEl = document.getElementById('student_photo');
    photoEl.onerror = function() {
        this.onerror = null; 
        this.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=e8f5ec&color=1b5e20&size=150`;
    };

    let providedPic = apiData.profile_pic || apiData.photo_url;
    if (providedPic && providedPic !== "null" && providedPic.trim() !== "") {
        if (providedPic.startsWith('/static')) {
            providedPic = 'http://127.0.0.1:5000' + providedPic; 
        }
        photoEl.src = providedPic + "?v=" + new Date().getTime();
    } else {
        photoEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=e8f5ec&color=1b5e20&size=150`;
    }

    // 4. Setup Dynamic Credentials & Populate Dropdown
    currentStudentCredentials = apiData.credentials || [];
    const dropdown = document.getElementById('category_dropdown');
    
    if(dropdown) {
        dropdown.innerHTML = '<option value="All">All Verified Records</option>'; 
        if (currentStudentCredentials.length > 0) {
            const uniqueCategories = [...new Set(currentStudentCredentials.map(c => c.category).filter(Boolean))];
            uniqueCategories.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat;
                opt.innerText = cat;
                dropdown.appendChild(opt);
            });
        }
    }
    renderCredentialBoxes("All");

    // 5. Apply "Edge vs Cloud" UI Differences
    const downloadBtn = document.getElementById('download_hr_copy');
    const archBadge = document.getElementById('auth_architecture_badge');

    if (mode === 'remote') {
        archBadge.innerText = "☁️ CLOUD: Centralized Master Recovery";
        archBadge.style.background = "#fee2e2";
        archBadge.style.color = "#991b1b";
        downloadBtn.style.display = 'block';
        downloadBtn.onclick = () => window.print();
    } else {
        archBadge.innerText = "📱 EDGE: Scoped SSI Presentation";
        archBadge.style.background = "#e0e7ff";
        archBadge.style.color = "#3730a3";
        downloadBtn.style.display = 'none';
    }

    // 6. Reveal the green success card
    document.getElementById('result_card').style.display = 'block';
}
/* =========================================
   DYNAMIC CREDENTIAL RENDERER
   ========================================= */

function renderCredentialBoxes(filterCategory) {
    const container = document.getElementById('dynamic_credentials');
    container.innerHTML = ''; // Clear previous boxes

    // Filter the array based on what the user selected in the dropdown
    const filtered = filterCategory === "All" 
        ? currentStudentCredentials 
        : currentStudentCredentials.filter(c => c.category === filterCategory);

    // Generate HTML for each credential box
    filtered.forEach(cred => {
        const box = document.createElement('div');
        box.className = 'data-box';
        
        const label = document.createElement('div');
        label.className = 'data-label';
        label.innerText = (cred.name || "Credential").toUpperCase();

        const val = document.createElement('div');
        val.className = 'data-value';
        
        // Auto-append percentage signs for board scores if missing
        let finalValue = cred.value.toString();
        if (cred.category && cred.category.toLowerCase().includes('board') && !finalValue.includes('%')) {
            finalValue += '%';
        }
        val.innerText = finalValue;

        box.appendChild(label);
        box.appendChild(val);
        container.appendChild(box);
    });
}

// Attach the event listener to the dropdown so it updates in real-time
document.getElementById('category_dropdown').addEventListener('change', function(e) {
    renderCredentialBoxes(e.target.value);
});


/* =========================================
   API INTEGRATION FUNCTIONS
   ========================================= */

async function requestOTP() {
    // 1. Grab the elements
    const apaarInput = document.getElementById('apaarInput');
    const btn = document.getElementById('send_otp_btn');
    
    // 2. Safety check: Did the HTML IDs get mixed up?
    if (!apaarInput || !btn) {
        console.error("Critical: Could not find the input or button in the HTML.");
        return;
    }

    const apaarId = apaarInput.value.trim();

    // 3. Prevent empty submissions
    if (!apaarId) {
        showToast("Please enter the student's APAAR ID first", "error");
        apaarInput.focus();
        return;
    }
    
    // 4. Update UI to show progress
    btn.innerText = "Sending...";
    btn.disabled = true;

    try {
        const response = await fetch('http://127.0.0.1:5000/api/otp/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apaar_id: apaarId })
        });

        // Try to parse the JSON, but catch server crash HTML pages
        let data;
        try {
            data = await response.json();
        } catch (parseError) {
            throw new Error("Server is down or returned an invalid response.");
        }
        
        if (response.ok && data.success) {
            btn.innerText = "Sent!";
            document.getElementById('otp_entry_area').style.display = 'block';
            showToast("OTP sent successfully!", "success");
        } else {
            throw new Error(data.message || "Failed to generate OTP");
        }
    } catch (error) {
        showToast("Error: " + error.message, "error");
        btn.innerText = "Send OTP to Email";
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
            showResultCard(studentData, 'remote');
        } else {
            showToast("Verification Failed: " + (data.message || "Invalid OTP"), "error")
            verifyBtn.innerText = "Verify";
        }
    } catch (error) {
        showToast("Error verifying OTP: " + error.message, "error");
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
            showResultCard(studentData, 'pin');
        } else {
            showToast("Unlock Failed: " + (data.message || "Invalid PIN"), "error");
            unlockBtn.innerText = "Unlock";
        }
    } catch (error) {
        showToast("Error verifying SSI PIN: " + error.message, "error");
        unlockBtn.innerText = "Unlock";
    }
}
function resetToPreviousMenu() {
    // 1. Hide Result Card
    const resultCard = document.getElementById('result_card');
    if (resultCard) resultCard.style.display = 'none';

    // 2. Restore Toggle Buttons Container
    const toggleContainer = document.querySelector('.toggle-container');
    if (toggleContainer) toggleContainer.style.display = 'flex';

    // 3. Reset "Send OTP" Button
    const sendOtpBtn = document.getElementById('send_otp_btn');
    if (sendOtpBtn) {
        sendOtpBtn.innerText = 'Send OTP';
        sendOtpBtn.disabled = false;
        sendOtpBtn.className = 'action-btn';
        sendOtpBtn.style.pointerEvents = 'auto';
        sendOtpBtn.style.opacity = '1';
        sendOtpBtn.style.cursor = 'pointer';
        sendOtpBtn.style.backgroundColor = '';
        sendOtpBtn.onclick = requestOTP;
    }

    // 4. Reset "Verify" Button
    const verifyBtn = document.querySelector('#otp_entry_area .action-btn');
    if (verifyBtn) {
        verifyBtn.innerText = 'Verify';
        verifyBtn.disabled = false;
        verifyBtn.style.pointerEvents = 'auto';
        verifyBtn.style.opacity = '1';
        verifyBtn.style.cursor = 'pointer';
        verifyBtn.style.backgroundColor = '#059669';
        verifyBtn.onclick = testRemoteVerification;
    }

    // 5. Reset "Unlock" Button (In-Person PIN mode)
    const unlockBtn = document.querySelector('#mode_pin .action-btn');
    if (unlockBtn) {
        unlockBtn.innerText = 'Unlock';
        unlockBtn.disabled = false;
        unlockBtn.style.pointerEvents = 'auto';
        unlockBtn.style.opacity = '1';
        unlockBtn.style.cursor = 'pointer';
        unlockBtn.onclick = testSSIVerification;
    }

    // 6. Hide and clear the OTP input row
    const otpArea = document.getElementById('otp_entry_area');
    if (otpArea) otpArea.style.display = 'none';

    const otpInput = document.getElementById('otpInput');
    if (otpInput) {
        otpInput.value = '';
        otpInput.disabled = false;
    }

    // 7. Re-enable input fields
    const apaarInput = document.getElementById('apaarInput');
    if (apaarInput) apaarInput.disabled = false;

    const pinInput = document.getElementById('pinInput');
    if (pinInput) pinInput.disabled = false;

    // 8. Restore active tab
    const isPinActive = document.getElementById('tab_pin')?.classList.contains('active');
    if (isPinActive) {
        document.getElementById('mode_pin').style.display = 'block';
        document.getElementById('mode_otp').style.display = 'none';
    } else {
        document.getElementById('mode_otp').style.display = 'block';
        document.getElementById('mode_pin').style.display = 'none';
    }
}

/* =========================================
   TOAST NOTIFICATION HELPER
   ========================================= */
function showToast(message, type = 'error') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    
    container.appendChild(toast);
    
    // Automatically remove it from the DOM after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 5000);
}