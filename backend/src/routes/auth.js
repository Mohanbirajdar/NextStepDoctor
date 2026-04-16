import { Router } from 'express';
import { register, login, me, updateProfile } from '../controllers/authController.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authRequired, me);
router.put('/profile', authRequired, updateProfile);

export default router;
