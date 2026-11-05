import { Router } from 'express';
// import * as

const folderRouter = Router();

folderRouter.get('/' /* folderController */);
folderRouter.get('/all' /* folderController */);
folderRouter.get('/:id' /* folderController */);
folderRouter.post('/add' /* folderController */);
folderRouter.post('/edit' /* folderController */);
folderRouter.post('/delete' /* folderController */);

export default folderRouter;
