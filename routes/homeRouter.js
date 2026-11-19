import { Router } from 'express';
import * as homeController from '../controllers/home.js';
import * as signupController from '../controllers/signup.js';

const homeRouter = Router();

homeRouter.get('/', homeController.renderHome);
homeRouter.post('/signup', signupController.validateSignup, signupController.addUser);

export default homeRouter;
