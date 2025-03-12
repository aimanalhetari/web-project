document.addEventListener("DOMContentLoaded", function () {
    const course_code = localStorage.getItem("selectedCourse"); // Get stored course_code

    fetch("json_files/sections.json")
        .then(response => response.json())
        .then(sections => {
            const tableBody = document.querySelector(".table__body tbody");
            tableBody.innerHTML = ""; 

            // Filter sections based on selected course_code
            const filteredSections = sections.filter(section => section.course_id === course_code);

            if (filteredSections.length === 0) {
                tableBody.innerHTML = "<tr><td colspan='8'>No sections available for this course.</td></tr>";
            } else {
                filteredSections.forEach(section => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${section.course_id}</td>
                        <td>${section.category}</td>
                        <td>${section.course_name}</td>
                        <td>${section.section_no}</td>
                        <td>${section.instructor}</td>
                        <td>${section.meeting_time}</td>
                        <td><strong>${section.status}</strong></td>
                        <td><p class="register" data-section-course_id="${section.course_id}">Register</p></td>
                    `;
                    tableBody.appendChild(row);
                });

                // Add event listeners for registration
                document.querySelectorAll(".register").forEach(button => {
                    button.addEventListener("click", function () {
                        const courseId = this.getAttribute("data-section-course_id");
                        handleRegistration(courseId);
                    });
                });
            }
        })
        .catch(error => console.error("Error loading sections:", error));
        
});

// Function to handle registration logic
function handleRegistration(courseId) {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")); // Retrieve logged-in student info

    if (!loggedInUser) {
        alert("Error: No user logged in. Please log in first.");
        window.location.href = "login.html";
        return;
    }

    fetch("json_files/courses.json")
        .then(response => response.json())
        .then(courses => {
            // Find the course that matches the section's course_code
            const course = courses.find(course => course.course_code === courseId);

            if (!course) {
                alert("Error: Course not found.");
                return;
            }

            // Check if student has completed prerequisites
            const missingPrerequisites = course.prerequisite.filter(prereq => 
                !loggedInUser.completedCourses.includes(prereq)
            );

            if (missingPrerequisites.length > 0) {
                alert(`You cannot register for this course. Missing prerequisites: ${missingPrerequisites.join(", ")}`);
                return;
            }

            // Proceed with registration
            registerStudent(loggedInUser, courseId);
        })
        .catch(error => console.error("Error fetching courses:", error));
}

// Function to register the student
function registerStudent(student, courseId) {
    student.in_progress_courses = student.in_progress_courses || []; // Ensure array exists

    if (student.in_progress_courses.includes(courseId)) {
        alert("You are already registered for this section.");
        return;
    }

    student.in_progress_courses.push(courseId);
    localStorage.setItem("loggedInUser", JSON.stringify(student)); // Update local storage

    alert("Successfully registered!");
}
