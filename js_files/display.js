export function displaysection(){
        const sections = {
        dashboard: document.getElementById("dashboard-section"),
        profile: document.getElementById("profile-section"),
        course:  document.getElementById("course-container"),
        attendence:  document.getElementById("attendence-section")
        };

        function showSection(sectionToShow) {
        for (const key in sections) {
            sections[key].style.display = key === sectionToShow ? "block" : "none";   // sections will get the data that is give to the key (variable )
        }
        }

        document.getElementById("dashboardbtn").addEventListener("click", () => showSection("dashboard"));
        document.getElementById("profilebtn").addEventListener("click", () => showSection("profile"));
        document.getElementById("coursesbtn").addEventListener("click", () => showSection("course"));
        document.getElementById("attendencebtn").addEventListener("click", () => showSection("attendence"));
       
}
