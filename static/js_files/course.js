window.initCoursesPage = async function () {
    console.log("Courses");

    let data;
    try {
        const res = await fetch('/api/merged-attendance');
        data = await res.json();
    } catch (err) {
        console.error('Error loading attendance data:', err);
        return;
    }

    const courses = data.courses;

    // Select tbody inside the .inprogress-courses section
    const tableBody = document.querySelector('.inprogress-courses tbody');
    tableBody.innerHTML = ''; // Clear old rows if any

    Object.entries(courses).forEach(([courseCode, course]) => { //1* object.entires will convert the object in to the array 
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="course-code">${courseCode}</span></td>
            <td>${course.CourseName}</td>
            <td><span class="status-badge status-inprogress">InProgress</span></td>
            <td>June-2025</td> <!-- Replace with actual date if available -->
        `;
        tableBody.appendChild(row);
    });

    

    document.querySelectorAll('[data-collapsible]').forEach(section => {
        const toggle = section.querySelector('[data-toggle]');
        toggle.addEventListener('click', () => {

            section.classList.toggle('collapsed'); // 2* this line adds the class if the class added then the data is collapsed have a look at the css file 
        });
    });
}