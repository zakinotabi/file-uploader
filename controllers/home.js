import { prisma } from '../lib/prisma.js';

export async function renderHome(req, res) {
  function convertSize(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 Bytes';

    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / 1024 ** unitIndex;
    const digits = value >= 10 || unitIndex === 0 ? 0 : 1;

    return `${value.toFixed(digits)} ${units[unitIndex]}`;
  }

  let folders, files, userStorage;
  if (res.locals.session?.user.id) {
    folders = await prisma.folder.findMany({
      where: { authorId: Number(res.locals.session.user.id) },
      include: { files: true },
      orderBy: { createdAt: 'desc' },
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
    userStorage = await prisma.file.aggregate({
      where: {
        authorId: Number(res.locals.session.user.id),
      },
      _sum: {
        size: true,
      },
    });

    files = files.map((file) => ({
      ...file,
      size: convertSize(file.size),
    }));
    userStorage._sum.size = convertSize(userStorage._sum.size ?? 0);
  }
  // const user = res.locals.user;
  res.render('dashboard', { folders: folders, files: files, userStorage: userStorage });
}
