// Theme debug functions
function toggleThemeManually() {
    console.log('Manual theme toggle clicked');
    if (window.botanicalApp) {
        console.log('App found, calling toggleTheme');
        window.botanicalApp.toggleTheme();
    } else {
        console.error('App not found');
    }
}