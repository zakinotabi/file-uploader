import { Router } from 'express';
import * as homeController from '../controllers/home.js';

const homeRouter = Router();

homeRouter.get('/', homeController.renderHome);

export default homeRouter;
