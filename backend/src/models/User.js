import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  age: { type: Number },
  sex: { type: String, trim: true },
  weight: { type: Number },
  location: { type: String, trim: true },
  medicalHistory: { type: String, trim: true },
  currentDisease: { type: String, trim: true },
  conditions: { type: String, trim: true },
  medications: { type: String, trim: true },
  currentMeds: { type: String, trim: true },
  allergies: { type: String, trim: true },
  labValues: { type: String, trim: true },
  consent: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
