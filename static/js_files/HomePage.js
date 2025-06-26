async function loadPage(url) {
    const container = document.getElementById('total-container');

    // Remove old dynamic CSS & JS
    document.querySelectorAll('[data-dynamic="true"]').forEach(el => el.remove());

    try {
        // Load HTML content
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to load page: ${res.status}`);
        const html = await res.text();
        container.innerHTML = html;

        // Extract name and capitalize for CSS/JS file names
        const name = url.split('/').pop();
        const capitalized = name.charAt(0).toUpperCase() + name.slice(1);

        // Load dynamic CSS
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = `/static/css_files/${capitalized}.css`;
        cssLink.dataset.dynamic = "true";
        document.head.appendChild(cssLink);

        // Load dynamic JS if exists
        const jsUrl = `/static/js_files/${capitalized}.js`;
        const jsResponse = await fetch(jsUrl, { method: 'HEAD' });
        if (jsResponse.ok) {
            const script = document.createElement('script');
            script.src = jsUrl;
            script.dataset.dynamic = "true";
            script.onload = () => { //1* perforemed After the load is Done 
                const initFunc =  window[`init${capitalized}Page`] 
                if (typeof initFunc === 'function') {
                  initFunc();
                }
               else {
                    console.error(`❌ ${capitalized}Page init function not found on window`);
                    }
              };
            document.body.appendChild(script); // 1* First the Script is loaded 
        }
       
    }
    catch (error) {
        console.error('Error loading page:', error);
        container.innerHTML = '<p>Error loading page.</p>';
    }
}



// Add click event listeners for menu items
document.addEventListener("DOMContentLoaded", function () {
    console.log("HomePage.js: DOMContentLoaded fired.");
    loadPage('/Dashboard')
    
    
    document.querySelectorAll('.sidebar-menu li').forEach(item => {
        item.addEventListener('click', function(event) {
            event.preventDefault();  // Add this line to prevent default navigation
            const url = this.dataset.url;
            if (url) {
                loadPage(url);
            }
        });
    });

    // Add click event for .sig-out to redirect to /Bricks
    const signOutElements = document.querySelectorAll('.sig-out');
    console.log(`HomePage.js: Found ${signOutElements.length} .sig-out elements.`);
    signOutElements.forEach(item => {
        item.addEventListener('click', function() {
            console.log("HomePage.js: .sig-out element clicked! Redirecting to /...");
            window.location.href = '/';
        });
    });
});
// Put this anywhere in your JS (usually HomePage.js)
window.addEventListener("beforeunload", function () {
  navigator.sendBeacon('/reset-attendance');
});