// pages/auth/login.js
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { loginUser } from '../../firebase/auth';
import { useDemo } from '../../hooks/useDemo';
import { Leaf, Mail, Lock, Eye, EyeOff, ArrowRight, Gamepad2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { startDemo, isDemo } = useDemo();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Fyll inn e-post og passord');
    setLoading(true);
    try {
      const user = await loginUser({ email, password });
      toast.success(`Velkommen tilbake, ${user.name}! 🌱`);
      if (user.role === 'admin') {
        router.push('/dashboard/admin');
      } else if (user.role === 'teacher') {
        router.push('/dashboard/teacher');
      } else if (user.role === 'rector') {
        router.push('/dashboard/rector');
      } else {
        router.push('/dashboard/student');
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.message === 'Firebase not configured'
        ? 'Firebase er ikke konfigurert. Sjekk miljøvariabler.'
        : err.code === 'auth/invalid-credential'
        ? 'Feil e-post eller passord'
        : err.code === 'auth/email-not-allowed'
        ? 'Denne e-postadressen er ikke tillatt for registrering'
        : err.code === 'auth/user-not-found'
        ? 'Bruker finnes ikke'
        : err.code === 'auth/email-already-in-use'
        ? 'E-post allerede i bruk'
        : 'Innlogging feilet. Prøv igjen.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    startDemo();
    router.push('/dashboard/demo-teacher');
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-bio-500/5 rounded-full blur-[120px]" />
        <div className="dot-pattern absolute inset-0 opacity-20" />
      </div>

      <div className="w-full max-w-md relative animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-bio-500 to-bio-700 flex items-center justify-center bio-glow">
              <Leaf size={22} className="text-white" />
            </div>
            <span className="font-display font-800 text-white text-2xl">BioBin X</span>
          </Link>
          <h1 className="font-display font-700 text-white text-3xl mb-2">Logg inn</h1>
          <p className="text-slate-400 font-body">Velkommen tilbake til den grønne siden 🌿</p>
        </div>

        {/* Form card */}
        <div className="bio-card p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-slate-300 text-sm font-body font-500 block mb-2">E-post</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="din@epost.no"
                  className="bio-input pl-11"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 text-sm font-body font-500 block mb-2">Passord</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bio-input pl-11 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Logg inn
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 mt-6 font-body">
          Har ikke konto?{' '}
          <Link href="/auth/signup" className="text-bio-400 hover:text-bio-300 transition-colors font-500">
            Registrer deg
          </Link>
        </p>

        <div className="mt-8 pt-6 border-t border-bio-border">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 hover:border-amber-500/50 transition-all group"
          >
            <div className="flex items-center justify-center gap-3">
              <Gamepad2 size={20} className="text-amber-400 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="text-amber-400 font-display font-600">Prøv BioBin X gratis</div>
                <div className="text-slate-500 text-xs font-body">Ingen registrering – kom i gang nå!</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
