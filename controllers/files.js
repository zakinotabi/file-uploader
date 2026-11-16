import multer from 'multer';
import crypto from 'node:crypto';
import path from 'node:path';
import { prisma } from '../lib/prisma.js';

const storage = multer.diskStorage({
  // WHERE to save the file

  destination: 'public/upload',
  // WHAT to name the file on disk
  filename: function (req, file, cb) {
    crypto.randomBytes(16, function (err, raw) {
      if (err) return cb(err);
      cb(null, file.fieldname + '-' + raw.toString('hex'));
    });
  },
});

// Export it so routes can use it as middleware
export const upload = multer({ storage });

// back later we need to have a root folder,
export async function saveFileInDb(req, res) {
  if (!req.file || !req.body.folderId) return res.status(400).send('data lack');

  await prisma.file.create({
    data: {
      fileName: req.file.originalname,
      storageKey: req.file.filename,
      mimeType: req.file.mimetype,
      size: Number(req.file.size),
      folderId: Number(req.body.folderId),
      authorId: Number(res.locals.session.user.id),
    },
  });

  res.redirect('/');
}

export async function getfiles(req, res) {
  const [files, folders] = await Promise.all([
    prisma.file.findMany({
      where: {
        authorId: Number(res.locals.session.user.id),
      },
      include: {
        folder: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.folder.findMany({
      where: {
        authorId: Number(res.locals.session.user.id),
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
  ]);

  res.render('files', { files, folders });
}

export async function downloadFile(req, res) {
  // 1. Get the file record from the database using Prisma
  const file = await prisma.file.findUnique({
    where: {
      id: Number(req.params.id),
      authorId: Number(res.locals.session.user.id),
    },
  });

  // 2. Get the physical file path on the server
  const filePath = path.join(process.cwd(), 'public', 'upload', file.storageKey);

  // 3. Send the file to the browser with its original name
  res.download(filePath, file.fileName);
}

export async function deleteFile(req, res) {
  const folder = await prisma.folder.delete({
    where: {
      id: Number(req.params.id),
      authorId: Number(res.locals.session.user.id),
    },
  });

  res.redirect('/files');
}
