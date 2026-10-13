import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Download, 
  Upload, 
  Trash2, 
  AlertTriangle, 
  Check, 
  Database,
  FileCheck,
  Info
} from 'lucide-react';
import { Language, t } from '../utils/translations';
import { AppBackupData } from '../types/recovery';

interface PrivacyPageProps {
  lang: Language;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ lang }) => {
  const strings = t[lang];

  const [backupSuccess, setBackupSuccess] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // ১. ব্যাকআপ ডাউনলোড (JSON Export)
  const handleExportBackup = () => {
    try {
      const installments = JSON.parse(localStorage.getItem('mdr_installments') || '[]');
      const complaints = JSON.parse(localStorage.getItem('mdr_complaints') || '[]');
      const locationHistory = JSON.parse(localStorage.getItem('mdr_location_history') || '[]');
      const technicianLogs = JSON.parse(localStorage.getItem('mdr_tech_logs') || '[]');
      const repairEstimates = JSON.parse(localStorage.getItem('mdr_repair_estimates') || '[]');
      const chatHistory = JSON.parse(localStorage.getItem('mdr_chat_sessions') || '[]');

      const backup: AppBackupData = {
        version: '1.2.0',
        exportDate: new Date().toISOString(),
        installments,
        complaints,
        locationHistory,
        technicianLogs,
        repairEstimates,
        chatHistory,
        settings: {
          autoLocationTracking: false,
          locationUpdateIntervalSeconds: 30,
          soundAlerts: true,
          theme: 'dark',
          privacyPolicyAccepted: true,
        },
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MDR_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setBackupSuccess(true);
      setTimeout(() => setBackupSuccess(false), 3000);
    } catch {
      alert('ব্যাকআপ তৈরিতে সমস্যা হয়েছে।');
    }
  };

  // ২. ব্যাকআপ রিস্টোর (JSON Import)
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content) as AppBackupData;

        if (Array.isArray(parsed.installments)) {
          localStorage.setItem('mdr_installments', JSON.stringify(parsed.installments));
        }
        if (Array.isArray(parsed.complaints)) {
          localStorage.setItem('mdr_complaints', JSON.stringify(parsed.complaints));
        }
        if (Array.isArray(parsed.locationHistory)) {
          localStorage.setItem('mdr_location_history', JSON.stringify(parsed.locationHistory));
        }
        if (Array.isArray(parsed.technicianLogs)) {
          localStorage.setItem('mdr_tech_logs', JSON.stringify(parsed.technicianLogs));
        }
        if (Array.isArray(parsed.repairEstimates)) {
          localStorage.setItem('mdr_repair_estimates', JSON.stringify(parsed.repairEstimates));
        }
        if (Array.isArray(parsed.chatHistory)) {
          localStorage.setItem('mdr_chat_sessions', JSON.stringify(parsed.chatHistory));
        }

        setRestoreMessage('ব্যাকআপ সফলভাবে পুনরুদ্ধার করা হয়েছে! পেজ রিলোড হচ্ছে...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err: any) {
        setRestoreMessage(`ভুল বা করাপ্ট ব্যাকআপ ফাইল: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  // ৩. সকল লোকাল ডেটা ক্লিয়ার
  const handleClearAllData = () => {
    localStorage.removeItem('mdr_installments');
    localStorage.removeItem('mdr_complaints');
    localStorage.removeItem('mdr_location_history');
    localStorage.removeItem('mdr_tech_logs');
    localStorage.removeItem('mdr_repair_estimates');
    localStorage.removeItem('mdr_chat_sessions');
    localStorage.removeItem('mdr_active_session_id');
    setShowClearConfirm(false);
    window.location.reload();
  };

  return (
    <div className="space-y-5 animate-fade-in pb-16">
      {/* হেডার */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>{strings.privacy}</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          {lang === 'bn' 
            ? 'ডিভাইস নিরাপত্তা, নৈতিক নীতিমালা ও তথ্যের সুরক্ষা প্রতিশ্রুতি।' 
            : 'Device security, ethical compliance, and data privacy principles.'}
        </p>
      </div>

      {/* গোপনীয়তা নীতিমালা পয়েন্টসমূহ */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>{lang === 'bn' ? 'আমাদের ৩টি মৌলিক গোপনীয়তা নীতি' : 'Our 3 Core Privacy Principles'}</span>
        </h3>

        <div className="space-y-3 text-xs sm:text-sm text-slate-300">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
              <span>১. কোনো ব্যক্তিগত পাসওয়ার্ড বা অ্যাকাউন্টের তথ্য চাওয়া হয় না</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'bn'
                ? 'Mafhuz Device Recovery ব্যবহারকারীর কাছ থেকে কখনোই গুগল পাসওয়ার্ড, স্ক্রিন পিন, বা ওটিপি (OTP) চায় না। আমরা কোনো অননুমোদিত কী-লগার বা পাসওয়ার্ড সংগ্রহকারী অ্যালগরিদম ব্যবহার করি না।'
                : 'We never request or store Google account passwords, lock PINs, or bank OTPs. No surveillance tools are employed.'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
              <span>২. শতভাগ লোকাল ও অফলাইন ফার্স্ট ডেটা হ্যান্ডলিং</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'bn'
                ? 'আপনার ইনপুটকৃত কিস্তির হিসাব এবং প্রস্তুতকৃত অভিযোগপত্র শুধুমাত্র আপনার ব্রাউজারের লোকাল স্টোরেজে সংরক্ষিত থাকে। কোনো দূরবর্তী ক্লাউড সার্ভারে গোপনে কোনো ব্যক্তিগত তথ্য পাঠানো হয় না।'
                : 'All installment records and drafted grievances remain stored strictly inside your browser local storage. No data is sent to external servers.'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
              <span>৩. অননুমোদিত বাইপাস বা হ্যাকিংয়ের কঠোর নিষেধাজ্ঞা</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'bn'
                ? 'আন্তর্জাতিক সাইবার নিরাপত্তা ও কপিরাইট আইন অনুযায়ী আমরা কোনো প্রতিষ্ঠানের রিমোট সিকিউরিটি নিয়ন্ত্রণ বাইপাস করি না। আমরা শুধুমাত্র নির্মাতা কর্তৃক প্রদত্ত অফিশিয়াল রিকভারি পদ্ধতি এবং ভোক্তা সুরক্ষার বৈধ পথপ্রদর্শন করি।'
                : 'We strictly comply with global device security standards. We do not bypass proprietary vendor locks and only educate on official recovery workflows.'}
            </p>
          </div>
        </div>
      </div>

      {/* ব্যাকআপ ও ডেটা ম্যানেজমেন্ট সেকশন */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <span>{lang === 'bn' ? 'লোকাল ডেটা ব্যাকআপ ও পুনরুদ্ধার' : 'Local Data Backup & Restore'}</span>
        </h3>
        <p className="text-xs text-slate-400">
          {lang === 'bn' 
            ? 'আপনার সকল কিস্তির রসিদ ও অভিযোগের ডেটা একটি সিঙ্গেল JSON ফাইলে ব্যাকআপ নিতে পারেন এবং প্রয়োজনে যেকোনো ডিভাইসে রিস্টোর করতে পারেন।'
            : 'Export all your installment receipts and complaints to a secure JSON file and restore anytime.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* ব্যাকআপ ডাউনলোড */}
          <button
            onClick={handleExportBackup}
            type="button"
            className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 flex items-center justify-between text-xs font-semibold text-slate-200 transition active:scale-98"
          >
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'bn' ? 'ব্যাকআপ ডাউনলোড (JSON)' : 'Download Backup (JSON)'}</span>
            </div>
            {backupSuccess && <Check className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* ব্যাকআপ রিস্টোর */}
          <label className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between text-xs font-semibold text-slate-200 transition active:scale-98 cursor-pointer">
            <div className="flex items-center gap-2.5">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>{lang === 'bn' ? 'ব্যাকআপ ফাইল আপলোড' : 'Upload Backup File'}</span>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>

        {restoreMessage && (
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-300">
            {restoreMessage}
          </div>
        )}
      </div>

      {/* বিপজ্জনক জোন: সমস্ত ডেটা মুছে ফেলা */}
      <div className="bg-rose-950/20 border border-rose-500/30 rounded-3xl p-5 sm:p-6 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-rose-300 flex items-center gap-1.5">
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>{lang === 'bn' ? 'সমস্ত লোকাল তথ্য মুছে ফেলুন' : 'Reset All Local Data'}</span>
            </h4>
            <p className="text-xs text-rose-200/80 mt-1 leading-relaxed">
              {lang === 'bn'
                ? 'এটি ব্রাউজারে সংরক্ষিত সমস্ত কিস্তির রসিদ ও অভিযোগের ড্রাফট স্থায়ীভাবে মুছে ফেলবে এবং প্রাথমিক ডেমো অবস্থায় ফিরে যাবে।'
                : 'This will permanently wipe all local installment records and complaints, returning the app to clean factory demo state.'}
            </p>
          </div>

          <button
            onClick={() => setShowClearConfirm(true)}
            type="button"
            className="shrink-0 px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition active:scale-95"
          >
            {lang === 'bn' ? 'মুছে ফেলুন' : 'Clear Data'}
          </button>
        </div>

        {/* কনফার্মেশন প্রম্পট */}
        {showClearConfirm && (
          <div className="p-3 rounded-xl bg-rose-900/40 border border-rose-500/50 text-xs text-rose-200 space-y-2">
            <p className="font-semibold">
              {lang === 'bn' ? 'আপনি কি নিশ্চিত যে সমস্ত লোকাল রেকর্ড মুছে ফেলতে চান?' : 'Are you sure you want to permanently clear all local records?'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleClearAllData}
                type="button"
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                {lang === 'bn' ? 'হ্যাঁ, সম্পূর্ণ মুছুন' : 'Yes, Delete All'}
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                type="button"
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
