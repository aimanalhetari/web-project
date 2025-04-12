document.addEventListener("DOMContentLoaded", () => {
    
    const container = document.querySelector("#courses-container");
    const searchField = document.querySelector("#search-textfield");

    let allCourses = [];

    function fetchCourses(){
        let storedCourses = localStorage.getItem('courses');
        
        if (storedCourses) {
            allCourses = JSON.parse(storedCourses);
            displayCourses(allCourses);
        } else {
            console.log("No courses in local storage fetching from JSON file");
            
            fetch("json_files/courses.json")
                .then(response => response.json())
                .then(courses => {
                    allCourses = courses;
                    displayCourses(allCourses);
                    localStorage.setItem('courses', JSON.stringify(allCourses));
                })
                .catch(error => console.error("Error fetching course data:", error));
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

        document.querySelectorAll("#register-now").forEach(button => {
            button.addEventListener("click", function () {
                const courseCode = this.getAttribute("data-course-code");
                localStorage.setItem("selectedCourse", courseCode);
                window.location.href = "new_register.html"; 
            });
        });
    }

    function searchCourses() {
        const query = searchField.value.trim().toLowerCase();
        
        if (query === '') {
            displayCourses(allCourses);
            return;
        }
        
        const filteredCourses = allCourses.filter(course =>
            course.course_code.toLowerCase().includes(query) ||
            course.title.toLowerCase().includes(query) ||
            course.category.toLowerCase().includes(query)
        );
        
        displayCourses(filteredCourses);
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