document.addEventListener('DOMContentLoaded', function() {
    // Auto logout after 1 minute of inactivity
    let inactivityTimer;
    const LOGOUT_TIME = 60000; // 1 minute in milliseconds

    function resetTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(logout, LOGOUT_TIME);
    }

    function logout() {
        window.location.href = 'login.html';
    }

    // Reset timer on user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetTimer);
    });

    // Start the timer
    resetTimer();

    // Get all navigation links
    const navLinks = document.querySelectorAll('.nav-links li');
    const pages = document.querySelectorAll('.page');

    // Function to show a specific page
    function showPage(pageId) {
        // Hide all pages
        pages.forEach(page => page.style.display = 'none');
        
        // Show the selected page
        const selectedPage = document.getElementById(pageId);
        if (selectedPage) {
            selectedPage.style.display = 'block';
        }

        // Update active state in navigation
        navLinks.forEach(link => {
            if (link.dataset.page === pageId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Add click event listeners to navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const pageId = this.dataset.page;
            if (pageId) {
                showPage(pageId);
            }
        });
    });

    // Handle form submissions
    const feedbackForm = document.querySelector('.feedback-form');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Feedback submitted successfully!');
            this.reset();
        });
    }

    const odForm = document.querySelector('.od-form');
    if (odForm) {
        odForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('OD request submitted successfully!');
            this.reset();
        });
    }

    // Show home page by default
    showPage('home');
}); 