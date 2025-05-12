document.addEventListener('DOMContentLoaded', function() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser || !loggedInUser.id) {
        window.location.href = 'login.html';
        return;
    }

    initPage();

    document.querySelector('.sign-out').addEventListener('click', handleSignOut);
    document.querySelector('.search-courses').addEventListener('input', filterCourses);
    document.querySelector('.filter-dropdown').addEventListener('change', filterCourses);

    loadStudentData(loggedInUser.id);
});

function initPage() {
}

function handleSignOut(e) {
    e.preventDefault();
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';
}

async function loadStudentData(studentId) {
    try {
        let users = JSON.parse(localStorage.getItem('users'));

        if (!users) {
            const response = await fetch('json_files/users.json');
            users = await response.json();
            localStorage.setItem('users', JSON.stringify(users));
        }

        const student = users.students.find(s => s.id === studentId);
        
        if (!student) {
            alert('Student not found');
            window.location.href = 'login.html';
            return;
        }

        updateStudentInfo(student);
        calculateCredits(student);
        renderCourseSections(student);

    } catch (error) {
        console.error('Error loading student data:', error);
        alert('Error loading student data. Please try again later.');
    }
}

function updateStudentInfo(student) {
    document.querySelector('.student-name').textContent = student.name;
    document.querySelector('.student-major').textContent = student.major;
    document.querySelector('.student-id').textContent = `ID: ${student.id}`;
    document.querySelector('.profile-initial').textContent = student.name.charAt(0);
    
    document.querySelector('.gpa-value').textContent = student.gpa.toFixed(2);
    
    document.querySelector('.current-year').textContent = 
        `Current Year: ${student.current_year} (${student.current_semester} Semester)`;
    
    if (student.advisor) {
        document.querySelector('.advisor-name').textContent = student.advisor.advisor_name;
        document.querySelector('.advisor-office').textContent = `Office: ${student.advisor.advisor_office}`;
        document.querySelector('.advisor-email').textContent = `Email: ${student.advisor.advisor_email}`;
    }
}

function calculateCredits(student) {
    const completedCredits = student.completedCourses.reduce((total, course) => total + course.credit, 0);
    document.querySelector('.completed-credits').textContent = `${completedCredits} CR`;
    
    const inProgressCredits = student.in_progress_courses.reduce((total, course) => total + course.credit, 0);
    document.querySelector('.in-progress-credits').textContent = `${inProgressCredits} CR`;
    
    const pendingCredits = student.pendingCourses.reduce((total, course) => total + course.credit, 0);
    document.querySelector('.pending-credits').textContent = `${pendingCredits} CR`;
    
    const remainingCredits = 120 - completedCredits - inProgressCredits - pendingCredits;
    document.querySelector('.remaining-credits').textContent = `${remainingCredits} CR`;
}

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


    


function renderCourseSections(student) {
    const sectionsContainer = document.querySelector('.course-sections');
    sectionsContainer.innerHTML = ''; 
    
    if (inProgressCourses(student).length > 0) {
        sectionsContainer.innerHTML += createCourseSection(
            'In Progress Courses', 
            'in_progress_header',
            inProgressCourses(student),
            ['Course Code', 'Course Title', 'Credits', 'Semester', 'Status'],
            true
        );
    }
    
    if (pendingCourses(student).length > 0) {
        sectionsContainer.innerHTML += createCourseSection(
            'Pending Courses (Registration Open)', 
            'pending_header',
            pendingCourses(student),
            ['Course Code', 'Course Title', 'Credits', 'Semester', 'Status'],
            true
        );
    }
    
    if (completedCourses(student).length > 0) {
        sectionsContainer.innerHTML += createCourseSection(
            'Completed Courses', 
            'completed_header',
            completedCourses(student),
            ['Course Code', 'Course Title', 'Credits', 'Semester', 'Grade'],
            true
        );
    }
    
    if (remainingCourses(student).length > 0) {
        sectionsContainer.innerHTML += createCourseSection(
            'Remaining Courses', 
            'remaining_header',
            remainingCourses(student),
            ['Course Code', 'Course Title', 'Credits', 'Year', 'Prerequisites'],
            false
        );
    }
}




function createCourseSection(title, headerClass, courses, columns, isStatusSection) {
    return `
        <div class="course_section">
            <div class="section_header ${headerClass}">
                <h2>${title}</h2>
            </div>
            <table class="courses_table">
                <thead>
                    <tr>
                        ${columns.map(column => `<th>${column}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${courses.map(course => `
                        <tr>
                            <td class="course_code">${course.code}</td>
                            <td>${course.title}</td>
                            <td class="credits">${course.credit}</td>
                            <td class="semester_label">${course.semester || course.year}</td>
                            <td ${isStatusSection && course.grade ? `class="${getGradeClass(course.grade)}"` : ''}>
                                ${isStatusSection ? 
                                    (course.status || (course.grade || '')) : 
                                    (course.prerequisites ? course.prerequisites.join(', ') : 'None')
                                }
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}


function getGradeClass(grade) {
    if (grade.startsWith('A')) return 'grade grade_a';
    if (grade.startsWith('B')) return 'grade grade_b';
    if (grade.startsWith('C')) return 'grade grade_c';
    if (grade.startsWith('D')) return 'grade grade_d';
    return 'grade';
}

function filterCourses() {
    const searchTerm = document.querySelector('.search-courses').value.toLowerCase();
    const filterValue = document.querySelector('.filter-dropdown').value;
    
    const sections = document.querySelectorAll('.course_section');
    
    sections.forEach(section => {
        const sectionTitle = section.querySelector('h2').textContent.toLowerCase();
        const isVisible = 
            (filterValue === 'all') ||
            (filterValue === 'in-progress' && sectionTitle.includes('in progress')) ||
            (filterValue === 'pending' && sectionTitle.includes('pending')) ||
            (filterValue === 'completed' && sectionTitle.includes('completed')) ||
            (filterValue === 'remaining' && sectionTitle.includes('remaining'));
        
        if (isVisible) {
            section.style.display = 'block';
            
            const rows = section.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
                const code = row.querySelector('.course_code').textContent.toLowerCase();
                const title = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
                
                const rowMatches = code.includes(searchTerm) || title.includes(searchTerm);
                row.style.display = rowMatches ? 'table-row' : 'none';
            });
            
            const hasVisibleRows = Array.from(rows).some(row => row.style.display !== 'none');
            section.style.display = hasVisibleRows ? 'block' : 'none';
        } else {
            section.style.display = 'none';
        }
    });
}