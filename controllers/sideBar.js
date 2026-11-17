import { prisma } from '../lib/prisma.js';
import { formatFileSize } from './formatFileSize.js';

export async function spaceUsed(id) {
  let storageUsed;
  if (id) {
    // folders = await prisma.folder.findMany({
    //   where: { authorId: Number(res.locals.session.user.id) },
    //   include: { files: true },
    //   orderBy: { createdAt: 'asc' },
    // });
    // files = await prisma.file.findMany({
    //   where: {
    //     authorId: Number(res.locals.session.user.id),
    //   },
    //   include: {
    //     folder: true,
    //   },
    //   orderBy: {
    //     createdAt: 'desc',
    //   },
    // });
    storageUsed = await prisma.file.aggregate({
      where: {
        authorId: Number(id),
      },
      _sum: {
        size: true,
      },
    });

    const formatStorageUsed = formatFileSize(storageUsed._sum.size ?? 0);

    let calculated = (storageUsed._sum.size ?? 0 * 100) / 500000000;
    if (calculated > 0.0 && calculated < 0.01) {
      calculated = '0.01';
    } else {
      calculated = calculated.toFixed(2);
    }
    return { percent: calculated, used: formatStorageUsed };
  }
}
