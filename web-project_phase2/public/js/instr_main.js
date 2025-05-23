document.addEventListener("DOMContentLoaded", () => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!loggedInUser) {
        alert("Unauthorized access. Redirecting to login...");
        window.location.href = "login.html"; 
        return;
    }

    loadSectionsData(loggedInUser);

    const signOutLink = document.querySelector('nav ul li:nth-child(2) a');
    if (signOutLink) {
        signOutLink.addEventListener('click', handleSignOut);
    }
    
    const inProgressTab = document.getElementById('in-progress-tab');
    const pendingTab = document.getElementById('pending-tab');
    const completedTab = document.getElementById('completed-tab');
    
    if (inProgressTab && pendingTab && completedTab) {
        inProgressTab.addEventListener('click', () => switchSectionType('in_progress'));
        pendingTab.addEventListener('click', () => switchSectionType('pending'));
        completedTab.addEventListener('click', () => switchSectionType('completed'));
    }
});

function handleSignOut(e) {
    e.preventDefault();
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';
}

let currentSectionType = 'in_progress'; 
let cachedSections = [];

function switchSectionType(sectionType) {
    currentSectionType = sectionType;
    
    const inProgressTab = document.getElementById('in-progress-tab');
    const pendingTab = document.getElementById('pending-tab');
    const completedTab = document.getElementById('completed-tab');
    
    if (sectionType === 'in_progress') {
        inProgressTab.classList.add('active');
        pendingTab.classList.remove('active');
        completedTab.classList.remove('active');
        document.querySelector('.table__header h1').textContent = 'Current Classes';
    } else if (sectionType === 'pending') {
        pendingTab.classList.add('active');
        inProgressTab.classList.remove('active');
        completedTab.classList.remove('active');
        document.querySelector('.table__header h1').textContent = 'Upcoming Classes';
    } else if (sectionType === 'completed') {
        completedTab.classList.add('active');
        inProgressTab.classList.remove('active');
        pendingTab.classList.remove('active');
        document.querySelector('.table__header h1').textContent = 'Completed Classes';
    }
    
    filterAndDisplaySections();
}

function filterAndDisplaySections() {
    if (cachedSections.length === 0) return;
    
    const filteredSections = cachedSections.filter(section => section.status === currentSectionType);
    
    displaySections(filteredSections);
}

async function loadSectionsData(loggedInUser) {
    try {
        const response = await fetch(`/api/instructors/${loggedInUser.id}/sections`);
        if (!response.ok) throw new Error("Failed to fetch sections");
        
        const sections = await response.json();

        // Default status fallback
        cachedSections = sections.map(section => ({
            ...section,
            status: section.status || 'in_progress',
        }));

        filterAndDisplaySections();

    } catch (error) {
        console.error("Error loading sections data:", error);
        alert("Error loading sections data. Please try again later.");
    }
}

function displaySections(instructorSections) {
    const tableBody = document.querySelector("tbody");
    
    if (instructorSections.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8">No ${currentSectionType === 'in_progress' ? 'current' : currentSectionType === 'pending' ? 'upcoming' : 'completed'} classes assigned to you.</td></tr>`;
    } else {
        let tableHTML = "";
        
        instructorSections.forEach(section => {
            tableHTML += `
                <tr class="${section.status === 'pending' ? 'pending-section' : section.status === 'completed' ? 'completed-section' : 'in-progress-section'}">
                    <td>${section.courseId}</td>
                    <td>${section.category || '-'}</td>
                    <td>${section.course?.title || section.course_name || '-'}</td>
                    <td>${section.section_no}</td>
                    <td>${section.instructor?.name || '-'}</td>
                    <td>${section.meeting_time || '-'}</td>
                    <td>
                        <div>
                            <span class="validation-status ${section.validated ? 'validated' : 'not-validated'}">
                                ${section.validated ? 'Validated' : 'Not Validated'}
                            </span>
                            <span class="status-badge ${section.status}">
                                ${section.status === 'pending' ? 'Pending' : 
                                  section.status === 'completed' ? 'Completed' : 'In Progress'}
                            </span>
                        </div>
                    </td>
                    <td>
                        <p class="view-grades" onclick="viewGrades(${JSON.stringify(section).replace(/"/g, '&quot;')})">
                            View Grades
                        </p>
                    </td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = tableHTML;
    }
}

function viewGrades(section) {
    localStorage.setItem("selectedSection", JSON.stringify(section));
    window.location.href = "grades.html";
}
