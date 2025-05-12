import repo from "../../repo/database-repo";



export async function GET(request) {
    const students = await repo.getAllStudents();
    return Response.json(students);
}


