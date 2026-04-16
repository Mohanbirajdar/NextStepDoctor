import { Router } from 'express';
import { streamChat } from '../controllers/streamController.js';
import { chatLimiter } from '../middleware/rateLimiter.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.post('/stream', authRequired, chatLimiter, streamChat);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
