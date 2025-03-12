document.addEventListener("DOMContentLoaded", () => {
    let allCourses = [];
    const container = document.querySelector("#courses-container");
    const searchField = document.querySelector("#search-textfield");
    const searchButton = document.querySelector("#search-button");

    // Fetch and load courses
    fetch("json_files/courses.json")
        .then(response => response.json())
        .then(courses => {
            allCourses = courses;
            displayCourses(allCourses);
        })
        .catch(error => console.error("Error fetching course data:", error));

    function displayCourses(filteredCourses) {
        container.innerHTML = "";
        filteredCourses.forEach(course => {
            const section = document.createElement("section");

            section.innerHTML = `
                <div id="section-img">
                    <img src="${course.image}" alt="${course.category}">
                </div>
                <div id="section-content">
                    <button class="category">${course.category}</button>
                    <div class="section-header">
                        <h5>${course.title}</h5>
                        <h6>Prerequisites: ${course.prerequisite}</h6>
                    </div>
                    <p class="description">${course.description}</p>
                    <div class="logo-date">
                        <div class="section-logo-div">
                            <img src="images/qu.jpg" class="section-logo">
                        </div>
                        <div class="date">
                            <b style="color: black;">${course.institution}</b>
                            <p>${course.duration}</p>
                        </div>
                    </div>
                    <button id="register-now" class="button" data-course-code="${course.course_code}">Register Now</button>
                </div>
            `;

            container.appendChild(section);
        });

        // Add event listeners to "Register Now" buttons
        document.querySelectorAll("#register-now").forEach(button => {
            button.addEventListener("click", function () {
                const courseCode = this.getAttribute("data-course-code");
                localStorage.setItem("selectedCourse", courseCode);
                window.location.href = "new_register.html"; // Navigate to register page
            });
        });
    }

    function searchCourses() {
        const query = searchField.value.trim().toLowerCase();
        const filteredCourses = allCourses.filter(course =>
            course.course_code.toLowerCase().includes(query) ||
            course.title.toLowerCase().includes(query) ||
            course.category.toLowerCase().includes(query)
        );
        displayCourses(filteredCourses);
    }

    searchField.addEventListener("input", searchCourses);
    searchButton.addEventListener("click", searchCourses);
});
