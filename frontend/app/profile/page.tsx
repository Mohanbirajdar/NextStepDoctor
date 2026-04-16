'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchMe, updateProfileRequest } from '@/lib/api';
import useAuthStore from '@/store/authStore';

export default function ProfilePage() {
  const router = useRouter();
  const { token, user, setAuth, clearAuth } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age ? String(user.age) : '');
  const [location, setLocation] = useState(user?.location || '');
  const [medicalHistory, setMedicalHistory] = useState(user?.medicalHistory || '');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!token) {
      router.push('/auth/sign-in');
      return;
    }
    fetchMe()
      .then((u) => {
        setAuth(token, u);
        setName(u.name || '');
        setAge(u.age ? String(u.age) : '');
        setLocation(u.location || '');
        setMedicalHistory(u.medicalHistory || '');
      })
      .catch(() => {});
  }, [token, router, setAuth]);

  const handleSave = async () => {
    setLoading(true);
    setStatus('');
    try {
      const updated = await updateProfileRequest({ name, age, location, medicalHistory });
      setAuth(token, updated);
      setStatus('Profile updated');
    } catch (err: any) {
      setStatus(err?.response?.data?.error || err?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  return (
    <div className="min-h-screen text-white flex items-center justify-center px-4 page-shell page-enter">
      <div className="w-full max-w-xl page-card rounded-2xl p-6">
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

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
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
            placeholder="Location"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm md:col-span-2"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <textarea
            placeholder="Medical history"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm min-h-[90px] md:col-span-2"
            value={medicalHistory}
            onChange={(e) => setMedicalHistory(e.target.value)}
          />
        </div>

        <div className="mt-5 flex items-center gap-2">
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
