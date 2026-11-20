import { dlopen } from 'node:process';
import { prisma } from '../lib/prisma.js';
import { formatFileSize } from './formatFileSize.js';

export async function setNewFolder(req, res) {
  if (!req.body.name) return res.status(400).send('No name');
  await prisma.folder.create({
    data: {
      folderName: req.body.name,
      authorId: Number(res.locals.session.user.id),
    },
  });

  res.redirect('/');
}

export async function getFolders(req, res) {
  const folders = await prisma.folder.findMany({
    where: {
      authorId: Number(res.locals.session.user.id),
    },
    include: {
      _count: {
        select: { files: true },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  res.render('folders', { folders: folders, pageStyle: 'folders' });
}
export async function getSingleFolder(req, res) {
  let files = await prisma.file.findMany({
    where: {
      folderId: Number(req.params.id),
      authorId: Number(res.locals.session.user.id),
    },
    include: {
      folder: {
        select: {
          folderName: true,
        },
      },
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
  const targetFolder = folders.find((folder) => folder.id === Number(req.params.id));
  const folderName = files[0]?.folder?.folderName || targetFolder.folderName || '';
  res.render('files', { files: files, folders: folders, currentFolder: folderName, pageStyle: 'files' });
}
export async function getSharedFolder(req, res) {
  const folder = await prisma.folder.findFirst({
    where: {
      id: Number(req.params.id),
      public: true,
    },
  });

  if (!folder) {
    return res.status(404).send('Shared folder not found');
  }

  let files = await prisma.file.findMany({
    where: {
      folderId: Number(req.params.id),
      public: true,
      folder: {
        is: {
          public: true,
        },
      },
    },
    include: {
      folder: {
        select: {
          folderName: true,
        },
      },
    },
  });

  files = files.map((file) => ({
    ...file,
    size: formatFileSize(file.size),
  }));

  res.render('sharedFiles', { layout: false, dashboard: false, shared: true, files: files, currentFolder: folder.folderName });
}
export async function setFolderPublic(req, res) {
  const folderId = Number(req.params.id);
  const isPublic = req.body.public === true || req.body.public === 'true';
  const authorId = Number(res.locals.session.user.id);

  const folder = await prisma.folder.findFirst({
    where: { id: folderId, authorId },
  });

  if (!folder) {
    return res.status(404).send('Folder not found');
  }

  await prisma.folder.update({
    where: { id: folderId },
    data: { public: isPublic },
  });

  await prisma.file.updateMany({
    where: { folderId, authorId },
    data: { public: isPublic },
  });

  res.redirect(req.get('Referrer') || '/');
}

export async function setFolderName(req, res) {
  if (!req.body.name) return res.status(400).send('No name');
  const folder = await prisma.folder.update({
    where: {
      id: Number(req.params.id),
      authorId: Number(res.locals.session.user.id),
    },
    data: {
      folderName: req.body.name,
    },
  });

  res.redirect('/folders');
}

export async function deleteFolder(req, res) {
  const folder = await prisma.folder.delete({
    where: {
      id: Number(req.params.id),
      authorId: Number(res.locals.session.user.id),
    },
  });

  res.redirect('/folders');
}
