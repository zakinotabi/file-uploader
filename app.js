import 'dotenv/config';

import express from 'express';
import session from 'express-session';

const app = express();
const PORT = process.env.PORT;

app.set('view engin', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log('running');
});
