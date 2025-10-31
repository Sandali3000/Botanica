function handleThemeToggle() {
    // Get HTML root element
    const root = document.documentElement;
    
    // Get button elements
    const button = document.querySelector('.theme-toggle');
    const icon = button.querySelector('i');
    const text = button.querySelector('span');
    
    // Check if we're in dark mode
    const isDark = root.hasAttribute('data-theme');
    
    if (isDark) {
        // Switch to light mode
        root.removeAttribute('data-theme');
        icon.className = 'fas fa-moon';
        text.textContent = 'Dark Mode';
    } else {
        // Switch to dark mode
        root.setAttribute('data-theme', 'dark');
        icon.className = 'fas fa-sun';
        text.textContent = 'Light Mode';
    }
}