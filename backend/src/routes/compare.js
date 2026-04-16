import { Router } from 'express';
import { compare } from '../controllers/compareController.js';
import { chatLimiter } from '../middleware/rateLimiter.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.post('/', authRequired, chatLimiter, compare);

export default router;
