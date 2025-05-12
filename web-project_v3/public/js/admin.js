document.addEventListener('DOMContentLoaded', function() {

    const courseModal = document.querySelector('#addCourseModal');
    const createCourseBtn = document.querySelector('.create_button');
    const closeCourseModal = document.querySelector('#closeModal');
    const cancelCourseBtn = document.querySelector('#cancelBtn');
    const addCourseForm = document.querySelector('#addCourseForm');
    const contentArea = document.querySelector('.content_area');

    const classModal = document.querySelector('#addClassModal');
    const closeClassModal = document.querySelector('#closeClassModal');
    const cancelClassBtn = document.querySelector('#cancelClassBtn');
    const addClassForm = document.querySelector('#addClassForm');
    const currentCourseIdInput = document.querySelector('#currentCourseId');
    const currentCourseCodeInput = document.querySelector('#currentCourseCode');
    const instructorsList = document.querySelector('#instructorsList');

    let courses = [];
    let classes = [];
    let usersData = {}; 

    closeClassModal.addEventListener('click', closeClassModalFunction);
    cancelClassBtn.addEventListener('click', closeClassModalFunction);
    createCourseBtn.addEventListener('click', openCourseModal);
    closeCourseModal.addEventListener('click', closeCourseModalFunction);
    cancelCourseBtn.addEventListener('click', closeCourseModalFunction);
    window.addEventListener('click', function(event) {
        if (event.target === courseModal) {
            closeCourseModalFunction();
        }
        if (event.target === classModal) {
            closeClassModalFunction();
        }
    });
    addCourseForm.addEventListener('submit', handleCourseFormSubmit);
    addClassForm.addEventListener('submit', handleClassFormSubmit);

    function openCourseModal() {
        courseModal.style.display = 'block';
    }

    function closeCourseModalFunction() {
        courseModal.style.display = 'none';
        addCourseForm.reset();
    }

    function closeClassModalFunction(){
        classModal.style.display = 'none';
        addClassForm.reset();
    }

    function openClassModal(courseId, courseCode) {
        currentCourseIdInput.value = courseId;
        if (!currentCourseCodeInput) {
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.id = 'currentCourseCode';
            hiddenInput.value = courseCode;
            addClassForm.appendChild(hiddenInput);
        } else {
            currentCourseCodeInput.value = courseCode;
        }
        
        if (instructorsList && usersData.instructors) {
            instructorsList.innerHTML = '';
            usersData.instructors.forEach(instructor => {
                const option = document.createElement('option');
                option.value = instructor.id;
                option.textContent = `${instructor.id} - ${instructor.name}`;
                instructorsList.appendChild(option);
            });
        }
        
        classModal.style.display = 'block';
    }

    async function initData() {
        if (localStorage.getItem('courses')) {
            courses = JSON.parse(localStorage.getItem('courses'));
            courses.forEach(course => {
                if (course.validated === undefined) {
                    course.validated = false;
                }
            });
            localStorage.setItem('courses', JSON.stringify(courses));
        } else {
            try {
                const response = await fetch('json_files/courses.json');
                courses = await response.json();
                courses.forEach(course => {
                    course.validated = false;
                });
                localStorage.setItem('courses', JSON.stringify(courses));
            } catch (error) {
                console.error('Error loading courses:', error);
                courses = [];
            }
        }

        if (localStorage.getItem('classes')) {
            classes = JSON.parse(localStorage.getItem('classes'));
            classes.forEach(cls => {
                if (cls.validated === undefined) {
                    cls.validated = false;
                }
                if (cls.status === undefined) {
                    cls.status = "pending"; 
                }
                if (cls.status === "in_progress" && !cls.validated) {
                    cls.validated = true;
                }
            });
            localStorage.setItem('classes', JSON.stringify(classes));
        } else {
            try {
                const response = await fetch('json_files/sections.json');
                classes = await response.json();
                classes.forEach(cls => {
                    if (cls.validated === undefined) {
                        cls.validated = false;
                    }
                    if (cls.status === undefined) {
                        cls.status = "pending"; 
                    }
                    if (cls.status === "in_progress" && !cls.validated) {
                        cls.validated = true;
                    }
                });
                localStorage.setItem('classes', JSON.stringify(classes));
            } catch (error) {
                console.error('Error loading classes:', error);
                classes = [];
            }
        }
        
        if (localStorage.getItem('users')) {
            usersData = JSON.parse(localStorage.getItem('users'));
            if (usersData.instructors) {
                usersData.instructors.forEach(instructor => {
                    if (!instructor.pending_sections) {
                        instructor.pending_sections = [];
                    }
                });
                localStorage.setItem('users', JSON.stringify(usersData));
            }
        } else {
            try {
                const response = await fetch('json_files/users.json');
                usersData = await response.json();
                if (usersData.instructors) {
                    usersData.instructors.forEach(instructor => {
                        if (!instructor.pending_sections) {
                            instructor.pending_sections = [];
                        }
                    });
                }
                localStorage.setItem('users', JSON.stringify(usersData));
            } catch (error) {
                console.error('Error loading users data:', error);
                usersData = { students: [], instructors: [], admins: [] };
            }
        }

        renderCourses();
    }

    function handleCourseFormSubmit(event) {
        event.preventDefault();
        
        const courseCode = document.querySelector('#courseCode').value;
        const courseName = document.querySelector('#courseName').value;
        const courseCategory = document.querySelector('#courseCategory').value;
        const courseCredit = parseInt(document.querySelector('#courseCredit').value);
        const coursePrerequisites = document.querySelector('#coursePrerequisites').value;
        const courseImage = document.querySelector('#courseImage').value;
        const courseDescription = document.querySelector('#courseDescription').value;

        const prerequisiteArray = coursePrerequisites 
            ? coursePrerequisites.split(',').map(item => item.trim())
            : [];

        const newCourse = {
            course_code: courseCode,
            title: courseName,
            category: courseCategory,
            credit: courseCredit,
            prerequisite: prerequisiteArray,
            description: courseDescription,
            institution: "QU-CENG",
            duration: "14 weeks",
            image: courseImage || "images/statistics.jpg",
            validated: false
        };

        courses.unshift(newCourse); 
        
        localStorage.setItem('courses', JSON.stringify(courses));
        
        renderCourses();
        
        closeCourseModalFunction();
        
        alert(`Course ${courseCode}: ${courseName} has been added successfully!`);
    }

    function handleClassFormSubmit(event) {
        event.preventDefault();

        const courseId = document.querySelector('#currentCourseId').value;
        const courseCode = document.querySelector('#currentCourseCode').value;
        
        const sectionNumber = document.querySelector('#sectionNumber').value;
        const instructorId = document.querySelector('#instructorId').value;
        const meetingTimes = document.querySelector('#meetingTimes').value;
        const availableSeats = document.querySelector('#availableSeats').value;

        const course = courses.find(c => c.course_code === courseCode);
        if (!course) {
            alert('Error: Course not found');
            return;
        }
        
        const instructor = usersData.instructors.find(instructor => instructor.id === instructorId);
        if (!instructor) {
            alert('Error: Invalid instructor ID. Please select a valid instructor from the list.');
            return;
        }
        
        const classId = `${courseCode}_${sectionNumber}`;
        
        const newClass = {
            id: classId,
            course_id: courseCode,
            category: course.category,
            course_name: course.title,
            section_no: sectionNumber,
            instructor_id: instructorId,
            instructor: instructor.name,
            meeting_time: meetingTimes,
            total_no_of_seats: parseInt(availableSeats),
            students: [],
            validated: false,
            status: "pending" 
        };

        classes.push(newClass);
        
        if (!instructor.pending_sections.includes(classId)) {
            instructor.pending_sections.push(classId);
            
            const instructorIndex = usersData.instructors.findIndex(i => i.id === instructorId);
            if (instructorIndex !== -1) {
                usersData.instructors[instructorIndex] = instructor;
                localStorage.setItem('users', JSON.stringify(usersData));
            }
        }
        
        localStorage.setItem('classes', JSON.stringify(classes));
        
        renderCourses();
        
        closeClassModalFunction();
        
        alert(`Class section ${sectionNumber} has been added successfully!`);
    }

    

function renderCourses() { 
    contentArea.innerHTML = '';
    
    courses.forEach(course => {
        const pendingClasses = classes.filter(cls => 
            cls.course_id === course.course_code && 
            cls.status === "pending"
        );
        
        const inProgressClasses = classes.filter(cls => 
            cls.course_id === course.course_code && 
            cls.status === "in_progress"
        );
        
        const courseCard = document.createElement('div');
        courseCard.className = 'course_card';
        
        const isValidated = course.validated || false;
        const validationStatus = isValidated ? 'validated' : 'unvalidated';
        const validationText = isValidated ? 'Validated' : 'Unvalidated';
        
        courseCard.innerHTML = `
            <div class="card_header">
                <div class="course_title_subtitle">
                    <h2 class="course_title">${course.course_code}: ${course.title}</h2>
                    <p class="course_subtitle">Category: ${course.category}</p>
                </div>
                <button class="btn ${validationStatus}">${validationText}</button>
            </div>
            <div class="card_content">
                <h3 class="number_of_classes">Pending Classes (${pendingClasses.length})</h3>
                
                <!-- Desktop/Laptop View -->
                <table class="classes_table">
                    <thead>
                        <tr>
                            <th>Section</th>
                            <th>Instructor</th>
                            <th>Schedule</th>
                            <th>Enrollment</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${pendingClasses.length === 0 ? 
                            '<tr><td colspan="6" style="text-align: center;">No pending classes added yet.</td></tr>' : 
                            pendingClasses.map(cls => {
                                const isClassValidated = cls.validated || false;
                                const rowStyle = isClassValidated ? 'background-color: #f0fff4;' : '';
                                
                                const studentsCount = cls.students.length;
                                const totalSeats = cls.total_no_of_seats;
                                const availableSeats = totalSeats - studentsCount;
                                
                                const statusDisplay = '<span style="color: orange; font-weight: bold;">Pending</span>';
                                
                                return `
                                    <tr data-id="${cls.id}" style="${rowStyle}">
                                        <td>${cls.section_no}</td>
                                        <td>${cls.instructor}</td>
                                        <td>${cls.meeting_time}</td>
                                        <td>${studentsCount}/${totalSeats} (${availableSeats} seats left)</td>
                                        <td>${statusDisplay}</td>
                                        <td>
                                            <div class="action_buttons_for_classes">
                                                <button class="btn validate" onclick="validateClass('${cls.id}')" ${isClassValidated ? 'disabled style="opacity: 0.5; cursor: default;"' : ''}>Validate</button>
                                                <button class="btn unvalidate" onclick="unvalidateClass('${cls.id}')" ${isClassValidated ? '' : 'disabled style="opacity: 0.5; cursor: default;"'}>Unvalidate</button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join('')
                        }
                    </tbody>
                </table>

                <!-- Mobile View -->
                <div class="class_list">
                    ${pendingClasses.length === 0 ? 
                        '<p>No pending classes added yet.</p>' : 
                        pendingClasses.map(cls => {
                            const isClassValidated = cls.validated || false;
                            const itemStyle = isClassValidated ? 'border-left: 4px solid #22c55e;' : '';
                            
                            const studentsCount = cls.students.length;
                            const totalSeats = cls.total_no_of_seats;
                            const availableSeats = totalSeats - studentsCount;
                            
                            const statusDisplay = '<span style="color: orange; font-weight: bold;">Pending</span>';
                            
                            return `
                                <div class="class_item" data-id="${cls.id}" style="${itemStyle}">
                                    <div class="class_header">
                                        <div class="class_instructor">${cls.instructor}</div>
                                        <p>${studentsCount}/${totalSeats} (${availableSeats} seats left)</p>
                                    </div>
                                    <div class="class_details">
                                        Section: ${cls.section_no}<br>
                                        Schedule: ${cls.meeting_time}<br>
                                        Status: ${statusDisplay}
                                    </div>
                                    <div class="action_buttons_for_classes">
                                        <button class="btn validate" onclick="validateClass('${cls.id}')" ${isClassValidated ? 'disabled style="opacity: 0.5; cursor: default;"' : ''}>Validate</button>
                                        <button class="btn unvalidate" onclick="unvalidateClass('${cls.id}')" ${isClassValidated ? '' : 'disabled style="opacity: 0.5; cursor: default;"'}>Unvalidate</button>
                                    </div>
                                </div>
                            `;
                        }).join('')
                    }
                </div>

                <!-- In-Progress Classes Section - Added April 12, 2025 -->
                <h3 class="number_of_classes" style="margin-top: 20px;">In-Progress Classes (${inProgressClasses.length})</h3>
                
                <!-- Desktop/Laptop View for In-Progress Classes -->
                <table class="classes_table">
                    <thead>
                        <tr>
                            <th>Section</th>
                            <th>Instructor</th>
                            <th>Schedule</th>
                            <th>Enrollment</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${inProgressClasses.length === 0 ? 
                            '<tr><td colspan="6" style="text-align: center;">No in-progress classes for this course.</td></tr>' : 
                            inProgressClasses.map(cls => {
                                const isClassValidated = cls.validated || false;
                                const rowStyle = isClassValidated ? 'background-color: #f0fff4;' : '';
                                
                                const studentsCount = cls.students.length;
                                const totalSeats = cls.total_no_of_seats;
                                const availableSeats = totalSeats - studentsCount;
                                
                                const statusDisplay = '<span style="color: green; font-weight: bold;">In Progress</span>';
                                
                                return `
                                    <tr data-id="${cls.id}" style="${rowStyle}">
                                        <td>${cls.section_no}</td>
                                        <td>${cls.instructor}</td>
                                        <td>${cls.meeting_time}</td>
                                        <td>${studentsCount}/${totalSeats} (${availableSeats} seats left)</td>
                                        <td>${statusDisplay}</td>
                                        <td>
                                            <div class="action_buttons_for_classes">
                                                <button class="btn" disabled style="opacity: 0.5; cursor: default;">Already Active</button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join('')
                        }
                    </tbody>
                </table>

                <!-- Mobile View for In-Progress Classes -->
                <div class="class_list">
                    ${inProgressClasses.length === 0 ? 
                        '<p>No in-progress classes for this course.</p>' : 
                        inProgressClasses.map(cls => {
                            const itemStyle = 'border-left: 4px solid #22c55e;';
                            
                            const studentsCount = cls.students.length;
                            const totalSeats = cls.total_no_of_seats;
                            const availableSeats = totalSeats - studentsCount;
                            
                            const statusDisplay = '<span style="color: green; font-weight: bold;">In Progress</span>';
                            
                            return `
                                <div class="class_item" data-id="${cls.id}" style="${itemStyle}">
                                    <div class="class_header">
                                        <div class="class_instructor">${cls.instructor}</div>
                                        <p>${studentsCount}/${totalSeats} (${availableSeats} seats left)</p>
                                    </div>
                                    <div class="class_details">
                                        Section: ${cls.section_no}<br>
                                        Schedule: ${cls.meeting_time}<br>
                                        Status: ${statusDisplay}
                                    </div>
                                    <div class="action_buttons_for_classes">
                                        <button class="btn" disabled style="opacity: 0.5; cursor: default;">Already Active</button>
                                    </div>
                                </div>
                            `;
                        }).join('')
                    }
                </div>
            </div>
            <div class="card_footer">
                <button class="btn add-class-btn" data-course-id="${course.course_code}" data-course-code="${course.course_code}">
                    <span class="icon icon_plus"></span>
                    Add Class
                </button>
                <button class="btn validate" onclick="validateCourse('${course.course_code}')" ${isValidated ? 'disabled style="opacity: 0.5; cursor: default;"' : ''}>Validate Course</button>
                <button class="btn unvalidate" onclick="unvalidateCourse('${course.course_code}')" ${isValidated ? '' : 'disabled style="opacity: 0.5; cursor: default;"'}>Unvalidate Course</button>
            </div>
        `;
        
        contentArea.appendChild(courseCard);
    });

    setupEventListeners();
}

    window.validateCourse = function(courseCode) {
        const courseIndex = courses.findIndex(c => c.course_code === courseCode);
        if (courseIndex !== -1) {
            courses[courseIndex].validated = true;
            
            classes.forEach(cls => {
                if (cls.course_id === courseCode) {
                    cls.validated = true;
                }
            });
            
            localStorage.setItem('courses', JSON.stringify(courses));
            localStorage.setItem('classes', JSON.stringify(classes));
        }
        
        renderCourses();
    };

    window.unvalidateCourse = function(courseCode) {
        const course = courses.find(c => c.course_code === courseCode);
        if (!course) return;
        
        if (confirm(`Are you sure you want to delete the course "${courseCode}: ${course.title}" and all its classes? This action cannot be undone.`)) {
            const courseClasses = classes.filter(cls => cls.course_id === courseCode);
            
            courseClasses.forEach(cls => {
                const instructorId = cls.instructor_id;
                const classId = cls.id;
                
                const instructorIndex = usersData.instructors.findIndex(i => i.id === instructorId);
                if (instructorIndex !== -1) {
                    const instructor = usersData.instructors[instructorIndex];
                    
                    const pendingIndex = instructor.pending_sections.indexOf(classId);
                    if (pendingIndex !== -1) {
                        instructor.pending_sections.splice(pendingIndex, 1);
                    }
                    
                    usersData.instructors[instructorIndex] = instructor;
                }
            });
            
            localStorage.setItem('users', JSON.stringify(usersData));
            
            const courseIndex = courses.findIndex(c => c.course_code === courseCode);
            if (courseIndex !== -1) {
                courses.splice(courseIndex, 1);
            }
            
            classes = classes.filter(cls => cls.course_id !== courseCode);
            
            localStorage.setItem('courses', JSON.stringify(courses));
            localStorage.setItem('classes', JSON.stringify(classes));
            
            renderCourses();
        }
    };

    window.validateClass = function(classId) {
        const classIndex = classes.findIndex(c => c.id === classId);
        if (classIndex !== -1) {
            classes[classIndex].validated = true;
            
            localStorage.setItem('classes', JSON.stringify(classes));
        }
        
        renderCourses();
    };

    window.unvalidateClass = function(classId) {
        const classObj = classes.find(c => c.id === classId);
        if (!classObj) return;
        
        if (confirm(`Are you sure you want to delete the class "${classObj.course_id} Section ${classObj.section_no}"? This action cannot be undone.`)) {
            const instructorId = classObj.instructor_id;
            const instructorIndex = usersData.instructors.findIndex(i => i.id === instructorId);
            
            if (instructorIndex !== -1) {
                const instructor = usersData.instructors[instructorIndex];
                
                const pendingIndex = instructor.pending_sections.indexOf(classId);
                if (pendingIndex !== -1) {
                    instructor.pending_sections.splice(pendingIndex, 1);
                }
                
                usersData.instructors[instructorIndex] = instructor;
                localStorage.setItem('users', JSON.stringify(usersData));
            }
            
            const classIndex = classes.findIndex(c => c.id === classId);
            if (classIndex !== -1) {
                classes.splice(classIndex, 1);
            }
            
            localStorage.setItem('classes', JSON.stringify(classes));
            
            renderCourses();
        }
    };

    function setupEventListeners() {
        document.querySelectorAll('.add-class-btn').forEach(button => {
            button.addEventListener('click', function() {
                const courseId = this.getAttribute('data-course-id');
                const courseCode = this.getAttribute('data-course-code');
                openClassModal(courseId, courseCode);
            });
        });
    }

    const searchInput = document.querySelector('.search_input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterCourses();
        });
    }

    function filterCourses() {
        const searchTerm = document.querySelector('.search_input').value.toLowerCase();
        const categoryFilter = document.querySelectorAll('.filter_select')[0].value;
        const validationFilter = document.querySelectorAll('.filter_select')[1].value;
        
        const courseCards = document.querySelectorAll('.course_card');
        
        courseCards.forEach(card => {
            const courseTitle = card.querySelector('.course_title').textContent.toLowerCase();
            const courseCategory = card.querySelector('.course_subtitle').textContent.toLowerCase();
            const validationStatus = card.querySelector('.card_header .btn').classList.contains('validated') ? 'validated' : 'unvalidated';
            
            const matchesSearch = courseTitle.includes(searchTerm);
            
            const matchesCategory = categoryFilter === 'all' || 
                                   (categoryFilter === 'computer_science' && courseCategory.includes('computer science')) ||
                                   (categoryFilter === 'computer_engineering' && courseCategory.includes('computer engineering')) ||
                                   (categoryFilter === 'mathematics' && courseCategory.includes('mathematics')) ||
                                   (categoryFilter === 'science' && courseCategory.includes('science')) ||
                                   (categoryFilter === 'english' && courseCategory.includes('english')) ||
                                   (categoryFilter === 'business' && courseCategory.includes('business')) ||
                                   (categoryFilter === 'arabic_islamic' && courseCategory.includes('arabic and islamic'));
            
            const matchesValidation = validationFilter === 'all' || 
                                     (validationFilter === 'validated' && validationStatus === 'validated') ||
                                     (validationFilter === 'unvalidated' && validationStatus === 'unvalidated');
            
            if (matchesSearch && matchesCategory && matchesValidation) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    const filterSelects = document.querySelectorAll('.filter_select');
    filterSelects.forEach(select => {
        select.addEventListener('change', function() {
            filterCourses();
        });
    });

    initData();
});