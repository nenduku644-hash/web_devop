document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember').checked;
    const errorMessage = document.getElementById('error-message');

    // Check credentials
    if (username === '192472374' && password === '123') {
        // Save credentials if remember me is checked
        if (rememberMe) {
            localStorage.setItem('savedUsername', username);
            localStorage.setItem('savedPassword', password);
        } else {
            localStorage.removeItem('savedUsername');
            localStorage.removeItem('savedPassword');
        }

        // Set session start time
        sessionStorage.setItem('loginTime', Date.now());

        // Successful login
        errorMessage.textContent = '';
        window.location.href = 'dashboard.html';
    } else {
        // Failed login
        errorMessage.textContent = 'Invalid registration number or password';
    }
});

// Check for saved credentials on page load
window.addEventListener('DOMContentLoaded', function() {
    const savedUsername = localStorage.getItem('savedUsername');
    const savedPassword = localStorage.getItem('savedPassword');
    
    if (savedUsername && savedPassword) {
        document.getElementById('username').value = savedUsername;
        document.getElementById('password').value = savedPassword;
        document.getElementById('remember').checked = true;
    }
}); 