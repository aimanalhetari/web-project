document.addEventListener("DOMContentLoaded", () => {
    // Retrieve the selected section from localStorage
    const selectedSection = JSON.parse(localStorage.getItem("selectedSection"));

    if (!selectedSection) {
        alert("No section selected. Redirecting to instructor main page...");
        window.location.href = "instr_main.html";
        return;
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
                            <td><select id="grades" class="grade-select">
                                <option value="A">A</option>
                                <option value="B+">B+</option>
                                <option value="B+">B</option>
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
        })
        .catch(error => console.error("Error loading users.json:", error));
});
