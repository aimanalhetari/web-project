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

    // NEW CODE: Add sign out functionality
    const signOutLink = document.querySelector("nav ul li:nth-child(3) a");
    if (signOutLink) {
        signOutLink.addEventListener("click", function(e) {
            e.preventDefault();
            // Clear the logged-in user from localStorage
            localStorage.removeItem("loggedInUser");
            // Redirect to the login page
            window.location.href = "login.html";
        });
    }
});

// Function to display sections based on selected course
function displaySections(sections, course_code) {
    const tableBody = document.querySelector(".table__body tbody");
    tableBody.innerHTML = ""; 

    // Filter sections based on selected course_code
    const filteredSections = sections.filter(section => section.course_id === course_code);

    if (filteredSections.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='9'>No sections available for this course.</td></tr>";
    } else {
        filteredSections.forEach(section => {
            // Calculate available seats
            const studentsCount = section.students.length;
            const totalSeats = section.total_no_of_seats;
            const availableSeats = totalSeats - studentsCount;
            const status = `${availableSeats} seats left`;

            // NEW CODE: Create validation status display
            const validationStatus = section.validated ? 
                "<span style='color: green; font-weight: bold;'>Validated by Admin</span>" : 
                "<span style='color: red;'>Not Validated by Admin yet</span>";

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${section.course_id}</td>
                <td>${section.category}</td>
                <td>${section.course_name}</td>
                <td>${section.section_no}</td>
                <td>${section.instructor}</td>
                <td>${section.meeting_time}</td>
                <td><strong>${status}</strong></td>
                <!-- NEW CODE: Add validation status column -->
                <td>${validationStatus}</td>
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

    // Initialize arrays if they don't exist
    loggedInUser.in_progress_courses = loggedInUser.in_progress_courses || [];
    loggedInUser.pendingCourses = loggedInUser.pendingCourses || [];
    loggedInUser.remaining_courses = loggedInUser.remaining_courses || [];

    // Check if student is already taking this course
    const isInProgress = loggedInUser.in_progress_courses.some(
        course => (typeof course === 'object' ? course.code === courseId : course === courseId)
    );
    
    if (isInProgress) {
        alert("You are already taking this course.");
        return;
    }

    // Check if course is already in pending courses
    const isPending = loggedInUser.pendingCourses.some(
        course => course.code === courseId
    );
    
    if (isPending) {
        alert("This course is already in your pending courses list.");
        return;
    }

    // Check if student has completed prerequisites
    const prerequisitesCompleted = checkPrerequisites(loggedInUser, course);
    
    if (!prerequisitesCompleted.success) {
        alert(`You cannot register for this course. Missing prerequisites: ${prerequisitesCompleted.missing.join(", ")}`);
        return;
    }

    // Check if the student has already completed the course
    const isCompleted = loggedInUser.completedCourses.some(
        course => course.code === courseId
    );
    
    if (isCompleted) {
        alert("You have already completed this course.");
        return;
    }

    // Proceed with registration
    registerStudent(loggedInUser, courseId, course, section, classes);
}

// Function to check if prerequisites are completed
function checkPrerequisites(student, course) {
    // If course has no prerequisites
    if (!course.prerequisite || course.prerequisite.length === 0) {
        return { success: true, missing: [] };
    }

    const completedCourseIds = student.completedCourses.map(course => course.code);
    const missingPrerequisites = [];

    // Check each prerequisite
    for (const prereq of course.prerequisite) {
        if (!completedCourseIds.includes(prereq)) {
            missingPrerequisites.push(prereq);
        }
    }

    return {
        success: missingPrerequisites.length === 0,
        missing: missingPrerequisites
    };
}

// Function to register the student - Updated 03/04/2025
function registerStudent(student, courseId, courseInfo, section, classes) {
    // Find the course in remaining_courses
    const courseIndex = student.remaining_courses.findIndex(
        course => course.code === courseId
    );

    if (courseIndex === -1) {
        // If course not found in remaining_courses, just add it to pendingCourses
        const newPendingCourse = {
            code: courseId,
            title: courseInfo.title || section.course_name,
            credit: courseInfo.credit || 3,
            semester: getCurrentSemester(),
            status: "Registration Confirmed"
        };

        student.pendingCourses.push(newPendingCourse);
    } else {
        // Move course from remaining_courses to pendingCourses
        const courseToMove = student.remaining_courses[courseIndex];
        
        const pendingCourse = {
            code: courseToMove.code,
            title: courseToMove.title,
            credit: courseToMove.credit,
            semester: getCurrentSemester(),
            status: "Registration Confirmed"
        };
        
        student.pendingCourses.push(pendingCourse);
        
        // Remove from remaining_courses
        student.remaining_courses.splice(courseIndex, 1);
    }
    
    // Add student to section's students list
    section.students.push(student.id);
    
    // Update local storage for the logged-in user
    localStorage.setItem("loggedInUser", JSON.stringify(student));
    localStorage.setItem("classes", JSON.stringify(classes));

    // Update the user in the users.json (or localStorage if available)
    updateUserInDatabase(student);

    alert("Successfully registered!");
    
    // Refresh the display
    const storedClasses = localStorage.getItem('classes');
    if (storedClasses) {
        displaySections(JSON.parse(storedClasses), courseId);
    }
}

// New function to update user data in the database - Added 03/04/2025
function updateUserInDatabase(updatedStudent) {
    // First try to get users from localStorage
    let usersData = localStorage.getItem('users');
    
    if (usersData) {
        // If users are in localStorage
        updateUserAndSave(JSON.parse(usersData), updatedStudent);
    } else {
        // If not in localStorage, fetch from the JSON file
        fetch("json_files/users.json")
            .then(response => response.json())
            .then(data => {
                // Store users in localStorage for future use
                updateUserAndSave(data, updatedStudent);
            })
            .catch(error => {
                console.error("Error updating user in database:", error);
            });
    }
}

// Helper function to update user in the data and save - Added 03/04/2025
function updateUserAndSave(usersData, updatedStudent) {
    // Find the student in the array
    const studentIndex = usersData.students.findIndex(student => student.id === updatedStudent.id);
    
    if (studentIndex !== -1) {
        // Update the student's data
        usersData.students[studentIndex] = updatedStudent;
        
        // Save back to localStorage
        localStorage.setItem('users', JSON.stringify(usersData));
        
        // In a real application, this would also send the updated data to the server
        console.log("User data updated successfully in the database");
    } else {
        console.error("Student not found in the database");
    }
}

// Helper function to get current semester
function getCurrentSemester() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11
    
    let semester;
    if (month >= 0 && month <= 4) {
        semester = "Spring " + year;
    } else if (month >= 5 && month <= 7) {
        semester = "Summer " + year;
    } else {
        semester = "Fall " + year;
    }
    
    return semester;
}