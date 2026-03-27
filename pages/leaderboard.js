// pages/leaderboard.js
import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { getStudentLeaderboard, getClassLeaderboard, getAllSchools, getSchoolStudentLeaderboard, getSchoolLeaderboard } from '../firebase/db';
import { useAuth } from '../hooks/useAuth';
import { useDemo } from '../hooks/useDemo';
import { Trophy, Users, Crown, Medal, Star } from 'lucide-react';

const RANK_MEDALS = ['🥇', '🥈', '🥉'];
const RANK_CLASSES = ['rank-1', 'rank-2', 'rank-3'];

export default function Leaderboard() {
  const { user, userData } = useAuth();
  const { isDemo, demoData } = useDemo();
  const [tab, setTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('all');

  useEffect(() => {
    if (isDemo) {
      setSchools([demoData.school]);
      setSelectedSchool(demoData.school.id);
      setLoading(false);
      return;
    }
    getAllSchools().then(schools => setSchools(schools || [])).catch(() => setSchools([]));
  }, [isDemo]);

  useEffect(() => {
    setLoading(true);
    
    if (isDemo) {
      const demoClasses = demoData.leaderboard.map(c => ({
        id: c.classId,
        name: c.className,
        totalWaste: c.weight,
        totalPoints: c.weight * 100,
      }));
      
      const allStudents = [];
      const studentNames = ['Emma', 'Lars', 'Sofia', 'Noah', 'Olivia', 'Jakob', 'Anna', 'Magnus', 'Sofie', 'Oliver'];
      let weightRemaining = 35.4;
      let pointsRemaining = 340;
      
      demoData.classes.forEach((cls, clsIdx) => {
        const studentCount = cls.students;
        const weightPerStudent = cls.weeklyStats.weight / Math.max(studentCount - 1, 1);
        const pointsPerStudent = Math.round(cls.weeklyStats.weight * 10 / Math.max(studentCount - 1, 1));
        
        for (let i = 0; i < Math.min(studentCount - 1, 3); i++) {
          if (allStudents.length < 10 && clsIdx === 0) {
            allStudents.push({
              uid: `demo-student-${allStudents.length + 1}`,
              name: studentNames[i],
              points: pointsRemaining - (allStudents.length * 25),
              totalWaste: weightRemaining - (allStudents.length * 0.5),
            });
          }
        }
      });
      
      setStudents(allStudents.length > 0 ? allStudents : [
        { uid: 'demo-1', name: 'Emma', points: 120, totalWaste: 12 },
        { uid: 'demo-2', name: 'Lars', points: 95, totalWaste: 9.5 },
        { uid: 'demo-3', name: 'Sofia', points: 85, totalWaste: 8.5 },
      ]);
      setClasses(demoClasses);
      setLoading(false);
      return;
    }

    if (selectedSchool === 'all') {
      Promise.all([getStudentLeaderboard(), getClassLeaderboard()]).then(([s, c]) => {
        setStudents(s || []);
        setClasses(c || []);
        setLoading(false);
      }).catch(() => {
        setStudents([]);
        setClasses([]);
        setLoading(false);
      });
    } else {
      Promise.all([getSchoolStudentLeaderboard(selectedSchool), getSchoolLeaderboard(selectedSchool)]).then(([s, c]) => {
        setStudents(s || []);
        setClasses(c || []);
        setLoading(false);
      }).catch(() => {
        setStudents([]);
        setClasses([]);
        setLoading(false);
      });
    }
  }, [selectedSchool, isDemo]);

  return (
    <Layout>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="mb-8 animate-slide-up">
          <h1 className="font-display font-700 text-white text-2xl lg:text-3xl mb-1 flex items-center gap-3">
            <Trophy size={28} className="text-earth-400" />
            Rangering
          </h1>
          <p className="text-slate-400 font-body">Hvem er skolens grønneste?</p>
        </div>

        {/* School filter */}
        {schools.length > 0 && (
          <div className="mb-6">
            <select
              value={selectedSchool}
              onChange={e => setSelectedSchool(e.target.value)}
              className="bio-input w-full max-w-xs"
            >
              <option value="all">Alle skoler</option>
              {schools.map(school => (
                <option key={school.id} value={school.id}>{school.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex gap-2 mb-6 p-1 bg-white/4 rounded-xl w-fit">
          {[
            { id: 'students', label: 'Elever', icon: Star },
            { id: 'classes', label: 'Klasser', icon: Users },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-body font-500 transition-all ${
                tab === id
                  ? 'bg-bio-600 text-white shadow-bio'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-bio-500/30 border-t-bio-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {(tab === 'students' ? students : classes).map((item, i) => {
              const itemId = item.uid || item.id;
              const isMe = tab === 'students' && itemId === user?.uid;
              const rankClass = i < 3 ? RANK_CLASSES[i] : '';

              return (
                <div
                  key={itemId}
                  className={`bio-card p-4 flex items-center gap-4 transition-all ${rankClass} ${isMe ? 'ring-1 ring-bio-500/40' : ''}`}
                >
                  {/* Rank */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-700 text-lg ${
                    i === 0 ? 'text-earth-300' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-300' : 'text-slate-500 text-sm'
                  }`}>
                    {i < 3 ? RANK_MEDALS[i] : i + 1}
                  </div>

                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-700 text-sm ${
                    isMe ? 'bg-bio-600 text-white' : 'bg-gradient-to-br from-bio-800 to-moss-900 text-bio-300'
                  }`}>
                    {tab === 'students'
                      ? (item.name?.[0]?.toUpperCase() || '?')
                      : (item.name?.[0]?.toUpperCase() || '?')
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className={`font-body font-600 text-sm truncate ${isMe ? 'text-bio-300' : 'text-white'}`}>
                      {item.name} {isMe && <span className="text-bio-500 text-xs">(deg)</span>}
                    </div>
                    <div className="text-slate-500 text-xs font-body">
                      {tab === 'students'
                        ? `${(item.totalWaste || 0).toFixed(1)} kg avfall`
                        : `${(item.totalWaste || 0).toFixed(1)} kg · ${item.totalPoints || 0} poeng totalt`
                      }
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-right flex-shrink-0">
                    <div className={`font-mono font-700 text-base ${i === 0 ? 'gradient-text-gold' : 'text-bio-400'}`}>
                      {((tab === 'students' ? item.points : item.totalPoints) || 0).toLocaleString('no-NO')}
                    </div>
                    <div className="text-slate-600 text-xs font-body">poeng</div>
                  </div>
                </div>
              );
            })}

            {(tab === 'students' ? students : classes).length === 0 && (
              <div className="text-center py-16 text-slate-500">
                <Trophy size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-body">Ingen data ennå. Vær den første! 🌱</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
