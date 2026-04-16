import mongoose from 'mongoose';

const { Schema } = mongoose;

const scoreBreakdownSchema = new Schema({
  relevance: Number,
  recency: Number,
  citations: Number,
  sourceCredibility: Number,
}, { _id: false });

const publicationSchema = new Schema({
  title: String,
  authors: [String],
  year: Number,
  abstract: String,
  source: String,
  url: String,
  citations: Number,
  score: Number,
  scoreBreakdown: scoreBreakdownSchema,
  weights: Schema.Types.Mixed,
}, { _id: false });

const trialSchema = new Schema({
  title: String,
  status: String,
  eligibility: String,
  locations: [String],
  contacts: [String],
  url: String,
  score: Number,
  nctId: String,
  phase: String,
}, { _id: false });

const confidenceSchema = new Schema({
  score: Number,
  label: String,
  factors: Schema.Types.Mixed,
  explanation: String,
}, { _id: false });

const transparencySchema = new Schema({
  queryExpansions: [String],
  retrievalStats: Schema.Types.Mixed,
  totalRetrieved: Number,
  afterFiltering: Number,
  topScore: Number,
  model: String,
  totalTimeMs: Number,
}, { _id: false });

const followUpSchema = new Schema({
  icon: String,
  label: String,
  action: String,
}, { _id: false });

const messageSchema = new Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: String,
  structured: {
    conditionOverview: String,
    researchInsights: String,
    clinicalTrials: String,
    recommendations: String,
    sources: String,
  },
  publications: [publicationSchema],
  clinicalTrials: [trialSchema],
  confidence: confidenceSchema,
  analytics: Schema.Types.Mixed,
  transparency: transparencySchema,
  followUps: [followUpSchema],
  timestamp: { type: Date, default: Date.now },
});

const conversationSchema = new Schema({
  title: String,
  context: {
    disease: String,
    location: String,
    patientName: String,
    patientAge: Number,
    intentQuery: String,
    intentType: String,
  },
  messages: [messageSchema],
}, { timestamps: true });

export default mongoose.model('Conversation', conversationSchema);
