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

    let isSignUpMode = false;

    // Check existing session
    const user = await getCurrentUser();
    if (user) {
        showDashboard();
    } else {
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
                titleElement.textContent = 'Operator Registration';
                submitBtn.textContent = 'Sign Up';
                toggleAuthModeBtn.textContent = 'Already have an account? Login';
            } else {
                titleElement.textContent = 'Operator Login';
                submitBtn.textContent = 'Login';
                toggleAuthModeBtn.textContent = 'Need an account? Sign Up';
            }
        });
    }

    // Handle Forgot Password click
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = emailInput.value.trim();
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
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            try {
                if (isSignUpMode) {
                    await signUp(email, password);
                    alert('Registration successful! You can now log in.');
                    isSignUpMode = false;
                    toggleAuthModeBtn.click();
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
        if (dashboardContainer) dashboardContainer.style.display = 'block';

        // Initialize Map and Telemetry
        initMap('map');
        const weather = await fetchWeather();
        const risk = evaluateRisk(weather);
        const cargo = calculateSpoilageRisk('perishable', 3, risk.score);

        const riskEl = document.getElementById('risk-score-display');
        if (riskEl) {
            riskEl.textContent = `${risk.riskLevel} (Score: ${risk.score})`;
        }
    }
});
