console.log("hello Profile");

async function initProfilePage() {
    try {
        // Fetch user profile data
        const response = await fetch('/api/profile');
        if (!response.ok) {
            throw new Error('Failed to fetch profile data');
        }
        
        const data = await response.json();
        if (data.status === 'success') {
            const user = data.user;
            
            // Update profile information
            document.getElementById('profile-name').textContent = user.name;
            document.getElementById('profile-reg').textContent = `Registration Number: ${user.register_number}`;
            document.getElementById('profile-dob').textContent = `Date of Birth: ${user.date_of_birth}`;
            document.getElementById('profile-email').textContent = `Email: ${user.email}`;
            document.getElementById('profile-phone').textContent = `Phone: ${user.phone_number}`;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        document.getElementById('total-container').innerHTML = `
            <div class="error-message">
                <h2>Error Loading Profile</h2>
                <p>${error.message}</p>
            </div>
        `;
    }
}