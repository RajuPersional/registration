
function loadPage(url) {
  
    fetch(url)
      .then(res => res.text())
      .then(html => {
        document.getElementById('total-container').innerHTML = html;
      })
      .catch(error => {
        console.error('Error loading page:', error);
      });
}


window.loadPage = loadPage;

document.addEventListener("DOMContentLoaded", function () {

    loadPage('/dashboard');
    
    const logoutIcons = document.querySelectorAll('.sig-out');
    logoutIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            window.location.href = '/';
        });
    });

    // Modify click handlers to prevent default behavior
    document.querySelectorAll('.sidebar-menu li').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent page reload
            const url = this.getAttribute('data-url');
            loadPage(url);
        });
    });
});


