import NodeCache from 'node-cache';
import { CACHE_TTL } from '../config/constants.js';

const cache = new NodeCache({ stdTTL: CACHE_TTL, checkperiod: 600 });

export default cache;
