import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { logoutUser } from '../../firebase/auth';
import { LayoutDashboard, Leaf, Camera, Users, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

const studentNav = [
  { href: '/dashboard/student', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/scan', icon: Camera, label: 'Logg avfall' },
];

const teacherNav = [
  { href: '/dashboard/teacher', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/student', icon: Users, label: 'Elever' },
];

export default function Layout({ children }) {
  const { userData } = useAuth();
  const router = useRouter();

  const getNav = () => {
    if (userData?.role === 'teacher' || userData?.role === 'admin') return teacherNav;
    return studentNav;
  };

  const nav = getNav();

  const handleLogout = async () => {
    await logoutUser();
    toast.success('Logget ut!');
    router.push('/');
  };

  return (
    <div className="flex min-h-screen bg-bio-gradient">
      <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-0 h-full border-r border-bio-border bg-dark-900/80 backdrop-blur-xl z-40">
        <div className="p-6 border-b border-bio-border">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-bio-500 to-bio-700 flex items-center justify-center">
              <Leaf size={18} className="text-white" />
            </div>
            <div className="font-800 text-white text-lg">BioBin</div>
          </Link>
        </div>

        {userData && (
          <div className="px-4 py-4 border-b border-bio-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-bio-500/20 flex items-center justify-center text-bio-400 font-700 text-sm">
                {userData.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <div className="text-white text-sm font-600">{userData.name}</div>
                <div className="text-slate-500 text-xs capitalize">
                  {userData.role === 'admin' ? 'Admin' : userData.role === 'teacher' ? 'Lærer' : 'Elev'}
                </div>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-1">
          {nav.map(({ href, icon: Icon, label }) => {
            const isActive = router.pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-bio-500/10 text-bio-400'
                    : 'text-slate-400 hover:text-white hover:bg-white/4'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-bio-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 transition-all w-full"
          >
            <LogOut size={18} />
            Logg ut
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64 min-h-screen pb-20 lg:pb-0">
        {children}
      </main>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 mobile-nav z-50">
        <div className="flex justify-around items-center py-2 px-2">
          {nav.map(({ href, icon: Icon, label }) => {
            const isActive = router.pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${
                  isActive ? 'text-bio-400' : 'text-slate-500'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
