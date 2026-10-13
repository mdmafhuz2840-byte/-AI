import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  Check, 
  Copy, 
  Terminal, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  Play
} from 'lucide-react';
import { Language } from '../utils/translations';
import { ApkDownloadCard } from './ApkDownloadCard';

interface ApkGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const ApkGuideModal: React.FC<ApkGuideModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const capacitorCommands = `# ১. প্রজেক্ট বিল্ড করুন
npm run build

# ২. ক্যাপাসিটর অ্যান্ড্রয়েড প্লাগইন ইনস্টল করুন
npm install @capacitor/core @capacitor/cli @capacitor/android

# ৩. প্রজেক্ট ইনিশিয়ালাইজ করুন
npx cap init "Mafhuz Device Recovery" "com.mafhuz.devicerecovery"

# ৪. অ্যান্ড্রয়েড প্ল্যাটফর্ম যোগ করুন
npx cap add android

# ৫. অ্যান্ড্রয়েড স্টুডিওতে ওপেন করুন
npx cap open android

# ৬. অ্যান্ড্রয়েড স্টুডিও মেনু থেকে:
# Build > Build Bundle(s) / APK(s) > Build APK(s) ক্লিক করলেই APK ডাউনলোড রেডি!`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 text-slate-200 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        {/* বন্ধ বাটন */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* হেডার */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {lang === 'bn' ? 'অ্যান্ড্রয়েড APK ও ইনস্টলেশন নির্দেশিকা' : 'Android APK & Installation Guide'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'bn' ? 'মোবাইলে টেস্ট করা ও ইনস্টলেবল APK তৈরি করার পূর্ণাঙ্গ উপায়' : 'Complete instructions to preview, test, and build native APK'}
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* সরাসরি APK ডাউনলোড কার্ড */}
          <ApkDownloadCard compact lang={lang} />

          {/* পদ্ধতি ১: ব্রাউজার থেকে সরাসরি PWA অ্যাপ ইনস্টল (সবচেয়ে দ্রুত) */}
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-emerald-300 flex items-center gap-1.5">
                <span>পদ্ধতি ১: তাৎক্ষণিক PWA ইনস্টল (মোবাইলে কোনো বিল্ড ছাড়া)</span>
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                সুপার ফাস্ট
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              আপনার অ্যান্ড্রয়েড ফোনে ক্রোম ব্রাউজারে এই অ্যাপটির লিঙ্ক খুলুন। ব্রাউজারের উপরে বা থ্রি-ডট (⋮) মেনু থেকে <strong>"Install app"</strong> অথবা <strong>"Add to Home screen"</strong> এ ট্যাপ করুন। এটি কোনো ব্রাউজার বার ছাড়া আপনার হোম স্ক্রিনে স্বতন্ত্র অ্যাপের মতো ইনস্টল হয়ে যাবে।
            </p>
          </div>

          {/* পদ্ধতি ২: ক্যাপাসিটর দিয়ে অ্যান্ড্রয়েড স্টুডিও APK তৈরি */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-cyan-300 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>পদ্ধতি ২: Capacitor দিয়ে আসল APK (.apk) তৈরি</span>
              </span>
              <button
                onClick={() => copyToClipboard(capacitorCommands, 'cap')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
              >
                {copiedCode === 'cap' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode === 'cap' ? 'কপি হয়েছে' : 'কমান্ড কপি'}</span>
              </button>
            </div>
            <p className="text-slate-400 leading-relaxed">
              প্রোজেক্টের রুট ফোল্ডারে নিচের সহজ কমান্ডগুলো রান করে সরাসরি অ্যান্ড্রয়েড স্টুডিও দিয়ে সাইনড বা ডিবাগ APK এক্সপোর্ট করা যায়:
            </p>
            <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed">
              {capacitorCommands}
            </pre>
          </div>

          {/* পদ্ধতি ৩: Bubblewrap CLI (TWA) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="font-bold text-sm text-purple-300 block">
              পদ্ধতি ৩: Bubblewrap CLI দিয়ে ১-ক্লিকে APK
            </span>
            <p className="text-slate-400 leading-relaxed">
              গুগলের অফিশিয়াল Bubblewrap টুল দিয়ে কোনো কোড লেখা ছাড়াই ওয়েব অ্যাপের manifest.json থেকে গুগল প্লে-স্টোর উপযোগী APK ও AAB ফাইল জেনারেট করা যায়:
            </p>
            <code className="block p-2 rounded-lg bg-slate-900 font-mono text-purple-300 text-[11px]">
              npx @bubblewrap/cli build
            </code>
          </div>

          {/* নিরাপত্তা অনুস্মারক */}
          <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-cyan-200 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              Mafhuz Device Recovery সম্পূর্ণ ক্লায়েন্ট-সাইড রেসপন্সিভ আর্কিটেকচারে তৈরি হওয়ায় যেকোনো অ্যান্ড্রয়েড ফোনে (Android 8 থেকে Android 15+) মসৃণভাবে চলবে।
            </p>
          </div>
        </div>

        {/* ফুটার */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
