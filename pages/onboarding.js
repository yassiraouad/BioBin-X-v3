import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { updateDoc, doc, getDoc } from '../firebase/config';
import { Users, ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Onboarding() {
  const { user, refreshUserData } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [classCode, setClassCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleClassJoin = async () => {
    if (!classCode.trim()) {
      setError('Skriv inn en klassekode');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { getClassByCode } = await import('../firebase/db');
      const cls = await getClassByCode(classCode.trim());
      if (!cls) {
        setError('Ukjent klassekode');
        setLoading(false);
        return;
      }
      
      await updateDoc(doc(db, 'users', user.uid), {
        classId: cls.id,
        role: role,
      });
      
      await refreshUserData();
      setStep(3);
    } catch (err) {
      console.error('Error joining class:', err);
      setError('Klarte ikke bli med i klasse');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = () => {
    setStep(3);
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
      toast.success('Velkommen til BioBin X! 🎉');
      router.push(role === 'teacher' ? '/dashboard/teacher' : '/dashboard/student');
    } catch (err) {
      console.error('Error completing onboarding:', err);
      setError('Klarte ikke fullføre oppsett');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-bio-500 to-bio-700 flex items-center justify-center mx-auto mb-4 bio-glow">
            <span className="text-3xl">🌱</span>
          </div>
          <h1 className="font-display font-700 text-white text-2xl">BioBin X</h1>
          <p className="text-slate-400 font-body mt-2">La oss komme i gang!</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full transition-all ${
                s === step ? 'bg-bio-500 w-8' : s < step ? 'bg-bio-500' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        <div className="bio-card p-8">
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="font-display font-700 text-white text-xl mb-6 text-center">Hvem er du?</h2>
              <div className="space-y-3">
                <button
                  onClick={() => handleRoleSelect('student')}
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-bio-500/10 hover:border-bio-500/30 transition-all flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-bio-500/20 flex items-center justify-center">
                    <Users size={24} className="text-bio-400" />
                  </div>
                  <div>
                    <div className="text-white font-body font-600">Elev</div>
                    <div className="text-slate-500 text-sm">Jeg kaster matavfall på skolen</div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleRoleSelect('teacher')}
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-earth-500/10 hover:border-earth-500/30 transition-all flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-earth-500/20 flex items-center justify-center">
                    <span className="text-xl">👨‍🏫</span>
                  </div>
                  <div>
                    <div className="text-white font-body font-600">Lærer</div>
                    <div className="text-slate-500 text-sm">Jeg administrerer klasser og bøtter</div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleRoleSelect('parent')}
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-moss-500/10 hover:border-moss-500/30 transition-all flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-moss-500/20 flex items-center justify-center">
                    <span className="text-xl">👨‍👩‍👧</span>
                  </div>
                  <div>
                    <div className="text-white font-body font-600">Forelder</div>
                    <div className="text-slate-500 text-sm">Jeg vil følge barnets aktivitet</div>
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
              
              {role === 'teacher' ? (
                <>
                  <h2 className="font-display font-700 text-white text-xl mb-2">Opprett eller velg klasse</h2>
                  <p className="text-slate-400 font-body mb-6">Har du allerede en klasse? Bli med med kode.</p>
                  
                  <div className="mb-4">
                    <label className="text-slate-300 text-sm font-body block mb-2">Bli med i klasse med kode</label>
                    <input
                      type="text"
                      value={classCode}
                      onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                      placeholder="F.eks. ABC123"
                      className="bio-input text-center text-xl font-mono tracking-widest"
                    />
                  </div>
                  
                  {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                  
                  <button
                    onClick={handleClassJoin}
                    disabled={loading}
                    className="btn-primary w-full mb-4 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <>Bli med <ArrowRight size={18} /></>}
                  </button>
                  
                  <div className="text-center">
                    <button onClick={handleCreateClass} className="text-bio-400 text-sm hover:underline">
                      Opprett ny klasse i stedet →
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="font-display font-700 text-white text-xl mb-2">Bli med i klasse</h2>
                  <p className="text-slate-400 font-body mb-6">Skriv inn klassekoden du fikk av læreren</p>
                  
                  <div className="mb-4">
                    <label className="text-slate-300 text-sm font-body block mb-2">Klassekode</label>
                    <input
                      type="text"
                      value={classCode}
                      onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                      placeholder="F.eks. ABC123"
                      className="bio-input text-center text-xl font-mono tracking-widest"
                    />
                  </div>
                  
                  {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                  
                  <button
                    onClick={handleClassJoin}
                    disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <>Bli med <ArrowRight size={18} /></>}
                  </button>
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in">
              <button onClick={() => setStep(2)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6">
                <ArrowLeft size={16} /> Tilbake
              </button>
              
              <h2 className="font-display font-700 text-white text-xl mb-2">Sett opp profilen din</h2>
              <p className="text-slate-400 font-body mb-6">Hva skal vi kalle deg?</p>
              
              <div className="mb-4">
                <label className="text-slate-300 text-sm font-body block mb-2">Displaynavn</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="F.eks. Ola Nordmann"
                  className="bio-input"
                  autoFocus
                />
              </div>
              
              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
              
              <button
                onClick={handleComplete}
                disabled={loading || !displayName.trim()}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <>Fullfør oppsett <Check size={18} /></>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}