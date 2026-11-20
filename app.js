import 'dotenv/config';

import express from 'express';
import expressEjsLayouts from 'express-ejs-layouts';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ExpressAuth } from '@auth/express';
import authConfig from './config/auth.js';
import callGetSession from './controllers/login.js';

import homeRouter from './routes/homeRouter.js';
import filesRouter from './routes/filesRouter.js';
import folderRouter from './routes/foldersRouter.js';

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(expressEjsLayouts);
// app.set('layout', 'layout');

app.use('/auth', ExpressAuth(authConfig));

app.use('/', callGetSession, homeRouter);
app.use('/files', filesRouter);
app.use('/folders', folderRouter);

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`running on port ${PORT}`);
  });
}

export default app;
