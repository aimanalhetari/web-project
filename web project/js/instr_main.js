document.addEventListener("DOMContentLoaded", () => {
    // Retrieve the logged-in instructor from localStorage
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!loggedInUser) {
        alert("Unauthorized access. Redirecting to login...");
        window.location.href = "login.html"; // Redirect if no instructor is logged in
        return;
    }

    // Display instructor name (if you want to add this feature later)
    // document.getElementById("instructor-name").textContent = loggedInUser.name;

    // Load sections data
    loadSectionsData(loggedInUser);

    // NEW CODE: Setup event listeners for sign out button
    const signOutLink = document.querySelector('nav ul li:nth-child(2) a');
    if (signOutLink) {
        signOutLink.addEventListener('click', handleSignOut);
    }
});

// NEW CODE: Handle sign out functionality
function handleSignOut(e) {
    e.preventDefault();
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';
}

// Load sections data from localStorage or JSON file
async function loadSectionsData(loggedInUser) {
    try {
        // Try to get classes from localStorage first
        let sections = JSON.parse(localStorage.getItem('classes'));

        // If classes not in localStorage, fetch from sections.json
        if (!sections) {
            const response = await fetch("json_files/sections.json");
            sections = await response.json();
            // Store in localStorage for future use
            localStorage.setItem('classes', JSON.stringify(sections));
        }

        // Filter sections for the current instructor
        const instructorSections = sections.filter(section => section.instructor === loggedInUser.name);

        // Populate the table
        displaySections(instructorSections);

    } catch (error) {
        console.error("Error loading sections data:", error);
        alert("Error loading sections data. Please try again later.");
    }
}

// Display sections in the table
function displaySections(instructorSections) {
    const tableBody = document.querySelector("tbody");
    tableBody.innerHTML = ""; // Clear existing rows

    if (instructorSections.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8">No sections assigned to you.</td></tr>`;
    } else {
        instructorSections.forEach(section => {
            // Create a new row for each section
            const row = document.createElement('tr');
            
            // Add course ID
            const courseIdCell = document.createElement('td');
            courseIdCell.textContent = section.course_id;
            row.appendChild(courseIdCell);
            
            // Add category
            const categoryCell = document.createElement('td');
            categoryCell.textContent = section.category;
            row.appendChild(categoryCell);
            
            // Add course name
            const courseNameCell = document.createElement('td');
            courseNameCell.textContent = section.course_name;
            row.appendChild(courseNameCell);
            
            // Add section number
            const sectionNoCell = document.createElement('td');
            sectionNoCell.textContent = section.section_no;
            row.appendChild(sectionNoCell);
            
            // Add instructor name
            const instructorCell = document.createElement('td');
            instructorCell.textContent = section.instructor;
            row.appendChild(instructorCell);
            
            // Add meeting time
            const meetingTimeCell = document.createElement('td');
            meetingTimeCell.textContent = section.meeting_time;
            row.appendChild(meetingTimeCell);
            
            // NEW CODE: Add validation status
            const validationCell = document.createElement('td');
            if (section.validated) {
                validationCell.innerHTML = '<span style="color: green; font-weight: bold;">Validated by Admin</span>';
            } else {
                validationCell.innerHTML = '<span style="color: red;">Not Validated by Admin yet</span>';
            }
            row.appendChild(validationCell);
            
            // Add view grades button
            const actionsCell = document.createElement('td');
            const viewGradesButton = document.createElement('p');
            viewGradesButton.className = 'view-grades';
            viewGradesButton.textContent = 'View Grades';
            viewGradesButton.setAttribute('data-section', JSON.stringify(section));
            actionsCell.appendChild(viewGradesButton);
            row.appendChild(actionsCell);
            
            // Add the row to the table body
            tableBody.appendChild(row);
        });

        // Add event listeners for "View Grades" buttons
        document.querySelectorAll(".view-grades").forEach(button => {
            button.addEventListener("click", (event) => {
                const sectionData = JSON.parse(event.target.getAttribute("data-section"));
                localStorage.setItem("selectedSection", JSON.stringify(sectionData)); // Save section info
                window.location.href = "grades.html"; // Redirect to grades page
            });
        });
    }
}