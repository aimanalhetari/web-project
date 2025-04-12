document.addEventListener("DOMContentLoaded", () => {
    const studentLoginBtn = document.querySelector("#student-login");
    const instructorLoginBtn = document.querySelector("#instructor-login");
    const adminLoginBtn = document.querySelector("#admin-login");

    const studentInputs = document.querySelector("#student-inputs");
    const instructorInputs = document.querySelector("#instructor-inputs");
    const adminInputs = document.querySelector("#admin-inputs");

    function resetInputs() {
        document.querySelectorAll(".email-password-section").forEach(section => {
            section.style.display = "none";
        });
    }

    function handleLogin(userType, emailSelector, passwordSelector, redirectPage) {
        const email = document.querySelector(emailSelector).value;
        const password = document.querySelector(passwordSelector).value;

        
        const usersFromStorage = localStorage.getItem("users");
        if (usersFromStorage) {
            const users = JSON.parse(usersFromStorage);
            processLogin(users, userType, email, password, redirectPage);
        } else {
           
            fetch("json_files/users.json")
                .then(response => response.json())
                .then(users => {
                    
                    localStorage.setItem("users", JSON.stringify(users));
                    processLogin(users, userType, email, password, redirectPage);
                })
                .catch(error => console.error("Error loading users.json:", error));
        }
    }

    
    function processLogin(users, userType, email, password, redirectPage) {
        const userList = users[userType];
        const user = userList.find(user => user.userName === email && user.password === password);

        if (user) {
            localStorage.setItem("loggedInUser", JSON.stringify(user)); 
            window.location.href = redirectPage; 
        } else {
            alert("Invalid credentials. Please try again.");
        }
    }

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