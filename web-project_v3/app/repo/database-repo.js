import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class Repository {

    // 6. Get user by userType, userName, and password
    async getUserByCredentials(userType, userName, password) {
    if (userType === "student") {
        return prisma.student.findFirst({
        where: {
            userName: userName,
            password: password,
        },
        });
    }

    if (userType === "instructor") {
        return prisma.instructor.findFirst({
        where: {
            userName: userName,
            password: password,
        },
        });
    }

    if (userType === "admin") {
        return prisma.admin.findFirst({
        where: {
            userName: userName,
            password: password,
        },
        });
    }

    return null;
    }

  // 1. Get admin by ID
  async getAdminById(id) {
    return prisma.admin.findUnique({ where: { id } });
  }

  // 2. Get all students with courses and sections
  async getAllStudents() {
    return prisma.student.findMany({
      include: {
        completedCourses: true,
        pendingCourses: true,
        inProgressCourses: true,
        remainingCourses: true,
        enrolledSections: true,
      },
    });
  }

  // 3. Get student by ID with all related info
  async getStudentById(id) {
    return prisma.student.findUnique({
      where: { id },
      include: {
        completedCourses: true,
        pendingCourses: true,
        inProgressCourses: true,
        remainingCourses: true,
        enrolledSections: true,
      },
    });
  }

  // 4. Get all instructors with their sections
  async getAllInstructors() {
    return prisma.instructor.findMany({
      include: { sections: true },
    });
  }

  // 5. Get instructor by ID with their sections
  async getInstructorById(id) {
    return prisma.instructor.findUnique({
      where: { id },
      include: { sections: true },
    });
  }

  // 6. Get all courses with sections and student statuses
  async getCourses() {
    return prisma.course.findMany({
      include: {
        sections: true,
        completedBy: true,
        inProgressBy: true,
        remainingBy: true,
        pendingBy: true,
      },
    });
  }
  async getAllCourses(query) {
    if (!query || query.trim() === "") {
        return this.getCourses(); // fallback to the unfiltered version
    }

    return prisma.course.findMany({
        where: {
            OR: [
                {
                    id: {
                        contains: query,
                        // mode: "insensitive",
                    },
                },
                {
                    title: {
                        contains: query,
                        // mode: "insensitive",
                    },
                },
                {
                    category: {
                        contains: query,
                        // mode: "insensitive",
                    },
                },
            ],
        },
        include: {
        sections: true,
        completedBy: true,
        inProgressBy: true,
        remainingBy: true,
        pendingBy: true,
        },
    });
    }


  // 7. Get course by ID with sections and student statuses
  async getCourseById(id) {
    return prisma.course.findUnique({
      where: { id },
      include: {
        sections: true,
        completedBy: true,
        inProgressBy: true,
        remainingBy: true,
        pendingBy: true,
      },
    });
  }

  // 8. Get all sections with course, instructor, and student enrollments
  async getAllSections() {
    return prisma.section.findMany({
      include: {
        course: true,
        instructor: true,
        studentEnrollments: true,
      },
    });
  }

  // 9. Get section by ID with course, instructor, and student enrollments
  async getSectionById(id) {
    return prisma.section.findUnique({
      where: { id },
      include: {
        course: true,
        instructor: true,
        studentEnrollments: true,
      },
    });
  }
  // Get all students in a section by section ID
async getStudentsBySectionId(sectionId) {
  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    include: {
      studentEnrollments: {
        include: {
          student: true, // Include student info in each enrollment
        },
      },
    },
  });

  if (!section) {
    throw new Error(`Section with ID ${sectionId} not found.`);
  }

  // Extract students from the enrollments
  return section.studentEnrollments.map(enrollment => enrollment.student);
}

  // Get all sections for a given course ID
  async getSectionByCourseId(courseId) {
    return prisma.section.findMany({
      where: {
        courseId: courseId,
      },
      include: {
        course: true,
        instructor: true,
        studentEnrollments: true,
      },
    });
  }
  // Get all sections for a given instructor ID
  async getSectionsByInstructorId(instructorId) {
    return prisma.section.findMany({
      where: {
        instructorId: instructorId,
      },
      include: {
        course: true,
        instructor: true,
        studentEnrollments: true,
      },
    });
  }
  // Update a section
  async updateSection(id, propertiesToUpdate) {
    return prisma.section.update({ data: propertiesToUpdate, where: { id } });
  }



  // 10. Get all completed courses with student and course info
  async getAllCompletedCourses() {
    return prisma.completedCourse.findMany({
      include: {
        student: true,
        course: true,
      },
    });
  }

  // 11. Get completed course by ID
  async getCompletedCourseById(id) {
    return prisma.completedCourse.findUnique({
      where: { id },
      include: {
        student: true,
        course: true,
      },
    });
  }


  // 12. Get all in-progress courses
  async getAllInProgressCourses() {
    return prisma.inProgressCourse.findMany({
      include: {
        student: true,
        course: true,
      },
    });
  }

  // 13. Get in-progress course by ID
  async getInProgressCourseById(id) {
    return prisma.inProgressCourse.findUnique({
      where: { id },
      include: {
        student: true,
        course: true,
      },
    });
  }

  // Remove in-progress course and add as completed (auto semester)
  async completeCourse(studentId, courseId, grade) {
    const inProgress = await prisma.inProgressCourse.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    if (!inProgress) {
      throw new Error("In-progress course not found");
    }

    return prisma.$transaction([
      prisma.inProgressCourse.delete({
        where: {
          studentId_courseId: {
            studentId,
            courseId,
          },
        },
      }),
      prisma.completedCourse.create({
        data: {
          studentId,
          courseId,
          semester: inProgress.semester,
          grade,
        },
      }),
    ]);
  }


  // Remove completed course and add as in-progress (without passing semester)
  async revertCompletedToInProgress(studentId, courseId) {
    // Get semester from the completed course
    const completed = await prisma.completedCourse.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    if (!completed) {
      throw new Error("Completed course not found");
    }

    return prisma.$transaction([
      prisma.completedCourse.delete({
        where: {
          studentId_courseId: {
            studentId,
            courseId,
          },
        },
      }),
      prisma.inProgressCourse.create({
        data: {
          studentId,
          courseId,
          semester: completed.semester,
          status: "In Progress",
        },
      }),
    ]);
  }



  // Remove pending course and add as in-progress (without passing semester)
  async promotePendingToInProgress(studentId, courseId) {
    // First, fetch the pending course to get the semester
    const pending = await prisma.pendingCourse.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    if (!pending) {
      throw new Error("Pending course not found");
    }

    // Then perform transaction
    return prisma.$transaction([
      prisma.pendingCourse.delete({
        where: {
          studentId_courseId: {
            studentId,
            courseId,
          },
        },
      }),
      prisma.inProgressCourse.create({
        data: {
          studentId,
          courseId,
          semester: pending.semester,
          status: "In Progress",
        },
      }),
    ]);
  }


  // Remove in-progress course and add back to pending (auto semester)
  async revertInProgressToPending(studentId, courseId) {
    const inProgress = await prisma.inProgressCourse.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    if (!inProgress) {
      throw new Error("In-progress course not found");
    }

    return prisma.$transaction([
      prisma.inProgressCourse.delete({
        where: {
          studentId_courseId: {
            studentId,
            courseId,
          },
        },
      }),
      prisma.pendingCourse.create({
        data: {
          studentId,
          courseId,
          semester: inProgress.semester,
          status: "Pending",
        },
      }),
    ]);
  }






  // 14. Get all pending courses
  async getAllPendingCourses() {
    return prisma.pendingCourse.findMany({
      include: {
        student: true,
        course: true,
      },
    });
  }

  // 15. Get pending course by ID
  async getPendingCourseById(id) {
    return prisma.pendingCourse.findUnique({
      where: { id },
      include: {
        student: true,
        course: true,
      },
    });
  }

  // 16. Get all student-section entries with course info
  async getAllStudentSections() {
    return prisma.studentSection.findMany({
      include: {
        student: true,
        section: {
          include: {
            course: true,
          },
        },
      },
    });
  }

  // 17. Get student-section by composite key
  async getStudentSectionById(studentId, sectionId) {
    return prisma.studentSection.findUnique({
      where: {
        studentId_sectionId: { studentId, sectionId },
      },
      include: {
        student: true,
        section: {
          include: {
            course: true,
          },
        },
      },
    });
  }
}

export default new Repository();
