// lib/repositories/StatisticsRepo.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class StatisticsRepo {
  async getStatistics() {
    const stats = [];

    // 1. Total students
    const totalStudents = await prisma.student.count();
    stats.push({ title: "Total Students", value: totalStudents });

    // 2. Total courses
    const totalCourses = await prisma.course.count();
    stats.push({ title: "Total Courses", value: totalCourses });

    // 3. Total instructors
    const totalInstructors = await prisma.instructor.count();
    stats.push({ title: "Total Instructors", value: totalInstructors });

    // 4. Number of students currently in progress per course
    const inProgress = await prisma.inProgressCourse.groupBy({
      by: ["courseId"],
      _count: { 
        courseId: true 
      },
      orderBy: { 
        _count: { 
          courseId: "desc" 
        } 
      },
      take: 3,
    });

    const inProgressNames = await Promise.all(
      inProgress.map((c) =>
        prisma.course.findUnique({
          where: { id: c.courseId },
          select: { title: true },
        })
      )
    );

    stats.push({
      title: "Top 3 In-Progress Courses",
      value: inProgressNames.map((c) => c.title).join(", "),
    });

    // 5. Average GPA of all students
    const avgGpa = await prisma.student.aggregate({
      _avg: { gpa: true },
    });
    stats.push({
      title: "Average Student GPA",
      value: avgGpa._avg.gpa?.toFixed(2) || "N/A",
    });

    // 6. Instructor with Most Sections
    const topInstructor = await prisma.section.groupBy({
      by: ["instructorId"],
      _count: { 
        instructorId: true 
      },
      orderBy: { 
        _count: { 
          instructorId: "desc" 
        } 
      },
      take: 1,
    });
    
    if (topInstructor.length > 0) {
      const instructor = await prisma.instructor.findUnique({
        where: { id: topInstructor[0].instructorId },
        select: { name: true },
      });
      stats.push({
        title: "Instructor with Most Sections",
        value: instructor?.name || "N/A",
      });
    } else {
      stats.push({
        title: "Instructor with Most Sections",
        value: "N/A",
      });
    }

    // 7. Failure Rate (% of F grades)
    const totalGrades = await prisma.completedCourse.count();
    const totalFails = await prisma.completedCourse.count({
      where: { grade: "F" },
    });
    const failureRate =
      totalGrades > 0 ? ((totalFails / totalGrades) * 100).toFixed(2) : "0.00";
    stats.push({
      title: "Failure Rate (%)",
      value: `${failureRate}%`,
    });
    
    // 8. Students with Highest GPA (Top 3)
    const topStudents = await prisma.student.findMany({
      orderBy: { gpa: "desc" },
      take: 3,
      select: { name: true, gpa: true },
    });
    stats.push({
      title: "Top 3 Students by GPA",
      value: topStudents.map((s) => `${s.name} (${s.gpa.toFixed(2)})`).join(", "),
    });

    // 9. Number of students per year (except Second Year which you wanted to remove)
    const yearGroups = await prisma.student.groupBy({
      by: ["current_year"],
      _count: { 
        _all: true 
      },
    });
    yearGroups.forEach((group) => {
      // Skip "Second Year" as requested
      if (group.current_year !== "Second Year") {
        stats.push({
          title: `Students in Year ${group.current_year}`,
          value: group._count._all,
        });
      }
    });

    // NEW STATISTICS

    // 10. Number of students who completed all their courses (graduation ready)
    const graduationReadyStudents = await prisma.student.findMany({
      where: {
        remainingCourses: {
          none: {}
        }
      },
      select: { id: true }
    });
    stats.push({
      title: "Graduation Ready Students",
      value: graduationReadyStudents.length,
    });

    // 11. Courses with the highest failure rate (percentage-based)
    // First, get course IDs and their completed counts
    const coursesWithCompletions = await prisma.completedCourse.groupBy({
      by: ['courseId'],
      _count: {
        courseId: true
      }
    });

    // Get failure counts per course (grade "F")
    const coursesWithFailures = await prisma.completedCourse.groupBy({
      by: ['courseId'],
      _count: {
        courseId: true
      },
      where: {
        grade: "F"
      }
    });

    // Calculate failure rates
    const failureRates = [];
    for (const course of coursesWithCompletions) {
      const courseId = course.courseId;
      const totalCompleted = course._count.courseId;
      
      // Find failures for this course
      const failureRecord = coursesWithFailures.find(c => c.courseId === courseId);
      const failures = failureRecord ? failureRecord._count.courseId : 0;
      
      // Calculate failure rate
      const rate = (failures / totalCompleted) * 100;
      
      failureRates.push({
        courseId,
        failureRate: rate
      });
    }

    // Sort by failure rate (highest first) and take top 3
    failureRates.sort((a, b) => b.failureRate - a.failureRate);
    const topFailureCourses = failureRates.slice(0, 3);

    // Get course names for top failure rates
    if (topFailureCourses.length > 0) {
      const courseDetails = await Promise.all(
        topFailureCourses.map(async (course) => {
          const courseInfo = await prisma.course.findUnique({
            where: { id: course.courseId },
            select: { title: true }
          });
          return {
            title: courseInfo?.title || "Unknown",
            rate: course.failureRate.toFixed(2)
          };
        })
      );

      stats.push({
        title: "Courses with Highest Failure Rate",
        value: courseDetails.map(c => `${c.title} (${c.rate}%)`).join(", ")
      });
    } else {
      stats.push({
        title: "Courses with Highest Failure Rate",
        value: "No data available"
      });
    }

    // 12. Total number of validated vs non-validated courses
    const courseValidationGroups = await prisma.course.groupBy({
      by: ['validated'],
      _count: {
        id: true
      }
    });

    // Extract the counts
    const validatedCount = courseValidationGroups.find(g => g.validated === true)?._count.id || 0;
    const nonValidatedCount = courseValidationGroups.find(g => g.validated === false)?._count.id || 0;

    stats.push({
      title: "Validated Courses",
      value: validatedCount
    });
    
    stats.push({
      title: "Non-Validated Courses",
      value: nonValidatedCount
    });

    // 13. Course with the highest number of students currently in progress
    const mostInProgressCourse = await prisma.inProgressCourse.groupBy({
      by: ['courseId'],
      _count: {
        courseId: true
      },
      orderBy: {
        _count: {
          courseId: 'desc'
        }
      },
      take: 1,
    });

    if (mostInProgressCourse.length > 0) {
      const courseInfo = await prisma.course.findUnique({
        where: { id: mostInProgressCourse[0].courseId },
        select: { title: true }
      });
      
      stats.push({
        title: "Most Popular In-Progress Course",
        value: `${courseInfo?.title || "Unknown"} (${mostInProgressCourse[0]._count.courseId} students)`
      });
    } else {
      stats.push({
        title: "Most Popular In-Progress Course",
        value: "No data available"
      });
    }

    // 14. Average number of sections per instructor
    const instructorCount = await prisma.instructor.count();
    const sectionCount = await prisma.section.count();
    
    if (instructorCount > 0) {
      const average = sectionCount / instructorCount;
      stats.push({
        title: "Average Sections per Instructor",
        value: average.toFixed(2)
      });
    } else {
      stats.push({
        title: "Average Sections per Instructor",
        value: "N/A (No instructors)"
      });
    }

    // 15. Number of students who have not completed any course
    const studentsWithNoCompletions = await prisma.student.findMany({
      where: {
        completedCourses: {
          none: {},
        },
      },
      select: { id: true }
    });

    stats.push({
      title: "Students with No Completed Courses",
      value: studentsWithNoCompletions.length
    });
    
    return stats;
  }
}

export default new StatisticsRepo();