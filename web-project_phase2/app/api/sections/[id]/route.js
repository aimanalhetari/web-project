import repo from "../../../repo/database-repo";

export async function PUT(request, { params }) {
     const sectionId = params.id;
    const section = await request.json();
    const updatedSection = await repo.updateSection(sectionId, section);
    return Response.json(updatedSection);
}