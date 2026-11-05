import 'dotenv/config';

import express from 'express';
import session from 'express-session';
import expressEjsLayouts from 'express-ejs-layouts';

import homeRouter from './routes/homeRouter.js';
// import filesRouter from './routes/filesRouter';
// import folderRouter from './routes/foldersRouter';

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(expressEjsLayouts);
// app.set('layout', 'layout');

app.use('/', homeRouter);
// app.use('/', filesRouter);
// app.use('/', folderRouter);

app.listen(PORT, () => {
  console.log('running');
});
