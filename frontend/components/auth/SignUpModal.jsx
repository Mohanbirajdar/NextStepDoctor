'use client';
import { useState } from 'react';
import { X } from 'lucide-react';
import { registerRequest } from '@/lib/api';
import useAuthStore from '@/store/authStore';

export default function SignUpModal({ open, onClose, onSwitch }) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [weight, setWeight] = useState('');
  const [location, setLocation] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [currentDisease, setCurrentDisease] = useState('');
  const [medications, setMedications] = useState('');
  const [allergies, setAllergies] = useState('');
  const [conditions, setConditions] = useState('');
  const [currentMeds, setCurrentMeds] = useState('');
  const [labValues, setLabValues] = useState('');
  const [consent, setConsent] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!consent) {
      setError('Consent is required');
      return;
    }
    setLoading(true);
    try {
      const data = await registerRequest({
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
      });
      setAuth(data.token, data.user);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center sm:items-start justify-center pt-10 sm:pt-20 px-3 sm:px-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-[96vw] sm:w-full max-w-md page-card rounded-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60"
          aria-label="Close"
        >
          <X size={14} />
        </button>
        <h1 className="text-xl font-semibold">Create account</h1>
        <p className="text-sm text-white/50 mt-1">Step {step} of 3</p>

        {error && <div className="mt-3 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {step === 1 && (
            <>
              <input
                type="text"
                placeholder="Name"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="number"
                placeholder="Age"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
              <input
                type="text"
                placeholder="Sex"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                value={sex}
                onChange={(e) => setSex(e.target.value)}
              />
              <input
                type="number"
                placeholder="Weight (kg)"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
              <input
                type="text"
                placeholder="Location"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg px-3 py-2"
              >
                Continue
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <textarea
                placeholder="Medical history (optional)"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm min-h-[80px]"
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
              />
              <input
                type="text"
                placeholder="Current disease"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                value={currentDisease}
                onChange={(e) => setCurrentDisease(e.target.value)}
              />
              <input
                type="text"
                placeholder="Conditions"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
              />
              <input
                type="text"
                placeholder="Medications / drugs"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
              />
              <input
                type="text"
                placeholder="Current meds"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                value={currentMeds}
                onChange={(e) => setCurrentMeds(e.target.value)}
              />
              <input
                type="text"
                placeholder="Allergies"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
              />
              <textarea
                placeholder="Lab values (optional)"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm min-h-[70px]"
                value={labValues}
                onChange={(e) => setLabValues(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-lg px-3 py-2"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg px-3 py-2"
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <input
                type="email"
                placeholder="Email"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label className="flex items-start gap-2 text-xs text-white/60">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                I consent to the use of my data for providing medical research assistance.
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-lg px-3 py-2"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg px-3 py-2"
                >
                  {loading ? 'Creating…' : 'Create account'}
                </button>
              </div>
            </>
          )}
        </form>

        <p className="text-xs text-white/40 mt-4">
          Have an account? <button onClick={onSwitch} className="text-emerald-400">Sign in</button>
        </p>
      </div>
    </div>
  );
}
