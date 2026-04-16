import mongoose from 'mongoose';

const cachedSearchSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  results: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now, expires: 86400 }, // TTL 24h
});

export default mongoose.model('CachedSearch', cachedSearchSchema);
