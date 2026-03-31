import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import Layout from '../../components/layout/Layout';
import { getUserLogs, getWeeklyWaste } from '../../firebase/db';
import { Leaf, TrendingUp, Calendar, Scale } from 'lucide-react';

export default function StudentDashboard() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [todayTotal, setTodayTotal] = useState(0);

  useEffect(() => {
    if (!loading && user) {
      if (userData?.role === 'teacher' || userData?.role === 'admin') {
        router.push('/dashboard/teacher');
      }
    }
  }, [user, userData, loading]);

  useEffect(() => {
    if (user) {
      getUserLogs(user.uid).then(userLogs => {
        setLogs(userLogs || []);
        
        const today = new Date().toDateString();
        let todaySum = 0;
        let weekSum = 0;
        
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
        weekStart.setHours(0, 0, 0, 0);
        
        (userLogs || []).forEach(log => {
          if (!log.timestamp) return;
          const d = log.timestamp.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
          
          if (d.toDateString() === today) {
            todaySum += log.weight || 0;
          }
          if (d >= weekStart) {
            weekSum += log.weight || 0;
          }
        });
        
        setTodayTotal(todaySum);
        setWeeklyTotal(weekSum);
      }).catch(() => setLogs([]));
    }
  }, [user]);

  if (loading || !userData) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-bio-500/30 border-t-bio-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Layout>
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <h1 className="font-display font-700 text-white text-2xl mb-6">
          Hei, {userData.name?.split(' ')[0]}!
        </h1>

        <a href="/scan" className="block mb-6">
          <div className="bio-card p-6 bg-gradient-to-r from-bio-600 to-bio-700 border-bio-500/30 text-center">
            <Scale size={32} className="mx-auto mb-2 text-white" />
            <div className="font-display font-700 text-white text-xl">Logg matavfall</div>
          </div>
        </a>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bio-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-bio-400" />
              <span className="text-slate-400 text-sm">I dag</span>
            </div>
            <div className="font-display font-700 text-white text-2xl">{todayTotal.toFixed(1)} kg</div>
          </div>
          <div className="bio-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-bio-400" />
              <span className="text-slate-400 text-sm">Denne uken</span>
            </div>
            <div className="font-display font-700 text-white text-2xl">{weeklyTotal.toFixed(1)} kg</div>
          </div>
        </div>

        <div className="bio-card p-6">
          <h2 className="font-display font-700 text-white text-lg mb-4">Siste registreringer</h2>
          {logs.length === 0 ? (
            <p className="text-slate-500 text-center py-6">Ingen registreringer ennå</p>
          ) : (
            <div className="space-y-3">
              {logs.slice(0, 10).map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-white/2">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🥬</div>
                    <div>
                      <div className="text-white text-sm font-body">{log.foodType || 'Matavfall'}</div>
                      <div className="text-slate-500 text-xs">
                        {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleDateString('no-NO') : ''}
                      </div>
                    </div>
                  </div>
                  <div className="text-bio-400 font-mono font-600">{log.weight} kg</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
