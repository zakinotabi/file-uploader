import { prisma } from '../lib/prisma.js';

export async function renderHome(req, res) {
  const folders = await prisma.folder.findMany({
    where: { authorId: Number(res.locals.session.user.id) },
    include: { files: true },
    orderBy: { createdAt: 'desc' },
  });
  // const user = res.locals.user;
  res.render('dashboard', { folders: folders });
}
