import { signIn, signUp, signOut, getCurrentUser, resetPassword } from './modules/authService.js';
import { initMap } from './modules/mapService.js';
import { fetchWeather } from './modules/weatherService.js';
import { evaluateRisk } from './modules/aiPredictor.js';
import { calculateSpoilageRisk } from './modules/cargoService.js';
import { triggerEmergencyAlert } from './modules/alertService.js';
import { speakAlert } from './modules/speechService.js';

let isSignUpMode = false;

window.addEventListener('DOMContentLoaded', async () => {
    const user = await getCurrentUser();
    if (user) {
        loadDashboard(user);
    } else {
        initAuthFlow();
    }
});

function initAuthFlow() {
    document.getElementById('auth-container').classList.remove('hidden');
    document.getElementById('dashboard-container').classList.add('hidden');

    const form = document.getElementById('auth-form');
    const title = document.getElementById('auth-title');
    const submitBtn = document.getElementById('auth-submit-btn');
    const toggleBtn = document.getElementById('toggle-auth-mode');
    const forgotBtn = document.getElementById('forgot-password-btn');

    toggleBtn.addEventListener('click', () => {
        isSignUpMode = !isSignUpMode;
        title.innerText = isSignUpMode ? 'Operator Registration' : 'Operator Login';
        submitBtn.innerText = isSignUpMode ? 'Sign Up' : 'Login';
        toggleBtn.innerText = isSignUpMode ? 'Already have an account? Login' : 'Need an account? Sign Up';
    });

    forgotBtn.addEventListener('click', async () => {
        const email = document.getElementById('email').value;
        if (!email) {
            alert('Please enter your email address in the field first.');
            return;
        }
        try {
            await resetPassword(email);
            alert('Password reset link sent to your email!');
        } catch (err) {
            alert('Error: ' + err.message);
        }
    });

    form.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            if (isSignUpMode) {
                await signUp(email, password);
                alert('Registration successful! You can now log in.');
                isSignUpMode = false;
                title.innerText = 'Operator Login';
                submitBtn.innerText = 'Login';
            } else {
                const data = await signIn(email, password);
                loadDashboard(data.user);
            }
        } catch (err) {
            alert('Authentication failed: ' + err.message);
        }
    };
}

async function loadDashboard(user) {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('dashboard-container').classList.remove('hidden');

    const userNav = document.getElementById('user-nav');
    userNav.innerHTML = `
        <span class="text-sm text-slate-300 hidden md:inline">${user.email}</span>
        <button id="profile-btn" class="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-sm font-semibold">Profile & Settings</button>
        <button id="logout-btn" class="bg-red-600/80 hover:bg-red-600 px-3 py-1 rounded text-sm font-semibold">Logout</button>
    `;

    document.getElementById('profile-email-display').innerText = user.email;

    document.getElementById('profile-btn').addEventListener('click', () => {
        document.getElementById('profile-modal').classList.remove('hidden');
    });
    document.getElementById('close-profile-btn').addEventListener('click', () => {
        document.getElementById('profile-modal').classList.add('hidden');
    });
    document.getElementById('logout-btn').addEventListener('click', async () => {
        await signOut();
    });

    initMap('map');

    const weather = await fetchWeather();
    document.getElementById('weather-box').innerHTML = `<b>Weather:</b> ${weather.temperature}°C, Wind: ${weather.windspeed} km/h`;

    const risk = evaluateRisk(weather);
    document.getElementById('risk-box').innerHTML = `<b>AI Terrain Risk:</b> <span class="text-yellow-400">${risk.riskLevel} (${risk.score}%)</span>`;

    const cargo = calculateSpoilageRisk('perishable', 4, risk.score);
    document.getElementById('cargo-box').innerHTML = `<b>Cargo Status:</b> ${cargo.status} (Score: ${cargo.spoilageScore})`;

    document.getElementById('alert-btn').addEventListener('click', async () => {
        speakAlert("Warning! High risk condition detected on active transport route.");
        await triggerEmergencyAlert({
            title: "NER-RouteIQ Hazard Alert",
            message: `High risk detected. Risk Score: ${risk.score}%`,
            timestamp: new Date().toISOString()
        });
        alert("Emergency alert webhook dispatched to Telegram and Gmail via Make.com!");
    });
}
