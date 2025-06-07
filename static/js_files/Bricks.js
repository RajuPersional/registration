function bricks() {
    document.addEventListener("DOMContentLoaded", () => {
        const welcomeText = document.getElementById("welcome-text");
        const subheadingText = document.getElementById("subheading-text");

        // Initially hide the text
        welcomeText.style.opacity = "0";
        subheadingText.style.opacity = "0";

        // Show the welcome text after 1 second
        setTimeout(() => {
            welcomeText.style.opacity = "1";
            welcomeText.style.transition = "opacity 1s";
        }, 1000);

        // Show the subheading text after 1.4 seconds
        setTimeout(() => {
            subheadingText.style.opacity = "1";
            subheadingText.style.transition = "opacity 1s";
        }, 1400);
    });
}

bricks();


function login(){
    // Attach this event listener once on page load {
        document.addEventListener('DOMContentLoaded', () => {
            const submitBtn = document.getElementById('submit-btn');
    
            submitBtn.addEventListener('click', async (e) => {
                e.preventDefault();  // Prevent form submission reload
    
                const registerNumber = document.getElementById('Register').value;
                const password = document.getElementById('password').value;
    
                try {
                    const res = await fetch('http://127.0.0.1:5000/api/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ registerNumber, password }),
                    });
    
                    if (!res.ok) {
                        throw new Error('Network response was not ok');
                    }
    
                    const data = await res.json();
    
                    if (data.status === 'success') {
                        window.location.href = '/HomePage';  // Redirect on success
                    } else {
                        alert(data.message || 'Login failed');
                    }
                } catch (err) {
                    console.error('Error:', err);
                    alert('An error occurred. Please try again.');
                }
            });
        });
    }
    
        

login();












