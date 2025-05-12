import repo from "../../../../repo/database-repo";

export async function GET(request, { params }) {
    const courseId = params.id;
    const sections = await repo.getSectionByCourseId(courseId)
    return Response.json(sections, { status: 200 });
}
