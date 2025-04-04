document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser || !loggedInUser.id) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize page elements
    initPage();

    // Setup event listeners
    document.querySelector('.sign-out').addEventListener('click', handleSignOut);
    document.querySelector('.search-courses').addEventListener('input', filterCourses);
    document.querySelector('.filter-dropdown').addEventListener('change', filterCourses);

    // Load student data
    loadStudentData(loggedInUser.id);
});

// Initialize page with loading states
function initPage() {
    // Set loading states if needed
}

// Handle sign out
function handleSignOut(e) {
    e.preventDefault();
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';
}

// Load student data from JSON file
async function loadStudentData(studentId) {
    try {
        // Try to get users from localStorage first
        let users = JSON.parse(localStorage.getItem('users'));

        // If users not in localStorage, fetch from users.json
        if (!users) {
            const response = await fetch('json_files/users.json');
            users = await response.json();
            localStorage.setItem('users', JSON.stringify(users));
        }

        // Find the student with matching ID
        const student = users.students.find(s => s.id === studentId);
        
        if (!student) {
            alert('Student not found');
            window.location.href = 'login.html';
            return;
        }

        // Update student information in the UI
        updateStudentInfo(student);
        calculateCredits(student);
        renderCourseSections(student);

    } catch (error) {
        console.error('Error loading student data:', error);
        alert('Error loading student data. Please try again later.');
    }
}

// Update student personal information in the UI
function updateStudentInfo(student) {
    // Update profile section
    document.querySelector('.student-name').textContent = student.name;
    document.querySelector('.student-major').textContent = student.major;
    document.querySelector('.student-id').textContent = `ID: ${student.id}`;
    document.querySelector('.profile-initial').textContent = student.name.charAt(0);
    
    // Update GPA
    document.querySelector('.gpa-value').textContent = student.gpa.toFixed(2);
    
    // Update current year and semester
    document.querySelector('.current-year').textContent = 
        `Current Year: ${student.current_year} (${student.current_semester} Semester)`;
    
    // Update advisor information
    if (student.advisor) {
        document.querySelector('.advisor-name').textContent = student.advisor.advisor_name;
        document.querySelector('.advisor-office').textContent = `Office: ${student.advisor.advisor_office}`;
        document.querySelector('.advisor-email').textContent = `Email: ${student.advisor.advisor_email}`;
    }
}

// Calculate and display credit hours
function calculateCredits(student) {
    // Calculate completed credits
    const completedCredits = student.completedCourses.reduce((total, course) => total + course.credit, 0);
    document.querySelector('.completed-credits').textContent = `${completedCredits} CR`;
    
    // Calculate in-progress credits
    const inProgressCredits = student.in_progress_courses.reduce((total, course) => total + course.credit, 0);
    document.querySelector('.in-progress-credits').textContent = `${inProgressCredits} CR`;
    
    // Calculate pending credits
    const pendingCredits = student.pendingCourses.reduce((total, course) => total + course.credit, 0);
    document.querySelector('.pending-credits').textContent = `${pendingCredits} CR`;
    
    // Calculate remaining credits (assuming 120 total - completed - in progress - pending)
    const remainingCredits = 120 - completedCredits - inProgressCredits - pendingCredits;
    document.querySelector('.remaining-credits').textContent = `${remainingCredits} CR`;
}

// Helper functions to access course lists
function completedCourses(student) {
    return student.completedCourses || [];
}

function inProgressCourses(student) {
    return student.in_progress_courses || [];
}

function pendingCourses(student) {
    return student.pendingCourses || [];
}

function remainingCourses(student) {
    return student.remaining_courses || [];
}

// Render course sections
function renderCourseSections(student) {
    const sectionsContainer = document.querySelector('.course-sections');
    sectionsContainer.innerHTML = ''; // Clear existing content
    
    // Render In Progress Courses
    if (inProgressCourses(student).length > 0) {
        sectionsContainer.appendChild(createCourseSection(
            'In Progress Courses', 
            'in_progress_header',
            inProgressCourses(student),
            ['Course Code', 'Course Title', 'Credits', 'Semester', 'Status'],
            true
        ));
    }
    
    // Render Pending Courses
    if (pendingCourses(student).length > 0) {
        sectionsContainer.appendChild(createCourseSection(
            'Pending Courses (Registration Open)', 
            'pending_header',
            pendingCourses(student),
            ['Course Code', 'Course Title', 'Credits', 'Semester', 'Status'],
            true
        ));
    }
    
    // Render Completed Courses
    if (completedCourses(student).length > 0) {
        sectionsContainer.appendChild(createCourseSection(
            'Completed Courses', 
            'completed_header',
            completedCourses(student),
            ['Course Code', 'Course Title', 'Credits', 'Semester', 'Grade'],
            true
        ));
    }
    
    // Render Remaining Courses
    if (remainingCourses(student).length > 0) {
        sectionsContainer.appendChild(createCourseSection(
            'Remaining Courses', 
            'remaining_header',
            remainingCourses(student),
            ['Course Code', 'Course Title', 'Credits', 'Year', 'Prerequisites'],
            false
        ));
    }
}

// Create a course section element
function createCourseSection(title, headerClass, courses, columns, isStatusSection) {
    const section = document.createElement('div');
    section.className = 'course_section';
    
    // Create header
    const header = document.createElement('div');
    header.className = `section_header ${headerClass}`;
    header.innerHTML = `<h2>${title}</h2>`;
    section.appendChild(header);
    
    // Create table
    const table = document.createElement('table');
    table.className = 'courses_table';
    
    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    columns.forEach(column => {
        const th = document.createElement('th');
        th.textContent = column;
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    // Add course rows
    courses.forEach(course => {
        const row = document.createElement('tr');
        
        // Course code
        const codeCell = document.createElement('td');
        codeCell.className = 'course_code';
        codeCell.textContent = course.code;
        row.appendChild(codeCell);
        
        // Course title
        const titleCell = document.createElement('td');
        titleCell.textContent = course.title;
        row.appendChild(titleCell);
        
        // Credits
        const creditsCell = document.createElement('td');
        creditsCell.className = 'credits';
        creditsCell.textContent = course.credit;
        row.appendChild(creditsCell);
        
        // Semester or Year
        const semesterCell = document.createElement('td');
        semesterCell.className = 'semester_label';
        semesterCell.textContent = course.semester || course.year;
        row.appendChild(semesterCell);
        
        // Status, Grade, or Prerequisites
        const lastCell = document.createElement('td');
        if (isStatusSection) {
            if (course.status) {
                lastCell.textContent = course.status;
            } else if (course.grade) {
                lastCell.className = getGradeClass(course.grade);
                lastCell.textContent = course.grade;
            }
        } else {
            // For remaining courses with prerequisites
            lastCell.textContent = course.prerequisites ? course.prerequisites.join(', ') : 'None';
        }
        row.appendChild(lastCell);
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    section.appendChild(table);
    
    return section;
}

// Get CSS class for grade display
function getGradeClass(grade) {
    if (grade.startsWith('A')) return 'grade grade_a';
    if (grade.startsWith('B')) return 'grade grade_b';
    if (grade.startsWith('C')) return 'grade grade_c';
    if (grade.startsWith('D')) return 'grade grade_d';
    return 'grade';
}

// Filter courses based on search input and dropdown
function filterCourses() {
    const searchTerm = document.querySelector('.search-courses').value.toLowerCase();
    const filterValue = document.querySelector('.filter-dropdown').value;
    
    // Get all course sections
    const sections = document.querySelectorAll('.course_section');
    
    sections.forEach(section => {
        // Check if section matches filter
        const sectionTitle = section.querySelector('h2').textContent.toLowerCase();
        const isVisible = 
            (filterValue === 'all') ||
            (filterValue === 'in-progress' && sectionTitle.includes('in progress')) ||
            (filterValue === 'pending' && sectionTitle.includes('pending')) ||
            (filterValue === 'completed' && sectionTitle.includes('completed')) ||
            (filterValue === 'remaining' && sectionTitle.includes('remaining'));
        
        // If section should be visible, filter individual rows
        if (isVisible) {
            section.style.display = 'block';
            
            // Get all rows in this section
            const rows = section.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
                const code = row.querySelector('.course_code').textContent.toLowerCase();
                const title = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
                
                // Check if row matches search term
                const rowMatches = code.includes(searchTerm) || title.includes(searchTerm);
                row.style.display = rowMatches ? 'table-row' : 'none';
            });
            
            // Check if any rows are visible
            const hasVisibleRows = Array.from(rows).some(row => row.style.display !== 'none');
            section.style.display = hasVisibleRows ? 'block' : 'none';
        } else {
            section.style.display = 'none';
        }
    });
}