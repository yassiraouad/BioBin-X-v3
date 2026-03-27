// pages/dashboard/classes.js
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useDemo } from '../../hooks/useDemo';
import Layout from '../../components/layout/Layout';
import { getTeacherClasses, createClass, getClassStudents, getSchoolByCode, getAllSchools, getSchoolGroups } from '../../firebase/db';
import { useRouter } from 'next/router';
import { Users, Plus, Copy, Hash, X, ChevronDown, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ClassesPage() {
  const { user, userData, loading } = useAuth();
  const { isDemo, demoData } = useDemo();
  const router = useRouter();
  const [classes, setClasses] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [classStudents, setClassStudents] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [schools, setSchools] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!loading && userData) {
      if (userData.role !== 'teacher' && userData.role !== 'admin' && userData.role !== 'rector' && !isDemo) {
        router.push('/auth/login');
      }
    }
  }, [loading, userData, isDemo]);

  useEffect(() => {
    if (isDemo) {
      setClasses(demoData.classes);
      const demoStudents = {
        'class-7a': [
          { id: 's1', name: 'Emma', points: 120 },
          { id: 's2', name: 'Lars', points: 95 },
          { id: 's3', name: 'Sofia', points: 85 },
          { id: 's4', name: 'Noah', points: 75 },
        ],
        'class-7b': [
          { id: 's5', name: 'Anna', points: 70 },
          { id: 's6', name: 'Magnus', points: 65 },
        ],
        'class-6a': [
          { id: 's7', name: 'Olivia', points: 60 },
          { id: 's8', name: 'Jakob', points: 55 },
        ],
      };
      setClassStudents(demoStudents);
      return;
    }

    if (user && userData?.role === 'teacher') {
      getTeacherClasses(user.uid).then(cls => setClasses(cls || [])).catch(() => setClasses([]));
    }
  }, [user, userData, isDemo]);

  const toggleExpand = async (classId) => {
    if (expanded === classId) { setExpanded(null); return; }
    setExpanded(classId);
    if (!classStudents[classId]) {
      const students = await getClassStudents(classId);
      setClassStudents(prev => ({ ...prev, [classId]: students || [] }));
    }
  };

  const handleOpenModal = async () => {
    try {
      const allSchools = await getAllSchools();
      setSchools(allSchools || []);
      if (allSchools && allSchools.length > 0) {
        setSelectedSchool(allSchools[0].id);
        const schoolGroups = await getSchoolGroups(allSchools[0].id);
        setGroups(schoolGroups || []);
      }
      setSelectedGroup('');
      setShowModal(true);
    } catch (err) {
      console.error('Error loading schools:', err);
      toast.error('Klarte ikke laste skoler');
    }
  };

  const handleSchoolChange = async (schoolId) => {
    setSelectedSchool(schoolId);
    setSelectedGroup('');
    try {
      const schoolGroups = await getSchoolGroups(schoolId);
      setGroups(schoolGroups || []);
    } catch (err) {
      setGroups([]);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return toast.error('Skriv inn klassenavn');
    if (!selectedSchool) return toast.error('Velg en skole');
    setCreating(true);
    try {
      const result = await createClass({ name: newName, teacherId: user.uid, schoolId: selectedSchool, groupId: selectedGroup || null });
      console.log('Class created:', result);
      toast.success(`Klasse opprettet! Kode: ${result.code} 🎉`);
      const cls = await getTeacherClasses(user.uid);
      setClasses(cls || []);
      setShowModal(false);
      setNewName('');
    } catch (err) {
      console.error('Error creating class:', err);
      toast.error('Feil ved oppretting: ' + err.message);
    }
    finally { setCreating(false); }
  };

  if (loading || !userData) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-bio-500/30 border-t-bio-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <Layout>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-700 text-white text-2xl mb-1">Mine klasser</h1>
            <p className="text-slate-400 font-body">{classes.length} klasse{classes.length !== 1 ? 'r' : ''}</p>
          </div>
          <button onClick={handleOpenModal} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={15} /> Ny klasse
          </button>
        </div>

        {classes.length === 0 ? (
          <div className="bio-card p-16 text-center">
            <Users size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400 font-body mb-4">Ingen klasser ennå.</p>
            <button onClick={handleOpenModal} className="btn-primary mx-auto flex items-center gap-2">
              <Plus size={15} /> Opprett første klasse
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {classes.map(cls => (
              <div key={cls.id} className="bio-card overflow-hidden">
                <button
                  onClick={() => toggleExpand(cls.id)}
                  className="w-full flex items-center gap-4 p-5 text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-bio-500/15 flex items-center justify-center text-bio-400">
                    <Users size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-display font-700">
                      {cls.name}
                      {cls.schoolName && <span className="text-bio-400 font-400 text-sm ml-1">- {cls.schoolName}</span>}
                      {cls.groupName && <span className="text-earth-400 font-400 text-sm ml-1"> ({cls.groupName})</span>}
                    </div>
                    <div className="text-slate-500 text-xs font-body mt-0.5">
                      {(cls.totalWaste || 0).toFixed(1)} kg · {cls.totalPoints || 0} poeng
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-bio-400 text-sm bg-bio-500/10 border border-bio-500/20 px-3 py-1 rounded-lg">
                      {cls.code}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(cls.code); toast.success('Kode kopiert!'); }}
                      className="text-slate-500 hover:text-bio-400 transition-colors"
                    >
                      <Copy size={14} />
                    </button>
                    {expanded === cls.id ? <ChevronDown size={16} className="text-slate-500" /> : <ChevronRight size={16} className="text-slate-500" />}
                  </div>
                </button>

                {expanded === cls.id && (
                  <div className="px-5 pb-5 border-t border-bio-border">
                    <div className="pt-4 space-y-2">
                      <h3 className="text-slate-400 text-xs font-body font-500 uppercase tracking-wider mb-3">Elever</h3>
                      {(classStudents[cls.id] || []).length === 0 ? (
                        <p className="text-slate-500 text-sm font-body py-4 text-center">
                          Ingen elever ennå. Del koden <span className="font-mono text-bio-400">{cls.code}</span>
                        </p>
                      ) : (
                        (classStudents[cls.id] || []).sort((a, b) => (b.points || 0) - (a.points || 0)).map((s, i) => (
                          <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/2">
                            <span className="text-slate-600 text-xs font-mono w-5">{i + 1}</span>
                            <div className="w-7 h-7 rounded-lg bg-bio-800 flex items-center justify-center text-bio-300 font-display font-700 text-xs">
                              {s.name?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1 text-white text-sm font-body">{s.name}</div>
                            <div className="text-bio-400 font-mono text-xs">{(s.points || 0)}p</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bio-card p-8 w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-700 text-white text-xl">Ny klasse</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="F.eks. 9B"
                className="bio-input"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
              />
              <select
                value={selectedSchool}
                onChange={e => handleSchoolChange(e.target.value)}
                className="bio-input"
              >
                {schools.length === 0 ? (
                  <option value="">Ingen skoler tilgjengelig</option>
                ) : (
                  schools.map(school => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))
                )}
              </select>
              {groups.length > 0 && (
                <select
                  value={selectedGroup}
                  onChange={e => setSelectedGroup(e.target.value)}
                  className="bio-input"
                >
                  <option value="">Ingen gruppe</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              )}
              <button onClick={handleCreate} disabled={creating || !selectedSchool} className="btn-primary w-full flex items-center justify-center gap-2 py-4">
                {creating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Plus size={16} /> Opprett</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
