import 'dotenv/config';

import Credentials from '@auth/express/providers/credentials';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';

const authConfig = {
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });

        if (!user) return null;

        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;

        return {
          id: user.id,
          name: user.name,
          username: user.username,
        };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    // puts the id and username into the session so you can use session.user.id and session.user.username
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.username = user.username;
      }
      return token;
    },

    session({ session, token }) {
      session.user.id = token.id;
      session.user.name = token.name ?? session.user?.name;
      session.user.username = token.username ?? session.user?.username;
      return session;
    },
  },

  secret: process.env.AUTH_SECRET,
  trustHost: true,
};

export default authConfig;
