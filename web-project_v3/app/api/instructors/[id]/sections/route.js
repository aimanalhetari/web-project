import repo from "../../../../repo/database-repo";

export async function GET(request, { params }) {
    const instructorId = params.id;
    const sections = await repo.getSectionsByInstructorId(instructorId)
    return Response.json(sections, { status: 200 });
}
