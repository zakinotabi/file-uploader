import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

export async function addUser(req, res) {
  // we get values of inputs from req
  const { username, name, password } = req.body;

  // hashing the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // creating the new user in the database using Prisma
  const user = await prisma.user.create({
    data: {
      username,
      name,
      password: hashedPassword,
      role: 'user',
    },
  });

  // for checking
  //   return res.status(201).json({
  //     message: 'User registered successfully',
  //     user: { id: user.id, username: user.username, name: user.name },
  //   });
}

export default router;
