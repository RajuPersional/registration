// =======================
// Updated Attendance.js (Using Combined JSON)
// =======================

window.sharedAttendanceLogic = async function () {
    const attendanceTableBody = document.getElementById('attendance-table-body');
    const modalTableBody = document.getElementById('modal-table-body');
    const modal = document.getElementById('attendance-modal');
  
    if (!attendanceTableBody || !modalTableBody || !modal) {
      console.error("Required DOM elements not found.");
      return;
    }
  
    // Fetch combined attendance + courses JSON
    let data;
    try {
      const res = await fetch('/static/File_Data/Attendence.json');
      data = await res.json();
    } catch (err) {
      console.error('Error loading attendance data:', err);
      return;
    }
  
    const courses = data.courses;
    console.log(courses)
    const attendanceData = data.attendance;
  
    // Clear and render table
    attendanceTableBody.innerHTML = '';
    Object.keys(attendanceData).forEach((courseCode, index) => {
      const course = courses[courseCode];
      //console.log(course);
      const row = attendanceTableBody.insertRow();
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${courseCode}</td>
        <td>${course.CourseName|| 'Unknown Course'}</td>
        <td>${course.ClassAttended|| 'Unknown Course'}</td>
        <td>${course.AttendedHours|| 'Unknown Course'}</td>
        <td>${course.TotalClass|| 'Unknown Course'}</td>
        <td>${course.TotalHours|| 'Unknown Course'}</td>
        <td>${course.Percentage|| 'Unknown Course'}</td>  
        <td><button class="details-btn">Details</button></td>
      `;
    });
  
    // Click listener for Details buttons
    attendanceTableBody.addEventListener('click', (event) => {
      if (event.target.classList.contains('details-btn')) {
        const row = event.target.closest('tr');
        const courseCode = row.cells[1].textContent.trim();
        openModal(courseCode, attendanceData[courseCode], modalTableBody, modal);
      }
    });
  
    // Modal close
    document.querySelectorAll('.close-button').forEach(btn => {
      btn.onclick = () => modal.style.display = 'none';
    });
    window.onclick = e => {
      if (e.target === modal) modal.style.display = 'none';
    };
  };
  
  function openModal(dataForCourse, modalTableBody, modal) {
    modalTableBody.innerHTML = '';
  
    if (dataForCourse && dataForCourse.length > 0) {
      dataForCourse.forEach((item, i) => {
        const row = modalTableBody.insertRow();
        row.innerHTML = `
          <td>${i + 1}</td>
          <td>${item.datedOn}</td>
          <td>${item.attendanceType}</td>
        
        `;
      });
    } else {
      const row = modalTableBody.insertRow();
      row.innerHTML = `<td colspan="3" style="text-align:center;">No absent details</td>`;
    }
  
    modal.style.display = 'block';
  }
  