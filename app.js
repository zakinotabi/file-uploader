import 'dotenv/config';

import express from 'express';
import session from 'express-session';
import expressEjsLayouts from 'express-ejs-layouts';

import homeRouter from './routes/homeRouter.js';
import { ExpressAuth } from '@auth/express';
import authConfig from './config/auth.js';
import callGetSession from './controllers/login.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(expressEjsLayouts);
// app.set('layout', 'layout');

app.use('/auth', ExpressAuth(authConfig));

app.use('/', callGetSession, homeRouter);
// app.use('/files', filesRouter);
// app.use('/', folderRouter);

app.listen(PORT, () => {
  console.log('running');
});
