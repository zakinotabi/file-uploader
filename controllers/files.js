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

// back later we need to have a root folder, fix ejs select folder then back here
export async function saveFileInDb(req, res) {
  if (!req.file) return res.status(400).send('No file');
  await prisma.file.create({
    data: {
      fileName: req.file.originalname,
      storageKey: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      authorId: res.locals.session.user.id,
    },
  });

  res.redirect('/');
}
