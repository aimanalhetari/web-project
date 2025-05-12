import repo from "../../repo/database-repo";


export async function POST(request) {
  const { studentId, courseId, grade } = await request.json();

  if (!studentId || !courseId || !grade) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }

  try {
    const [deletedInProgress, addedCompleted] = await repo.completeCourse(studentId, courseId, grade);
    return Response.json({ message: "Course marked as completed", completedCourse: addedCompleted });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}



export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");
  const courseId = searchParams.get("courseId");

  if (!studentId || !courseId) {
    return new Response(JSON.stringify({ error: "Missing query parameters" }), { status: 400 });
  }

  try {
    const [deletedCompleted, addedInProgress] = await repo.revertCompletedToInProgress(studentId, courseId);
    return Response.json({
      message: "Completed course deleted and reverted to in-progress.",
      inProgressCourse: addedInProgress,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

