import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import Layout from '../../components/layout/Layout';
import { getAdminStats, getAllSchools, createSchool } from '../../firebase/db';
import { Shield, Users, School, Trash2, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [schools, setSchools] = useState([]);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [creatingSchool, setCreatingSchool] = useState(false);

  useEffect(() => {
    if (!loading && (!user || userData?.role !== 'admin')) {
      router.push('/auth/login');
    }
  }, [user, userData, loading]);

  useEffect(() => {
    if (user && userData?.role === 'admin') {
      getAdminStats().then(data => {
        setStats(data || { totalUsers: 0, totalStudents: 0, totalClasses: 0, totalWaste: 0 });
      }).catch(() => setStats({ totalUsers: 0, totalStudents: 0, totalClasses: 0, totalWaste: 0 }));
      getAllSchools().then(setSchools).catch(() => setSchools([]));
    }
  }, [user, userData]);

  const handleCreateSchool = async () => {
    if (!newSchoolName.trim()) return toast.error('Skriv inn skolenavn');
    setCreatingSchool(true);
    try {
      await createSchool({ name: newSchoolName });
      toast.success('Skole opprettet!');
      setNewSchoolName('');
      setShowSchoolModal(false);
      getAllSchools().then(setSchools).catch(() => setSchools([]));
    } catch (err) {
      toast.error('Klarte ikke opprette skole');
    } finally {
      setCreatingSchool(false);
    }
  };

  if (loading || !userData) {
    return <div className="min-h-screen bg-dark-900 flex items-center justify-center"><div className="w-10 h-10 border-2 border-bio-500/30 border-t-bio-500 rounded-full animate-spin" /></div>;
  }

  return (
    <Layout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-white text-2xl font-700">Admin Dashboard</h1>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bio-card p-5">
            <div className="text-slate-400 text-sm mb-1">Brukere</div>
            <div className="text-white text-2xl font-700">{stats?.totalUsers || 0}</div>
          </div>
          <div className="bio-card p-5">
            <div className="text-slate-400 text-sm mb-1">Elever</div>
            <div className="text-white text-2xl font-700">{stats?.totalStudents || 0}</div>
          </div>
          <div className="bio-card p-5">
            <div className="text-slate-400 text-sm mb-1">Klasser</div>
            <div className="text-white text-2xl font-700">{stats?.totalClasses || 0}</div>
          </div>
          <div className="bio-card p-5">
            <div className="text-slate-400 text-sm mb-1">Totalt avfall</div>
            <div className="text-white text-2xl font-700">{(stats?.totalWaste || 0).toFixed(1)} kg</div>
          </div>
        </div>

        <div className="bio-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-lg">Skoler</h2>
            <button onClick={() => setShowSchoolModal(true)} className="btn-primary text-sm">
              <Plus size={14} /> Ny skole
            </button>
          </div>
          {schools.length === 0 ? (
            <p className="text-slate-500 text-center py-6">Ingen skoler ennå</p>
          ) : (
            <div className="space-y-2">
              {schools.map(school => (
                <div key={school.id} className="flex items-center justify-between p-3 rounded-xl bg-white/2">
                  <div className="flex items-center gap-3">
                    <School size={20} className="text-bio-400" />
                    <span className="text-white">{school.name}</span>
                  </div>
                  <span className="text-slate-500 text-sm">{school.code}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showSchoolModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bio-card p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl">Ny skole</h2>
              <button onClick={() => setShowSchoolModal(false)} className="text-slate-500"><X size={20} /></button>
            </div>
            <input
              type="text"
              value={newSchoolName}
              onChange={e => setNewSchoolName(e.target.value)}
              placeholder="Skolenavn"
              className="bio-input mb-4"
              autoFocus
            />
            <button onClick={handleCreateSchool} disabled={creatingSchool} className="btn-primary w-full">
              {creatingSchool ? 'Lager...' : 'Opprett'}
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
