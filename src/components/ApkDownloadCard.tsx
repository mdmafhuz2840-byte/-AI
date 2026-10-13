import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Check, 
  Copy, 
  Smartphone, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink,
  Info
} from 'lucide-react';
import { Language } from '../utils/translations';

interface ApkDownloadCardProps {
  lang?: Language;
  onOpenGuide?: () => void;
  compact?: boolean;
}

export const ApkDownloadCard: React.FC<ApkDownloadCardProps> = ({
  lang = 'bn',
  onOpenGuide,
  compact = false,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [apkInfo, setApkInfo] = useState<{
    available: boolean;
    sizeFormatted: string;
    version: string;
  }>({
    available: true,
    sizeFormatted: '2.1 MB',
    version: '3.5.0',
  });

  useEffect(() => {
    fetch('/api/apk-status')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.version) {
          setApkInfo({
            available: data.available,
            sizeFormatted: data.sizeFormatted || '2.1 MB',
            version: data.version,
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}/download/Mahfuzur_Rahman_AI.apk`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  return (
    <div 
      className="relative overflow-hidden rounded-2xl text-center border border-blue-500 shadow-2xl transition-all duration-300 hover:shadow-blue-500/20"
      style={{
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        padding: compact ? '20px 16px' : '28px 20px',
        margin: '18px 0',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
      }}
    >
      {/* ব্যাকগ্রাউন্ড গ্লো ইফেক্ট */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* রোবট ইমোজি */}
      <div 
        style={{ fontSize: compact ? '34px' : '44px', marginBottom: '10px' }}
        className="animate-bounce-subtle select-none"
      >
        🤖
      </div>

      {/* অ্যাপের নাম ও অফিসিয়াল ব্যাজ */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <h2 
          style={{ color: '#ffffff', margin: 0, fontFamily: 'system-ui, sans-serif' }}
          className="text-lg sm:text-2xl font-black tracking-tight"
        >
          {lang === 'bn' ? 'মাহফুজুর রহমান AI (Official App)' : 'Mahfuzur Rahman AI (Official App)'}
        </h2>
        <span className="text-[11px] bg-blue-500/20 text-blue-400 border border-blue-400/30 px-2 py-0.5 rounded-full font-bold">
          v{apkInfo.version}
        </span>
      </div>

      {/* বিবরণ টেক্সট */}
      <p 
        style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}
        className="max-w-md mx-auto leading-relaxed"
      >
        {lang === 'bn' 
          ? 'আপনার অ্যান্ড্রয়েড ফোনে সরাসরি ব্যবহার করতে অ্যাপটি নিচে থেকে ডাউনলোড করুন।' 
          : 'Download and install the official app directly on your Android phone.'}
      </p>

      {/* ডাউনলোড বোতাম ও অ্যাকশনস */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {/* প্রধান APK ডাউনলোড বাটন */}
        <a 
          href="/download/Mahfuzur_Rahman_AI.apk" 
          download="Mahfuzur_Rahman_AI.apk" 
          style={{
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: '#ffffff',
            padding: '14px 28px',
            textDecoration: 'none',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)',
            transition: 'all 0.3s ease',
          }}
          className="hover:scale-105 active:scale-95 group cursor-pointer"
        >
          <span className="text-xl group-hover:translate-y-0.5 transition-transform">⬇️</span>
          <span>{lang === 'bn' ? 'মাহফুজ এআই APK ডাউনলোড করুন' : 'Download Mahfuz AI APK'}</span>
        </a>

        {/* লিংক কপি বোতাম */}
        <button
          onClick={handleCopyLink}
          type="button"
          className="px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-sm"
          title="ডাউনলোড লিঙ্ক কপি করুন"
        >
          {copiedLink ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300">{lang === 'bn' ? 'লিঙ্ক কপি হয়েছে' : 'Copied!'}</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-blue-400" />
              <span>{lang === 'bn' ? 'লিঙ্ক কপি' : 'Copy Link'}</span>
            </>
          )}
        </button>

        {/* নির্দেশিকা বোতাম */}
        {onOpenGuide && (
          <button
            onClick={onOpenGuide}
            type="button"
            className="px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 text-xs font-semibold transition active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>{lang === 'bn' ? 'ইনস্টল গাইড' : 'Install Guide'}</span>
          </button>
        )}
      </div>

      {/* ফুটার ফিচার হাইলাইটস */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>১০০% নিরাপদ ও স্ক্যানকৃত</span>
        </span>
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>সাইজ: {apkInfo.sizeFormatted}</span>
        </span>
        <span className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-blue-400" />
          <span>অ্যান্ড্রয়েড ৫.০+ সমর্থিত</span>
        </span>
      </div>
    </div>
  );
};
