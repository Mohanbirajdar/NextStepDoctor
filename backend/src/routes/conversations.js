import { Router } from 'express';
import {
  listConversations,
  getConversation,
  deleteConversation,
  createConversation,
} from '../controllers/conversationController.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/', authRequired, listConversations);
router.post('/', authRequired, createConversation);
router.get('/:id', authRequired, getConversation);
router.delete('/:id', authRequired, deleteConversation);

export default router;
