import { Router } from 'express';
import * as filesController from '../controllers/files.js';

const filesRouter = Router();

filesRouter.get('/', filesController.getfiles);
filesRouter.post('/upload', filesController.upload.single('file'), filesController.saveFileInDb);
filesRouter.get('/shared/:id', filesController.getsharedfile);
filesRouter.post('/:id/download', filesController.downloadFile);
filesRouter.post('/:id/delete', filesController.deleteFile);

export default filesRouter;
