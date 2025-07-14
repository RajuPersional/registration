
// ✅ Tells TypeScript/VSCode: I am adding csrfToken to window
window.csrfToken = window.csrfToken || '';

async function ensureCSRFToken() {
  if (!window.csrfToken) {
    const res = await fetch('/get-csrf-token', { credentials: 'include' });
    const data = await res.json();
    window.csrfToken = data.csrf_token;
  }
}


// In HomePage.js
async function loadPage(url) {
    const container = document.getElementById('total-container');
    document.querySelectorAll('[data-dynamic="true"]').forEach(el => el.remove());
    
    try {
        console.log(`Attempting to load page: ${url}`);
        const res = await fetch(url);
        console.log(`Fetch response status: ${res.status}`);
        
        if (!res.ok) {
            console.error(`Failed to load page: ${url}, Status: ${res.status}`);
            throw new Error(`Failed to load page: ${url}, Status: ${res.status}`);
        }
        
        const html = await res.text();
        console.log(`Successfully loaded HTML for page: ${url}`);
        container.innerHTML = html;

        const name = url.split('/').pop().toLowerCase(); // Always use lowercase
        console.log(`Page name: ${name}`);
        
        // Construct the single, correct CSS path
        const cssPath = `/static/css_files/${name}.css`;

        try {
            console.log(`Attempting to load CSS: ${cssPath}`);
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = cssPath;
            cssLink.dataset.dynamic = "true";
            document.head.appendChild(cssLink);
            console.log(`Successfully linked CSS: ${cssPath}`);
        } catch (error) {
            console.error(`Error loading CSS for ${name}:`, error);
        }
        
        // Load dynamic JS if it exists
        const jsUrl = `/static/js_files/${name}.js`;
        console.log(`Checking JS file: ${jsUrl}`);
        const jsResponse = await fetch(jsUrl, { method: 'HEAD' });
        
        if (jsResponse.ok) {
            console.log(`Found JS file: ${jsUrl}`);
            const script = document.createElement('script');
            script.src = jsUrl;
            script.dataset.dynamic = "true";
            
            script.onload = () => {
                console.log(`Successfully loaded JS file: ${jsUrl}`);
                const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
                console.log(`Initializing page with: init${capitalizedName}Page`);
                const initFunc = window[`init${capitalizedName}Page`];
                if (typeof initFunc === 'function') {
                    console.log(`Initializing page with: init${capitalizedName}Page`);
                    initFunc();
                } else {
                    console.error(`❌ init${capitalizedName}Page function not found on window`);
                }
            };
            
            script.onerror = () => {
                console.error(`Error loading JS file: ${jsUrl}`);
            };
            
            document.body.appendChild(script);
        } else {
            console.log(`JS file not found: ${jsUrl}, Status: ${jsResponse.status}`);
        }
       
    }
    catch (error) {
        console.error('Error loading page:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <h2>Error loading page</h2>
                <p>Details: ${error.message}</p>
            </div>
        `;
    }
}



// Add click event listeners for menu items
document.addEventListener("DOMContentLoaded",async function () {
    await ensureCSRFToken();
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
    // Replace the existing signOutElements code with this:
const signOutElements = document.querySelectorAll('.sig-out');
signOutElements.forEach(item => {
    item.addEventListener('click', async function(e) {
        e.preventDefault();
        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
                credentials: 'same-origin',  // Important for sending session cookies
                headers: {
                    'X-CSRFToken': window.csrfToken
                }
            });
            if (response.ok) {
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Logout failed:', error);
            window.location.href = '/';
        }
    });
    });
});
// Put this anywhere in your JS (usually HomePage.js)
window.addEventListener("beforeunload", function () {
  navigator.sendBeacon('/reset-attendance');
});