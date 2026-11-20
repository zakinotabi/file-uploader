import multer from 'multer';
import crypto from 'node:crypto';
import { prisma } from '../lib/prisma.js';
import { supabase, BUCKET } from '../supabase.js';
import { formatFileSize } from './formatFileSize.js';

// const storage = multer.diskStorage({
//   // WHERE to save the file

//   destination: 'public/upload',
//   // WHAT to name the file on disk
//   filename: function (req, file, cb) {
//     crypto.randomBytes(16, function (err, raw) {
//       if (err) return cb(err);
//       cb(null, file.fieldname + '-' + raw.toString('hex'));
//     });
//   },
// });

// Export it so routes can use it as middleware
// Keep the file in memory instead of saving it to disk
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB, the free tier max
});

export async function saveFileInDb(req, res) {
  if (!req.file || !req.body.folderId) return res.status(400).send('data lack');

  const userId = Number(res.locals.session.user.id);

  // Unique path inside the bucket (no original name, so no weird characters)
  const storageKey = `${userId}/${crypto.randomBytes(16).toString('hex')}`;

  const { error } = await supabase.storage.from(BUCKET).upload(storageKey, req.file.buffer, {
    contentType: req.file.mimetype,
  });

  if (error) {
    console.error(error);
    return res.status(500).send('Upload failed');
  }

  await prisma.file.create({
    data: {
      fileName: req.file.originalname,
      storageKey,
      mimeType: req.file.mimetype,
      size: Number(req.file.size),
      folderId: Number(req.body.folderId),
      authorId: userId,
    },
  });

  res.redirect('/');
}

export async function getfiles(req, res) {
  let files = await prisma.file.findMany({
    where: {
      authorId: Number(res.locals.session.user.id),
    },
    include: {
      folder: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  files = files.map((file) => ({
    ...file,
    size: formatFileSize(file.size),
  }));

  const folders = await prisma.folder.findMany({
    where: {
      authorId: Number(res.locals.session.user.id),
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  res.render('files', { files, folders, pageStyle: 'files' });
}
export async function getsharedfile(req, res) {
  let file = await prisma.file.findFirst({
    where: {
      id: Number(req.params.id),
      public: true,
    },
    include: {
      folder: true,
      author: true,
    },
  });

  if (!file) {
    return res.status(404).send('Shared file not found');
  }

  file.size = formatFileSize(file.size);

  res.render('sharedFiles', {
    layout: false,
    dashboard: false,
    shared: true,
    files: [file],
    currentFolder: file.folder?.folderName || '',
  });
}
export async function setFilePublic(req, res) {
  const fileId = Number(req.params.id);
  const isPublic = req.body.public === true || req.body.public === 'true';

  const file = await prisma.file.findFirst({
    where: {
      id: fileId,
      authorId: Number(res.locals.session.user.id),
    },
  });

  if (!file) {
    return res.status(404).send('File not found');
  }

  await prisma.file.update({
    where: {
      id: fileId,
      authorId: Number(res.locals.session.user.id),
    },
    data: { public: isPublic },
  });

  // Only matters if the file lives in a folder
  if (file.folderId) {
    // Is any file in THIS folder still public?
    const publicFile = await prisma.file.findFirst({
      where: {
        folderId: file.folderId,
        authorId: Number(res.locals.session.user.id),
        public: true,
      },
    });

    await prisma.folder.update({
      where: {
        id: file.folderId,
        authorId: Number(res.locals.session.user.id),
      },
      data: { public: Boolean(publicFile) },
    });
  }

  res.redirect(req.get('Referrer') || '/');
}

export async function downloadFile(req, res) {
  const userId = Number(res.locals.session?.user?.id) || null;
  const fileId = Number(req.params.id);

  const file = await prisma.file.findFirst({
    where: userId ? { id: fileId, authorId: userId } : { id: fileId, public: true },
  });

  if (!file) {
    return res.status(404).send('File not found');
  }

  // old
  // 2. Get the physical file path on the server
  // const filePath = path.join(process.cwd(), 'public', 'upload', file.storageKey);

  // 3. Send the file to the browser with its original name
  // res.download(filePath, file.fileName);

  // Temporary link, valid for 60 seconds
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(file.storageKey, 60, { download: file.fileName });

  if (error) {
    console.error(error);
    return res.status(500).send('Could not get file');
  }

  res.redirect(data.signedUrl);
}

export async function deleteFile(req, res) {
  const userId = Number(res.locals.session.user.id);

  const file = await prisma.file.findFirst({
    where: { id: Number(req.params.id), authorId: userId },
  });

  if (!file) return res.status(404).send('File not found');

  // Remove from the bucket first, then from the database
  const { error } = await supabase.storage.from(BUCKET).remove([file.storageKey]);
  if (error) console.error(error);

  await prisma.file.delete({ where: { id: file.id } });

  res.redirect(req.get('Referrer') || '/');
}

export async function getSharedFiles(req, res) {
  if (!res.locals.session?.user?.id) {
    return res.redirect('/');
  }

  let files = await prisma.file.findMany({
    where: {
      authorId: Number(res.locals.session.user.id),
      public: true,
    },
    include: {
      folder: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  files = files.map((file) => ({
    ...file,
    size: formatFileSize(file.size),
  }));

  const folders = await prisma.folder.findMany({
    where: {
      authorId: Number(res.locals.session.user.id),
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  res.render('files', {
    files,
    folders,
    sharedCollection: true,
    pageStyle: 'files',
  });
}
