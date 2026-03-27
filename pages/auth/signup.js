// pages/auth/signup.js
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { registerUser } from '../../firebase/auth';
import { Leaf, Mail, Lock, User, Hash, Eye, EyeOff, ArrowRight, GraduationCap, School } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', classCode: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Fyll inn alle felt');
    if (form.password.length < 6) return toast.error('Passordet må være minst 6 tegn');
    if (form.role === 'student' && !form.classCode) return toast.error('Skriv inn klassekoden');
    setLoading(true);
    try {
      await registerUser(form);
      toast.success(`Konto opprettet! Velkommen, ${form.name}! 🌱`);
      if (form.role === 'admin') {
        router.push('/dashboard/admin');
      } else if (form.role === 'teacher') {
        router.push('/dashboard/teacher');
      } else {
        router.push('/dashboard/student');
      }
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'E-postadressen er allerede i bruk'
        : err.code === 'auth/email-not-allowed'
        ? 'Denne e-postadressen er ikke tillatt'
        : 'Registrering feilet. Prøv igjen.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-bio-500/5 rounded-full blur-[120px]" />
        <div className="dot-pattern absolute inset-0 opacity-20" />
      </div>

      <div className="w-full max-w-md relative animate-slide-up">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-bio-500 to-bio-700 flex items-center justify-center bio-glow">
              <Leaf size={22} className="text-white" />
            </div>
            <span className="font-display font-800 text-white text-2xl">BioBin X</span>
          </Link>
          <h1 className="font-display font-700 text-white text-3xl mb-2">Opprett konto</h1>
          <p className="text-slate-400 font-body">Bli en del av den grønne bevegelsen 🌍</p>
        </div>

        <div className="bio-card p-8">
          <form onSubmit={handleSignup} className="space-y-5">
            {/* Role selector */}
            <div>
              <label className="text-slate-300 text-sm font-body font-500 block mb-2">Jeg er en...</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'student', label: 'Elev', icon: GraduationCap },
                  { value: 'teacher', label: 'Lærer', icon: School },
                  { value: 'rector', label: 'Rector', icon: School },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, role: value }))}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all font-body font-500 text-sm ${
                      form.role === value
                        ? 'bg-bio-500/15 border-bio-500/40 text-bio-400'
                        : 'bg-white/3 border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-slate-300 text-sm font-body font-500 block mb-2">Fullt navn</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="text" value={form.name} onChange={update('name')} placeholder="Kari Nordmann" className="bio-input pl-11" required />
              </div>
            </div>

            <div>
              <label className="text-slate-300 text-sm font-body font-500 block mb-2">E-post</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" value={form.email} onChange={update('email')} placeholder="din@epost.no" className="bio-input pl-11" required />
              </div>
            </div>

            <div>
              <label className="text-slate-300 text-sm font-body font-500 block mb-2">Passord</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={update('password')}
                  placeholder="Minst 6 tegn"
                  className="bio-input pl-11 pr-12"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {form.role === 'student' && (
              <div>
                <label className="text-slate-300 text-sm font-body font-500 block mb-2">Klassekode <span className="text-red-400">*</span></label>
                <div className="relative">
                  <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={form.classCode}
                    onChange={update('classCode')}
                    placeholder="F.eks. XK9A2B"
                    className="bio-input pl-11 uppercase"
                    maxLength={8}
                    required
                  />
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base mt-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Opprett konto <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 mt-6 font-body">
          Har du allerede konto?{' '}
          <Link href="/auth/login" className="text-bio-400 hover:text-bio-300 transition-colors font-500">Logg inn</Link>
        </p>
      </div>
    </div>
  );
}
