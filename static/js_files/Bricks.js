function bricks() {
        const welcomeText = document.getElementById("welcome-text");
        const subheadingText = document.getElementById("subheading-text");

        // Initially hide the text
        welcomeText.style.opacity = "0";
        subheadingText.style.opacity = "0";

        // Show the welcome text after 1 second
        setTimeout(() => {
            welcomeText.style.opacity = "1";
            welcomeText.style.transition = "opacity 1s";
        }, 800);

        // Show the subheading text after 1.4 seconds
        setTimeout(() => {
            subheadingText.style.opacity = "1";
            subheadingText.style.transition = "opacity 1s";
        }, 1000);
    };


function togglePasswordVisibility() { //1*
    const toggle = document.querySelector('.toggle-password');  // 👁️ icon
    const passwordInput = document.getElementById('password');   // password field
                                                                
    toggle.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password'; // check type
        passwordInput.type = isPassword ? 'text' : 'password';
        toggle.textContent = isPassword ? '🙈' : '👁️';  // Optional: icon toggle
    });
}

function loadVerfy() {
  fetch('/Verfy')
    .then(response => response.text())
    .then(html => {
      document.getElementById('container').innerHTML = html;
    });
}

function login() {
    const submitBtn = document.getElementById('submit-btn');

    submitBtn.addEventListener('click', async (e) => {
        e.preventDefault();  // Prevent form submission reload

        const registerNumber = document.getElementById('Register').value;
        const password = document.getElementById('password').value;

        if (!registerNumber || !password) {
            alert('Please enter both registration number and password');
            return;
        }

        try {
            const res = await fetch('http://127.0.0.1:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ registerNumber, password }),
                credentials: 'include'  // This is important for session cookies
            });

            const data = await res.json();

            if (data.status === 'success') {
                window.location.href = data.redirect || '/HomePage';
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (err) {
            console.error('Error:', err);
            alert('An error occurred. Please try again.');
        }
    });
}



// Initialize both functions when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    bricks();
    login();
    togglePasswordVisibility();
});












