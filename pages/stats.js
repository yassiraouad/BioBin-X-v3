// pages/stats.js
import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';
import { useDemo } from '../hooks/useDemo';
import { getUserLogs, getGlobalStats } from '../firebase/db';
import { calculateEnergy, calculateCO2Saved, getWeeklyData } from '../utils/calculator';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart2, Leaf, Zap, Wind, Globe, TrendingUp } from 'lucide-react';

const COLORS = ['#22c55e', '#84cc16', '#eab308', '#16a34a'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-800 border border-bio-border rounded-xl p-3 text-sm font-body">
        <p className="text-slate-400">{label}</p>
        <p className="text-bio-400 font-600">{payload[0].value} {payload[0].name === 'weight' ? 'kg' : ''}</p>
      </div>
    );
  }
  return null;
};

export default function Stats() {
  const { user, userData } = useAuth();
  const { isDemo, demoData, localState } = useDemo();
  const [logs, setLogs] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [tab, setTab] = useState('personal');

  useEffect(() => {
    if (isDemo) {
      const demoLogs = [
        { timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), weight: 2.3 },
        { timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), weight: 1.8 },
        { timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), weight: 2.1 },
        { timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), weight: 1.5 },
        { timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), weight: 2.0 },
        { timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), weight: 1.2 },
        { timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), weight: 1.9 },
      ];
      setLogs(demoLogs);
      setWeeklyData(getWeeklyData(demoLogs));
      setGlobalStats({
        totalWaste: demoData.classes.reduce((sum, c) => sum + c.weeklyStats.weight, 0),
        totalEnergy: demoData.classes.reduce((sum, c) => sum + c.weeklyStats.weight * 0.5, 0),
        totalCO2: demoData.classes.reduce((sum, c) => sum + c.weeklyStats.weight * 0.8, 0),
        activeUsers: demoData.classes.reduce((sum, c) => sum + c.students, 0),
        totalScans: demoData.classes.reduce((sum, c) => sum + c.weeklyStats.empties * 10, 0),
      });
      return;
    }

    if (user) {
      getUserLogs(user.uid).then(userLogs => {
        setLogs(userLogs || []);
        setWeeklyData(getWeeklyData(userLogs || []));
      }).catch(() => {
        setLogs([]);
        setWeeklyData([]);
      });
    }
    getGlobalStats().then(stats => setGlobalStats(stats)).catch(() => setGlobalStats(null));
  }, [user, isDemo]);

  const totalWaste = isDemo ? localState.totalWeight : (userData?.totalWaste || 0);
  const energy = calculateEnergy(totalWaste);
  const co2 = calculateCO2Saved(totalWaste);

  // Distribution for pie chart
  const distributionData = [
    { name: 'Grønnsaker', value: 35 },
    { name: 'Brød', value: 25 },
    { name: 'Frukt', value: 20 },
    { name: 'Annet', value: 20 },
  ];

  return (
    <Layout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="mb-8 animate-slide-up">
          <h1 className="font-display font-700 text-white text-2xl lg:text-3xl mb-1 flex items-center gap-3">
            <BarChart2 size={28} className="text-bio-400" />
            Statistikk
          </h1>
          <p className="text-slate-400 font-body">Din og skolens miljøpåvirkning</p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-6 p-1 bg-white/4 rounded-xl w-fit">
          {[
            { id: 'personal', label: 'Personlig' },
            { id: 'global', label: 'Skolen' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-5 py-2.5 rounded-lg text-sm font-body font-500 transition-all ${
                tab === id ? 'bg-bio-600 text-white shadow-bio' : 'text-slate-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'personal' ? (
          <>
            {/* Personal stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Matavfall totalt', value: `${totalWaste.toFixed(1)} kg`, icon: Leaf, color: 'bio', sub: `${logs.length} registreringer` },
                { label: 'Energi produsert', value: `${energy.toFixed(2)} kWh`, icon: Zap, color: 'moss', sub: 'Fra biogas' },
                { label: 'CO₂ spart', value: `${co2.toFixed(2)} kg`, icon: Wind, color: 'earth', sub: 'vs. deponi' },
              ].map(({ label, value, icon: Icon, color, sub }) => (
                <div key={label} className="bio-card p-5">
                  <div className={`w-9 h-9 rounded-xl bg-${color}-500/15 flex items-center justify-center mb-3`}>
                    <Icon size={18} className={`text-${color}-400`} />
                  </div>
                  <div className="font-display font-700 text-white text-xl">{value}</div>
                  <div className="text-slate-400 text-xs font-body mt-1">{label}</div>
                  <div className="text-slate-600 text-xs font-body">{sub}</div>
                </div>
              ))}
            </div>

            {/* Weekly area chart */}
            <div className="bio-card p-6 mb-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-700 text-white text-lg">Ukentlig matavfall</h2>
                <TrendingUp size={16} className="text-bio-400" />
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="weight" stroke="#22c55e" fill="url(#grad1)" strokeWidth={2.5} dot={{ fill: '#22c55e', r: 4, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart - distribution */}
            <div className="bio-card p-6">
              <h2 className="font-display font-700 text-white text-lg mb-5">Type matavfall (estimat)</h2>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={160}>
                  <PieChart>
                    <Pie data={distributionData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3 flex-1">
                  {distributionData.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                        <span className="text-slate-300 text-sm font-body">{item.name}</span>
                      </div>
                      <span className="text-slate-500 text-sm font-mono">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Global stats */
          <div>
            {globalStats && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Total avfall', value: `${(globalStats.totalWaste || 0).toFixed(0)} kg`, icon: Leaf, color: 'bio' },
                    { label: 'Energi totalt', value: `${(globalStats.totalEnergy || 0).toFixed(0)} kWh`, icon: Zap, color: 'moss' },
                    { label: 'CO₂ spart', value: `${(globalStats.totalCO2 || 0).toFixed(0)} kg`, icon: Wind, color: 'earth' },
                    { label: 'Registreringer', value: globalStats.totalLogs || 0, icon: Globe, color: 'bio' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bio-card p-5">
                      <div className={`w-9 h-9 rounded-xl bg-${color}-500/15 flex items-center justify-center mb-3`}>
                        <Icon size={18} className={`text-${color}-400`} />
                      </div>
                      <div className="font-display font-700 text-white text-xl">{value}</div>
                      <div className="text-slate-500 text-xs font-body mt-1">{label}</div>
                    </div>
                  ))}
                </div>

                <div className="bio-card p-6">
                  <h2 className="font-display font-700 text-white text-lg mb-3">CO₂ ekvivalenter</h2>
                  <div className="space-y-4">
                    {[
                      { label: 'Bilkjøring spart', value: `${((globalStats.totalCO2 || 0) * 4).toFixed(0)} km`, icon: '🚗' },
                      { label: 'Flyreiser spart', value: `${((globalStats.totalCO2 || 0) / 90).toFixed(1)} Oslo-London`, icon: '✈️' },
                      { label: 'Trær plantet eq.', value: `${Math.round((globalStats.totalCO2 || 0) / 21)} trær/år`, icon: '🌳' },
                    ].map(({ label, value, icon }) => (
                      <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/6">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{icon}</span>
                          <span className="text-slate-300 text-sm font-body">{label}</span>
                        </div>
                        <span className="text-bio-400 font-mono font-600 text-sm">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
