import { getSession } from '@auth/express';
import authConfig from '../config/auth.js';
import { spaceUsed } from './sideBar.js';

export default async function callGetSession(req, res, next) {
  const hasSession = req.headers.cookie?.includes('authjs.session-token');
  res.locals.currentPath = req.path;

  if (hasSession) {
    res.locals.session = await getSession(req, authConfig);
    const results = await spaceUsed(res.locals.session.user.id);
    res.locals.spaceUsed = results.percent;
    res.locals.userStorage = results.used;
  } else {
    const loginFailed = req.query.error === 'CredentialsSignin';
    res.locals.loginError = loginFailed ? 'Invalid username or password. Please try again.' : null;
    res.locals.signupError = null;
    res.locals.spaceUsed = '15';
    res.locals.userStorage = '110 MB';
  }

  next();
}
