function loadPage(url) {
    const container = document.getElementById('total-container');

    // Clean up old CSS & JS
    document.getElementById("dynamic-css")?.remove();
    document.getElementById("dynamic-js")?.remove();

    fetch(url)
        .then(res => res.text())
        .then(html => {
            container.innerHTML = html;

            const name = url.split("/").pop(); // Get the last part of URL
            const capitalized = name.charAt(0).toUpperCase() + name.slice(1); // Capitalize

            // Load matching CSS
            const css = document.createElement("link");
            css.rel = "stylesheet";
            css.href = `/static/css_files/${capitalized}.css`;
            css.id = "dynamic-css";
            document.head.appendChild(css);

            // Load matching JS
            const script = document.createElement("script");
            script.src = `/static/js_files/${capitalized}.js`;
            script.id = "dynamic-js";
            document.body.appendChild(script);
        })
        .catch(error => {
            console.error('Error loading page:', error);
            container.innerHTML = "<p>Error loading page.</p>";
        });
}


document.addEventListener("DOMContentLoaded", function () {
    loadPage('/dashboard');  // Default

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
