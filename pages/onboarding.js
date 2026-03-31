import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { updateDoc, doc } from '../firebase/config';
import { Users, ArrowRight, ArrowLeft, Check, Loader2, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Onboarding() {
  const { user, refreshUserData } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleComplete = async () => {
    if (!displayName.trim()) {
      setError('Skriv inn et navn');
      return;
    }
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name: displayName.trim(),
        onboardingComplete: true,
      });
      
      await refreshUserData();
      toast.success('Velkommen til BioBin!');
      router.push(role === 'teacher' ? '/dashboard/teacher' : '/dashboard/student');
    } catch (err) {
      setError('Klarte ikke fullføre');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-bio-500 to-bio-700 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🌱</span>
          </div>
          <h1 className="font-700 text-white text-2xl">BioBin</h1>
          <p className="text-slate-400 mt-2">La oss komme i gang!</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1 rounded-full transition-all ${
                s === step ? 'bg-bio-500 w-8' : s < step ? 'bg-bio-500 w-4' : 'bg-slate-700 w-4'
              }`}
            />
          ))}
        </div>

        <div className="bio-card p-8">
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="font-700 text-white text-xl mb-6 text-center">Hvem er du?</h2>
              <div className="space-y-3">
                <button
                  onClick={() => handleRoleSelect('student')}
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-bio-500/10 hover:border-bio-500/30 transition-all flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-bio-500/20 flex items-center justify-center">
                    <Users size={24} className="text-bio-400" />
                  </div>
                  <div>
                    <div className="text-white font-600">Elev</div>
                    <div className="text-slate-500 text-sm">Jeg kaster matavfall</div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleRoleSelect('teacher')}
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-earth-500/10 hover:border-earth-500/30 transition-all flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-earth-500/20 flex items-center justify-center">
                    <BookOpen size={24} className="text-earth-400" />
                  </div>
                  <div>
                    <div className="text-white font-600">Lærer</div>
                    <div className="text-slate-500 text-sm">Jeg administrerer klasser</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6">
                <ArrowLeft size={16} /> Tilbake
              </button>
              
              <h2 className="font-700 text-white text-xl mb-2">Hva skal vi kalle deg?</h2>
              <p className="text-slate-400 mb-6">Skriv inn navnet ditt</p>
              
              <div className="mb-4">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="F.eks. Ola Nordmann"
                  className="bio-input w-full"
                  autoFocus
                />
              </div>
              
              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
              
              <button
                onClick={handleComplete}
                disabled={loading || !displayName.trim()}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <>Fullfør <Check size={18} /></>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
