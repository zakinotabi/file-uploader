import { Router } from 'express';
import * as filesController from '../controllers/files.js';

const filesRouter = Router();

// filesRouter.get('/' /* filesController */);
// filesRouter.post('/upload', filesController.upload.single('file'), filesController.saveFileInDb);
// filesRouter.post('/show' /* filesController */);
// filesRouter.post('/download' /* filesController */);
// filesRouter.post('/delete' /* filesController */);

export default filesRouter;
