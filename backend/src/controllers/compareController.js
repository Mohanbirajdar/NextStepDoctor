import { compareTreatments } from '../services/processing/comparisonEngine.js';

export async function compare(req, res, next) {
  try {
    const { disease, treatments, context } = req.body;
    if (!treatments || treatments.length < 2) {
      return res.status(400).json({ error: 'At least 2 treatments required' });
    }
    const result = await compareTreatments({ disease, treatments, context });
    res.json(result);
  } catch (err) {
    next(err);
  }
}
