import { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { setUserLanguage } from '../firebase/db';

const languages = [
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'so', name: 'Soomaali', flag: '🇸🇴' },
];

export default function LanguageSelector({ currentLanguage = 'no', userId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(languages.find(l => l.code === currentLanguage) || languages[0]);

  const handleSelect = async (lang) => {
    setSelected(lang);
    setIsOpen(false);
    if (userId) {
      try {
        await setUserLanguage(userId, lang.code);
      } catch (err) {
        console.error('Error saving language:', err);
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
      >
        <Globe size={16} className="text-slate-400" />
        <span className="text-sm text-white">{selected.flag} {selected.name}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-48 bg-dark-800 border border-bio-border rounded-xl shadow-lg overflow-hidden z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang)}
              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <span className="text-white text-sm">{lang.flag} {lang.name}</span>
              {selected.code === lang.code && <Check size={16} className="text-bio-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function useTranslation(lang = 'no') {
  const translations = {
    no: {
      welcome: 'Velkommen til BioBin X!',
      checkin: 'Sjekk inn i dag',
      register: 'Registrer matavfall',
      leaderboard: 'Rangering',
      quiz: 'Quiz',
      settings: 'Innstillinger',
      logout: 'Logg ut',
      offline: 'Du er frakoblet',
      syncing: 'Synkroniserer...',
    },
    en: {
      welcome: 'Welcome to BioBin X!',
      checkin: 'Check in today',
      register: 'Register food waste',
      leaderboard: 'Leaderboard',
      quiz: 'Quiz',
      settings: 'Settings',
      logout: 'Log out',
      offline: 'You are offline',
      syncing: 'Syncing...',
    },
    ar: {
      welcome: 'مرحباً بك في BioBin X!',
      checkin: 'تسجيل الدخول اليوم',
      register: 'تسجيل نفايات الطعام',
      leaderboard: 'لوحة المتصدرين',
      quiz: 'اختبار',
      settings: 'الإعدادات',
      logout: 'تسجيل الخروج',
      offline: 'أنت غير متصل',
      syncing: 'جارٍ المزامنة...',
    },
    so: {
      welcome: 'Ku soo dhawow BioBin X!',
      checkin: 'Check in maanta',
      register: 'Diiri cunto-cunato',
      leaderboard: 'Bogga hore',
      quiz: 'Imtixaan',
      settings: 'Dejinta',
      logout: 'Ka bax',
      offline: 'Waxaad ku xiran tahay',
      syncing: 'Syncing...',
    },
  };

  return (key) => translations[lang]?.[key] || translations.no[key] || key;
}