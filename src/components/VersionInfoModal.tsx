import React, { useState, useEffect } from 'react';
import { 
  X, 
  Info, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw, 
  Cpu, 
  Zap, 
  Globe, 
  Mic, 
  FileImage,
  GitBranch
} from 'lucide-react';
import { Language } from '../utils/translations';

interface VersionInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

interface VersionData {
  appName: string;
  version: string;
  releaseDate: string;
  channel: string;
  updateAvailable: boolean;
  changelog: Array<{
    version: string;
    date: string;
    title: string;
    features: string[];
  }>;
}

export const VersionInfoModal: React.FC<VersionInfoModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [versionData, setVersionData] = useState<VersionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetch('/api/version')
        .then((res) => res.json())
        .then((data) => setVersionData(data))
        .catch(() => {
          setVersionData({
            appName: 'মাহফুজুর রহমান AI',
            version: '3.5.0',
            releaseDate: '2026-10-12',
            channel: 'Production Stable',
            updateAvailable: false,
            changelog: [
              {
                version: 'v3.5.0',
                date: '2026-10-12',
                title: 'সুপার এআই রিলিজ ও মাল্টিমোডাল ইন্টিগ্রেশন',
                features: [
                  'বাংলা ভয়েস ইনপুট (Speech-to-Text) ও স্পিচ প্লেব্যাক (TTS)',
                  'Gemini লাইভ গুগল সার্চ গ্রাউন্ডিং ও সোর্স সাইটেশন লিংক',
                  'মাল্টিমোডাল ছবি ও ডকুমেন্ট এটাচমেন্ট বিশ্লেষণ',
                  'OpenRouter (DeepSeek / Llama) ও ৪-টিয়ার ফলব্যাক সিকোয়েন্স',
                  'সুপার এডমিন কন্ট্রোল সেন্টার ও সার্বিক টার্মিনাল এক্সিকিউটর',
                  'চ্যাট হিস্ট্রি, প্রশ্ন-উত্তর ওয়ান-ক্লিক কপি ও মোবাইল-বান্ধব ইন্টারফেস'
                ]
              }
            ]
          });
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* হেডার */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  {lang === 'bn' ? 'অ্যাপ সংস্করণ ও আপডেট তথ্য' : 'App Version & Release Notes'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {versionData?.version || 'v3.5.0'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'bn' ? 'মাহফুজুর রহমান AI — অল-ইন-ওয়ান সুপার প্ল্যাটফর্ম' : 'Mahfuzur Rahman AI - Super Platform'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* কনটেন্ট */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-sm">
          {/* স্ট্যাটাস কার্ড */}
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-emerald-200 text-xs sm:text-sm">
                  {lang === 'bn' ? 'অ্যাপটি সম্পূর্ণ আপ-টু-ডেট' : 'App is up to date'}
                </h4>
                <p className="text-[11px] text-emerald-300/80">
                  {lang === 'bn' ? 'সর্বশেষ প্রোডাকশন স্ট্যাবিল সংস্করণ সক্রিয় রয়েছে।' : 'Latest production stable channel active.'}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
              {versionData?.releaseDate || '2026-10-12'}
            </span>
          </div>

          {/* প্রধান ফিচারসমূহ কার্ড গ্রিড */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang === 'bn' ? 'সিস্টেম আর্কিটেকচার ও মূল প্রযুক্তি' : 'Architecture & Core Tech'}</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-2">
                <Mic className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200 block text-[11px]">বাংলা ভয়েস ইনপুট</span>
                  <span className="text-[10px] text-slate-400">Web Speech API (bn-BD)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-2">
                <Globe className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200 block text-[11px]">সার্চ গ্রাউন্ডিং</span>
                  <span className="text-[10px] text-slate-400">Google Search লাইভ লিংক</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-2">
                <FileImage className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200 block text-[11px]">মাল্টিমোডাল ভিশন</span>
                  <span className="text-[10px] text-slate-400">ছবি ও ডকুমেন্ট অ্যানালাইসিস</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-2">
                <Zap className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200 block text-[11px]">ফলব্যাক সিকোয়েন্স</span>
                  <span className="text-[10px] text-slate-400">OpenAI ➔ Gemini ➔ OpenRouter</span>
                </div>
              </div>
            </div>
          </div>

          {/* চেঞ্জলগ হিস্ট্রি */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'bn' ? 'আপডেট বিবরণী (Changelog)' : 'Changelog History'}</span>
            </h4>
            <div className="space-y-3">
              {versionData?.changelog?.map((log, index) => (
                <div
                  key={index}
                  className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-emerald-400 font-mono">
                        {log.version}
                      </span>
                      <span className="font-semibold text-xs text-slate-200">
                        {log.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{log.date}</span>
                  </div>
                  <ul className="space-y-1 pl-2">
                    {log.features.map((feat, fIdx) => (
                      <li key={fIdx} className="text-xs text-slate-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* ক্রেডিট ও নিরাপত্তা নোট */}
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              {lang === 'bn'
                ? 'সমস্ত API Key ও গোপনীয় তথ্য সার্ভার-সাইডে সুরক্ষিত। ব্যবহারকারীর চ্যাট মেমোরি ও সেটিংস সম্পূর্ণ লোকাল ব্রাউজারে সুরক্ষিত থাকে।'
                : 'All API keys are held strictly on the server. Your data and settings are stored locally in the browser.'}
            </p>
          </div>
        </div>

        {/* ফুটার */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            {lang === 'bn' ? 'ঠিক আছে' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
