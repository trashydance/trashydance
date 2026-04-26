import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import FortyTwoProvider from "next-auth/providers/42-school";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      
      name: "Email:",
      
      credentials: {
        email: { label: "Email", type: "email", placeholder: "mario@bros.com" },
        password: { label: "Password", type: "password" }
      },
      
      // autorizzo utente verificando la password criptata nel database
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        // cerco l'utente nel DB
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        // utente non esiste o non ha una password o registrato tramite 42
        if (!user || !user.password) {
          return null;
        }

        // confrontto  password inserita con hash e salt salvati nel DB
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        // Se password è valida, ritorno l'utente reale
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image
        };
      }
    }),
    FortyTwoProvider({
      clientId: process.env.FORTYTWO_CLIENT_ID as string,
      clientSecret: process.env.FORTYTWO_CLIENT_SECRET as string,
    })
  ],
  // Configurazione extra per i token
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Ignora errore TypeScript
        (session.user as any).id = token.id; 
      }
      return session;
    }
  },
  // Disabilita messaggi errore
  debug: true,
});

export { handler as GET, handler as POST };