document.addEventListener('DOMContentLoaded', function() {

    // Get modal elements
    const courseModal = document.querySelector('#addCourseModal');
    const createCourseBtn = document.querySelector('.create_button');
    const closeCourseModal = document.querySelector('#closeModal');
    const cancelCourseBtn = document.querySelector('#cancelBtn');
    const addCourseForm = document.querySelector('#addCourseForm');
    const contentArea = document.querySelector('.content_area');

    // Get class modal elements
    const classModal = document.querySelector('#addClassModal');
    const closeClassModal = document.querySelector('#closeClassModal');
    const cancelClassBtn = document.querySelector('#cancelClassBtn');
    const addClassForm = document.querySelector('#addClassForm');
    const currentCourseIdInput = document.querySelector('#currentCourseId');
    const currentCourseCodeInput = document.querySelector('#currentCourseCode');
    const instructorsList = document.querySelector('#instructorsList');


    // Data storage
    let courses = [];
    let classes = [];
    let instructors = [];

    // Event Listeners
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

    // Function to Open Course Modal
    function openCourseModal() {
        courseModal.style.display = 'block';
    }

    // Function to Close Course Modal
    function closeCourseModalFunction() {
        courseModal.style.display = 'none';
        addCourseForm.reset();
    }

    function closeClassModalFunction(){
        classModal.style.display = 'none';
        addClassForm.reset();
    }

    // Function to Open Class Modal
    function openClassModal(courseId, courseCode) {
        currentCourseIdInput.value = courseId;
        if (!currentCourseCodeInput) {
            // Add hidden input if it doesn't exist
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.id = 'currentCourseCode';
            hiddenInput.value = courseCode;
            addClassForm.appendChild(hiddenInput);
        } else {
            currentCourseCodeInput.value = courseCode;
        }
        
        // Populate instructor datalist
        if (instructorsList) {
            instructorsList.innerHTML = '';
            instructors.forEach(instructor => {
                const option = document.createElement('option');
                option.value = instructor.id;
                option.textContent = `${instructor.id} - ${instructor.name}`;
                instructorsList.appendChild(option);
            });
        }
        
        classModal.style.display = 'block';
    }

    // Initialize data
    async function initData() {
        // Load courses
        if (localStorage.getItem('courses')) {
            courses = JSON.parse(localStorage.getItem('courses'));
            // Ensure all courses have a validated property set to false
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
                // Set validated property to false for all courses
                courses.forEach(course => {
                    course.validated = false;
                });
                localStorage.setItem('courses', JSON.stringify(courses));
            } catch (error) {
                console.error('Error loading courses:', error);
                courses = [];
            }
        }

        // Load classes
        if (localStorage.getItem('classes')) {
            classes = JSON.parse(localStorage.getItem('classes'));
            // Ensure all classes have a validated property set to false
            classes.forEach(cls => {
                if (cls.validated === undefined) {
                    cls.validated = false;
                }
            });
            localStorage.setItem('classes', JSON.stringify(classes));
        } else {
            try {
                const response = await fetch('json_files/sections.json');
                classes = await response.json();
                // Set validated property to false for all classes
                classes.forEach(cls => {
                    cls.validated = false;
                });
                localStorage.setItem('classes', JSON.stringify(classes));
            } catch (error) {
                console.error('Error loading classes:', error);
                classes = [];
            }
        }
        
        // Load instructors
        if (localStorage.getItem('instructors')) {
            instructors = JSON.parse(localStorage.getItem('instructors'));
        } else {
            try {
                const response = await fetch('json_files/users.json');
                const usersData = await response.json();
                instructors = usersData.instructors;
                localStorage.setItem('instructors', JSON.stringify(instructors));
            } catch (error) {
                console.error('Error loading instructors:', error);
                instructors = [];
            }
        }

        // Render the UI
        renderCourses();
    }

    // Handle Course Form Submission
    function handleCourseFormSubmit(event) {
        event.preventDefault();
        
        // Get form values
        const courseCode = document.querySelector('#courseCode').value;
        const courseName = document.querySelector('#courseName').value;
        const courseCategory = document.querySelector('#courseCategory').value;
        const coursePrerequisites = document.querySelector('#coursePrerequisites').value;
        const courseImage = document.querySelector('#courseImage').value;
        const courseDescription = document.querySelector('#courseDescription').value;

        // Process prerequisites (split by comma and trim)
        const prerequisiteArray = coursePrerequisites 
            ? coursePrerequisites.split(',').map(item => item.trim())
            : [];

        // Create new course object
        const newCourse = {
            course_code: courseCode,
            title: courseName,
            category: courseCategory,
            prerequisite: prerequisiteArray,
            description: courseDescription,
            institution: "QU-CENG",
            duration: "14 weeks",
            image: courseImage || "images/statistics.jpg",
            validated: false
        };

        // Add to courses array
        courses.unshift(newCourse); // Add to beginning of array
        
        // Save to localStorage
        localStorage.setItem('courses', JSON.stringify(courses));
        
        // Render updated courses
        renderCourses();
        
        // Reset form and close modal
        closeCourseModalFunction();
        
        // Show success message
        alert(`Course ${courseCode}: ${courseName} has been added successfully!`);
    }

    // Handle Class Form Submission
    function handleClassFormSubmit(event) {
        event.preventDefault();

        const courseId = document.querySelector('#currentCourseId').value;
        const courseCode = document.querySelector('#currentCourseCode').value;
        
        // Get form values
        const sectionNumber = document.querySelector('#sectionNumber').value;
        const instructorId = document.querySelector('#instructorId').value;
        const meetingTimes = document.querySelector('#meetingTimes').value;
        const availableSeats = document.querySelector('#availableSeats').value;

        // Find matching course
        const course = courses.find(c => c.course_code === courseCode);
        if (!course) {
            alert('Error: Course not found');
            return;
        }
        
        // Validate instructor ID
        const instructor = instructors.find(instructor => instructor.id === instructorId);
        if (!instructor) {
            alert('Error: Invalid instructor ID. Please select a valid instructor from the list.');
            return;
        }
        
        // Create class ID
        const classId = `${courseCode}_${sectionNumber}`;
        
        // Update instructor's sections array
        if (!instructor.sections.includes(classId)) {
            instructor.sections.push(classId);
            
            // Update instructors in localStorage
            const instructorIndex = instructors.findIndex(i => i.id === instructorId);
            instructors[instructorIndex] = instructor;
            localStorage.setItem('instructors', JSON.stringify(instructors));
        }
        
        // Create new class object
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
            validated: false
        };

        // Add to classes array
        classes.push(newClass);
        
        // Save to localStorage
        localStorage.setItem('classes', JSON.stringify(classes));
        
        // Re-render the courses to update the UI
        renderCourses();
        
        // Reset form and close modal
        closeClassModalFunction();
        
        // Show success message
        alert(`Class section ${sectionNumber} has been added successfully!`);
    }

    // Render all courses with their classes
    function renderCourses() {
        // Clear the content area
        contentArea.innerHTML = '';
        
        // Loop through courses
        courses.forEach(course => {
            // Find classes for this course
            const courseClasses = classes.filter(cls => cls.course_id === course.course_code);
            
            // Create course card
            const courseCard = document.createElement('div');
            courseCard.className = 'course_card';
            
            // Set course validation status - prioritize the property in the object
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
                    <h3 class="number_of_classes">Classes (${courseClasses.length})</h3>
                    
                    <!-- Desktop/Laptop View -->
                    <table class="classes_table">
                        <thead>
                            <tr>
                                <th>Section</th>
                                <th>Instructor</th>
                                <th>Schedule</th>
                                <th>Enrollment</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            ${courseClasses.length === 0 ? 
                                '<tr><td colspan="5" style="text-align: center;">No classes added yet.</td></tr>' : 
                                courseClasses.map(cls => {
                                    // Get class validation status - prioritize the property in the object
                                    const isClassValidated = cls.validated || false;
                                    const rowStyle = isClassValidated ? 'background-color: #f0fff4;' : '';
                                    
                                    // Calculate enrollment correctly
                                    const studentsCount = cls.students.length;
                                    const totalSeats = cls.total_no_of_seats;
                                    const availableSeats = totalSeats - studentsCount;
                                    
                                    // Added instructor ID display
                                    // const instructorDisplay = cls.instructor_id ? 
                                    //     `${cls.instructor} (${cls.instructor_id})` : 
                                    //     cls.instructor;
                                    
                                    return `
                                        <tr data-id="${cls.id}" style="${rowStyle}">
                                            <td>${cls.section_no}</td>
                                            <td>${cls.instructor}</td>
                                            <td>${cls.meeting_time}</td>
                                            <td>${studentsCount}/${totalSeats} (${availableSeats} seats left)</td>
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
                        ${courseClasses.length === 0 ? 
                            '<p>No classes added yet.</p>' : 
                            courseClasses.map(cls => {
                                // Get class validation status - prioritize the property in the object
                                const isClassValidated = cls.validated || false;
                                const itemStyle = isClassValidated ? 'border-left: 4px solid #22c55e;' : '';
                                
                                // Calculate enrollment correctly
                                const studentsCount = cls.students.length;
                                const totalSeats = cls.total_no_of_seats;
                                const availableSeats = totalSeats - studentsCount;
                                
                                // Add instructor ID for mobile view
                                // const instructorDisplay = cls.instructor_id ? 
                                //     `${cls.instructor} (${cls.instructor_id})` : 
                                //     cls.instructor;
                                
                                return `
                                    <div class="class_item" data-id="${cls.id}" style="${itemStyle}">
                                        <div class="class_header">
                                            <div class="class_instructor">${cls.instructor}</div>
                                            <p>${studentsCount}/${totalSeats} (${availableSeats} seats left)</p>
                                        </div>
                                        <div class="class_details">
                                            Section: ${cls.section_no}<br>
                                            Schedule: ${cls.meeting_time}
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
            
            // Add the course card to the content area
            contentArea.appendChild(courseCard);
        });

        // Set up event listeners for the new elements
        setupEventListeners();
    }

    // Global functions for validation and unvalidation
    window.validateCourse = function(courseCode) {
        // Find the course and update its validated property
        const courseIndex = courses.findIndex(c => c.course_code === courseCode);
        if (courseIndex !== -1) {
            courses[courseIndex].validated = true;
            
            // Also validate all classes associated with this course
            classes.forEach(cls => {
                if (cls.course_id === courseCode) {
                    cls.validated = true;
                }
            });
            
            // Update localStorage
            localStorage.setItem('courses', JSON.stringify(courses));
            localStorage.setItem('classes', JSON.stringify(classes));
        }
        
        renderCourses();
    };

    window.unvalidateCourse = function(courseCode) {
        // Find course details for the confirmation message
        const course = courses.find(c => c.course_code === courseCode);
        if (!course) return;
        
        // Show confirmation dialog
        if (confirm(`Are you sure you want to delete the course "${courseCode}: ${course.title}" and all its classes? This action cannot be undone.`)) {
            // Remove course from array
            const courseIndex = courses.findIndex(c => c.course_code === courseCode);
            if (courseIndex !== -1) {
                courses.splice(courseIndex, 1);
            }
            
            // Remove associated classes
            classes = classes.filter(cls => cls.course_id !== courseCode);
            
            // Update localStorage
            localStorage.setItem('courses', JSON.stringify(courses));
            localStorage.setItem('classes', JSON.stringify(classes));
            
            // Re-render
            renderCourses();
        }
    };

    window.validateClass = function(classId) {
        // Find the class and update its validated property
        const classIndex = classes.findIndex(c => c.id === classId);
        if (classIndex !== -1) {
            classes[classIndex].validated = true;
            
            // Update localStorage
            localStorage.setItem('classes', JSON.stringify(classes));
        }
        
        renderCourses();
    };

    window.unvalidateClass = function(classId) {
        // Find class details for the confirmation message
        const classObj = classes.find(c => c.id === classId);
        if (!classObj) return;
        
        // Show confirmation dialog
        if (confirm(`Are you sure you want to delete the class "${classObj.course_id} Section ${classObj.section_no}"? This action cannot be undone.`)) {
            // Remove class from array
            const classIndex = classes.findIndex(c => c.id === classId);
            if (classIndex !== -1) {
                classes.splice(classIndex, 1);
            }
            
            // Update localStorage
            localStorage.setItem('classes', JSON.stringify(classes));
            
            // Re-render
            renderCourses();
        }
    };

    // Setup event listeners for dynamically created elements
    function setupEventListeners() {
        // Add class buttons
        document.querySelectorAll('.add-class-btn').forEach(button => {
            button.addEventListener('click', function() {
                const courseId = this.getAttribute('data-course-id');
                const courseCode = this.getAttribute('data-course-code');
                openClassModal(courseId, courseCode);
            });
        });
    }

    // Search functionality
    const searchInput = document.querySelector('.search_input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterCourses();
        });
    }

    // Filter courses by search term and filter selections
    function filterCourses() {
        const searchTerm = document.querySelector('.search_input').value.toLowerCase();
        const categoryFilter = document.querySelectorAll('.filter_select')[0].value;
        const validationFilter = document.querySelectorAll('.filter_select')[1].value;
        
        const courseCards = document.querySelectorAll('.course_card');
        
        courseCards.forEach(card => {
            const courseTitle = card.querySelector('.course_title').textContent.toLowerCase();
            const courseCategory = card.querySelector('.course_subtitle').textContent.toLowerCase();
            const validationStatus = card.querySelector('.card_header .btn').classList.contains('validated') ? 'validated' : 'unvalidated';
            
            // Check if course matches search term
            const matchesSearch = courseTitle.includes(searchTerm);
            
            // Check if course matches category filter (updated to include new categories)
            const matchesCategory = categoryFilter === 'all' || 
                                   (categoryFilter === 'computer_science' && courseCategory.includes('computer science')) ||
                                   (categoryFilter === 'computer_engineering' && courseCategory.includes('computer engineering')) ||
                                   (categoryFilter === 'mathematics' && courseCategory.includes('mathematics')) ||
                                   (categoryFilter === 'science' && courseCategory.includes('science')) ||
                                   (categoryFilter === 'english' && courseCategory.includes('english')) ||
                                   (categoryFilter === 'business' && courseCategory.includes('business')) ||
                                   (categoryFilter === 'arabic_islamic' && courseCategory.includes('arabic and islamic'));
            
            // Check if course matches validation filter
            const matchesValidation = validationFilter === 'all' || 
                                     (validationFilter === 'validated' && validationStatus === 'validated') ||
                                     (validationFilter === 'unvalidated' && validationStatus === 'unvalidated');
            
            // Show/hide the course card based on filters
            if (matchesSearch && matchesCategory && matchesValidation) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Filter dropdowns functionality
    const filterSelects = document.querySelectorAll('.filter_select');
    filterSelects.forEach(select => {
        select.addEventListener('change', function() {
            filterCourses();
        });
    });

    // Call initData to load and render the initial data
    initData();
});