// Get all login buttons
const studentLoginBtn = document.getElementById('student-login');
const instructorLoginBtn = document.getElementById('instructor-login');
const adminLoginBtn = document.getElementById('admin-login');

// Get all input sections
const studentInputs = document.getElementById('student-inputs');
const instructorInputs = document.getElementById('instructor-inputs');
const adminInputs = document.getElementById('admin-inputs');

// Function to reset visibility
function resetInputs() {
    studentInputs.style.display = 'none';
    instructorInputs.style.display = 'none';
    adminInputs.style.display = 'none';
}

// Event listener for student login
studentLoginBtn.addEventListener('click', () => {
    resetInputs();
    studentInputs.style.display = 'block';
});

// Event listener for instructor login
instructorLoginBtn.addEventListener('click', () => {
    resetInputs();
    instructorInputs.style.display = 'block';
});

// Event listener for admin login
adminLoginBtn.addEventListener('click', () => {
    resetInputs();
    adminInputs.style.display = 'block';
});
