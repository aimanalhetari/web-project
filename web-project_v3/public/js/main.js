document.addEventListener("DOMContentLoaded", () => {
    
    const container = document.querySelector("#courses-container");
    const searchField = document.querySelector("#search-textfield");

    let allCourses = [];

    async function fetchCourses(query = "") {
        try {
            const response = await fetch(`/api/courses${query ? `?query=${encodeURIComponent(query)}` : ''}`);
            if (!response.ok) {
                throw new Error("Failed to fetch courses");
            }

            allCourses = await response.json();
            displayCourses(allCourses);
        } catch (error) {
            console.error("Error fetching course data:", error);
        }
    }

    fetchCourses();

    function displayCourses(filteredCourses) {
        console.log("Rendering courses");

        container.innerHTML = "";

        if (filteredCourses.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <h3>No courses match your search criteria</h3>
                    <p>Try a different search term or browse all courses</p>
                </div>
            `;
            return;
        }

        filteredCourses.forEach(course => {
            const section = document.createElement("section");

            section.innerHTML = `
                <div id="section-img">
                    <img src="${course.image}" alt="${course.category}">
                </div>
                <div id="section-content">
                    <button class="category">${course.category}</button>
                    <div class="section-header">
                        <h5>${course.id}: ${course.title}</h5>
                        <h6>Prerequisites: ${course.prerequisiteCodes || 'None'}</h6>
                    </div>
                    <p class="description">${course.description}</p>
                    <div class="logo-date">
                        <div class="section-logo-div">
                            <img src="images/qu.jpg" class="section-logo">
                        </div>
                        <div class="date">
                            <b style="color: black;">${course.institution}</b>
                        </div>
                    </div>
                    <button id="register-now" class="button" data-course-code="${course.id}">Register Now</button>
                </div>
            `;

            container.appendChild(section);
        });

        document.querySelectorAll("#register-now").forEach(button => {
            button.addEventListener("click", function () {
                const courseCode = this.getAttribute("data-course-code");
                localStorage.setItem("selectedCourse", courseCode);
                window.location.href = "new_register.html"; 
            });
        });
    }

    function searchCourses() {
        const query = searchField.value.trim();
        fetchCourses(query); // Call API with query
    }

    searchField.addEventListener("input", searchCourses);

    const signOutLink = document.querySelector(".nav_links a[href='login.html']");
    if (signOutLink) {
        signOutLink.addEventListener("click", function(e) {
            e.preventDefault();
            localStorage.removeItem("loggedInUser");
            window.location.href = "login.html";
        });
    }
});
