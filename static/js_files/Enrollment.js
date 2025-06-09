(function () {
    const courseData = {
        'slot-a': [
            { title: "MAT1001-Advanced Mathematics for Engineers-Dr. Rajesh Kumar", badge: "15" },
            { title: "PHY2001-Quantum Physics Applications-Dr. Priya Sharma", badge: "8" },
            { title: "CHE2001-Chemical Engineering Applications-Dr. Sumanth Reddy", badge: "12" },
        ],
        'slot-b': [
            { title: "BIO1001-Biotechnology Fundamentals-Dr. Kavya Nair", badge: "25" },
            { title: "EEE2001-Power Systems Analysis-Prof. Ramesh Gupta", badge: "18" },
        ],
        'slot-c': [
            { title: "AER1001-Aerospace Dynamics-Dr. Vikram Joshi", badge: "10" },
            { title: "MAR2001-Marine Engineering-Prof. Lata Desai", badge: "28" },
        ],
        'slot-d': [
            { title: "ECA0307-Signals and Systems for Speech Recognition-Dr.Vidhya", badge: "18" },
            { title: "ECA1418-Embedded Systems for IoT-KEERTHI KASSAN V", badge: "0" },
            { title: "CSA0834-Python Programming for Polymorphism-Dr.G.Charlyn Pushpa Latha", badge: "0" },
        ]
    };

    function showToast(message) {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            alert(message); // fallback
            return;
        }
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toastContainer.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            toast.classList.add('hide');
            setTimeout(() => {
                if (toastContainer.contains(toast)) toastContainer.removeChild(toast);
            }, 300);
        }, 3000);
    }

    function loadCourses(slot) {
        const courseGrid = document.getElementById('courseGrid');
        if (!courseGrid) {
            console.error('Element with id="courseGrid" not found');
            return;
        }

        const courses = courseData[slot] ;
        if (!courses) {
            console.error(`No courses found for slot: ${slot}`);
            return;
        }
        courseGrid.innerHTML = '';

        courses.forEach((course, idx) => {
            const courseCard = document.createElement('div');
            courseCard.className = 'course-card';
            courseCard.innerHTML = `
                <div class="radio-option">
                    <input type="radio" name="course" id="course${idx}" value="${course.title}">
                    <label for="course${idx}">${course.title}</label>
                </div>
                <div class="course-badge">${course.badge}</div>
            `;
            courseGrid.appendChild(courseCard);
        });

        attachRadioListeners();
    }

    function attachRadioListeners() {
        const radios = document.querySelectorAll('input[name="course"]');
        const cards = document.querySelectorAll('.course-card');

        radios.forEach(radio => {
            radio.addEventListener('change', () => {
                cards.forEach(c => c.classList.remove('selected-course'));
                if (radio.checked) {
                    radio.closest('.course-card').classList.add('selected-course');
                }
            });
        });

        cards.forEach(card => {
            card.addEventListener('click', e => {
                if (e.target.type !== 'radio') {
                    const radio = card.querySelector('input[type="radio"]');
                    if (radio) {
                        radio.checked = true;
                        radio.dispatchEvent(new Event('change'));
                    }
                }
            });
        });
    }

    function toggleSection() {
        const content = document.getElementById('courseContent');
        const header = document.querySelector('.section-header');
        if (!content) return;
        content.classList.toggle('collapsed');
        if (header) header.classList.toggle('collapsed');
    }

    function handleEnrollment() {
        const selected = document.querySelector('input[name="course"]:checked');
        showToast(selected ? 'Enrollment Successful' : 'Please select a course before enrolling.');
    }

    // ✅ Call this manually after page is loaded
    function initEnrollmentPage() {
        const courseGrid = document.getElementById('courseGrid');
        const slotSelect = document.getElementById('slotSelect');

        if (!courseGrid || !slotSelect) {
            console.error('Required elements not found in DOM');
            return;
        }

        loadCourses('slot-a');
        slotSelect.addEventListener('change', function () {
            loadCourses(this.value);
        });
    }

    // Expose to global scope
    window.toggleSection = toggleSection;
    window.handleEnrollment = handleEnrollment;
    window.initEnrollmentPage = initEnrollmentPage; // Changed from initCoursesPage

})();
