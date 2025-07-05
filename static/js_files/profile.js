
window.initProfilePage = ()=> {

    // Get the button directly
    const editButton = document.getElementById('edit-save-btn');

    // Function to validate input fields
    function validateInput(input) {
        const value = input.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch(input.id) {
            case 'profile-email-input':
                // Enhanced email validation
                const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if (!emailPattern.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address (e.g., user@domain.com)';
                } else {
                    // Additional checks for email
                    const [localPart, domain] = value.split('@');
                    if (localPart.length > 64) {
                        isValid = false;
                        errorMessage = 'Email username part is too long (max 64 characters)';
                    } else if (domain.length > 255) {
                        isValid = false;
                        errorMessage = 'Email domain part is too long (max 255 characters)';
                    } else if (value.length > 254) {
                        isValid = false;
                        errorMessage = 'Email address is too long (max 254 characters)';
                    } else if (!/^[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9]$/.test(domain)) {
                        isValid = false;
                        errorMessage = 'Invalid domain format in email address';
                    }
                }
                break;
            
            case 'profile-phone-input':
                const phonePattern = /^\d{10}$/;
                isValid = phonePattern.test(value);
                errorMessage = 'Phone number must be exactly 10 digits';
                break;
            
            case 'profile-name-input':
                if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Name must be at least 2 characters long';
                } else if (value.length > 50) {
                    isValid = false;
                    errorMessage = 'Name must not exceed 50 characters';
                } else if (!/^[a-zA-Z\s.'-]+$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Name can only contain letters, spaces, and basic punctuation';
                }
                break;
            
            case 'profile-dob-input':
                const date = new Date(value);
                const today = new Date();
                const minDate = new Date();
                minDate.setFullYear(today.getFullYear() - 100); // Max age 100 years
                
                if (isNaN(date.getTime())) {
                    isValid = false;
                    errorMessage = 'Please enter a valid date';
                } else if (date >= today) {
                    isValid = false;
                    errorMessage = 'Date of birth must be in the past';
                } else if (date < minDate) {
                    isValid = false;
                    errorMessage = 'Date of birth seems too far in the past';
                }
                break;
        }

        // Update input styling based on validation
        if (!isValid && value !== '') {
            input.style.borderColor = '#d32f2f';
            input.title = errorMessage;
        } else {
            input.style.borderColor = '#ddd';
            input.title = '';
        }

        return isValid;
    }

    // Function to show toast message
    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.style.display = 'block';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }

    // Function to save profile data
    async function saveProfileData() {
        const loadingSpinner = document.getElementById('loading-spinner');
        const formData = {
            name: document.getElementById('profile-name-input').value.trim(),
            date_of_birth: document.getElementById('profile-dob-input').value,
            email: document.getElementById('profile-email-input').value.trim(),
            phone_number: document.getElementById('profile-phone-input').value.trim()
        };

        // Validate all inputs
        const inputs = document.querySelectorAll('.profile-input:not([readonly])');
        let isValid = true;
        inputs.forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
            }
        });

        if (!isValid) {
            showToast('Please fix the validation errors before saving', 'error');
            return;
        }

        try {
            loadingSpinner.style.display = 'block';
            const response = await fetch('/api/update-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': window.csrfToken 
                },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            const data = await response.json();

            if (data.status === 'success') {
                // Update both profile and header displays
                document.getElementById('profile-name-display').textContent = formData.name;
                document.getElementById('profile-dob-display').textContent = formData.date_of_birth;
                document.getElementById('profile-email-display').textContent = formData.email;
                document.getElementById('profile-phone-display').textContent = formData.phone_number;
                
                // Safely update the header if it exists
                const headerUser = document.querySelector('.header-user');
                if (headerUser) {
                    headerUser.textContent = formData.name.toUpperCase();
                }
                
                showToast('Profile updated successfully!');
                editButton.textContent = 'Edit Profile';
                // Hide inputs, show displays
                document.querySelectorAll('.profile-input').forEach(input => input.style.display = 'none');
                document.querySelectorAll('.detail-value').forEach(span => span.style.display = 'block');
            } else {
                showToast(data.message || 'Failed to update profile', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('An error occurred while updating profile', 'error');
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }

    // Add input validation listeners
    document.querySelectorAll('.profile-input').forEach(input => {
        input.addEventListener('input', function() {
            validateInput(this);
        });
    });

    // Direct click handler for edit/save button
    editButton.onclick = function() {
        if (this.textContent === 'Edit Profile') {
            // Entering edit mode
            this.textContent = 'Save';
            // This will make the input element to be Displayed in the page 
            document.querySelectorAll('.profile-input').forEach(input => {
                if (input.id !== 'profile-reg-input') {
                    input.style.display = 'block';
                    validateInput(input);
                }
            });

            // This make the data in the page is hidden
            document.querySelectorAll('.detail-value').forEach(span => {
                if (span.id !== 'profile-reg-display') {
                    span.style.display = 'none';
                }
            });
        } else {
            // Save mode - validate and save data
            saveProfileData();
        }
    };
}

// Export the init function for HomePage.js to use
window.initProfilePage = initProfilePage;