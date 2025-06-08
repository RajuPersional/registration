document.addEventListener('DOMContentLoaded', function() {
    // Course data for different slots
    const coursesBySlot = {
        'slot-a': [
            { code: 'ECA0307', title: 'Signals and Systems for Speech Recognition', instructor: 'Dr.Vidhya', seats: 18 },
            { code: 'CSA0834', title: 'Python Programming for Polymorphism', instructor: 'Dr.G.Charlyn Pushpa Latha', seats: 12 },
            { code: 'CSA1219', title: 'Computer Architecture for Parallel Processing', instructor: 'Dr Vignesh', seats: 8 },
            { code: 'BTA3802', title: 'Nutrition and Dietetics for Antinutritional Studies', instructor: 'Dr. I PRAVEEN KUMAR', seats: 15 },
            { code: 'ACA1010', title: 'Thermodynamics, Refrigeration and Air conditioning for Agricultural Products', instructor: 'Dr. KALIL RAHIMAN M', seats: 24 },
            { code: 'UBA1057', title: 'Numerical Methods and Its Influence in Computer Science Engineering', instructor: 'Maragathavalli', seats: 6 },
            { code: 'ECA1418', title: 'Embedded Systems for IoT', instructor: 'KEERTHI KASSAN V', seats: 0 },
            { code: 'CSA0230', title: 'C Programming for Registers', instructor: 'KESAVAN', seats: 0 }
        ],
        'slot-b': [
            { code: 'CSA1219', title: 'Computer Architecture for Parallel Processing', instructor: 'Dr Vignesh', seats: 22 },
            { code: 'ECA1418', title: 'Embedded Systems for IoT', instructor: 'KEERTHI KASSAN V', seats: 16 },
            { code: 'BTA3802', title: 'Nutrition and Dietetics for Antinutritional Studies', instructor: 'Dr. I PRAVEEN KUMAR', seats: 0 },
            { code: 'UBA1057', title: 'Numerical Methods and Its Influence in Computer Science Engineering', instructor: 'Maragathavalli', seats: 20 },
            { code: 'ECA0307', title: 'Signals and Systems for Speech Recognition', instructor: 'Dr.Vidhya', seats: 5 },
            { code: 'CSA0230', title: 'C Programming for Registers', instructor: 'KESAVAN', seats: 14 },
            { code: 'CSA0834', title: 'Python Programming for Polymorphism', instructor: 'Dr.G.Charlyn Pushpa Latha', seats: 0 },
            { code: 'ACA1010', title: 'Thermodynamics, Refrigeration and Air conditioning for Agricultural Products', instructor: 'Dr. KALIL RAHIMAN M', seats: 11 }
        ],
        'slot-c': [
            { code: 'UBA1057', title: 'Numerical Methods and Its Influence in Computer Science Engineering', instructor: 'Maragathavalli', seats: 18 },
            { code: 'CSA0230', title: 'C Programming for Registers', instructor: 'KESAVAN', seats: 25 },
            { code: 'ACA1010', title: 'Thermodynamics, Refrigeration and Air conditioning for Agricultural Products', instructor: 'Dr. KALIL RAHIMAN M', seats: 0 },
            { code: 'ECA0307', title: 'Signals and Systems for Speech Recognition', instructor: 'Dr.Vidhya', seats: 9 },
            { code: 'BTA3802', title: 'Nutrition and Dietetics for Antinutritional Studies', instructor: 'Dr. I PRAVEEN KUMAR', seats: 13 },
            { code: 'ECA1418', title: 'Embedded Systems for IoT', instructor: 'KEERTHI KASSAN V', seats: 7 },
            { code: 'CSA1219', title: 'Computer Architecture for Parallel Processing', instructor: 'Dr Vignesh', seats: 0 },
            { code: 'CSA0834', title: 'Python Programming for Polymorphism', instructor: 'Dr.G.Charlyn Pushpa Latha', seats: 21 }
        ],
        'slot-d': [
            { code: 'ECA0307', title: 'Signals and Systems for Speech Recognition', instructor: 'Dr.Vidhya', seats: 18 },
            { code: 'ECA1418', title: 'Embedded Systems for IoT', instructor: 'KEERTHI KASSAN V', seats: 0 },
            { code: 'CSA0834', title: 'Python Programming for Polymorphism', instructor: 'Dr.G.Charlyn Pushpa Latha', seats: 0 },
            { code: 'CSA1219', title: 'Computer Architecture for Parallel Processing', instructor: 'Dr Vignesh', seats: 0 },
            { code: 'CSA0230', title: 'C Programming for Registers', instructor: 'KESAVAN', seats: 0 },
            { code: 'BTA3802', title: 'Nutrition and Dietetics for Antinutritional Studies', instructor: 'Dr. I PRAVEEN KUMAR', seats: 0 },
            { code: 'ACA1010', title: 'Thermodynamics, Refrigeration and Air conditioning for Agricultural Products', instructor: 'Dr. KALIL RAHIMAN M', seats: 24 },
            { code: 'UBA1057', title: 'Numerical Methods and Its Influence in Computer Science Engineering', instructor: 'Maragathavalli', seats: 0 }
        ]
    };

    // Notification system
    function createNotificationContainer() {
        if (document.getElementById('notification-container')) {
            return document.getElementById('notification-container');
        }
        
        const container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
        return container;
    }

    function showNotification(message, type = 'success') {
        const container = createNotificationContainer();
        const notification = document.createElement('div');
        notification.className = 'notification ' + (type === 'success' ? 'success' : 'error');
        notification.textContent = message;

        container.appendChild(notification);

        // Animate in (handled by CSS animation)
        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);

        // Click to remove immediately
        notification.addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    }

    // Update courses for selected slot
    function updateCoursesForSlot(slotValue) {
        const courses = coursesBySlot[slotValue] || [];
        const container = document.getElementById('courses-container');
        container.innerHTML = ''; // Clear previous cards
    
        courses.forEach(course => {
            const card = document.createElement('div');
            card.className = 'course-card';

            card.innerHTML = `
                <div class="course-content">
                    <input type="radio" name="course" class="course-radio" value="${course.code.toLowerCase()}">
                    <div class="course-info">
                        <p class="course-title">${course.code} - ${course.title} - ${course.instructor}</p>
                    </div>
                    <div class="seat-count ${course.seats === 0 ? 'zero' : ''}">${course.seats}</div>
                </div>
            `;

            // Clicking anywhere on card checks radio
            card.addEventListener('click', (e) => {
                if (e.target.type !== 'radio') {
                    card.querySelector('.course-radio').checked = true;
                    updateSelectedCourse(card);
                }
            });

            container.appendChild(card);
        });

        // Add change listeners to radios
        document.querySelectorAll('.course-radio').forEach(radio => {
            radio.addEventListener('change', function () {
                updateSelectedCourse(this.closest('.course-card'));
            });
        });

        // Clear any previous selection
        updateSelectedCourse(null);
    }

    // Toggle course section visibility
    const toggleBtn = document.getElementById('toggle-courses');
    const coursesContainer = document.getElementById('courses-container');

    toggleBtn.addEventListener('click', () => {
        coursesContainer.classList.toggle('collapsed');
        toggleBtn.classList.toggle('rotated');
    });

    // Selected course card update
    function updateSelectedCourse(selectedCard) {
        document.querySelectorAll('.course-card').forEach(card => {
            card.classList.remove('selected');
        });
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
    }

    // Slot select change
    const slotSelect = document.getElementById('slot-select');
    slotSelect.addEventListener('change', function() {
        updateCoursesForSlot(this.value);
    });

    // Enrollment and draft buttons
    const enrollBtn = document.getElementById('enroll-btn');
});