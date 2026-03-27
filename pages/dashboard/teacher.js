// pages/dashboard/teacher.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import Layout from '../../components/layout/Layout';
import { getTeacherClasses, getClassStudents, getClassLogs, createClass, setClassWeeklyGoal, getWeeklyWaste, getSchoolByCode, getAllSchools, getSchoolGroups, getBinsByTeacher, getAllBinsHealth, setClassWeeklyGoalKg } from '../../firebase/db';
import { calculateEnergy, calculateCO2Saved } from '../../utils/calculator';
import { Users, Leaf, Zap, Wind, Plus, Copy, X, BarChart2, Trophy, Target, CheckCircle, Trash2, Scale } from 'lucide-react';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AddBinModal from '../../components/AddBinModal';
import GroupModal from '../../components/GroupModal';
import Klasseligaen from '../../components/Klasseligaen';
import Challenges from '../../components/Challenges';
import SmartAvfallsanalyse from '../../components/SmartAvfallsanalyse';
import CO2Prognose from '../../components/CO2Prognose';
import AIAssistant from '../../components/AIAssistant';
import { Sparkles, MessageCircle } from 'lucide-react';

export default function TeacherDashboard() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classStats, setClassStats] = useState({ students: [], logs: [], totalWaste: 0 });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [creating, setCreating] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalWeight, setGoalWeight] = useState('');
  const [settingGoal, setSettingGoal] = useState(false);
  const [classWeeklyWaste, setClassWeeklyWaste] = useState(0);
  const [schoolCode, setSchoolCode] = useState('');
  const [schools, setSchools] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedSchoolData, setSelectedSchoolData] = useState(null);
  const [showAddBinModal, setShowAddBinModal] = useState(false);
  const [bins, setBins] = useState([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  useEffect(() => {
    if (!loading && (!user || (userData?.role !== 'teacher' && userData?.role !== 'admin' && userData?.role !== 'rector'))) {
      router.push('/auth/login');
    }
  }, [user, userData, loading]);

  useEffect(() => {
    if (user && userData?.role === 'teacher') {
      getTeacherClasses(user.uid).then(cls => {
        setClasses(cls || []);
        if (cls && cls.length > 0) setSelectedClass(cls[0]);
      }).catch(err => {
        console.error('Error loading classes:', err);
        setClasses([]);
      });
      getBinsByTeacher(user.uid).then(b => setBins(b || [])).catch(() => setBins([]));
    }
  }, [user, userData]);

  useEffect(() => {
    if (selectedClass) {
      Promise.all([
        getClassStudents(selectedClass.id),
        getClassLogs(selectedClass.id),
      ]).then(([students, logs]) => {
        const totalWaste = (logs || []).reduce((s, l) => s + (l.weight || 0), 0);
        setClassStats({ students: students || [], logs: logs || [], totalWaste });
      }).catch(err => {
        console.error('Error loading class data:', err);
        setClassStats({ students: [], logs: [], totalWaste: 0 });
      });
      getWeeklyWaste(null, selectedClass.id).then(setClassWeeklyWaste).catch(() => setClassWeeklyWaste(0));
      setGoalWeight(selectedClass.weeklyGoal?.toString() || '');
    }
  }, [selectedClass]);

  const handleOpenCreateModal = async () => {
    try {
      const allSchools = await getAllSchools();
      setSchools(allSchools || []);
      if (allSchools && allSchools.length > 0) {
        setSelectedSchool(allSchools[0].id);
        const schoolGroups = await getSchoolGroups(allSchools[0].id);
        setGroups(schoolGroups || []);
      }
      setSchoolCode('');
      setSelectedGroup('');
      setShowCreateModal(true);
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

  const handleCreateClass = async () => {
    if (!newClassName.trim()) return toast.error('Skriv inn klassenavn');
    if (!selectedSchool) return toast.error('Velg en skole');
    setCreating(true);
    try {
      const result = await createClass({ name: newClassName, teacherId: user.uid, schoolId: selectedSchool, groupId: selectedGroup || null });
      console.log('Class created:', result);
      toast.success(`Klasse opprettet! Kode: ${result.code} 🎉`);
      const cls = await getTeacherClasses(user.uid);
      setClasses(cls || []);
      setShowCreateModal(false);
      setNewClassName('');
    } catch (err) {
      console.error('Error creating class:', err);
      toast.error('Klarte ikke opprette klasse');
    } finally {
      setCreating(false);
    }
  };

  const handleSetGoal = async () => {
    if (!selectedClass) return;
    const weight = parseFloat(goalWeight);
    if (isNaN(weight) || weight <= 0) return toast.error('Skriv inn en gyldig vekt');
    setSettingGoal(true);
    try {
      await setClassWeeklyGoal(selectedClass.id, weight);
      toast.success('Ukentlig mål satt for klassen! 🎯');
      setShowGoalModal(false);
      const cls = await getTeacherClasses(user.uid);
      setClasses(cls || []);
      const updated = cls?.find(c => c.id === selectedClass.id);
      if (updated) setSelectedClass(updated);
    } catch (err) {
      console.error('Error setting goal:', err);
      toast.error('Klarte ikke sette mål');
    } finally {
      setSettingGoal(false);
    }
  };

  if (loading || !userData) {
    return <div className="min-h-screen bg-dark-900 flex items-center justify-center"><div className="w-10 h-10 border-2 border-bio-500/30 border-t-bio-500 rounded-full animate-spin" /></div>;
  }

  const energy = calculateEnergy(classStats.totalWaste);
  const co2 = calculateCO2Saved(classStats.totalWaste);

  // Build student bar chart data
  const studentChartData = classStats.students
    .sort((a, b) => (b.points || 0) - (a.points || 0))
    .slice(0, 8)
    .map(s => ({ name: s.name?.split(' ')[0] || 'Ukjent', poeng: s.points || 0 }));

  return (
    <Layout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-slide-up">
          <div>
            <h1 className="font-display font-700 text-white text-2xl lg:text-3xl mb-1">
              Lærer-dashboard 🏫
            </h1>
            <p className="text-slate-400 font-body">Hei {userData.name}! Oversikt over klassen din.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleOpenCreateModal}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Plus size={16} />
              Ny klasse
            </button>
            <button
              onClick={() => setShowAddBinModal(true)}
              className="btn-primary flex items-center gap-2 text-sm bg-moss-600"
            >
              <Trash2 size={16} />
              Legg til bøtte
            </button>
            <button
              onClick={() => setShowGroupModal(true)}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Users size={16} />
              Grupper
            </button>
            <button
              onClick={() => setShowAIAssistant(true)}
              className="btn-primary flex items-center gap-2 text-sm bg-moss-600"
            >
              <Sparkles size={16} />
              AI-assistent
            </button>
          </div>
        </div>

        {/* Class selector */}
        {classes.length > 0 && (
          <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
            {classes.map(cls => (
              <button
                key={cls.id}
                onClick={() => setSelectedClass(cls)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-body font-500 whitespace-nowrap transition-all ${
                  selectedClass?.id === cls.id
                    ? 'bg-bio-500/15 border border-bio-500/30 text-bio-400'
                    : 'bg-white/4 border border-white/8 text-slate-400 hover:text-white'
                }`}
              >
                <Users size={14} />
                {cls.name}
                {cls.schoolName && <span className="text-bio-400 text-xs">- {cls.schoolName}</span>}
                {cls.groupName && <span className="text-earth-400 text-xs"> ({cls.groupName})</span>}
                {cls.code && (
                  <span className="font-mono text-xs bg-white/8 px-2 py-0.5 rounded-md">{cls.code}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {classes.length === 0 ? (
          <div className="bio-card p-16 text-center">
            <Users size={48} className="mx-auto text-slate-600 mb-4" />
            <h2 className="font-display font-700 text-white text-xl mb-2">Ingen klasser ennå</h2>
            <p className="text-slate-400 font-body mb-6">Opprett din første klasse og del klassekoden med elevene.</p>
            <button onClick={handleOpenCreateModal} className="btn-primary flex items-center gap-2 mx-auto">
              <Plus size={16} /> Opprett klasse
            </button>
          </div>
        ) : (
          <>
            {/* Class code display */}
            {selectedClass && (
              <div className="bio-card p-4 mb-6 flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-xs font-body mb-1">Klassekode for {selectedClass.name}</div>
                  <div className="font-mono font-700 text-bio-400 text-xl tracking-widest">{selectedClass.code}</div>
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(selectedClass.code); toast.success('Kode kopiert!'); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bio-500/10 border border-bio-500/20 text-bio-400 text-sm font-body hover:bg-bio-500/15 transition-all"
                >
                  <Copy size={14} /> Kopier
                </button>
              </div>
            )}

            {/* Weekly Goal Card */}
            {selectedClass && selectedClass.weeklyGoal && selectedClass.weeklyGoal > 0 && (
              <div className="bio-card p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-bio-500/15 flex items-center justify-center">
                      <Target size={20} className="text-bio-400" />
                    </div>
                    <div>
                      <h2 className="font-display font-700 text-white text-lg">Ukentlig klassemål</h2>
                      <p className="text-slate-400 text-sm font-body">{selectedClass.weeklyGoal} kg denne uken</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowGoalModal(true)}
                    className="text-bio-400 text-sm font-body hover:text-bio-300 transition-colors"
                  >
                    Endre
                  </button>
                </div>
                <div className="relative h-4 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
                      classWeeklyWaste >= selectedClass.weeklyGoal ? 'bg-earth-400' : 'bg-bio-500'
                    }`}
                    style={{ width: `${Math.min((classWeeklyWaste / selectedClass.weeklyGoal) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-slate-400 text-sm font-body">
                    {classWeeklyWaste.toFixed(1)} / {selectedClass.weeklyGoal} kg
                  </span>
                  {selectedClass.weeklyGoalCompleted ? (
                    <span className="flex items-center gap-1 text-earth-400 text-sm font-body font-500">
                      <CheckCircle size={14} /> Mål nådd! +200 poeng til alle
                    </span>
                  ) : (
                    <span className="text-slate-500 text-sm font-body">
                      {((selectedClass.weeklyGoal - classWeeklyWaste) > 0 ? (selectedClass.weeklyGoal - classWeeklyWaste) : 0).toFixed(1)} kg igjen
                    </span>
                  )}
                </div>
              </div>
            )}

            {selectedClass && (!selectedClass.weeklyGoal || selectedClass.weeklyGoal <= 0) && (
              <div className="bio-card p-6 mb-6 text-center">
                <Target size={32} className="mx-auto text-slate-600 mb-3" />
                <h2 className="font-display font-700 text-white text-lg mb-2">Sett et ukentlig klassemål</h2>
                <p className="text-slate-400 text-sm font-body mb-4">Alle elever får 200 bonuspoeng hvis klassen når målet!</p>
                <button onClick={() => setShowGoalModal(true)} className="btn-primary">
                  Sett klassemål
                </button>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Elever', value: classStats.students.length, icon: Users, color: 'bio', unit: 'stk' },
                { label: 'Matavfall', value: classStats.totalWaste.toFixed(1), icon: Leaf, color: 'bio', unit: 'kg' },
                { label: 'Energi', value: energy.toFixed(1), icon: Zap, color: 'moss', unit: 'kWh' },
                { label: 'CO₂ spart', value: co2.toFixed(1), icon: Wind, color: 'earth', unit: 'kg' },
              ].map(({ label, value, icon: Icon, color, unit }) => (
                <div key={label} className="bio-card p-5">
                  <div className={`w-9 h-9 rounded-xl bg-${color}-500/15 flex items-center justify-center mb-3`}>
                    <Icon size={18} className={`text-${color}-400`} />
                  </div>
                  <div className="font-display font-700 text-white text-2xl">{value}</div>
                  <div className="text-slate-500 text-xs font-body mt-1">{label} ({unit})</div>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            <div className="bio-card p-6 mb-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-700 text-white text-lg">Poeng per elev</h2>
                <BarChart2 size={18} className="text-bio-400" />
              </div>
              {studentChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={studentChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#1a2d1f', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '12px', fontFamily: 'DM Sans' }}
                      labelStyle={{ color: '#94a3b8' }}
                      itemStyle={{ color: '#4ade80' }}
                    />
                    <Bar dataKey="poeng" fill="#22c55e" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-500 text-center py-8 font-body">Ingen elever ennå</p>
              )}
            </div>

            {/* Student list */}
            <div className="bio-card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-700 text-white text-lg">Elevliste</h2>
                <span className="text-slate-500 text-sm font-body">{classStats.students.length} elever</span>
              </div>
              {classStats.students.length === 0 ? (
                <div className="text-center py-8 text-slate-500 font-body">
                  <p>Ingen elever har blitt med ennå.</p>
                  <p className="text-sm mt-1">Del klassekoden <span className="font-mono text-bio-400">{selectedClass?.code}</span></p>
                </div>
              ) : (
                <div className="space-y-2">
                  {classStats.students
                    .sort((a, b) => (b.points || 0) - (a.points || 0))
                    .map((student, i) => (
                      <div key={student.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/2 border border-white/5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-700 ${i === 0 ? 'bg-earth-400/20 text-earth-300' : i === 1 ? 'bg-slate-400/20 text-slate-300' : i === 2 ? 'bg-orange-400/20 text-orange-300' : 'bg-white/5 text-slate-500'}`}>
                          {i + 1}
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-bio-600 to-moss-700 flex items-center justify-center text-white font-display font-700 text-xs">
                          {student.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-body font-500 truncate">{student.name}</div>
                          <div className="text-slate-500 text-xs font-body">{(student.totalWaste || 0).toFixed(1)} kg avfall</div>
                        </div>
                        <div className="text-bio-400 font-mono text-sm font-600">{(student.points || 0).toLocaleString('no-NO')} p</div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* New Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Klasseligaen userData={userData} />
          <CO2Prognose />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Challenges classId={selectedClass?.id} teacherId={user?.uid} />
          <SmartAvfallsanalyse teacherId={user?.uid} />
        </div>
      </div>

      {/* Create class modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bio-card p-8 w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-700 text-white text-xl">Opprett ny klasse</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm font-body font-500 block mb-2">Klassenavn</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                  placeholder="F.eks. 8A"
                  className="bio-input"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm font-body font-500 block mb-2">Skole</label>
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
              </div>
              {groups.length > 0 && (
                <div>
                  <label className="text-slate-300 text-sm font-body font-500 block mb-2">Gruppe (valgfritt)</label>
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
                </div>
              )}
              <button onClick={handleCreateClass} disabled={creating || !selectedSchool} className="btn-primary w-full flex items-center justify-center gap-2 py-4">
                {creating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Plus size={16} /> Opprett klasse</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bio-card p-8 w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-700 text-white text-xl">Sett ukentlig klassemål</h2>
              <button onClick={() => setShowGoalModal(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <p className="text-slate-400 text-sm font-body mb-4">
              Sett et mål for hvor mye matavfall klassen skal registrere denne uken. Hvis alle elever sammen når målet, får hver elev 200 bonuspoeng!
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm font-body font-500 block mb-2">Klassemål (kg)</label>
                <input
                  type="number"
                  value={goalWeight}
                  onChange={e => setGoalWeight(e.target.value)}
                  placeholder="F.eks. 50"
                  className="bio-input"
                  min="0"
                  step="1"
                  autoFocus
                />
              </div>
              <button onClick={handleSetGoal} disabled={settingGoal} className="btn-primary w-full flex items-center justify-center gap-2 py-4">
                {settingGoal ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Target size={16} /> Sett klassemål</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <AddBinModal
        isOpen={showAddBinModal}
        onClose={() => setShowAddBinModal(false)}
        onSuccess={() => {
          if (user) {
            getBinsByTeacher(user.uid).then(b => setBins(b || [])).catch(() => {});
          }
        }}
      />

      <GroupModal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        teacherId={user?.uid}
        onSuccess={() => {
        }}
      />

      <AIAssistant
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        teacherId={user?.uid}
      />
    </Layout>
  );
}
