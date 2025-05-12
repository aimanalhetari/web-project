import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import AdminRepository from "../../../repo/admin-repo";

export const options = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username:', type: 'text', placeholder: "your-cool-username" },
        password: { label: 'Password:', type: 'password', placeholder: "your-awesome-password" },
      },
      async authorize(credentials) {
        const admin = await AdminRepository.validateCredentials(
          credentials.username,
          credentials.password
        );

        if (!admin) return null;

        return {
          id: admin.id.toString(),
          name: admin.userName,
        };
      },
    }),
  ],
};