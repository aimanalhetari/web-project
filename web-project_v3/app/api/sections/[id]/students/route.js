import repo from "../../../../repo/database-repo";

export async function GET(request, { params }) {
    const sectionId = params.id;
    const students = await repo.getStudentsBySectionId(sectionId)
    return Response.json(students, { status: 200 });
}
