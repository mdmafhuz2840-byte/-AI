import React from 'react';
import { X, Key, ShieldCheck, PlayCircle, ExternalLink, CheckCircle, AlertCircle, Copy, Check } from 'lucide-react';

interface ConfigGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConfigured: boolean;
  keyPreview: string | null;
  onTestConnection: () => void;
  isTesting: boolean;
  testResult: { success: boolean; message: string; detail?: string } | null;
}

export const ConfigGuideModal: React.FC<ConfigGuideModalProps> = ({
  isOpen,
  onClose,
  isConfigured,
  keyPreview,
  onTestConnection,
  isTesting,
  testResult,
}) => {
  const [copiedEnv, setCopiedEnv] = React.useState(false);

  if (!isOpen) return null;

  const envSample = `OPENAI_API_KEY="sk-your-openai-api-key-here"`;

  const copyEnvCode = () => {
    navigator.clipboard.writeText(envSample);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-200 my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* বন্ধ করার বাটন */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>

        {/* হেডার */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">API সেটআপ ও সংযোগ নির্দেশিকা</h2>
            <p className="text-xs text-slate-400">মাহফুজুর রহমান AI এর ব্যাকএন্ড কনফিগারেশন</p>
          </div>
        </div>

        {/* বর্তমান সংযোগের অবস্থা */}
        <div className={`p-4 rounded-xl border mb-6 flex items-start gap-3 ${
          isConfigured 
            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200' 
            : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
        }`}>
          {isConfigured ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <h4 className="font-semibold text-sm">
              {isConfigured ? 'OpenAI API কী সার্ভারে কনফিগার করা আছে' : 'API কী এখনও কনফিগার করা হয়নি'}
            </h4>
            <p className="text-xs mt-1 text-slate-300">
              {isConfigured 
                ? `সার্ভার এনভায়রনমেন্টে API কী শনাক্ত হয়েছে (কী: ${keyPreview || 'নিরাপদ সংরক্ষিত'})। আপনি প্রশ্ন করতে পারেন!`
                : 'এআই থেকে উত্তর পেতে সার্ভার ভেরিয়েবলে আপনার OpenAI API কী সেট করতে হবে।'}
            </p>
          </div>
        </div>

        {/* টেস্ট কানেকশন বাটন ও ফলাফল */}
        <div className="mb-6 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <div>
              <span className="text-sm font-semibold text-white block">সার্ভার সংযোগ যাচাই</span>
              <span className="text-xs text-slate-400">সরাসরি OpenAI সার্ভারে সংযোগ পরীক্ষা করুন</span>
            </div>
            <button
              onClick={onTestConnection}
              disabled={isTesting}
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition active:scale-95 disabled:opacity-50"
            >
              <PlayCircle className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
              {isTesting ? 'পরীক্ষা করা হচ্ছে...' : 'সংযোগ পরীক্ষা করুন'}
            </button>
          </div>

          {testResult && (
            <div className={`mt-3 p-3 rounded-lg text-xs border ${
              testResult.success
                ? 'bg-emerald-900/30 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-900/30 border-rose-500/40 text-rose-300'
            }`}>
              <div className="font-medium">{testResult.message}</div>
              {testResult.detail && (
                <div className="mt-1 text-[11px] text-slate-400 font-mono bg-slate-900/60 p-1.5 rounded">
                  {testResult.detail}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ধাপসমূহ (Steps) */}
        <div className="space-y-4 text-sm">
          <h3 className="font-bold text-white text-base">কীভাবে কনফিগার করবেন? (সহজ ৪ ধাপ)</h3>

          {/* ধাপ ১ */}
          <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50">
            <div className="flex items-center justify-between font-semibold text-emerald-400 mb-1">
              <span>ধাপ ১: OpenAI API Key সংগ্রহ করুন</span>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline"
              >
                OpenAI ড্যাশবোর্ড <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              OpenAI প্ল্যাটফর্মে লগইন করে "Create new secret key" এ ক্লিক করে একটি API কী কপি করে নিন (যেমন: <code className="text-emerald-300 font-mono">sk-proj-...</code>)।
            </p>
          </div>

          {/* ধাপ ২ */}
          <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50">
            <div className="font-semibold text-emerald-400 mb-1">
              ধাপ ২: পরিবেশ ভেরিয়েবল (Environment Variable) এ যোগ করুন
            </div>
            <p className="text-xs text-slate-300 mb-2 leading-relaxed">
              প্রজেক্টের মূল ডিরেক্টরিতে <code className="text-amber-300 font-mono">.env</code> ফাইল তৈরি করুন অথবা ক্লাউড হোস্টিং এর Environment Secrets-এ ভেরিয়েবলটি সেট করুন:
            </p>
            <div className="relative bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400 flex items-center justify-between">
              <code>{envSample}</code>
              <button
                onClick={copyEnvCode}
                type="button"
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="কপি করুন"
              >
                {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* ধাপ ৩ */}
          <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50">
            <div className="font-semibold text-emerald-400 mb-1">
              ধাপ ৩: সার্ভার রিস্টার্ট দিন
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              এনভায়রনমেন্ট ভেরিয়েবল যোগ করার পর নোড সার্ভার স্বয়ংক্রিয়ভাবে নতুন কী লোড করবে।
            </p>
          </div>

          {/* ধাপ ৪: ফলব্যাক সিস্টেম */}
          <div className="bg-slate-800/40 p-3.5 rounded-xl border border-cyan-500/30">
            <div className="font-semibold text-cyan-400 mb-1 flex items-center gap-1.5">
              <span>ধাপ ৪: স্মার্ট ফলব্যাক ও বিকল্প সিস্টেম</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded">অটো-সুইচ</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              যদি আপনার OpenAI অ্যাকাউন্টের ক্রেডিট বা কোটা শেষ হয়ে যায়, তবে অ্যাপটি বন্ধ হবে না! এটি স্বয়ংক্রিয়ভাবে সেকেন্ডারি কী অথবা Google Gemini (gemini-3.8-flash) ব্যাকআপ মডেলে সুইচ করে নিরবচ্ছিন্নভাবে বাংলা উত্তর প্রদান করতে থাকবে।
            </p>
          </div>

          {/* নিরাপত্তা তথ্য */}
          <div className="bg-cyan-950/20 border border-cyan-800/40 p-3.5 rounded-xl text-xs text-cyan-200 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-cyan-300">নিরাপত্তা নিশ্চয়তা:</strong> আপনার API কী কখনো ব্রাউজারে পাঠানো বা সংরক্ষণ করা হয় না। এটি শুধুমাত্র নোড.জেএস (Node.js) সার্ভারে সুরক্ষিতভাবে থাকে এবং নিরাপদ ব্যাকএন্ড প্রক্সির মাধ্যমে এআই উত্তর আনা হয়।
            </div>
          </div>
        </div>

        {/* ফুটার */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition"
          >
            বুঝেছি, বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
