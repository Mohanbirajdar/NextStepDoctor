'use client';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { fetchMe, updateProfileRequest } from '@/lib/api';
import useAuthStore from '@/store/authStore';

export default function ProfileModal({ open, onClose }) {
  const { token, user, setAuth, clearAuth } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age ? String(user.age) : '');
  const [sex, setSex] = useState(user?.sex || '');
  const [weight, setWeight] = useState(user?.weight ? String(user.weight) : '');
  const [location, setLocation] = useState(user?.location || '');
  const [medicalHistory, setMedicalHistory] = useState(user?.medicalHistory || '');
  const [currentDisease, setCurrentDisease] = useState(user?.currentDisease || '');
  const [conditions, setConditions] = useState(user?.conditions || '');
  const [medications, setMedications] = useState(user?.medications || '');
  const [currentMeds, setCurrentMeds] = useState(user?.currentMeds || '');
  const [allergies, setAllergies] = useState(user?.allergies || '');
  const [labValues, setLabValues] = useState(user?.labValues || '');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!open || !token) return;
    fetchMe()
      .then((u) => {
        setAuth(token, u);
        setName(u.name || '');
        setAge(u.age ? String(u.age) : '');
        setSex(u.sex || '');
        setWeight(u.weight ? String(u.weight) : '');
        setLocation(u.location || '');
        setMedicalHistory(u.medicalHistory || '');
        setCurrentDisease(u.currentDisease || '');
        setConditions(u.conditions || '');
        setMedications(u.medications || '');
        setCurrentMeds(u.currentMeds || '');
        setAllergies(u.allergies || '');
        setLabValues(u.labValues || '');
      })
      .catch(() => {});
  }, [open, token, setAuth]);

  if (!open) return null;

  const handleSave = async () => {
    setLoading(true);
    setStatus('');
    try {
      const updated = await updateProfileRequest({
        name,
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
      });
      setAuth(token, updated);
      setStatus('Profile updated');
    } catch (err) {
      setStatus(err?.response?.data?.error || err?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4 sm:px-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-xl page-card rounded-2xl p-5 sm:p-6 max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60"
          aria-label="Close"
        >
          <X size={14} />
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Profile</h1>
            <p className="text-sm text-white/50 mt-1">Update your onboarding details.</p>
          </div>
          <div className="text-xs text-white/40">{user?.email}</div>
        </div>

        {status && (
          <div className="mt-3 text-sm text-white/70 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            {status}
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm sm:col-span-2"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <input
            type="text"
            placeholder="Current disease"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm sm:col-span-2"
            value={currentDisease}
            onChange={(e) => setCurrentDisease(e.target.value)}
          />
          <input
            type="text"
            placeholder="Conditions"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm sm:col-span-2"
            value={conditions}
            onChange={(e) => setConditions(e.target.value)}
          />
          <input
            type="text"
            placeholder="Medications / drugs"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm sm:col-span-2"
            value={medications}
            onChange={(e) => setMedications(e.target.value)}
          />
          <input
            type="text"
            placeholder="Current meds"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm sm:col-span-2"
            value={currentMeds}
            onChange={(e) => setCurrentMeds(e.target.value)}
          />
          <input
            type="text"
            placeholder="Allergies"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm sm:col-span-2"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
          />
          <textarea
            placeholder="Lab values"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm min-h-[70px] sm:col-span-2"
            value={labValues}
            onChange={(e) => setLabValues(e.target.value)}
          />
          <textarea
            placeholder="Medical history"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm min-h-[90px] sm:col-span-2"
            value={medicalHistory}
            onChange={(e) => setMedicalHistory(e.target.value)}
          />
        </div>

        <div className="mt-5 flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium"
          >
            {loading ? 'Saving…' : 'Save changes'}
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
