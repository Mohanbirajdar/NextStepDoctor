import { Router } from 'express';
import {
  listConversations,
  getConversation,
  deleteConversation,
  createConversation,
} from '../controllers/conversationController.js';

const router = Router();

router.get('/', listConversations);
router.post('/', createConversation);
router.get('/:id', getConversation);
router.delete('/:id', deleteConversation);

export default router;
