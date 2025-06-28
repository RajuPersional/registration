window.initEnrollmentPage= async function(){
    const response = await fetch("/static/File_Data/Enrollment.json")
    const courseData = await response.json();
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
        const parts = selected.value.split('-'); //*1
        const code = parts[0];// 👉 code = "MAT1001"                    

        const subject = parts.slice(1, -1).join('-'); // *2

        fetch('/save-attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({code:code,subject:subject})
        })
        .then(async res => {
                const text = await res.json();  // Waits for full response body

                if (!res.ok) {
                showToast(`Error: ${text.message}`);
                throw new Error(text.message);        //  Triggers .catch()
                }

                showToast(json.message);
                return text;                    //  Goes to next .then() (if any)
            })
        .then(data => {
            console.log(' Saved:', data);
            showToast("Enrollment saved to attendance");})
        .catch(err => console.error(' Error:', err));

        showToast(selected ? 'Enrollment Successful' : 'Please select a course before enrolling.');

    }

    // ✅ Call this manually after page is loaded
    function EnrollmentPage() {
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

    document.querySelector('.section-header').addEventListener('click',toggleSection)
    // Expose to global scope
    document.querySelector('.btn-enrollment').addEventListener('click',function(){

        handleEnrollment()
    })
    EnrollmentPage(); 

};
