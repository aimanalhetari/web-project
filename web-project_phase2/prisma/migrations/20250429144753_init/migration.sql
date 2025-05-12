-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "credit" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "validated" BOOLEAN NOT NULL DEFAULT false,
    "prerequisiteCodes" TEXT
);

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "section_no" TEXT NOT NULL,
    "meeting_time" TEXT NOT NULL,
    "total_no_of_seats" INTEGER NOT NULL,
    "validated" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    CONSTRAINT "Section_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Section_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudentSection" (
    "studentId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,

    PRIMARY KEY ("studentId", "sectionId"),
    CONSTRAINT "StudentSection_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StudentSection_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "gpa" REAL NOT NULL,
    "major" TEXT NOT NULL,
    "current_year" TEXT NOT NULL,
    "current_semester" TEXT NOT NULL,
    "advisorName" TEXT NOT NULL,
    "advisorOffice" TEXT NOT NULL,
    "advisorEmail" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Instructor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userName" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CompletedCourse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    CONSTRAINT "CompletedCourse_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CompletedCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InProgressCourse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'In Progress',
    CONSTRAINT "InProgressCourse_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InProgressCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PendingCourse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Registration Confirmed',
    CONSTRAINT "PendingCourse_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PendingCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RemainingCourse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    CONSTRAINT "RemainingCourse_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RemainingCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_userName_key" ON "Student"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "Instructor_userName_key" ON "Instructor"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_userName_key" ON "Admin"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "CompletedCourse_studentId_courseId_key" ON "CompletedCourse"("studentId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "InProgressCourse_studentId_courseId_key" ON "InProgressCourse"("studentId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "PendingCourse_studentId_courseId_key" ON "PendingCourse"("studentId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "RemainingCourse_studentId_courseId_key" ON "RemainingCourse"("studentId", "courseId");
