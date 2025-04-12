document.addEventListener("DOMContentLoaded", () => {
    initializePage();
});

function initializePage() {
    const selectedSection = JSON.parse(localStorage.getItem("selectedSection"));

    if (!selectedSection) {
        alert("No section selected. Redirecting to instructor main page...");
        window.location.href = "instr_main.html";
        return;
    }

    setupEventListeners(selectedSection);
    fetchStudentsData(selectedSection);
}

function setupEventListeners(selectedSection) {
    const signOutLink = document.querySelector('nav ul li:nth-child(2) a');
    if (signOutLink) {
        signOutLink.addEventListener('click', handleSignOut);
    }

    document.querySelector("form").addEventListener("submit", (event) => {
        event.preventDefault();
        
        if (selectedSection.status === "pending") {
            alert("This section has not started yet, you cannot submit grades.");
            return;
        }
        
        if (selectedSection.status === "completed") {
            alert("This section is already completed. Grades cannot be submitted again.");
            return;
        }
        
        submitGrades(selectedSection);
    });
}

function fetchStudentsData(selectedSection) {
    fetch("json_files/users.json")
        .then(response => response.json())
        .then(users => {
            const students = users.students.filter(student => 
                selectedSection.students.includes(student.id)
            );

            populateGradesTable(students);

            localStorage.setItem("users", JSON.stringify(users));
        })
        .catch(error => console.error("Error loading users.json:", error));
}

function populateGradesTable(students) {
    const tableBody = document.querySelector("tbody");
    tableBody.innerHTML = ""; 

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
}



function submitGrades(selectedSection) {
    const users = JSON.parse(localStorage.getItem("users"));
    if (!users) {
        alert("Error: No users data found.");
        return;
    }

    let sections = JSON.parse(localStorage.getItem("classes"));
    if (!sections) {
        alert("Error: No sections data found.");
        return;
    }

    const processedStudentIds = [];

    document.querySelectorAll(".grade-select").forEach(select => {
        const studentId = select.dataset.studentId;
        const selectedGrade = select.value;

        updateStudentRecord(users, studentId, selectedGrade, selectedSection);
        processedStudentIds.push(studentId);
    });

    
    const sectionIndex = sections.findIndex(section => section.id === selectedSection.id);
    if (sectionIndex !== -1) {
        sections[sectionIndex].status = "completed";
    }

    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("classes", JSON.stringify(sections));

    alert("Grades successfully submitted, and section marked as completed.");

    window.location.href = "instr_main.html";
}

function updateStudentRecord(users, studentId, selectedGrade, selectedSection) {
    const student = users.students.find(s => s.id === studentId);
    if (student) {
        let courseFound = false;
        
        const inProgressIndex = student.in_progress_courses ? 
            student.in_progress_courses.findIndex(course => course.code === selectedSection.course_id) : -1;
        
        if (inProgressIndex !== -1) {
            const courseInfo = student.in_progress_courses[inProgressIndex];
            
            student.in_progress_courses.splice(inProgressIndex, 1);
            
            student.completedCourses = student.completedCourses || [];

            student.completedCourses.push({
                code: courseInfo.code,
                title: courseInfo.title,
                credit: courseInfo.credit,
                semester: courseInfo.semester,
                grade: selectedGrade
            });
            
            courseFound = true;
        }
        
        
    }
}



function handleSignOut(e) {
    e.preventDefault();
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';
}