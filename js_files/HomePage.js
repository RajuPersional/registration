import { displaysection } from "./display.js"

document.addEventListener("DOMContentLoaded", function () {
    
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
            window.location.href = 'Bricks.html';
        });
    });
});




window.addEventListener("DOMContentLoaded", () => {
    displaysection(); 
});