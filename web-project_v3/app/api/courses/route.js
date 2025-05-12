import repo from "../../repo/database-repo";

export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const courses = await repo.getAllCourses(query)
    return Response.json(courses)
}



