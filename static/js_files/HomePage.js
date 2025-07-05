
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

        const name = url.split('/').pop();
        const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
        console.log(`Page name: ${name}, Capitalized: ${capitalized}`);
        
        // Try both capitalized and lowercase versions
        const cssPaths = [
            `/static/css_files/${capitalized}.css`,
            `/static/css_files/${name}.css`
        ];

        for (const path of cssPaths) {
            try {
                console.log(`Checking CSS file: ${path}`);
                const response = await fetch(path, { method: 'HEAD' });
                if (response.ok) {
                    console.log(`Found CSS file: ${path}`);
                    const cssLink = document.createElement('link');
                    cssLink.rel = 'stylesheet';
                    cssLink.href = path;
                    cssLink.dataset.dynamic = "true";
                    document.head.appendChild(cssLink);
                    console.log(`Successfully loaded CSS from: ${path}`);
                    break; // Stop trying other paths if we found one that works
                } else {
                    console.log(`CSS file not found: ${path}, Status: ${response.status}`);
                }
            } catch (error) {
                console.error(`Error checking CSS file ${path}:`, error);
            }
        }
        
        // Load dynamic JS if exists
        const jsUrl = `/static/js_files/${capitalized}.js`;
        console.log(`Checking JS file: ${jsUrl}`);
        const jsResponse = await fetch(jsUrl, { method: 'HEAD' });
        
        if (jsResponse.ok) {
            console.log(`Found JS file: ${jsUrl}`);
            const script = document.createElement('script');
            script.src = jsUrl;
            script.dataset.dynamic = "true";
            
            script.onload = () => {
                console.log(`Successfully loaded JS file: ${jsUrl}`);
                const initFunc = window[`init${capitalized}Page`];
                if (typeof initFunc === 'function') {
                    console.log(`Initializing page with: init${capitalized}Page`);
                    initFunc();
                } else {
                    console.error(`❌ ${capitalized}Page init function not found on window`);
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