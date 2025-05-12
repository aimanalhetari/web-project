import repo from "../../repo/database-repo";

export async function POST(request) {
  const { studentId, courseId } = await request.json();

  if (!studentId || !courseId) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }

  try {
    const [deletedPending, addedInProgress] = await repo.promotePendingToInProgress(studentId, courseId);
    return Response.json({
      message: "Pending course promoted to in-progress",
      inProgressCourse: addedInProgress,
    });
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
    const [deletedInProgress, addedPending] = await repo.revertInProgressToPending(studentId, courseId);
    return Response.json({
      message: "Course reverted to pending",
      pendingCourse: addedPending,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

