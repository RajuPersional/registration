
// Sample data (you would typically fetch this from a backend)
const attendanceData = {
    'SPIC781': generateRandomAttendance(10, '2025-01-01', '2025-03-31'),
    'MMA1217': generateRandomAttendance(5, '2025-01-01', '2025-03-31'),
    'SPIC4A04': generateRandomAttendance(7, '2025-01-01', '2025-03-31')
};

// Generate fake absent data
function generateRandomAttendance(numAbsents, startDate, endDate) {
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let i = 0; i < numAbsents; i++) {
        const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
        const randomDate = new Date(randomTime);
        dates.push(randomDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }));
    }

    // Sort dates in chronological order
    dates.sort((a, b) => new Date(a.split('/').reverse().join('-')) - new Date(b.split('/').reverse().join('-')));

    return dates.map((date, index) => ({
        sNo: index + 1,
        datedOn: date,
        attendanceType: 'Absent'
    }));
}

// Open modal and show data
function openModal(courseCode, modalTableBody, attendanceModal) {
    console.log("Attempting to open modal for course:", courseCode);
    console.log("Available keys:", Object.keys(attendanceData)); // Debug log
    const dataForCourse = attendanceData[courseCode];
    modalTableBody.innerHTML = '';

    if (dataForCourse && dataForCourse.length > 0) {
        dataForCourse.forEach(item => {
            const row = modalTableBody.insertRow();
            row.insertCell(0).textContent = item.sNo;
            row.insertCell(1).textContent = item.datedOn;
            row.insertCell(2).textContent = item.attendanceType;
        });
        console.log("Modal data populated.");
    } else {
        const row = modalTableBody.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 3;
        cell.textContent = 'No absent details available for this course.';
        cell.style.textAlign = 'center';
        console.log("No data found for course.");
    }

    attendanceModal.style.display = 'block';
    console.log("Modal opened.");
}

// Close modal
function closeModal(attendanceModal) {
    attendanceModal.style.display = 'none';
    console.log("Modal closed.");
}

    const attendanceModal = document.getElementById('attendance-modal');
    const closeButton = document.querySelector('.close-button');
    const modalTableBody = document.getElementById('modal-table-body');

    if (!attendanceModal || !modalTableBody) {
        console.error("Modal elements missing.");
    
    }

    const attendanceTable = document.querySelector('.attendance-table');
    if (attendanceTable) {
        attendanceTable.addEventListener('click', (event) => {
            if (event.target.classList.contains('details-btn')) {
                const row = event.target.closest('tr');
                const courseCodeTd = row.querySelector('td:nth-child(2)');
                if (courseCodeTd) {
                    const courseCode = courseCodeTd.textContent.trim(); // FIX APPLIED HERE
                    openModal(courseCode, modalTableBody, attendanceModal);
                } else {
                    console.error("Course code column not found.");
                }
            }
        });
    } else {
        console.error("Attendance table not found.");
    }

    if (closeButton) {
        closeButton.addEventListener('click', () => closeModal(attendanceModal));
    }

    window.addEventListener('click', (event) => {
        if (event.target === attendanceModal) {
            closeModal(attendanceModal);
        }
    });