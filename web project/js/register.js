document.addEventListener("DOMContentLoaded", function () {
    const course_code = localStorage.getItem("selectedCourse"); // Get stored course_code

    // First check if sections exist in local storage
    const storedClasses = localStorage.getItem('classes');
    
    if (storedClasses) {
        // Use sections from local storage
        displaySections(JSON.parse(storedClasses), course_code);
    } else {
        // Fetch sections from server if not in local storage
        fetch("json_files/sections.json")
            .then(response => response.json())
            .then(sections => {
                // Store sections in local storage for future use
                localStorage.setItem('classes', JSON.stringify(sections));
                displaySections(sections, course_code);
            })
            .catch(error => console.error("Error loading sections:", error));
    }
});

// Function to display sections based on selected course
function displaySections(sections, course_code) {
    const tableBody = document.querySelector(".table__body tbody");
    tableBody.innerHTML = ""; 

    // Filter sections based on selected course_code
    const filteredSections = sections.filter(section => section.course_id === course_code);

    if (filteredSections.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='8'>No sections available for this course.</td></tr>";
    } else {
        filteredSections.forEach(section => {
            // Calculate available seats
            const studentsCount = section.students.length;
            const totalSeats = section.total_no_of_seats;
            const availableSeats = totalSeats - studentsCount;
            const status = `${availableSeats} seats left`;

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${section.course_id}</td>
                <td>${section.category}</td>
                <td>${section.course_name}</td>
                <td>${section.section_no}</td>
                <td>${section.instructor}</td>
                <td>${section.meeting_time}</td>
                <td><strong>${status}</strong></td>
                <td><p class="register" data-section-course_id="${section.course_id}" data-section-id="${section.id}">Register</p></td>
            `;
            tableBody.appendChild(row);
        });

        // Add event listeners for registration
        document.querySelectorAll(".register").forEach(button => {
            button.addEventListener("click", function () {
                const courseId = this.getAttribute("data-section-course_id");
                const sectionId = this.getAttribute("data-section-id");
                handleRegistration(courseId, sectionId);
            });
        });
    }
}

// Function to handle registration logic
function handleRegistration(courseId, sectionId) {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")); // Retrieve logged-in student info

    if (!loggedInUser) {
        alert("Error: No user logged in. Please log in first.");
        window.location.href = "login.html";
        return;
    }

    // Check if courses exist in local storage
    const storedCourses = localStorage.getItem('courses');
    const storedClasses = localStorage.getItem('classes');
    
    if (storedCourses && storedClasses) {
        // Use courses from local storage
        const courses = JSON.parse(storedCourses);
        const classes = JSON.parse(storedClasses);
        processCourseRegistration(courses, classes, loggedInUser, courseId, sectionId);
    } else {
        // Fetch courses from server if not in local storage
        fetch("json_files/courses.json")
            .then(response => response.json())
            .then(courses => {
                // Store courses in local storage for future use
                localStorage.setItem('courses', JSON.stringify(courses));
                
                // Also fetch classes if needed
                if (!storedClasses) {
                    fetch("json_files/sections.json")
                        .then(response => response.json())
                        .then(classes => {
                            localStorage.setItem('classes', JSON.stringify(classes));
                            processCourseRegistration(courses, classes, loggedInUser, courseId, sectionId);
                        })
                        .catch(error => console.error("Error fetching sections:", error));
                } else {
                    processCourseRegistration(courses, JSON.parse(storedClasses), loggedInUser, courseId, sectionId);
                }
            })
            .catch(error => console.error("Error fetching courses:", error));
    }
}

// Function to process course registration after courses are retrieved
function processCourseRegistration(courses, classes, loggedInUser, courseId, sectionId) {
    // Find the course that matches the section's course_code
    const course = courses.find(course => course.course_code === courseId);
    const section = classes.find(section => section.id === sectionId);

    if (!course) {
        alert("Error: Course not found.");
        return;
    }

    if (!section) {
        alert("Error: Section not found.");
        return;
    }

    // Check if there are available seats
    const availableSeats = section.total_no_of_seats - section.students.length;
    if (availableSeats <= 0) {
        alert("Error: No available seats in this section.");
        return;
    }

    // Check if student is already registered for this section
    if (section.students.includes(loggedInUser.id)) {
        alert("You are already registered for this section.");
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
    registerStudent(loggedInUser, courseId, section, classes);
}

// Function to register the student
function registerStudent(student, courseId, section, classes) {
    student.in_progress_courses = student.in_progress_courses || []; // Ensure array exists

    if (student.in_progress_courses.includes(courseId)) {
        alert("You are already registered for this course.");
        return;
    }

    // Add course to student's in-progress courses
    student.in_progress_courses.push(courseId);
    
    // Add student to section's students list
    section.students.push(student.id);
    
    // Update local storage
    localStorage.setItem("loggedInUser", JSON.stringify(student));
    localStorage.setItem("classes", JSON.stringify(classes));

    alert("Successfully registered!");
    
    // Refresh the display
    displaySections(classes, courseId);
}