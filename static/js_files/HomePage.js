
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
    const today = new Date();

    const currentDate = today.getDate();
    const currentMonth = today.toLocaleString('default', { month: 'long' });
    const currentyear = today.getFullYear();

    document.querySelector('.calendar-title').innerHTML = `${currentDate} ${currentMonth} ${currentyear}`;

    const days = document.querySelectorAll('td');
    days.forEach(day => {
        if (parseInt(day.textContent) === currentDate) {
            day.classList.add('today');
        }
    });

    
    const logoutIcons = document.querySelectorAll('.sig-out');
    logoutIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            window.location.href = '/';
        });
    });

    
});


