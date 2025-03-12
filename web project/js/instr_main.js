document.addEventListener("DOMContentLoaded", () => {
    // Retrieve the logged-in instructor from localStorage
    const loggedInInstructor = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!loggedInInstructor) {
        alert("Unauthorized access. Redirecting to login...");
        window.location.href = "index.html"; // Redirect if no instructor is logged in
        return;
    }

    // Fetch sections from sections.json
    fetch("json_files/sections.json")
        .then(response => response.json())
        .then(sections => {
            // Filter sections for the current instructor
            const instructorSections = sections.filter(section => section.instructor === loggedInInstructor.name);

            // Populate the table
            const tableBody = document.querySelector("tbody");
            tableBody.innerHTML = ""; // Clear existing rows

            if (instructorSections.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="7">No sections assigned to you.</td></tr>`;
            } else {
                instructorSections.forEach(section => {
                    const row = `
                        <tr>
                            <td>${section.course_id}</td>
                            <td>${section.category}</td>
                            <td>${section.course_name}</td>
                            <td>${section.section_no}</td>
                            <td>${section.instructor}</td>
                            <td>${section.meeting_time}</td>
                            <td>
                                <p class="view-grades" data-section='${JSON.stringify(section)}'>View Grades</p>
                            </td>
                        </tr>
                    `;
                    tableBody.innerHTML += row;
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
        })
        .catch(error => console.error("Error loading sections.json:", error));
});