import { logger } from '../utils/logger.js';

export function requestLogger(req, res, next) {
  logger.info(`${req.method} ${req.path}`);
  next();
}
