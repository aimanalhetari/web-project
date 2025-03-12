document.addEventListener("DOMContentLoaded", () => {
    // Get all login buttons
    const studentLoginBtn = document.querySelector("#student-login");
    const instructorLoginBtn = document.querySelector("#instructor-login");
    const adminLoginBtn = document.querySelector("#admin-login");

    // Get all input sections
    const studentInputs = document.querySelector("#student-inputs");
    const instructorInputs = document.querySelector("#instructor-inputs");
    const adminInputs = document.querySelector("#admin-inputs");

    // Function to reset visibility
    function resetInputs() {
        document.querySelectorAll(".email-password-section").forEach(section => {
            section.style.display = "none";
        });
    }

    // Function to handle login
    function handleLogin(userType, emailSelector, passwordSelector, redirectPage) {
        const email = document.querySelector(emailSelector).value;
        const password = document.querySelector(passwordSelector).value;

        fetch("json_files/users.json")
            .then(response => response.json())
            .then(users => {
                const userList = users[userType];
                const user = userList.find(user => user.userName === email && user.password === password);

                if (user) {
                    localStorage.setItem("loggedInUser", JSON.stringify(user)); // Save user info
                    window.location.href = redirectPage; // Redirect based on user type
                } else {
                    alert("Invalid credentials. Please try again.");
                }
            })
            .catch(error => console.error("Error loading users.json:", error));
    }

    // Add event listeners for login buttons
    studentLoginBtn.addEventListener("click", () => {
        resetInputs();
        studentInputs.style.display = "flex";
    });

    instructorLoginBtn.addEventListener("click", () => {
        resetInputs();
        instructorInputs.style.display = "flex";
    });

    adminLoginBtn.addEventListener("click", () => {
        resetInputs();
        adminInputs.style.display = "flex";
    });

    // Add event listeners for form submission
    document.querySelector("#student-sign-in-input").addEventListener("click", (event) => {
        event.preventDefault();
        handleLogin("students", "#student-email", "#student-password", "main.html");
    });

    document.querySelector("#instr-sign-in-input").addEventListener("click", (event) => {
        event.preventDefault();
        handleLogin("instructors", "#instructor-email", "#instructor-password", "instr_main.html");
    });

    document.querySelector("#admin-sign-in-input").addEventListener("click", (event) => {
        event.preventDefault();
        handleLogin("admins", "#admin-email", "#admin-password", "admin_main.html");
    });
});
