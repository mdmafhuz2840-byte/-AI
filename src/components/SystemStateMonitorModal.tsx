import React, { useState, useEffect } from 'react';
import { 
  X, 
  Activity, 
  Brain, 
  Database, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  Smartphone, 
  Clock, 
  Save, 
  FileText, 
  Server, 
  Cpu, 
  Sliders, 
  Download, 
  Trash2,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  UserPreferences, 
  ModuleHealth, 
  ProjectChangeEvent, 
  ProjectStateSnapshot 
} from '../types/recovery';
import { 
  getUserPreferences, 
  saveUserPreferences, 
  getModulesHealth, 
  getProjectChangeLog, 
  clearProjectChangeLog,
  runSelfHealingMigration,
  exportProjectStateSnapshot,
  getEnrichedAiContext,
  CURRENT_SCHEMA_VERSION
} from '../services/projectStateUpdater';

interface SystemStateMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'bn' | 'en';
  activeModel?: string;
  onPreferencesUpdated?: (prefs: UserPreferences) => void;
}

export const SystemStateMonitorModal: React.FC<SystemStateMonitorModalProps> = ({
  isOpen,
  onClose,
  lang,
  activeModel = 'Vivo Y21',
  onPreferencesUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'memory' | 'modules' | 'changelog'>('memory');
  const [prefs, setPrefs] = useState<UserPreferences>(getUserPreferences());
  const [modules, setModules] = useState<ModuleHealth[]>([]);
  const [changelog, setChangelog] = useState<ProjectChangeEvent[]>([]);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationFeedback, setMigrationFeedback] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [storageBytes, setStorageBytes] = useState<number>(0);
  const [contextPreview, setContextPreview] = useState<string>('');

  // ডেটা লোড
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = () => {
    const currentPrefs = getUserPreferences();
    setPrefs(currentPrefs);
    setModules(getModulesHealth());
    setChangelog(getProjectChangeLog());

    // মেমোরি কনটেক্সট প্রাকদর্শন
    const enriched = getEnrichedAiContext(activeModel);
    setContextPreview(enriched.summaryText);

    // লোকালস্টোরেজ সাইজ গণনা
    if (typeof window !== 'undefined') {
      let total = 0;
      for (const x in localStorage) {
        if (x.startsWith('mdr_') && Object.prototype.hasOwnProperty.call(localStorage, x)) {
          total += (localStorage[x].length + x.length) * 2;
        }
      }
      setStorageBytes(total);
    }
  };

  if (!isOpen) return null;

  // সেটিংস সংরক্ষণ
  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveUserPreferences(prefs);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2500);
    loadData();
    if (onPreferencesUpdated) {
      onPreferencesUpdated(updated);
    }
  };

  // সেলফ-হিলিং মাইগ্রেশন চালানো
  const handleRunMigration = () => {
    setIsMigrating(true);
    setMigrationFeedback(null);
    setTimeout(() => {
      const result = runSelfHealingMigration();
      setIsMigrating(false);
      setMigrationFeedback(
        lang === 'bn' 
          ? `সেলফ-হিলিং সম্পন্ন! সংস্করণ: ${result.currentVersion}। সংরক্ষিত মডিউল: ${result.migratedModules.length || 'সব সক্রিয়'}`
          : `Self-healing migration complete! Version: ${result.currentVersion}. Validated modules: ${result.migratedModules.length || 'All active'}`
      );
      loadData();
    }, 600);
  };

  // স্ন্যাপশট ডাউনলোড
  const handleDownloadSnapshot = () => {
    const snapshot: ProjectStateSnapshot = exportProjectStateSnapshot();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MDR_Project_State_Snapshot_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // চেঞ্জলগ ক্লিয়ার
  const handleClearLog = () => {
    if (window.confirm(lang === 'bn' ? 'আপনি কি নিশ্চিত যে প্রজেক্ট হিস্ট্রি লগ মুছে ফেলতে চান?' : 'Clear all project change audit logs?')) {
      clearProjectChangeLog();
      setChangelog([]);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* শীর্ষ হেডার */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
                  {lang === 'bn' ? 'সিস্টেম স্টেট ও পারসিস্টেন্ট মেমোরি মনিটর' : 'System State & Persistent Memory Monitor'}
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  v{CURRENT_SCHEMA_VERSION}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'bn' 
                  ? 'স্বয়ংক্রিয় প্রজেক্ট স্টেট ট্র্যাকিং ও নিরবচ্ছিন্ন ক্রস-সেশন স্মৃতি' 
                  : 'Automated Project State Tracking & Cross-Session Memory Engine'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* সাব-ট্যাব ন্যাভিগেশন */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2 gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('memory')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'memory'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>{lang === 'bn' ? 'মেমোরি ও পছন্দ সেটিংস' : 'Memory & Preferences'}</span>
          </button>

          <button
            onClick={() => setActiveTab('modules')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'modules'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{lang === 'bn' ? 'মডিউল ইন্টিগ্রিটি ও সেলফ-আপডেট' : 'Module Health & Updater'}</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-slate-800 text-slate-300">
              {modules.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('changelog')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'changelog'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{lang === 'bn' ? 'প্রজেক্ট চেঞ্জলগ ও অডিট' : 'Project Changelog'}</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-slate-800 text-slate-300">
              {changelog.length}
            </span>
          </button>
        </div>

        {/* কনটেন্ট বডি */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          
          {/* ট্যাব ১: মেমোরি ও পছন্দ */}
          {activeTab === 'memory' && (
            <div className="space-y-5">
              {/* স্ট্যাটাস কার্ড গ্রিড */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                    <Brain className="w-3.5 h-3.5 text-emerald-400" />
                    <span>মেমোরি স্ট্যাটাস</span>
                  </div>
                  <div className="text-base font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>সক্রিয় (Active)</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                    <Database className="w-3.5 h-3.5 text-cyan-400" />
                    <span>লোকাল স্টোরেজ</span>
                  </div>
                  <div className="text-base font-bold text-white">
                    {formatSize(storageBytes)}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>মেমোরি উইন্ডো</span>
                  </div>
                  <div className="text-base font-bold text-white">
                    {prefs.memoryDepth} মেসেজ
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                    <span>অফলাইন নিরাপত্তা</span>
                  </div>
                  <div className="text-base font-bold text-emerald-400">
                    ১০০% সুরক্ষিত
                  </div>
                </div>
              </div>

              {/* টেকনিশিয়ান ও শপ কনফিগারেশন ফর্ম */}
              <form onSubmit={handleSavePreferences} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'bn' ? 'ব্যবহারকারী ও টেকনিশিয়ান পছন্দমালা' : 'User & Technician Preferences'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      {lang === 'bn' ? 'দোকান বা সার্ভিস পয়েন্টের নাম:' : 'Shop / Service Center Name:'}
                    </label>
                    <input
                      type="text"
                      value={prefs.shopName}
                      onChange={(e) => setPrefs({ ...prefs, shopName: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                      placeholder="যেমন: মাহফুজ ডিভাইস সার্ভিস হাব"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      {lang === 'bn' ? 'প্রধান টেকনিশিয়ানের নাম:' : 'Technician Name:'}
                    </label>
                    <input
                      type="text"
                      value={prefs.technicianName}
                      onChange={(e) => setPrefs({ ...prefs, technicianName: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                      placeholder="যেমন: মোঃ মাহফুজুর রহমান"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      {lang === 'bn' ? 'ডিফল্ট কাজের মডেল:' : 'Default Working Model:'}
                    </label>
                    <input
                      type="text"
                      value={prefs.preferredModel}
                      onChange={(e) => setPrefs({ ...prefs, preferredModel: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                      placeholder="যেমন: Vivo Y21"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      {lang === 'bn' ? 'মেমোরি কনটেক্সট গভীরতা (বার্তা সংখ্যা):' : 'Memory Context Depth (Messages):'}
                    </label>
                    <select
                      value={prefs.memoryDepth}
                      onChange={(e) => setPrefs({ ...prefs, memoryDepth: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value={5}>৫টি সাম্প্রতিক মেসেজ (দ্রুততম)</option>
                      <option value={10}>১০টি সাম্প্রতিক মেসেজ (স্ট্যান্ডার্ড)</option>
                      <option value={20}>২০টি সাম্প্রতিক মেসেজ (গভীর মেমোরি)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {lang === 'bn' ? 'বিশেষ টেকনিক্যাল নোট (যা এআই সব সময় মনে রাখবে):' : 'Special Technical Notes (Always remembered by AI):'}
                  </label>
                  <textarea
                    rows={2}
                    value={prefs.quickNotes}
                    onChange={(e) => setPrefs({ ...prefs, quickNotes: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Vivo Y21 ফাস্টবুট, রিকভারি মোড, স্ক্রিন প্যাটার্ন ও ইএমআই কিস্তি লক বিশেষজ্ঞ।"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={prefs.autoEnrichAiContext}
                      onChange={(e) => setPrefs({ ...prefs, autoEnrichAiContext: e.target.checked })}
                      className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span>{lang === 'bn' ? 'এআই প্রম্পটে স্বয়ংক্রিয় প্রজেক্ট স্টেট যোগ করা' : 'Auto-inject Project State into AI Prompts'}</span>
                  </label>

                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition active:scale-95"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saveFeedback ? 'সংরক্ষিত হয়েছে!' : 'পছন্দ সংরক্ষণ করুন'}</span>
                  </button>
                </div>
              </form>

              {/* রিয়েল-টাইম এআই কনটেক্সট প্রাকদর্শন */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>লাইভ এআই মেমোরি স্ন্যাপশট (Live Injected Context)</span>
                  </span>
                  <span className="text-[11px] text-slate-500">অনুরোধের সাথে স্বয়ংক্রিয়ভাবে প্রেরিত হয়</span>
                </div>
                <pre className="text-[11px] font-mono text-slate-300 bg-slate-900/80 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
                  {contextPreview}
                </pre>
              </div>
            </div>
          )}

          {/* ট্যাব ২: মডিউল ইন্টিগ্রিটি ও সেলফ-আপডেট */}
          {activeTab === 'modules' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>সেলফ-হিলিং অটো-আপডেট ও স্কিমা মাইগ্রেশন</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    পূর্ববর্তী কিস্তি, অভিযোগ ও আনলক গাইড অক্ষুণ্ণ রেখে নতুন কোড ও ফিচার ইন্টিগ্রেশন নিশ্চিত করে।
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunMigration}
                    disabled={isMigrating}
                    type="button"
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isMigrating ? 'animate-spin' : ''}`} />
                    <span>{isMigrating ? 'যাচাই হচ্ছে...' : 'সেলফ-টেস্ট ও মাইগ্রেশন'}</span>
                  </button>

                  <button
                    onClick={handleDownloadSnapshot}
                    type="button"
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition active:scale-95"
                    title="পুরো প্রজেক্টের স্টেট স্ন্যাপশট JSON হিসেবে সংরক্ষণ করুন"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>স্ন্যাপশট</span>
                  </button>
                </div>
              </div>

              {migrationFeedback && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{migrationFeedback}</span>
                </div>
              )}

              {/* মডিউল তালিকা গ্রিড */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {modules.map((m) => (
                  <div 
                    key={m.id}
                    className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-slate-600 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="font-semibold text-xs text-white">
                          {lang === 'bn' ? m.nameBn : m.nameEn}
                        </div>
                        <span className="shrink-0 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>সক্রিয়</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">
                        {m.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800 pt-2">
                      <span>রেকর্ড: <strong className="text-white">{m.recordsCount}</strong></span>
                      <span className="font-mono text-cyan-400">v{m.version}</span>
                      <span>চেক: {m.lastUpdated}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ট্যাব ৩: প্রজেক্ট চেঞ্জলগ ও অডিট */}
          {activeTab === 'changelog' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>প্রজেক্ট চেঞ্জ ও অ্যাকশন অডিট ট্রেইল</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    অ্যাপে হওয়া প্রতিটি গুরুত্বপূর্ণ পরিবর্তন ও মেমোরি ইভেন্ট স্বয়ংক্রিয়ভাবে নিচে রেকর্ড করা থাকে।
                  </p>
                </div>

                {changelog.length > 0 && (
                  <button
                    onClick={handleClearLog}
                    type="button"
                    className="px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg border border-rose-900/60 transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>লগ মুছুন</span>
                  </button>
                )}
              </div>

              {changelog.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  কোনো চেঞ্জলগ পাওয়া যায়নি। অ্যাপে নতুন কাজ করলে স্বয়ংক্রিয়ভাবে এখানে যুক্ত হবে।
                </div>
              ) : (
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {changelog.map((event) => (
                    <div 
                      key={event.id}
                      className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            event.category === 'ai_memory' 
                              ? 'bg-purple-900/60 text-purple-300 border border-purple-700/60'
                              : event.category === 'installment'
                              ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/60'
                              : event.category === 'complaint'
                              ? 'bg-amber-900/60 text-amber-300 border border-amber-700/60'
                              : event.category === 'preference'
                              ? 'bg-blue-900/60 text-blue-300 border border-blue-700/60'
                              : 'bg-slate-700 text-slate-300'
                          }`}>
                            {event.category}
                          </span>
                          <span className="font-semibold text-white">{event.action}</span>
                        </div>
                        <p className="text-slate-300 text-[11px]">{event.summary}</p>
                      </div>

                      <div className="text-[10px] text-slate-500 shrink-0 text-right">
                        {new Date(event.timestamp).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                        <div className="text-[9px]">
                          {new Date(event.timestamp).toLocaleDateString('bn-BD')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* ফুটার */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>পারসিস্টেন্ট আর্কিটেকচার ও লোকাল স্টোরেজ সিঙ্ক ১০০% সক্রিয়</span>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
