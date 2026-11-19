import { prisma } from '../lib/prisma.js';
import { formatFileSize } from './formatFileSize.js';

export async function renderHome(req, res) {
  let folders, files;

  if (res.locals.session?.user.id) {
    folders = await prisma.folder.findMany({
      where: { authorId: Number(res.locals.session.user.id) },
      include: { files: true },
      orderBy: { createdAt: 'asc' },
    });
    files = await prisma.file.findMany({
      where: {
        authorId: Number(res.locals.session.user.id),
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
  }
  // const user = res.locals.user;
  res.render('dashboard', { folders: folders, files: files });
}
