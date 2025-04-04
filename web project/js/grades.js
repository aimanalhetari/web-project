document.addEventListener("DOMContentLoaded", () => {
    // Retrieve the selected section from localStorage
    const selectedSection = JSON.parse(localStorage.getItem("selectedSection"));

    if (!selectedSection) {
        alert("No section selected. Redirecting to instructor main page...");
        window.location.href = "instr_main.html";
        return;
    }

    // NEW CODE: Setup event listeners for sign out button
    const signOutLink = document.querySelector('nav ul li:nth-child(2) a');
    if (signOutLink) {
        signOutLink.addEventListener('click', handleSignOut);
    }

    // Fetch students who belong to this section
    fetch("json_files/users.json")
        .then(response => response.json())
        .then(users => {
            const students = users.students.filter(student => selectedSection.students.includes(student.id));

            // Populate the grades table
            const tableBody = document.querySelector("tbody");
            tableBody.innerHTML = ""; // Clear existing rows

            if (students.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="3">No students found for this section.</td></tr>`;
            } else {
                students.forEach(student => {
                    const row = `
                        <tr>
                            <td>${student.id}</td>
                            <td>${student.name}</td>
                            <td>
                                <select class="grade-select" data-student-id="${student.id}">
                                    <option value="A">A</option>
                                    <option value="B+">B+</option>
                                    <option value="B">B</option>
                                    <option value="C+">C+</option>
                                    <option value="C">C</option>
                                    <option value="D+">D+</option>
                                    <option value="D">D</option>
                                    <option value="F">F</option>
                                </select>
                            </td>
                        </tr>
                    `;
                    tableBody.innerHTML += row;
                });
            }

            // Save updated users object in localStorage
            localStorage.setItem("users", JSON.stringify(users));
        })
        .catch(error => console.error("Error loading users.json:", error));

    // Handle form submission
    document.querySelector("form").addEventListener("submit", (event) => {
        event.preventDefault();

        // Retrieve users from local storage
        const users = JSON.parse(localStorage.getItem("users"));
        if (!users) {
            alert("Error: No users data found.");
            return;
        }

        // Get selected grades
        document.querySelectorAll(".grade-select").forEach(select => {
            const studentId = select.dataset.studentId;
            const selectedGrade = select.value;

            // Find the student in the users data
            const student = users.students.find(s => s.id === studentId);
            if (student) {
                console.log("Student found: ", student);
                
                // Find the course in in_progress_courses
                const courseIndex = student.in_progress_courses.findIndex(
                    course => course.code === selectedSection.course_id
                );
                
                console.log("Selected course ID: ", selectedSection.course_id);
                console.log("Course Index: ", courseIndex);
                
                if (courseIndex !== -1) {
                    console.log("Course found in in_progress_courses:", selectedSection.course_id);
                    
                    // Get the course info before removing it
                    const courseInfo = student.in_progress_courses[courseIndex];
                    
                    // Remove from in_progress_courses
                    student.in_progress_courses.splice(courseIndex, 1);
                    
                    // Ensure completedCourses is an array
                    student.completedCourses = student.completedCourses || [];

                    // Add course with grade to completedCourses
                    student.completedCourses.push({
                        code: courseInfo.code,
                        title: courseInfo.title,
                        credit: courseInfo.credit,
                        semester: courseInfo.semester,
                        grade: selectedGrade
                    });
                }
            }
        });

        // Save updated users data back to local storage
        localStorage.setItem("users", JSON.stringify(users));

        alert("Grades successfully submitted, and courses marked as completed.");

        // Redirect back to the instructor home page
        window.location.href = "instr_main.html";
    });
});

// NEW CODE: Handle sign out functionality
function handleSignOut(e) {
    e.preventDefault();
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';
}