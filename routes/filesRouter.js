import { Router } from 'express';
// import * as

const filesRouter = Router();

filesRouter.get('/' /* filesController */);
filesRouter.post('/show' /* filesController */);
filesRouter.post('/download' /* filesController */);
filesRouter.post('/delete' /* filesController */);

export default filesRouter;
