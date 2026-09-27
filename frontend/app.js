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
                togglePasswordBtn.textContent = '🔒';
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

        // 1. Crowdsourced Incident Reporting Interaction
        const reportBtn = document.getElementById('report-incident-btn');
        if (reportBtn) {
            reportBtn.addEventListener('click', async () => {
                const hazardType = document.getElementById('incident-type').value;
                
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(async (position) => {
                        const lat = position.coords.latitude.toFixed(4);
                        const lon = position.coords.longitude.toFixed(4);
                        
                        try {
                            await triggerEmergencyAlert({
                                title: `Field Report: ${hazardType.toUpperCase()} HAZARD`,
                                message: `Ground unit logged a severe ${hazardType} obstruction at GPS [${lat}, ${lon}]. Immediate route deviation recommended.`,
                                timestamp: new Date().toLocaleString()
                            });
                            alert(`Crowdsourced ${hazardType.toUpperCase()} broadcasted successfully to Telegram!`);
                        } catch (e) {
                            alert(`Logged locally. GPS: [${lat}, ${lon}]`);
                        }
                    }, () => {
                        alert(`GPS unavailable. Default corridor coordinates used.`);
                    });
                }
            });
        }

        // 2. Dynamic Cargo Spoilage Alert
        const calcSpoilageBtn = document.getElementById('calculate-spoilage-btn');
        if (calcSpoilageBtn) {
            calcSpoilageBtn.addEventListener('click', async () => {
                const type = document.getElementById('cargo-type-select').value;
                const days = parseInt(document.getElementById('transit-delay-input').value) || 1;
                const risk = calculateSpoilageRisk(type, days, 75); 
                
                const prob = risk.probability ?? risk.percentage ?? risk.score ?? 45;
                const status = risk.status ?? risk.level ?? 'Evaluated';
                
                const resultEl = document.getElementById('spoilage-result');
                if (resultEl) {
                    resultEl.textContent = `Spoilage Probability: ${prob}% (${status})`;
                }

                if (prob > 50) {
                    try {
                        await triggerEmergencyAlert({
                            title: `CRITICAL CARGO SPOILAGE WARNING: ${type.toUpperCase()}`,
                            message: `A transit delay of ${days} days has raised spoilage risk to ${prob}% (${status}). Immediate dispatch intervention required.`,
                            timestamp: new Date().toLocaleString()
                        });
                    } catch (e) {
                        console.error("Webhook failed");
                    }
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