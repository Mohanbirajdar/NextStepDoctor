import { Router } from 'express';
import { compare } from '../controllers/compareController.js';
import { chatLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/', chatLimiter, compare);

export default router;
