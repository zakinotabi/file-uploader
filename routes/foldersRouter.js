import { Router } from 'express';
import * as folderController from '../controllers/folders.js';

const folderRouter = Router();

folderRouter.get('/', folderController.getFolders);
folderRouter.get('/shared/:id', folderController.getSharedFolder);
folderRouter.post('/share/:id', folderController.setFolderPublic);
folderRouter.get('/:id', folderController.getSingleFolder);
folderRouter.post('/add', folderController.setNewFolder);
folderRouter.post('/:id/rename', folderController.setFolderName);
folderRouter.post('/:id/delete', folderController.deleteFolder);

export default folderRouter;
