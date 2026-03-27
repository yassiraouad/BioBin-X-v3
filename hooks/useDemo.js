import { createContext, useContext, useState, useEffect } from 'react';

const demoData = {
  school: {
    id: 'demo-school-1',
    name: 'Kurland skole',
  },
  classes: [
    {
      id: 'class-7a',
      name: '7A',
      students: 22,
      weeklyStats: { weight: 14.2, empties: 6, streak: 5 },
      rank: 1,
      groups: ['Arbeidsgruppe 1', 'Arbeidsgruppe 2', 'Arbeidsgruppe 3'],
    },
    {
      id: 'class-7b',
      name: '7B',
      students: 20,
      weeklyStats: { weight: 11.8, empties: 5, streak: 3 },
      rank: 2,
      groups: ['Arbeidsgruppe 1', 'Arbeidsgruppe 2', 'Arbeidsgruppe 3'],
    },
    {
      id: 'class-6a',
      name: '6A',
      students: 19,
      weeklyStats: { weight: 9.4, empties: 4, streak: 2 },
      rank: 3,
      groups: ['Arbeidsgruppe 1', 'Arbeidsgruppe 2', 'Arbeidsgruppe 3'],
    },
  ],
  bins: [
    { id: 'bin-7a-1', classId: 'class-7a', name: 'BioBin 7A-1', status: 'active', lastEmptied: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'bin-7a-2', classId: 'class-7a', name: 'BioBin 7A-2', status: 'active', lastEmptied: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'bin-7a-3', classId: 'class-7a', name: 'BioBin 7A-3', status: 'active', lastEmptied: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'bin-7b-1', classId: 'class-7b', name: 'BioBin 7B-1', status: 'active', lastEmptied: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'bin-7b-2', classId: 'class-7b', name: 'BioBin 7B-2', status: 'active', lastEmptied: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'bin-7b-3', classId: 'class-7b', name: 'BioBin 7B-3', status: 'active', lastEmptied: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'bin-6a-1', classId: 'class-6a', name: 'BioBin 6A-1', status: 'active', lastEmptied: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'bin-6a-2', classId: 'class-6a', name: 'BioBin 6A-2', status: 'active', lastEmptied: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'bin-6a-3', classId: 'class-6a', name: 'BioBin 6A-3', status: 'active', lastEmptied: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  ],
  challenges: [
    {
      id: 'challenge-1',
      title: 'Kast 15kg denne uken',
      description: 'Samlet 15kg matavfall denne uken',
      targetWeight: 15,
      currentWeight: 14.2,
      progress: 0.947,
      classId: 'class-7a',
      status: 'active',
    },
    {
      id: 'challenge-2',
      title: 'Tøm bøtten 5 dager på rad',
      description: 'Tøm biobøtten hver dag i 5 dager',
      targetStreak: 5,
      currentStreak: 5,
      progress: 1,
      classId: 'class-7a',
      status: 'completed',
    },
  ],
  co2Prognose: {
    nextMonth: 42,
    nextYear: 504,
    aiSummary: 'Kurland skole er på god vei til å spare over 500kg CO₂ dette skoleåret — tilsvarende 2 flyreiser Oslo–London.',
  },
  leaderboard: [
    { classId: 'class-7a', className: '7A', weight: 14.2, rank: 1 },
    { classId: 'class-7b', className: '7B', weight: 11.8, rank: 2 },
    { classId: 'class-6a', className: '6A', weight: 9.4, rank: 3 },
  ],
  demoUser: {
    uid: 'demo-user-1',
    name: 'Demo Lærer',
    email: 'demo@biobin.no',
    role: 'teacher',
    classId: 'class-7a',
    className: '7A',
    points: 340,
    ecoLevel: 'Gold',
    schoolId: 'demo-school-1',
    schoolName: 'Kurland skole',
  },
};

const initialLocalState = {
  scans: 0,
  totalWeight: 0,
  co2Saved: 0,
  points: 340,
  streak: 5,
  weeklyQuizScore: 0,
  completedChallenges: [],
  reactions: [],
};

const DemoContext = createContext({});

export function DemoProvider({ children }) {
  const [isDemo, setIsDemo] = useState(false);
  const [demoUser, setDemoUser] = useState(null);
  const [localState, setLocalState] = useState(initialLocalState);

  useEffect(() => {
    const stored = localStorage.getItem('biobin-demo');
    if (stored) {
      const parsed = JSON.parse(stored);
      setIsDemo(true);
      setDemoUser(parsed.demoUser);
      setLocalState(parsed.localState || initialLocalState);
    }
  }, []);

  const startDemo = () => {
    const demoState = {
      isDemo: true,
      demoUser: demoData.demoUser,
      localState: initialLocalState,
    };
    localStorage.setItem('biobin-demo', JSON.stringify(demoState));
    setIsDemo(true);
    setDemoUser(demoData.demoUser);
    setLocalState(initialLocalState);
  };

  const exitDemo = () => {
    localStorage.removeItem('biobin-demo');
    setIsDemo(false);
    setDemoUser(null);
    setLocalState(initialLocalState);
  };

  const updateLocalState = (updates) => {
    setLocalState(prev => {
      const newState = { ...prev, ...updates };
      if (isDemo) {
        localStorage.setItem('biobin-demo', JSON.stringify({ demoUser: demoData.demoUser, localState: newState }));
      }
      return newState;
    });
  };

  const addScan = (weight) => {
    const co2Saved = weight * 0.68;
    const points = Math.round(weight * 10);
    updateLocalState({
      scans: localState.scans + 1,
      totalWeight: localState.totalWeight + weight,
      co2Saved: localState.co2Saved + co2Saved,
      points: localState.points + points,
    });
  };

  const addReaction = (type) => {
    updateLocalState({
      reactions: [...localState.reactions, { type, timestamp: Date.now() }],
    });
  };

  const completeChallenge = (challengeId) => {
    if (!localState.completedChallenges.includes(challengeId)) {
      updateLocalState({
        completedChallenges: [...localState.completedChallenges, challengeId],
      });
    }
  };

  const value = {
    isDemo,
    demoUser,
    demoData,
    localState,
    startDemo,
    exitDemo,
    updateLocalState,
    addScan,
    addReaction,
    completeChallenge,
  };

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  );
}

export const useDemo = () => useContext(DemoContext);