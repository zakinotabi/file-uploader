import { dlopen } from 'node:process';
import { prisma } from '../lib/prisma.js';

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
// we still need to add size for each folder to show <%= folder.totalSize %>
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
  });

  res.render('folders', { folders: folders });
}
export async function getSingleFolder(req, res) {
  const folder = await prisma.folder.findUnique({
    where: {
      id: Number(req.params.id),
      authorId: Number(res.locals.session.user.id),
    },
    include: {
      files: true,
    },
  });

  res.render('files', { folder: folder });
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
