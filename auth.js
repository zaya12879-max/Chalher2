import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeAuth();
});

function initializeAuth() {
    // Tab switching
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');

    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            forms.forEach(f => f.classList.remove('active'));

            tab.classList.add('active');
            const tabName = tab.getAttribute('data-tab');
            document.getElementById(`${tabName}Form`).classList.add('active');

            // Clear messages
            hideMessages();
        };
    });

    // Login form
    const loginForm = document.getElementById('loginForm');
    loginForm.onsubmit = async (e) => {
        e.preventDefault();
        hideMessages();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            showError(error.message);
        } else {
            showSuccess('Connexion réussie ! Redirection...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    };

    // Register form
    const registerForm = document.getElementById('registerForm');
    registerForm.onsubmit = async (e) => {
        e.preventDefault();
        hideMessages();

        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

        if (password !== passwordConfirm) {
            showError('Les mots de passe ne correspondent pas');
            return;
        }

        if (password.length < 6) {
            showError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error) {
            showError(error.message);
        } else {
            showSuccess('Inscription réussie ! Connexion...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    };
}

function showError(message) {
    const errorDiv = document.getElementById('authError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function showSuccess(message) {
    const successDiv = document.getElementById('authSuccess');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
}

function hideMessages() {
    document.getElementById('authError').style.display = 'none';
    document.getElementById('authSuccess').style.display = 'none';
}
