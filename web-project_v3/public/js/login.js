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

        const queryParams = new URLSearchParams({
            userType: userType,
            userName: email,
            password: password,
        });

        fetch(`/api/users?${queryParams.toString()}`)
            .then(response => {
                if (!response.ok) throw new Error("User not found");
                return response.json();
            })
            .then(user => {
                if (user) {
                    localStorage.setItem("loggedInUser", JSON.stringify(user));
                    window.location.href = redirectPage;
                } else {
                    alert("Invalid credentials. Please try again.");
                }
            })
            .catch(error => {
                console.error("Login error:", error);
                alert("Invalid credentials. Please try again.");
            });
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
        handleLogin("student", "#student-email", "#student-password", "main.html");
    });

    document.querySelector("#instr-sign-in-input").addEventListener("click", (event) => {
        event.preventDefault();
        handleLogin("instructor", "#instructor-email", "#instructor-password", "instr_main.html");
    });

    document.querySelector("#admin-sign-in-input").addEventListener("click", (event) => {
        event.preventDefault();
        handleLogin("admin", "#admin-email", "#admin-password", "admin_main.html");
    });
});
