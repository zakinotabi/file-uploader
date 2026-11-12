import { getSession } from '@auth/express';
import authConfig from '../config/auth.js';

export default async function callGetSession(req, res, next) {
  const hasSession = req.headers.cookie?.includes('authjs.session-token');
  if (hasSession) {
    res.locals.session = await getSession(req, authConfig);
  }
  next();
}
