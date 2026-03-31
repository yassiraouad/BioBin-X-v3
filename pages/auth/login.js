import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { loginUser } from '../../firebase/auth';
import { Leaf, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Fyll inn e-post og passord');
    setLoading(true);
    try {
      const user = await loginUser({ email, password });
      toast.success(`Velkommen, ${user.name}!`);
      if (user.role === 'admin') {
        router.push('/dashboard/admin');
      } else if (user.role === 'teacher') {
        router.push('/dashboard/teacher');
      } else {
        router.push('/dashboard/student');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Innlogging feilet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-bio-500 to-bio-700 flex items-center justify-center">
              <Leaf size={22} className="text-white" />
            </div>
            <span className="font-800 text-white text-2xl">BioBin</span>
          </Link>
          <h1 className="font-700 text-white text-3xl mb-2">Logg inn</h1>
        </div>

        <div className="bio-card p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-slate-300 text-sm block mb-2">E-post</label>
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
              <label className="text-slate-300 text-sm block mb-2">Passord</label>
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
            >
              {loading ? 'Laster...' : <>Logg inn <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 mt-6">
          Har ikke konto?{' '}
          <Link href="/auth/signup" className="text-bio-400 hover:text-bio-300">
            Registrer deg
          </Link>
        </p>
      </div>
    </div>
  );
}
