import React, { useState, useEffect } from 'react';
import { Activity, Brain, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { CURRENT_SCHEMA_VERSION, getUserPreferences } from '../services/projectStateUpdater';

interface ProjectStatusBadgeProps {
  onOpenMonitor: () => void;
  lang?: 'bn' | 'en';
}

export const ProjectStatusBadge: React.FC<ProjectStatusBadgeProps> = ({
  onOpenMonitor,
  lang = 'bn',
}) => {
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [lastEventSummary, setLastEventSummary] = useState<string>('সব মডিউল স্বাভাবিক');
  const [isPulsing, setIsPulsing] = useState<boolean>(false);

  useEffect(() => {
    updateCounts();

    const handleStateChange = (e: any) => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 2000);
      if (e?.detail?.summary) {
        setLastEventSummary(e.detail.summary);
      }
      updateCounts();
    };

    window.addEventListener('mdr-project-state-change', handleStateChange);
    return () => {
      window.removeEventListener('mdr-project-state-change', handleStateChange);
    };
  }, []);

  const updateCounts = () => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('mdr_chat_sessions');
        if (raw) {
          const sessions = JSON.parse(raw);
          setSessionCount(Array.isArray(sessions) ? sessions.length : 0);
        }
      } catch {
        // ignore
      }
    }
  };

  return (
    <button
      onClick={onOpenMonitor}
      type="button"
      className={`group flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:py-1.5 rounded-xl border transition cursor-pointer select-none ${
        isPulsing 
          ? 'bg-emerald-950/80 border-emerald-400/80 text-emerald-300 shadow-md shadow-emerald-500/20 scale-102' 
          : 'bg-slate-900/90 hover:bg-slate-800/90 border-emerald-500/30 hover:border-emerald-500/60 text-slate-200'
      }`}
      title={lang === 'bn' ? 'সিস্টেম স্টেট ও মেমোরি মনিটর খুলুন' : 'Open System State & Memory Monitor'}
    >
      <div className="relative flex items-center justify-center">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
        <span className="absolute w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75"></span>
      </div>

      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold leading-tight">
          <span className="text-emerald-400 font-bold">
            {lang === 'bn' ? 'মেমোরি ও অটো-আপডেট' : 'Memory & Auto-Update'}
          </span>
          <span className="text-[10px] text-slate-400 hidden md:inline">
            • {lang === 'bn' ? 'সক্রিয়' : 'Active'}
          </span>
        </div>
        <div className="text-[9px] text-slate-400 flex items-center gap-1 leading-none">
          <Brain className="w-2.5 h-2.5 text-teal-400" />
          <span>{sessionCount} {lang === 'bn' ? 'সেশন সিঙ্কড' : 'sessions'}</span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-cyan-400 font-mono hidden sm:inline">v{CURRENT_SCHEMA_VERSION}</span>
        </div>
      </div>

      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition hidden xs:block" />
    </button>
  );
};
