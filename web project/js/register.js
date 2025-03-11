document.addEventListener("DOMContentLoaded", function () {
    fetch("json_files/sections.json")
        .then(response => response.json())
        .then(sections => {
            const tableBody = document.querySelector(".table__body tbody");
            tableBody.innerHTML = ""; 

            sections.forEach(section => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${section.id}</td>
                    <td>${section.category}</td>
                    <td>${section.course_name}</td>
                    <td>${section.section_no}</td>
                    <td>${section.instructor}</td>
                    <td>${section.meeting_time}</td>
                    <td><strong>${section.status}</strong></td>
                    <td><p class="register">Register</p></td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error("Error loading sections:", error));
});
