import repo from "../../repo/database-repo";


export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const userType = searchParams.get('userType')
    const userName = searchParams.get('userName')
    const password = searchParams.get('password')
    const user = await repo.getUserByCredentials(userType, userName, password)
    return Response.json(user)
}

