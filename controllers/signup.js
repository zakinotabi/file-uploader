import express from 'express';
import bcrypt from 'bcryptjs';
import { encode } from '@auth/core/jwt';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma.js';

const router = express.Router();
const SESSION_COOKIE_NAME = 'authjs.session-token';

export const validateSignup = [
  body('name').trim().notEmpty().withMessage('Full name is required.'),
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters.')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores.')
    .custom((value) => {
      const reservedNames = ['admin', 'administrator', 'root', 'superuser', 'moderator', 'support', 'system'];

      return !reservedNames.includes(value.toLowerCase());
    })
    .withMessage('This username is reserved. Please choose another one.'),
  body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters.'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match.'),
  body('terms').equals('on').withMessage('You must agree to the terms of service.'),
];

export async function addUser(req, res) {
  const errors = validationResult(req);
  res.locals.signupError = {};
  if (!errors.isEmpty()) {
    for (const err of errors.array()) {
      res.locals.signupError[err.path] = err.msg;
    }
    return res.render('dashboard', { folders: [], files: [] });
  }

  const { username, name, password } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { username: username.trim() },
  });

  if (existingUser) {
    res.locals.signupError.username = 'That username is already taken.';
    return res.render('dashboard', { folders: [], files: [] });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username: username.trim(),
      name: name.trim(),
      password: hashedPassword,
      role: 'user',
      folders: {
        create: {
          folderName: 'My files',
          isRoot: true,
        },
      },
    },
  });

  const sessionToken = await encode({
    secret: process.env.AUTH_SECRET,
    salt: SESSION_COOKIE_NAME,
    token: {
      id: user.id,
      name: user.name,
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
