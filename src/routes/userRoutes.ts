import { Router } from 'express';
import { login, signup, logout } from '../controllers/userController.js';

const router: Router = Router();

router.route('/register').post(signup);
router.route('/login').post(login);
router.route('/logout').get(logout);

export default router;
