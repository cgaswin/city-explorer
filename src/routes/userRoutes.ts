import { Router } from 'express';
import { login, signup, logout, getRecommendation } from '../controllers/userController.js';
import { isLoggedIn } from '../middlewares/userMiddleware.js';

const router: Router = Router();

router.route('/register').post(signup);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/recommendation').get(isLoggedIn, getRecommendation);

export default router;
