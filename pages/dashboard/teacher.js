import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import Layout from '../../components/layout/Layout';
import { getTeacherClasses, getClassStudents, getClassLogs, createClass, getWeeklyWaste } from '../../firebase/db';
import { Users, Leaf, Plus, X, Trash2, Scale } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeacherDashboard() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [creating, setCreating] = useState(false);
  const [weeklyTotals, setWeeklyTotals] = useState({});

  useEffect(() => {
    if (!loading && (!user || (userData?.role !== 'teacher' && userData?.role !== 'admin'))) {
      router.push('/auth/login');
    }
  }, [user, userData, loading]);

  useEffect(() => {
    if (user && userData?.role === 'teacher') {
      getTeacherClasses(user.uid).then(cls => {
        setClasses(cls || []);
        if (cls && cls.length > 0) setSelectedClass(cls[0]);
      }).catch(() => setClasses([]));
    }
  }, [user, userData]);

  useEffect(() => {
    if (selectedClass) {
      Promise.all([
        getClassStudents(selectedClass.id),
        getClassLogs(selectedClass.id),
      ]).then(([studentsData, logsData]) => {
        setStudents(studentsData || []);
        setLogs(logsData || []);
      }).catch(() => {
        setStudents([]);
        setLogs([]);
      });
      
      getWeeklyWaste(selectedClass.id).then(weekData => {
        const total = Array.isArray(weekData) 
          ? weekData.reduce((s, d) => s + (d.weight || 0), 0)
          : (weekData?.total || 0);
        setWeeklyTotals(prev => ({ ...prev, [selectedClass.id]: total }));
      }).catch(() => {});
    }
  }, [selectedClass]);

  const handleCreateClass = async () => {
    if (!newClassName.trim()) return toast.error('Skriv inn klassenavn');
    setCreating(true);
    try {
      const result = await createClass({ name: newClassName.trim(), teacherId: user.uid });
      toast.success(`Klasse opprettet! Kode: ${result.code}`);
      const cls = await getTeacherClasses(user.uid);
      setClasses(cls || []);
      setShowCreateModal(false);
      setNewClassName('');
    } catch (err) {
      toast.error('Klarte ikke opprette klasse');
    } finally {
      setCreating(false);
    }
  };

  const totalWaste = logs.reduce((s, l) => s + (l.weight || 0), 0);
  const weeklyWaste = weeklyTotals[selectedClass?.id] || 0;

  if (loading || !userData) {
    return <div className="min-h-screen bg-dark-900 flex items-center justify-center"><div className="w-10 h-10 border-2 border-bio-500/30 border-t-bio-500 rounded-full animate-spin" /></div>;
  }

  return (
    <Layout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display font-700 text-white text-2xl">Lærer-dashboard</h1>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Ny klasse
          </button>
        </div>

        {classes.length > 0 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {classes.map(cls => (
              <button
                key={cls.id}
                onClick={() => setSelectedClass(cls)}
                className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap ${
                  selectedClass?.id === cls.id
                    ? 'bg-bio-500/15 border border-bio-500/30 text-bio-400'
                    : 'bg-white/4 border border-white/8 text-slate-400'
                }`}
              >
                {cls.name}
              </button>
            ))}
          </div>
        )}

        {classes.length === 0 ? (
          <div className="bio-card p-12 text-center">
            <Users size={48} className="mx-auto text-slate-600 mb-4" />
            <h2 className="text-white text-xl mb-2">Ingen klasser</h2>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary mt-4">
              <Plus size={16} /> Opprett klasse
            </button>
          </div>
        ) : selectedClass ? (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bio-card p-5">
                <div className="text-slate-400 text-sm mb-1">Elever</div>
                <div className="text-white text-2xl font-700">{students.length}</div>
              </div>
              <div className="bio-card p-5">
                <div className="text-slate-400 text-sm mb-1">Totalt avfall</div>
                <div className="text-white text-2xl font-700">{totalWaste.toFixed(1)} kg</div>
              </div>
              <div className="bio-card p-5">
                <div className="text-slate-400 text-sm mb-1">Denne uken</div>
                <div className="text-bio-400 text-2xl font-700">{weeklyWaste.toFixed(1)} kg</div>
              </div>
            </div>

            <div className="bio-card p-6">
              <h2 className="text-white text-lg mb-4">Elever</h2>
              {students.length === 0 ? (
                <p className="text-slate-500 text-center py-6">Ingen elever ennå</p>
              ) : (
                <div className="space-y-2">
                  {students.map(student => (
                    <div key={student.id} className="flex items-center justify-between p-3 rounded-xl bg-white/2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-bio-500/20 flex items-center justify-center text-white font-700 text-sm">
                          {student.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-white">{student.name}</span>
                      </div>
                      <span className="text-slate-400">{(student.totalWaste || 0).toFixed(1)} kg</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bio-card p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl">Ny klasse</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-500"><X size={20} /></button>
            </div>
            <input
              type="text"
              value={newClassName}
              onChange={e => setNewClassName(e.target.value)}
              placeholder="F.eks. 8A"
              className="bio-input mb-4"
              autoFocus
            />
            <button onClick={handleCreateClass} disabled={creating} className="btn-primary w-full">
              {creating ? 'Lager...' : 'Opprett'}
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
