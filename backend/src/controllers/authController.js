import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signToken } from '../middleware/auth.js';

export async function register(req, res, next) {
  try {
    const {
      name,
      email,
      password,
      age,
      sex,
      weight,
      location,
      medicalHistory,
      currentDisease,
      conditions,
      medications,
      currentMeds,
      allergies,
      labValues,
      consent,
    } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    if (!consent) {
      return res.status(400).json({ error: 'Consent is required' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      age: age ? Number(age) : undefined,
      sex,
      weight: weight ? Number(weight) : undefined,
      location,
      medicalHistory,
      currentDisease,
      conditions,
      medications,
      currentMeds,
      allergies,
      labValues,
      consent: Boolean(consent),
    });

    const token = signToken(user);
    return res.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        age: user.age,
        sex: user.sex,
        weight: user.weight,
        location: user.location,
        medicalHistory: user.medicalHistory,
        currentDisease: user.currentDisease,
        conditions: user.conditions,
        medications: user.medications,
        currentMeds: user.currentMeds,
        allergies: user.allergies,
        labValues: user.labValues,
        consent: user.consent,
      },
    });
  } catch (err) {
    return next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken(user);
    return res.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        age: user.age,
        sex: user.sex,
        weight: user.weight,
        location: user.location,
        medicalHistory: user.medicalHistory,
        currentDisease: user.currentDisease,
        conditions: user.conditions,
        medications: user.medications,
        currentMeds: user.currentMeds,
        allergies: user.allergies,
        labValues: user.labValues,
        consent: user.consent,
      },
    });
  } catch (err) {
    return next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        age: user.age,
        sex: user.sex,
        weight: user.weight,
        location: user.location,
        medicalHistory: user.medicalHistory,
        currentDisease: user.currentDisease,
        conditions: user.conditions,
        medications: user.medications,
        currentMeds: user.currentMeds,
        allergies: user.allergies,
        labValues: user.labValues,
        consent: user.consent,
      },
    });
  } catch (err) {
    return next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { name, age, sex, weight, location, medicalHistory, currentDisease, conditions, medications, currentMeds, allergies, labValues } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        ...(name !== undefined ? { name } : {}),
        ...(age !== undefined ? { age: age ? Number(age) : null } : {}),
        ...(sex !== undefined ? { sex } : {}),
        ...(weight !== undefined ? { weight: weight ? Number(weight) : null } : {}),
        ...(location !== undefined ? { location } : {}),
        ...(medicalHistory !== undefined ? { medicalHistory } : {}),
        ...(currentDisease !== undefined ? { currentDisease } : {}),
        ...(conditions !== undefined ? { conditions } : {}),
        ...(medications !== undefined ? { medications } : {}),
        ...(currentMeds !== undefined ? { currentMeds } : {}),
        ...(allergies !== undefined ? { allergies } : {}),
        ...(labValues !== undefined ? { labValues } : {}),
      },
      { new: true },
    ).lean();

    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        age: user.age,
        sex: user.sex,
        weight: user.weight,
        location: user.location,
        medicalHistory: user.medicalHistory,
        currentDisease: user.currentDisease,
        conditions: user.conditions,
        medications: user.medications,
        currentMeds: user.currentMeds,
        allergies: user.allergies,
        labValues: user.labValues,
        consent: user.consent,
      },
    });
  } catch (err) {
    return next(err);
  }
}
