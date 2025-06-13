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

        // Extract name and capitalize
        const name = url.split('/').pop();
        const capitalized = name.charAt(0).toUpperCase() + name.slice(1);

        // Load dynamic CSS
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = `/static/css_files/${capitalized}.css`;
        cssLink.dataset.dynamic = "true";
        document.head.appendChild(cssLink);

        // Check for JS file existence
        const jsUrl = `/static/js_files/${capitalized}.js`;
        
        const jsResponse = await fetch(jsUrl, { method: 'HEAD' });

        if (jsResponse.ok) {
            const script = document.createElement('script');
            script.src = jsUrl;
            script.dataset.dynamic = "true";
            script.onload = () => {
                const initFunc = window[`init${capitalized}Page`];
                if (typeof initFunc === 'function') {
                    initFunc();
                }
            };
            document.body.appendChild(script);
        } else {
            console.log(`No JS file found for ${capitalized}. Skipping script load.`);
        }

    } catch (error) {
        console.error('Error loading page:', error);
        container.innerHTML = '<p>Error loading page.</p>';
    }
}


document.addEventListener("DOMContentLoaded", function () {
  loadPage('/Dashboard'); // Load default

  document.querySelectorAll('.sig-out').forEach(icon => {
      icon.addEventListener('click', () => window.location.href = '/');
  });

  document.querySelectorAll('.sidebar-menu li').forEach(item => {
      item.addEventListener('click', function (e) {
          e.preventDefault();
          const url = this.getAttribute('data-url');
          loadPage(url);
      });
  });
});
