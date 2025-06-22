
        const attendanceData = {
            'SPIC781': generateRandomAttendance(10, '2025-01-01', '2025-03-31'),
            'MMA1217': generateRandomAttendance(5, '2025-01-01', '2025-03-31'),
            'SPIC4A04': generateRandomAttendance(7, '2025-01-01', '2025-03-31')
        };

        const courseNameData = {
            'SPIC781': 'Product Design & Development for Sustainability',
            'MMA1217': 'Mentor Mentee Meeting',
            'SPIC4A04': 'Core Project for Big Data and Network Security'
        };

        function generateRandomAttendance(numAbsents, startDate, endDate) {
            const dates = [];
            const start = new Date(startDate);
            const end = new Date(endDate);

            for (let i = 0; i < numAbsents; i++) {
                const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
                const randomDate = new Date(randomTime);
                dates.push(randomDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }));
            }

            dates.sort((a, b) => new Date(a.split('/').reverse().join('-')) - new Date(b.split('/').reverse().join('-')));

            return dates.map((date, index) => ({
                sNo: index + 1,
                datedOn: date,
                attendanceType: 'Absent'
            }));
        }

        function initAttendencePage() {
            const attendanceTableBody = document.getElementById('attendance-table-body');

            Object.keys(attendanceData).forEach((courseCode, index) => {
                const row = attendanceTableBody.insertRow();
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${courseCode}</td>
                    <td>${courseNameData[courseCode]}</td>
                    <td>92</td>
                    <td>92</td>
                    <td>123</td>
                    <td>123</td>
                    <td><span class="percentage good">75%</span></td>
                    <td><button class="details-btn">Details</button></td>
                `;
            });

            // Modal handling
            const attendanceModal = document.getElementById('attendance-modal');
            const modalTableBody = document.getElementById('modal-table-body');
            const closeButton = document.querySelectorAll('.close-button');

            attendanceTableBody.addEventListener('click', (event) => {
                if (event.target.classList.contains('details-btn')) {
                    const row = event.target.closest('tr');
                    const courseCode = row.cells[1].textContent.trim();
                    openModal(courseCode, modalTableBody, attendanceModal);
                }
            });

            closeButton.forEach(button => {
                button.addEventListener('click', () => {
                    attendanceModal.style.display = 'none';
                });
            });

            window.addEventListener('click', (event) => {
                if (event.target === attendanceModal) {
                    attendanceModal.style.display = 'none';
                }
            });
        }

        function openModal(courseCode, modalTableBody, attendanceModal) {
            const dataForCourse = attendanceData[courseCode];
            modalTableBody.innerHTML = '';

            if (dataForCourse && dataForCourse.length > 0) {
                dataForCourse.forEach(item => {
                    const row = modalTableBody.insertRow();
                    row.innerHTML = `
                        <td>${item.sNo}</td>
                        <td>${item.datedOn}</td>
                        <td>${item.attendanceType}</td>
                    `;
                });
            } else {
                const row = modalTableBody.insertRow();
                row.innerHTML = `<td colspan="3" style="text-align: center;">No absent details available for this course.</td>`;
            }

            attendanceModal.style.display = 'block';
        }

        window.initAttendencePage = initAttendencePage;
