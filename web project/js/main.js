document.addEventListener("DOMContentLoaded", () => {
    let allCourses = []; // Store courses globally
    const container = document.querySelector("#courses-container");
    const searchField = document.querySelector("#search-textfield");
    const searchButton = document.querySelector("#search-button");

    // Fetch and load courses
    fetch("json_files/courses.json")
        .then(response => response.json())
        .then(courses => {
            allCourses = courses; // Store all courses for searching
            displayCourses(allCourses); // Initially display all courses
        })
        .catch(error => console.error("Error fetching course data:", error));

    // Function to display courses
    function displayCourses(filteredCourses) {
        container.innerHTML = ""; // Clear previous courses
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
                    <button id="register-now" class="button">Register Now</button>
                </div>
            `;

            container.appendChild(section);
        });
    }

    // Function to filter courses based on search input
    function searchCourses() {
        const query = searchField.value.trim().toLowerCase();
        const filteredCourses = allCourses.filter(course =>
            course.course_code.toLowerCase().includes(query) ||
            course.title.toLowerCase().includes(query) ||
            course.category.toLowerCase().includes(query)
        );

        displayCourses(filteredCourses);
    }

    // Trigger search when user types
    searchField.addEventListener("input", searchCourses);

    // Trigger search when clicking the button
    searchButton.addEventListener("click", searchCourses);
});
