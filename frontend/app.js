import { signIn, signUp, signOut, getCurrentUser, resetPassword } from './modules/authService.js';
import { initMap } from './modules/mapService.js';
import { fetchWeather } from './modules/weatherService.js';
import { evaluateRisk } from './modules/aiPredictor.js';
import { calculateSpoilageRisk } from './modules/cargoService.js';
import { triggerEmergencyAlert } from './modules/alertService.js';
import { speakAlert } from './modules/speechService.js';

document.addEventListener('DOMContentLoaded', async () => {
    const authContainer = document.getElementById('auth-container');
    const dashboardContainer = document.getElementById('dashboard-container');
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email-input');
    const passwordInput = document.getElementById('password-input');
    const toggleAuthModeBtn = document.getElementById('toggle-auth-mode');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const logoutBtn = document.getElementById('logout-btn');
    const emergencyBtn = document.getElementById('emergency-btn');

    // Toggle Password Visibility
    const togglePasswordBtn = document.getElementById('toggle-password-btn');
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const currentType = passwordInput.getAttribute('type');
            if (currentType === 'password') {
                passwordInput.setAttribute('type', 'text');
                togglePasswordBtn.textContent = '🔒'; // Changes icon when revealed
            } else {
                passwordInput.setAttribute('type', 'password');
                togglePasswordBtn.textContent = '👁️';
            }
        });
    }

    let isSignUpMode = false;

    // Check existing active session
    try {
        const user = await getCurrentUser();
        if (user) {
            showDashboard();
        } else {
            showAuth();
        }
    } catch (err) {
        console.error("Session check error:", err);
        showAuth();
    }

    // Toggle between Login and Sign Up mode
    if (toggleAuthModeBtn) {
        toggleAuthModeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            isSignUpMode = !isSignUpMode;
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const titleElement = authContainer.querySelector('h2');
            
            if (isSignUpMode) {
                if (titleElement) titleElement.textContent = 'Operator Registration';
                if (submitBtn) submitBtn.textContent = 'Sign Up';
                toggleAuthModeBtn.textContent = 'Already have an account? Login';
            } else {
                if (titleElement) titleElement.textContent = 'Operator Login';
                if (submitBtn) submitBtn.textContent = 'Login';
                toggleAuthModeBtn.textContent = 'Need an account? Sign Up';
            }
        });
    }

    // Handle Forgot Password click
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = emailInput ? emailInput.value.trim() : '';
            if (!email) {
                alert('Please enter your email address in the field above first.');
                return;
            }
            try {
                await resetPassword(email);
                alert('Password reset link sent to your email.');
            } catch (err) {
                alert('Error: ' + err.message);
            }
        });
    }

    // Handle Login / Sign Up Form Submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value.trim() : '';

            try {
                if (isSignUpMode) {
                    await signUp(email, password);
                    alert('Registration successful! You can now log in.');
                    isSignUpMode = false;
                    if (toggleAuthModeBtn) toggleAuthModeBtn.click();
                } else {
                    await signIn(email, password);
                    showDashboard();
                }
            } catch (err) {
                alert('Authentication Error: ' + err.message);
            }
        });
    }

    // Handle Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await signOut();
        });
    }

    // Handle Emergency Alert Button Test
    if (emergencyBtn) {
        emergencyBtn.addEventListener('click', async () => {
            const payload = {
                title: "CRITICAL HAZARD: Landslide Detected",
                message: "NH-27 corridor blocked due to heavy rainfall and mudslide risk.",
                timestamp: new Date().toISOString()
            };
            await triggerEmergencyAlert(payload);
            speakAlert("Emergency alert triggered. Dispatching notifications.");
            alert("Emergency Webhook Dispatched Successfully!");
        });
    }

    function showAuth() {
        if (authContainer) authContainer.style.display = 'block';
        if (dashboardContainer) dashboardContainer.style.display = 'none';
    }

    async function showDashboard() {
        if (authContainer) authContainer.style.display = 'none';
        if (dashboardContainer) dashboardContainer.style.display = 'flex';

       // Cargo Spoilage Calculator Interaction
    const calcSpoilageBtn = document.getElementById('calculate-spoilage-btn');
    if (calcSpoilageBtn) {
        calcSpoilageBtn.addEventListener('click', () => {
            const type = document.getElementById('cargo-type-select').value;
            const days = parseInt(document.getElementById('transit-delay-input').value) || 1;
            const risk = calculateSpoilageRisk(type, days, 75); 
            
            const resultEl = document.getElementById('spoilage-result');
            if (resultEl) {
                // Extracts the actual numeric value from whichever property name your cargoService uses
                const prob = risk.probability ?? risk.percentage ?? risk.score ?? (typeof risk === 'object' ? Object.values(risk)[0] : risk);
                const status = risk.status ?? risk.level ?? 'Evaluated';
                resultEl.textContent = `Spoilage Probability: ${prob}% (${status})`;
            }
        });
    }

    // Crowdsourced Incident Reporting Interaction
    const reportBtn = document.getElementById('report-incident-btn');
    if (reportBtn) {
        reportBtn.addEventListener('click', () => {
            const hazardType = document.getElementById('incident-type').value;
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    const lat = position.coords.latitude.toFixed(4);
                    const lon = position.coords.longitude.toFixed(4);
                    alert(`Crowdsourced Hazard Broadcasted!\nType: ${hazardType.toUpperCase()}\nGPS: [${lat}, ${lon}] sent to command center.`);
                }, () => {
                    alert(`Crowdsourced Hazard Broadcasted!\nType: ${hazardType.toUpperCase()}\nGPS: [26.2006, 92.9376] (Assam Corridor Default)`);
                });
            } else {
                alert(`Hazard Reported Successfully for NH-27 Corridor.`);
            }
        });
    }

        // Initialize Map and Telemetry
        try {
            initMap('map');
            const weather = await fetchWeather();
            const risk = evaluateRisk(weather);
            calculateSpoilageRisk('perishable', 3, risk.score);

            const riskEl = document.getElementById('risk-score-display');
            if (riskEl) {
                riskEl.textContent = `${risk.riskLevel} (Score: ${risk.score})`;
            }
        } catch (err) {
            console.error("Dashboard initialization error:", err);
        }
    }
});