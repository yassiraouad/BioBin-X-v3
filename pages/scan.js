import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/layout/Layout';
import { logWaste } from '../firebase/db';
import { useRouter } from 'next/router';
import { Scale, Check, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const FOOD_TYPES = [
  'Frukt & grønt',
  'Brød & bakst',
  'Meieriprodukter',
  'Kjøtt & fisk',
  'Tilberedt mat',
  'Annet'
];

export default function ScanPage() {
  const { user, userData, loading, refreshUserData } = useAuth();
  const router = useRouter();
  const [foodType, setFoodType] = useState(FOOD_TYPES[0]);
  const [weight, setWeight] = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading]);

  const handleSave = async () => {
    const weightNum = parseFloat(weight);
    if (!weight || isNaN(weightNum) || weightNum <= 0) {
      return toast.error('Skriv inn en gyldig vekt');
    }
    if (weightNum > 100) {
      return toast.error('Vekten kan ikke være over 100 kg');
    }

    setSaving(true);
    try {
      const data = await logWaste({
        userId: user.uid,
        weight: weightNum,
        classId: userData?.classId || null,
        foodType: foodType,
      });
      setResult({ weight: weightNum, foodType });
      await refreshUserData();
    } catch (err) {
      toast.error('Klarte ikke lagre');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-bio-500/30 border-t-bio-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (result) {
    return (
      <Layout>
        <div className="p-6 max-w-md mx-auto">
          <div className="bio-card p-8 text-center animate-slide-up">
            <div className="w-20 h-20 rounded-full bg-bio-500/20 border-2 border-bio-500 flex items-center justify-center mx-auto mb-6">
              <Check size={36} className="text-bio-400" />
            </div>
            <h2 className="font-700 text-white text-2xl mb-2">Registrert!</h2>
            <p className="text-slate-400 mb-6">
              {result.weight} kg {result.foodType.toLowerCase()}
            </p>
            <div className="flex gap-3">
              <button onClick={() => { setResult(null); setWeight(''); }} className="flex-1 py-3 rounded-xl border border-bio-border text-slate-300 hover:text-white transition-all">
                Ny registrering
              </button>
              <button onClick={() => router.push('/dashboard/student')} className="btn-primary flex-1">
                Tilbake
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-md mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 mb-6 hover:text-white">
          <ArrowLeft size={20} /> Tilbake
        </button>

        <h1 className="font-700 text-white text-2xl mb-6">Logg matavfall</h1>

        <div className="space-y-4">
          <div>
            <label className="text-slate-300 text-sm block mb-2">Type mat</label>
            <select
              value={foodType}
              onChange={e => setFoodType(e.target.value)}
              className="bio-input w-full"
            >
              {FOOD_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-300 text-sm block mb-2 flex items-center gap-2">
              <Scale size={14} /> Vekt (kg)
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="100"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="F.eks. 0.5"
              className="bio-input w-full text-lg"
              autoFocus
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !weight}
            className="btn-primary w-full py-4 text-base"
          >
            {saving ? 'Lagrer...' : 'Lagre'}
          </button>
        </div>
      </div>
    </Layout>
  );
}
