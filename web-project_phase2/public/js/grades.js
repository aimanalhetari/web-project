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
    fetchStudentsFromAPI(selectedSection.id);
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

function fetchStudentsFromAPI(sectionId) {
    fetch(`/api/sections/${sectionId}/students`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch students from server.");
            }
            return response.json();
        })
        .then(students => {
            populateGradesTable(students);
        })
        .catch(error => {
            console.error("Error fetching students:", error);
            alert("Could not load student data. Please try again later.");
        });
}

function populateGradesTable(students) {
    const tableBody = document.querySelector("tbody");
    tableBody.innerHTML = "";

    if (!students || students.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="3">No students found for this section.</td></tr>`;
        return;
    }

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

async function updateStudentRecord(studentId, selectedSection, selectedGrade) {
  const payload = {
    studentId: studentId,
    courseId: selectedSection.courseId,
    grade: selectedGrade
  };

  try {
    const response = await fetch('/api/completedCourses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Error completing course:', result.error);
    } else {
      console.log('Course successfully marked as completed:', result);
    }
  } catch (err) {
    console.error('Network or server error:', err);
  }
}
async function submitGrades(selectedSection) {
    const gradeSelects = document.querySelectorAll(".grade-select");

    try {
        for (const select of gradeSelects) {
            const studentId = select.dataset.studentId;
            const selectedGrade = select.value;

            // FIXED: Correct order of arguments
            await updateStudentRecord(studentId, selectedSection, selectedGrade);
        }

        // Now update the section status to "completed"
        const response = await fetch(`/api/sections/${selectedSection.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status: "completed" })
        });

        if (!response.ok) {
            throw new Error("Failed to update section status.");
        }

        alert("Grades successfully submitted, and section marked as completed.");
        window.location.href = "instr_main.html";

    } catch (error) {
        console.error("Error during grade submission:", error);
        alert("Failed to complete the submission. Please try again.");
    }
}




function handleSignOut(e) {
    e.preventDefault();
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';
}