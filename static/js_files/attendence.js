window.initAttendencePage = async function () {
  const attendanceTableBody = document.getElementById('attendance-table-body');
  const modalTableBody = document.getElementById('modal-table-body');
  const modal = document.getElementById('attendance-modal');

  if (!attendanceTableBody || !modalTableBody || !modal) {
    console.error("Required DOM elements not found.");
    return;
  }

  // 🔄 Fetch merged permanent + temp session data
  let data;
  try {
    const res = await fetch('/api/merged-attendance');
    data = await res.json();
  } catch (err) {
    console.error('Error loading attendance data:', err);
    return;
  }

  
  const courses = data.courses;
  const attendanceData = data.attendance;

  // 🧹 Clear table
  attendanceTableBody.innerHTML = '';

  // 📋 Render each course row
  Object.keys(courses).forEach((courseCode, index) => {
    const course = courses[courseCode];

    const row = attendanceTableBody.insertRow();
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${courseCode}</td>
      <td>${course.CourseName || 'Unknown Course'}</td>
      <td>${course.ClassAttended || 0}</td>
      <td>${course.AttendedHours || 0}</td>
      <td>${course.TotalClass || 0}</td>
      <td>${course.TotalHours || 0}</td>
      <td>${course.Percentage || '0%'}</td>
      <td><button class="details-btn">Details</button></td>
    `;
  });

  // 🎯 Listen for 'Details' button click
  attendanceTableBody.addEventListener('click', (event) => {
    if (event.target.classList.contains('details-btn')) {
      const row = event.target.closest('tr');
      const courseCode = row.cells[1].textContent.trim();
      openModal(attendanceData[courseCode], modalTableBody, modal);
    }
  });

  // ❌ Close modal logic
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
