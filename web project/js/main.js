document.addEventListener("DOMContentLoaded", () => {
    
    const container = document.querySelector("#courses-container");
    const searchField = document.querySelector("#search-textfield");

    // NEW CODE: Define allCourses variable at a scope accessible to all functions
    let allCourses = [];

    // Fetch and load courses
    function fetchCourses(){
        // NEW CODE: Check if courses exist in localStorage
        let storedCourses = localStorage.getItem('courses');
        
        if (storedCourses) {
            // NEW CODE: Parse and use courses from localStorage
            allCourses = JSON.parse(storedCourses);
            displayCourses(allCourses);
        } else {
            console.log("No courses in local storage fetching from JSON file");
            
            fetch("json_files/courses.json")
                .then(response => response.json())
                .then(courses => {
                    // NEW CODE: Store fetched courses in the allCourses variable
                    allCourses = courses;
                    displayCourses(allCourses);
                    localStorage.setItem('courses', JSON.stringify(allCourses));
                })
                .catch(error => console.error("Error fetching course data:", error));
        }
    }

    // Initialize by loading all courses
    fetchCourses();

    function displayCourses(filteredCourses) {
        console.log("Rendering courses");
        
        container.innerHTML = "";
        
        // NEW CODE: Check if any courses match the search criteria
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
                        <h5>${course.course_code}: ${course.title}</h5>
                        <h6>Prerequisites: ${course.prerequisite}</h6>
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

    // NEW CODE: Improved searchCourses function
    function searchCourses() {
        const query = searchField.value.trim().toLowerCase();
        
        // If the search query is empty, display all courses
        if (query === '') {
            displayCourses(allCourses);
            return;
        }
        
        // Filter courses based on course code, title, or category
        const filteredCourses = allCourses.filter(course =>
            course.course_code.toLowerCase().includes(query) ||
            course.title.toLowerCase().includes(query) ||
            course.category.toLowerCase().includes(query)
        );
        
        displayCourses(filteredCourses);
    }

    // NEW CODE: Add event listeners for search functionality
    searchField.addEventListener("input", searchCourses);

    // Handle sign out functionality
    const signOutLink = document.querySelector(".nav_links a[href='login.html']");
    if (signOutLink) {
        signOutLink.addEventListener("click", function(e) {
            e.preventDefault();
            // Clear the logged-in user from localStorage
            localStorage.removeItem("loggedInUser");
            // Redirect to the login page
            window.location.href = "login.html";
        });
    }
});