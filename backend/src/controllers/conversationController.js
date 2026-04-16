import * as contextManager from '../services/contextManager.js';

export async function listConversations(req, res, next) {
  try {
    const conversations = await contextManager.listConversations(req.user.id);
    res.json({ conversations });
  } catch (err) {
    next(err);
  }
}

export async function getConversation(req, res, next) {
  try {
    const conv = await contextManager.getConversation(req.params.id, req.user.id);
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });
    res.json({ conversation: conv });
  } catch (err) {
    next(err);
  }
}

export async function deleteConversation(req, res, next) {
  try {
    await contextManager.deleteConversation(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function createConversation(req, res, next) {
  try {
    const { context, title } = req.body;
    const conv = await contextManager.getOrCreateConversation(null, context, title || 'New Conversation', req.user.id);
    res.json({ conversation: conv });
  } catch (err) {
    next(err);
  }
}
