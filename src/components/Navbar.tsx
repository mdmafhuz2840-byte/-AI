import React, { useState, useRef, useEffect } from 'react';
import { 
  Home, 
  Smartphone, 
  Receipt, 
  MessageSquareWarning, 
  ShieldCheck, 
  Sparkles, 
  Globe, 
  Radio, 
  Wrench, 
  Sun, 
  Moon,
  ChevronDown,
  Check,
  Bot,
  LayoutDashboard,
  Settings,
  Send,
  Download
} from 'lucide-react';
import { Language, t } from '../utils/translations';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { Agent, AI_AGENTS } from '../types/agents';
import { renderAgentIcon } from './AgentSelector';

export type AppTab = 'home' | 'diagnostic' | 'tracker' | 'tools' | 'installments' | 'complaints' | 'privacy' | 'ai' | 'admin' | 'settings' | 'telegram' | 'download';

interface NavbarProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  lang: Language;
  onToggleLang: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onOpenApkGuide?: () => void;
  onOpenStateMonitor?: () => void;
  selectedAgent?: Agent;
  onSelectAgent?: (agent: Agent) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  lang,
  onToggleLang,
  theme = 'dark',
  onToggleTheme,
  onOpenApkGuide,
  onOpenStateMonitor,
  selectedAgent,
  onSelectAgent,
}) => {
  const strings = t[lang];
  const [isAgentMenuOpen, setIsAgentMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // বাইরে ক্লিক করলে অ্যাসিস্ট্যান্ট ড্রপডাউন বন্ধ হবে
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAgentMenuOpen(false);
      }
    };
    if (isAgentMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAgentMenuOpen]);

  const activeAgent = selectedAgent || AI_AGENTS[0];

  const handleAgentClick = (agent: Agent) => {
    if (onSelectAgent) {
      onSelectAgent(agent);
    }
    // স্বয়ংক্রিয়ভাবে AI ট্যাবে নিয়ে যাওয়া যাতে ইউজার সরাসরি চ্যাট শুরু করতে পারে
    onTabChange('ai');
    setIsAgentMenuOpen(false);
  };

  return (
    <>
      {/* ১. শীর্ষ বার (Top Android App Bar with Prominent Assistant Selector) */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-4xl mx-auto px-2.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2">
          {/* লোগো ও ব্র্যান্ড নাম */}
          <div 
            onClick={() => onTabChange('home')}
            className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer active:scale-98 transition shrink-0"
            title="হোম পেজে যান"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h1 className="text-xs sm:text-base font-bold tracking-tight text-white flex items-center gap-1 leading-none">
                Mafhuz Recovery
              </h1>
              <p className="text-[9px] sm:text-[10px] text-emerald-400 font-medium mt-0.5 sm:mt-1 leading-none hidden md:block">
                {strings.tagline}
              </p>
            </div>
          </div>

          {/* ২. হেডারে লক্ষণীয় অ্যাসিস্ট্যান্ট সিলেক্টর ড্রপডাউন (PROMINENT ASSISTANT SELECTOR DROPDOWN) */}
          <div className="relative flex-1 max-w-[210px] sm:max-w-xs mx-1 sm:mx-2" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsAgentMenuOpen(!isAgentMenuOpen)}
              className={`w-full flex items-center justify-between gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 shadow-sm cursor-pointer ${
                isAgentMenuOpen
                  ? 'bg-slate-800 text-white border-emerald-500 ring-2 ring-emerald-500/30'
                  : 'bg-slate-800/95 hover:bg-slate-800 text-slate-100 border-slate-700/80 hover:border-slate-600'
              }`}
              title="এআই সহকারী মোড পরিবর্তন করুন"
              aria-label="Assistant Selector Dropdown"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`p-1 rounded-lg ${activeAgent.colorClass.bg} ${activeAgent.colorClass.text} shrink-0`}>
                  {renderAgentIcon(activeAgent.iconName, 'w-3.5 h-3.5')}
                </span>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-[11px] sm:text-xs font-bold truncate text-slate-100 leading-tight">
                    {activeAgent.name}
                  </span>
                  <span className="text-[9px] text-emerald-400 truncate hidden xs:block leading-none">
                    {activeAgent.badge}
                  </span>
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${isAgentMenuOpen ? 'rotate-180 text-emerald-400' : ''}`} />
            </button>

            {/* হেডারের পপআপ ড্রপডাউন মেনু (১১টি স্পেশালাইজড মোড) */}
            {isAgentMenuOpen && (
              <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-72 sm:w-84 z-50 bg-slate-900/98 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-2 space-y-1 max-h-[80vh] overflow-y-auto scrollbar-thin animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
                      সহকারী মোড নির্বাচন ({AI_AGENTS.length})
                    </span>
                    <span className="text-[10px] text-emerald-400">
                      সরাসরি মোড পরিবর্তন করুন
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                    MDR AI Hub
                  </span>
                </div>

                <div className="py-1 space-y-0.5">
                  {AI_AGENTS.map((agent) => {
                    const isSelected = agent.id === activeAgent.id;
                    return (
                      <button
                        key={agent.id}
                        type="button"
                        onClick={() => handleAgentClick(agent)}
                        className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800/90 text-white ring-1 ring-emerald-500/40 shadow-sm'
                            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${agent.colorClass.bg} ${agent.colorClass.text} border ${agent.colorClass.border}`}>
                          {renderAgentIcon(agent.iconName, 'w-4 h-4')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-white truncate">
                              {agent.name}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal shrink-0 ${agent.colorClass.bg} ${agent.colorClass.text}`}>
                              {agent.badge}
                            </span>
                          </div>
                          <p className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5">
                            {agent.description}
                          </p>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* অ্যাকশন বাটনসমূহ (মেমোরি স্ট্যাটাস ব্যাজ, ডার্ক/লাইট মোড, ভাষা ও APK গাইড) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* ভিজ্যুয়াল স্ট্যাটাস ইন্ডিকেটর: মেমোরি ও অটো-আপডেট */}
            {onOpenStateMonitor && (
              <ProjectStatusBadge 
                onOpenMonitor={onOpenStateMonitor}
                lang={lang}
              />
            )}

            {/* ডার্ক / লাইট মোড টগল বাটন */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                type="button"
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition active:scale-95 shadow-sm cursor-pointer"
                title={theme === 'dark' ? (lang === 'bn' ? 'লাইট মোড চালু করুন' : 'Switch to Light Mode') : (lang === 'bn' ? 'ডার্ক মোড চালু করুন' : 'Switch to Dark Mode')}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden lg:inline">{lang === 'bn' ? 'লাইট' : 'Light'}</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="hidden lg:inline">{lang === 'bn' ? 'ডার্ক' : 'Dark'}</span>
                  </>
                )}
              </button>
            )}

            {onOpenApkGuide && (
              <button
                onClick={onOpenApkGuide}
                type="button"
                className="hidden sm:flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 transition active:scale-95 shadow-sm cursor-pointer"
                title="Android APK Export & Install Guide"
              >
                <span>APK গাইড</span>
              </button>
            )}

            <button
              onClick={onToggleLang}
              type="button"
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-95 shadow-sm cursor-pointer"
              title="Change Language (বাংলা / English)"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>

            {/* সুপার এডমিন প্যানেল হেডার শর্টকাট */}
            <button
              onClick={() => onTabChange('admin')}
              type="button"
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl transition active:scale-95 shadow-sm cursor-pointer ${
                currentTab === 'admin'
                  ? 'bg-indigo-600 text-white border border-indigo-400 shadow-indigo-600/30 ring-2 ring-indigo-500/40'
                  : 'bg-indigo-950/70 hover:bg-indigo-900/70 text-indigo-300 border border-indigo-500/40'
              }`}
              title="মাহফুজুর রহমান AI — সুপার এডমিন প্যানেল"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang === 'bn' ? 'এডমিন' : 'Admin'}</span>
            </button>

            {/* AI API সংযোগ ও সেটিংস হেডার শর্টকাট */}
            <button
              onClick={() => onTabChange('settings')}
              type="button"
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl transition active:scale-95 shadow-sm cursor-pointer ${
                currentTab === 'settings'
                  ? 'bg-teal-600 text-white border border-teal-400 shadow-teal-600/30 ring-2 ring-teal-500/40'
                  : 'bg-slate-800/90 hover:bg-slate-700 text-teal-300 border border-teal-500/40'
              }`}
              title="AI API সংযোগ (OpenRouter Setup)"
            >
              <Settings className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden xs:inline">{lang === 'bn' ? 'API' : 'API'}</span>
            </button>

            {/* টেলিগ্রাম বট হেডার শর্টকাট */}
            <button
              onClick={() => onTabChange('telegram')}
              type="button"
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl transition active:scale-95 shadow-sm cursor-pointer ${
                currentTab === 'telegram'
                  ? 'bg-cyan-600 text-white border border-cyan-400 shadow-cyan-600/30 ring-2 ring-cyan-500/40'
                  : 'bg-cyan-950/70 hover:bg-cyan-900/70 text-cyan-300 border border-cyan-500/40'
              }`}
              title="টেলিগ্রাম বট (@mahfuzur_rahman_ai_bot)"
            >
              <Send className="w-3.5 h-3.5 text-cyan-400" />
              <span>টেলিগ্রাম</span>
            </button>

            {/* APK ডাউনলোড হেডার বাটন */}
            <button
              onClick={() => onTabChange('download')}
              type="button"
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl transition active:scale-95 shadow-sm cursor-pointer ${
                currentTab === 'download'
                  ? 'bg-blue-600 text-white border border-blue-400 shadow-blue-600/30 ring-2 ring-blue-500/40 animate-pulse'
                  : 'bg-blue-950/70 hover:bg-blue-900/70 text-blue-300 border border-blue-500/40'
              }`}
              title="মাহফুজুর রহমান AI — APK ডাউনলোড করুন"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>APK ডাউনলোড</span>
            </button>
          </div>
        </div>
      </header>

      {/* ২. বটম ন্যাভিগেশন বার (Android Mobile Bottom Nav Bar) */}
      <nav 
        aria-label="Android Bottom Navigation" 
        className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 shadow-2xl safe-area-pb"
      >
        <div className="max-w-3xl mx-auto px-1 flex items-center justify-between h-14 overflow-x-auto no-scrollbar">
          {/* হোম */}
          <button
            onClick={() => onTabChange('home')}
            className={`flex flex-col items-center justify-center flex-1 py-1 h-full transition cursor-pointer min-w-[50px] ${
              currentTab === 'home' ? 'text-emerald-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-4.5 h-4.5" />
            <span className="text-[9px] mt-1 truncate">{strings.home}</span>
          </button>

          {/* ডায়াগনস্টিক */}
          <button
            onClick={() => onTabChange('diagnostic')}
            className={`flex flex-col items-center justify-center flex-1 py-1 h-full transition cursor-pointer min-w-[50px] ${
              currentTab === 'diagnostic' ? 'text-emerald-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4.5 h-4.5" />
            <span className="text-[9px] mt-1 truncate">{strings.diagnostic}</span>
          </button>

          {/* ট্র্যাকার ও ডিভাইস */}
          <button
            onClick={() => onTabChange('tracker')}
            className={`flex flex-col items-center justify-center flex-1 py-1 h-full transition cursor-pointer min-w-[50px] ${
              currentTab === 'tracker' ? 'text-cyan-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-4.5 h-4.5" />
            <span className="text-[9px] mt-1 truncate">{strings.tracker}</span>
          </button>

          {/* প্রো টুলস */}
          <button
            onClick={() => onTabChange('tools')}
            className={`flex flex-col items-center justify-center flex-1 py-1 h-full transition cursor-pointer min-w-[50px] ${
              currentTab === 'tools' ? 'text-indigo-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-4.5 h-4.5" />
            <span className="text-[9px] mt-1 truncate">{lang === 'bn' ? 'টুলস' : 'Tools'}</span>
          </button>

          {/* কিস্তি ও রশিদ */}
          <button
            onClick={() => onTabChange('installments')}
            className={`flex flex-col items-center justify-center flex-1 py-1 h-full transition cursor-pointer min-w-[50px] ${
              currentTab === 'installments' ? 'text-emerald-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Receipt className="w-4.5 h-4.5" />
            <span className="text-[9px] mt-1 truncate">{lang === 'bn' ? 'কিস্তি' : 'Receipts'}</span>
          </button>

          {/* অভিযোগ সহায়তা */}
          <button
            onClick={() => onTabChange('complaints')}
            className={`flex flex-col items-center justify-center flex-1 py-1 h-full transition cursor-pointer min-w-[50px] ${
              currentTab === 'complaints' ? 'text-emerald-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquareWarning className="w-4.5 h-4.5" />
            <span className="text-[9px] mt-1 truncate">{lang === 'bn' ? 'অভিযোগ' : 'Claims'}</span>
          </button>

          {/* এআই সহকারী */}
          <button
            onClick={() => onTabChange('ai')}
            className={`flex flex-col items-center justify-center flex-1 py-1 h-full transition cursor-pointer min-w-[50px] ${
              currentTab === 'ai' ? 'text-teal-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4.5 h-4.5" />
            <span className="text-[9px] mt-1 truncate">{lang === 'bn' ? 'এআই' : 'AI'}</span>
          </button>

          {/* সুপার এডমিন */}
          <button
            onClick={() => onTabChange('admin')}
            className={`flex flex-col items-center justify-center flex-1 py-1 h-full transition cursor-pointer min-w-[50px] ${
              currentTab === 'admin' ? 'text-indigo-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4.5 h-4.5" />
            <span className="text-[9px] mt-1 truncate">{lang === 'bn' ? 'এডমিন' : 'Admin'}</span>
          </button>

          {/* AI API সংযোগ ও সেটিংস */}
          <button
            onClick={() => onTabChange('settings')}
            className={`flex flex-col items-center justify-center flex-1 py-1 h-full transition cursor-pointer min-w-[50px] ${
              currentTab === 'settings' ? 'text-teal-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="AI API সংযোগ (OpenRouter Setup)"
          >
            <Settings className="w-4.5 h-4.5" />
            <span className="text-[9px] mt-1 truncate">{lang === 'bn' ? 'সেটিংস' : 'Settings'}</span>
          </button>

          {/* টেলিগ্রাম বট */}
          <button
            onClick={() => onTabChange('telegram')}
            className={`flex flex-col items-center justify-center flex-1 py-1 h-full transition cursor-pointer min-w-[50px] ${
              currentTab === 'telegram' ? 'text-cyan-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="টেলিগ্রাম বট হাব (@mahfuzur_rahman_ai_bot)"
          >
            <Send className="w-4.5 h-4.5" />
            <span className="text-[9px] mt-1 truncate">টেলিগ্রাম</span>
          </button>

          {/* APK ডাউনলোড */}
          <button
            onClick={() => onTabChange('download')}
            className={`flex flex-col items-center justify-center flex-1 py-1 h-full transition cursor-pointer min-w-[50px] ${
              currentTab === 'download' ? 'text-blue-400 font-bold scale-105' : 'text-blue-400/70 hover:text-blue-300'
            }`}
            title="মাহফুজুর রহমান AI — APK ডাউনলোড"
          >
            <Download className="w-4.5 h-4.5" />
            <span className="text-[9px] mt-1 truncate font-semibold">APK</span>
          </button>

          {/* প্রাইভেসি */}
          <button
            onClick={() => onTabChange('privacy')}
            className={`flex flex-col items-center justify-center flex-1 py-1 h-full transition cursor-pointer min-w-[50px] ${
              currentTab === 'privacy' ? 'text-emerald-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4.5 h-4.5" />
            <span className="text-[9px] mt-1 truncate">{lang === 'bn' ? 'নীতি' : 'Policy'}</span>
          </button>
        </div>
      </nav>
    </>
  );
};
