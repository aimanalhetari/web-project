import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


class AdminRepo {

    async findByUsername(username) {
        return await prisma.admin.findUnique({
        where: { userName: username },
        });
    }

    async validateCredentials(username, password) {
        const admin = await this.findByUsername(username);
        if (!admin) return null;

        const isValid = password === admin.password; // You may hash this later
        return isValid ? admin : null;
    }
}

export default new AdminRepo();