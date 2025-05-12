import { PrismaClient } from "@prisma/client";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting database seeding...');

    // Read JSON data from files using process.cwd() and fs.readJSON
    const usersPath = path.join(process.cwd(), 'app/data/users.json');
    const coursesPath = path.join(process.cwd(), 'app/data/courses.json');
    const sectionsPath = path.join(process.cwd(), 'app/data/sections.json');

    const usersData = await fs.readJSON(usersPath);
    const coursesData = await fs.readJSON(coursesPath);
    const sectionsData = await fs.readJSON(sectionsPath);

    // Process and seed courses
    console.log('Seeding courses...');
    for (const course of coursesData) {
      await prisma.course.upsert({
        where: { id: course.course_code },
        update: {
          title: course.title,
          category: course.category,
          credit: course.credit,
          description: course.description,
          institution: course.institution,
          duration: course.duration,
          image: course.image,
          validated: course.validated || false,
          prerequisiteCodes: course.prerequisite ? course.prerequisite.join(',') : null
        },
        create: {
          id: course.course_code,
          title: course.title,
          category: course.category,
          credit: course.credit,
          description: course.description,
          institution: course.institution,
          duration: course.duration,
          image: course.image,
          validated: course.validated || false,
          prerequisiteCodes: course.prerequisite ? course.prerequisite.join(',') : null
        }
      });
    }

    // Process and seed instructors, students, and admins
    console.log('Seeding users...');

    // Seed instructors
    for (const instructor of usersData.instructors) {
      await prisma.instructor.upsert({
        where: { id: instructor.id },
        update: {
          name: instructor.name,
          userName: instructor.userName,
          password: instructor.password
        },
        create: {
          id: instructor.id,
          name: instructor.name,
          userName: instructor.userName,
          password: instructor.password
        }
      });
    }

    // Seed students
    for (const student of usersData.students) {
      // Create the student
      await prisma.student.upsert({
        where: { id: student.id },
        update: {
          name: student.name,
          userName: student.userName,
          password: student.password,
          gpa: student.gpa,
          major: student.major,
          current_year: student.current_year,
          current_semester: student.current_semester,
          advisorName: student.advisor.advisor_name,
          advisorOffice: student.advisor.advisor_office,
          advisorEmail: student.advisor.advisor_email
        },
        create: {
          id: student.id,
          name: student.name,
          userName: student.userName,
          password: student.password,
          gpa: student.gpa,
          major: student.major,
          current_year: student.current_year,
          current_semester: student.current_semester,
          advisorName: student.advisor.advisor_name,
          advisorOffice: student.advisor.advisor_office,
          advisorEmail: student.advisor.advisor_email
        }
      });

      // Add completed courses for this student
      if (student.completedCourses && student.completedCourses.length > 0) {
        for (const course of student.completedCourses) {
          try {
            // Try to create the completed course record
            await prisma.completedCourse.create({
              data: {
                student: { connect: { id: student.id } },
                course: { connect: { id: course.code } },
                semester: course.semester,
                grade: course.grade
              }
            });
            console.log(`Added completed course ${course.code} for student ${student.id}`);
          } catch (error) {
            // If it fails due to unique constraint, just log and continue
            if (error.code === 'P2002') {
              console.log(`Skipping duplicate completed course ${course.code} for student ${student.id}`);
            } else {
              // For other errors, log and re-throw
              console.error(`Error adding completed course ${course.code} for student ${student.id}:`, error);
              throw error;
            }
          }
        }
      }

      // Add in-progress courses for this student
      if (student.in_progress_courses && student.in_progress_courses.length > 0) {
        for (const course of student.in_progress_courses) {
          try {
            await prisma.inProgressCourse.create({
              data: {
                student: { connect: { id: student.id } },
                course: { connect: { id: course.code } },
                semester: course.semester,
                status: course.status
              }
            });
            console.log(`Added in-progress course ${course.code} for student ${student.id}`);
          } catch (error) {
            if (error.code === 'P2002') {
              console.log(`Skipping duplicate in-progress course ${course.code} for student ${student.id}`);
            } else {
              console.error(`Error adding in-progress course ${course.code} for student ${student.id}:`, error);
              throw error;
            }
          }
        }
      }

      // Add pending courses for this student
      if (student.pendingCourses && student.pendingCourses.length > 0) {
        for (const course of student.pendingCourses) {
          try {
            await prisma.pendingCourse.create({
              data: {
                student: { connect: { id: student.id } },
                course: { connect: { id: course.code } },
                semester: course.semester,
                status: course.status
              }
            });
            console.log(`Added pending course ${course.code} for student ${student.id}`);
          } catch (error) {
            if (error.code === 'P2002') {
              console.log(`Skipping duplicate pending course ${course.code} for student ${student.id}`);
            } else {
              console.error(`Error adding pending course ${course.code} for student ${student.id}:`, error);
              throw error;
            }
          }
        }
      }

      // Add remaining courses for this student
      if (student.remaining_courses && student.remaining_courses.length > 0) {
        for (const course of student.remaining_courses) {
          try {
            await prisma.remainingCourse.create({
              data: {
                student: { connect: { id: student.id } },
                course: { connect: { id: course.code } },
                year: course.year || "Future" // Provide a fallback value in case year is missing
              }
            });
            console.log(`Added remaining course ${course.code} for student ${student.id}`);
          } catch (error) {
            if (error.code === 'P2002') {
              console.log(`Skipping duplicate remaining course ${course.code} for student ${student.id}`);
            } else {
              console.error(`Error adding remaining course ${course.code} for student ${student.id}:`, error);
              throw error;
            }
          }
        }
      }
    } // <-- This closing bracket was missing

    // Seed admins
    for (let i = 0; i < usersData.admins.length; i++) {
      const admin = usersData.admins[i];
      await prisma.admin.create({
        data: {
          userName: admin.userName,
          password: admin.password
        }
      });
    }

    // Process and seed sections
    console.log('Seeding sections...');
    for (const section of sectionsData) {
      // Create the section
      await prisma.section.upsert({
        where: { id: section.id },
        update: {
          section_no: section.section_no,
          meeting_time: section.meeting_time,
          total_no_of_seats: section.total_no_of_seats,
          validated: section.validated,
          status: section.status,
          course: { connect: { id: section.course_id } },
          instructor: { connect: { id: section.instructor_id } }
        },
        create: {
          id: section.id,
          section_no: section.section_no,
          meeting_time: section.meeting_time,
          total_no_of_seats: section.total_no_of_seats,
          validated: section.validated,
          status: section.status,
          course: { connect: { id: section.course_id } },
          instructor: { connect: { id: section.instructor_id } }
        }
      });

      // Connect students to this section
      if (section.students && section.students.length > 0) {
        for (const studentId of section.students) {
          try {
            await prisma.studentSection.create({
              data: {
                student: { connect: { id: studentId } },
                section: { connect: { id: section.id } }
              }
            });
            console.log(`Added student ${studentId} to section ${section.id}`);
          } catch (error) {
            if (error.code === 'P2002') {
              console.log(`Skipping duplicate enrollment of student ${studentId} in section ${section.id}`);
            } else {
              console.error(`Error adding student ${studentId} to section ${section.id}:`, error);
              throw error;
            }
          }
        }
      }
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });