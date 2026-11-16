import express from 'express';
import bcrypt from 'bcryptjs';
import { encode } from '@auth/core/jwt';
import { prisma } from '../lib/prisma.js';

const router = express.Router();
const SESSION_COOKIE_NAME = 'authjs.session-token';

export async function addUser(req, res) {
  // we get values of inputs from req
  const { username, name, password } = req.body;

  // hashing the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // creating the new user and a default "my files" folder in the database
  const user = await prisma.user.create({
    data: {
      username,
      name,
      password: hashedPassword,
      role: 'user',
      folders: {
        create: {
          folderName: 'My files',
        },
      },
    },
  });

  const sessionToken = await encode({
    secret: process.env.AUTH_SECRET,
    salt: SESSION_COOKIE_NAME,
    token: {
      id: user.id,
      name: user.username,
      username: user.username,
    },
    maxAge: 30 * 24 * 60 * 60,
  });

  res.cookie(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: false,
  });

  return res.redirect('/');
}

export default router;
