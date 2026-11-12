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

        return { id: user.id, name: user.username };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    // puts the id into the session so you can use session.user.id
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },

    session({ session, token }) {
      session.user.id = token.id;
      return session;
    },
  },

  secret: process.env.AUTH_SECRET,
  trustHost: true,
};

export default authConfig;
