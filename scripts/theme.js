// Theme handling
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const htmlRoot = document.documentElement;
    
    // Initialize theme
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        htmlRoot.setAttribute('data-theme', 'dark');
        updateThemeButton(true);
    }
    
    // Theme toggle function
    function updateThemeButton(isDark) {
        const icon = themeToggle.querySelector('i');
        const text = themeToggle.querySelector('span');
        
        if (isDark) {
            icon.className = 'fas fa-sun';
            text.textContent = 'Light Mode';
        } else {
            icon.className = 'fas fa-moon';
            text.textContent = 'Dark Mode';
        }
    }
    
    // Click handler
    themeToggle.addEventListener('click', function() {
        const isDark = htmlRoot.hasAttribute('data-theme');
        
        if (isDark) {
            htmlRoot.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            updateThemeButton(false);
        } else {
            htmlRoot.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            updateThemeButton(true);
        }
    });
});