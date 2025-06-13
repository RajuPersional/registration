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
            setProfileFields(user);
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

    // Setup edit/save button logic
    const editSaveBtn = document.getElementById('edit-save-btn');
    let isEditing = false;

    editSaveBtn.addEventListener('click', async function () {
        if (!isEditing) {
            makeFieldsEditable(true);
            editSaveBtn.textContent = 'Save';
            isEditing = true;
        } else {
            // Gather updated data
            const updatedData = {
                name: document.getElementById('profile-name-input').value,
                date_of_birth: document.getElementById('profile-dob-input').value,
                email: document.getElementById('profile-email-input').value,
                phone_number: document.getElementById('profile-phone-input').value
            };
            // Send update to backend
            const res = await fetch('/api/profile/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            const result = await res.json();
            alert(result.message);

            // Set fields back to read-only and update display
            setProfileFields(updatedData);
            makeFieldsEditable(false);
            editSaveBtn.textContent = 'Edit Profile';
            isEditing = false;
        }
    });
}

function setProfileFields(user) {
    document.getElementById('profile-name').innerHTML = user.name || `<input id="profile-name-input" value="">`;
    document.getElementById('profile-reg').textContent = user.register_number ? `Registration Number: ${user.register_number}` : '';
    document.getElementById('profile-dob').innerHTML = user.date_of_birth
        ? user.date_of_birth
        : `<input id="profile-dob-input" value="">`;
    document.getElementById('profile-email').innerHTML = user.email
        ? user.email
        : `<input id="profile-email-input" value="">`;
    document.getElementById('profile-phone').innerHTML = user.phone_number
        ? user.phone_number
        : `<input id="profile-phone-input" value="">`;
}

function makeFieldsEditable(editable) {
    if (editable) {
        // Replace spans with inputs for editable fields
        const name = document.getElementById('profile-name').textContent;
        document.getElementById('profile-name').innerHTML = `<input id="profile-name-input" value="${name}">`;

        const dob = document.getElementById('profile-dob').textContent;
        document.getElementById('profile-dob').innerHTML = `<input id="profile-dob-input" value="${dob}">`;

        const email = document.getElementById('profile-email').textContent;
        document.getElementById('profile-email').innerHTML = `<input id="profile-email-input" value="${email}">`;

        const phone = document.getElementById('profile-phone').textContent;
        document.getElementById('profile-phone').innerHTML = `<input id="profile-phone-input" value="${phone}">`;
    } else {
        // Replace inputs with spans (read-only)
        document.getElementById('profile-name').textContent = document.getElementById('profile-name-input').value;
        document.getElementById('profile-dob').textContent = document.getElementById('profile-dob-input').value;
        document.getElementById('profile-email').textContent = document.getElementById('profile-email-input').value;
        document.getElementById('profile-phone').textContent = document.getElementById('profile-phone-input').value;
    }
}

// Initialize when the profile page loads
if (document.getElementById('profile-section')) {
    initProfilePage();
}