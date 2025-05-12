document.addEventListener("DOMContentLoaded", async function () {
    const course_code = localStorage.getItem("selectedCourse");

    if (!course_code) {
        console.error("No selected course found in localStorage.");
        return;
    }

    try {
        const response = await fetch(`/api/courses/${course_code}/sections`);
        if (!response.ok) {
            throw new Error("Failed to fetch sections from API");
        }
        const sections = await response.json();
        displaySections(sections);
    } catch (error) {
        console.error("Error loading sections from API:", error);
    }

    const signOutLink = document.querySelector("nav ul li:nth-child(3) a");
    if (signOutLink) {
        signOutLink.addEventListener("click", function(e) {
            e.preventDefault();
            localStorage.removeItem("loggedInUser");
            window.location.href = "login.html";
        });
    }
});

function displaySections(filteredSections) {
    const tableBody = document.querySelector(".table__body tbody");
    tableBody.innerHTML = ""; 

    if (filteredSections.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='9'>No pending sections available for this course.</td></tr>";
    } else {
        filteredSections.forEach(section => {
            const studentsCount = section.studentEnrollments.length;
            const totalSeats = section.total_no_of_seats;
            const availableSeats = totalSeats - studentsCount;
            const status = `${availableSeats} seats left`;

            const validationStatus = section.validated ? 
                "<span style='color: green; font-weight: bold;'>Validated by Admin</span>" : 
                "<span style='color: red;'>Not Validated by Admin yet</span>";

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${section.courseId}</td>
                <td>${section.course.category}</td>
                <td>${section.course.title}</td>
                <td>${section.section_no}</td>
                <td>${section.instructor.name}</td>
                <td>${section.meeting_time}</td>
                <td><strong>${status}</strong></td>
                <td>${validationStatus}</td>
                <td><p class="register" data-section-course_id="${section.courseId}" data-section-id="${section.id}">Register</p></td>
            `;
            tableBody.appendChild(row);
        });

        document.querySelectorAll(".register").forEach(button => {
            button.addEventListener("click", function () {
                const courseId = this.getAttribute("data-section-course_id");
                const sectionId = this.getAttribute("data-section-id");
                handleRegistration(courseId, sectionId);
            });
        });
    }
}


function handleRegistration(courseId, sectionId) {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")); 

    if (!loggedInUser) {
        alert("Error: No user logged in. Please log in first.");
        window.location.href = "login.html";
        return;
    }

    const storedCourses = localStorage.getItem('courses');
    const storedClasses = localStorage.getItem('classes');
    
    if (storedCourses && storedClasses) {
        const courses = JSON.parse(storedCourses);
        const classes = JSON.parse(storedClasses);
        processCourseRegistration(courses, classes, loggedInUser, courseId, sectionId);
    } else {
        fetch("json_files/courses.json")
            .then(response => response.json())
            .then(courses => {
                localStorage.setItem('courses', JSON.stringify(courses));
                
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

function processCourseRegistration(courses, classes, loggedInUser, courseId, sectionId) {
    const course = courses.find(course => course.course_code === courseId);
    const section = classes.find(section => section.id === sectionId);

   

    if (section.status !== "pending") {
        alert("Error: This section is not available for registration.");
        return;
    }

    const availableSeats = section.total_no_of_seats - section.students.length;
    if (availableSeats <= 0) {
        alert("Error: No available seats in this section.");
        return;
    }

    if (section.students.includes(loggedInUser.id)) {
        alert("This course is already in your pending courses list.");
        return;
    }

    loggedInUser.in_progress_courses = loggedInUser.in_progress_courses || [];
    loggedInUser.pendingCourses = loggedInUser.pendingCourses || [];
    loggedInUser.remaining_courses = loggedInUser.remaining_courses || [];

    const isInProgress = loggedInUser.in_progress_courses.some(
        course => (course.code === courseId)
    );
    
    if (isInProgress) {
        alert("You are already taking this course this semester.");
        return;
    }

    const isPending = loggedInUser.pendingCourses.some(
        course => course.code === courseId
    );
    
    if (isPending) {
        alert("This course is already in your pending courses list.");
        return;
    }

    const prerequisitesCompleted = checkPrerequisites(loggedInUser, course);
    
    if (!prerequisitesCompleted.success) {
        alert(`You cannot register for this course. Missing prerequisites: ${prerequisitesCompleted.missing.join(", ")}`);
        return;
    }

    const isCompleted = loggedInUser.completedCourses.some(
        course => course.code === courseId
    );
    
    if (isCompleted) {
        alert("You have already completed this course.");
        return;
    }

    registerStudent(loggedInUser, courseId, course, section, classes);
}


function checkPrerequisites(student, course) {
    if (!course.prerequisite || course.prerequisite.length === 0) {
        return { success: true, missing: [] };
    }

    const completedCourseIds = student.completedCourses ? 
        student.completedCourses.map(course => course.code) : [];
    
    const inProgressCourseIds = student.in_progress_courses ? 
        student.in_progress_courses.map(course => course.code) : [];
    
    const availableCourseIds = [...completedCourseIds, ...inProgressCourseIds];
    
    const missingPrerequisites = [];

    for (const prereq of course.prerequisite) {
        if (!availableCourseIds.includes(prereq)) {
            missingPrerequisites.push(prereq);
        }
    }

    return {
        success: missingPrerequisites.length === 0,
        missing: missingPrerequisites
    };
}


function registerStudent(student, courseId, courseInfo, section, classes) {
    const courseIndex = student.remaining_courses.findIndex(
        course => course.code === courseId
    );

    if (courseIndex === -1) {
        
        const newPendingCourse = {
            code: courseId,
            title: courseInfo.title || section.course_name,
            credit: courseInfo.credit,
            semester: getCurrentSemester(),
            status: "Registration Confirmed"
        };

        student.pendingCourses.push(newPendingCourse);
    } else {
        
        const courseToMove = student.remaining_courses[courseIndex];
        
        const pendingCourse = {
            code: courseToMove.code,
            title: courseToMove.title,
            credit: courseToMove.credit,
            semester: getCurrentSemester(),
            status: "Registration Confirmed"
        };
        
        student.pendingCourses.push(pendingCourse);
        
        student.remaining_courses.splice(courseIndex, 1);
    }
    
    section.students.push(student.id);
    
    localStorage.setItem("loggedInUser", JSON.stringify(student));
    localStorage.setItem("classes", JSON.stringify(classes));

    updateUserInDatabase(student);

    alert("Successfully registered!");
    
    const storedClasses = localStorage.getItem('classes');
    if (storedClasses) {
        displaySections(JSON.parse(storedClasses), courseId);
    }
}

function updateUserInDatabase(updatedStudent) {
    let usersData = localStorage.getItem('users');
    
    if (usersData) {
        updateUserAndSave(JSON.parse(usersData), updatedStudent);
    } else {
        fetch("json_files/users.json")
            .then(response => response.json())
            .then(data => {
                updateUserAndSave(data, updatedStudent);
            })
            .catch(error => {
                console.error("Error updating user in users:", error);
            });
    }
}

function updateUserAndSave(usersData, updatedStudent) {
    const studentIndex = usersData.students.findIndex(student => student.id === updatedStudent.id);
    
    if (studentIndex !== -1) {
        
        usersData.students[studentIndex] = updatedStudent;
        
       
        localStorage.setItem('users', JSON.stringify(usersData));
        
        
        console.log("User data updated successfully in the json");
    } else {
        console.error("Student not found in the json");
    }
}


function getCurrentSemester() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth(); 
    
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