import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  ExternalLink, 
  Copy, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Smartphone, 
  Sparkles, 
  Sliders, 
  Lock, 
  HelpCircle,
  Zap,
  Info,
  Server
} from 'lucide-react';
import { Language } from '../utils/translations';
import { AppTab } from './Navbar';

interface ApiSetupPageProps {
  lang: Language;
  onNavigateTab: (tab: AppTab) => void;
}

interface OpenRouterStatusResponse {
  configured: boolean;
  status: 'NOT_CONFIGURED' | 'CONFIGURED' | 'CONNECTED' | 'UNAUTHORIZED' | 'RATE_LIMIT_OR_CREDITS' | 'API_ERROR' | 'NETWORK_ERROR';
  message: string;
  detail?: string;
  keyPreview?: string | null;
  model?: string;
  success?: boolean;
  isMismatchedEnvName?: boolean;
}

export const ApiSetupPage: React.FC<ApiSetupPageProps> = ({ lang, onNavigateTab }) => {
  // ১. বর্তমান সক্রিয় ধাপ (১ থেকে ৫)
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // ২. ক্লিপবোর্ড কপি ফিডব্যাক
  const [copiedKeyName, setCopiedKeyName] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // ৩. ব্যাকএন্ড সংযোগ ও স্ট্যাটাস স্টেট
  const [serverStatus, setServerStatus] = useState<OpenRouterStatusResponse | null>(null);
  const [isCheckingInitial, setIsCheckingInitial] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    detail?: string;
    model?: string;
    keyPreview?: string | null;
  } | null>(null);

  // পৃষ্ঠা লোড হলে স্বয়ংক্রিয়ভাবে সার্ভারের বর্তমান কনফিগারেশন চেক
  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/openrouter-status');
      const data = await res.json();
      setServerStatus(data);
    } catch (err: any) {
      setServerStatus({
        configured: false,
        status: 'NETWORK_ERROR',
        message: 'সার্ভার স্ট্যাটাস লোড করা সম্ভব হয়নি',
        detail: err.message,
      });
    } finally {
      setIsCheckingInitial(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // বাস্তব রিকোয়েস্ট চালিয়ে সংযোগ পরীক্ষা
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/test-openrouter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message || 'OpenRouter API সফলভাবে সংযুক্ত হয়েছে! (Connected)',
          detail: data.detail || `সক্রিয় মডেল: ${data.model || 'deepseek/deepseek-chat'}`,
          model: data.model,
          keyPreview: data.keyPreview,
        });
        setServerStatus({
          configured: true,
          status: 'CONNECTED',
          message: 'সফলভাবে সংযুক্ত (Connected)',
          keyPreview: data.keyPreview,
          model: data.model,
        });
      } else {
        setTestResult({
          success: false,
          message: data.message || 'সংযোগ ব্যর্থ হয়েছে।',
          detail: data.detail || 'সার্ভার থেকে সফল উত্তর পাওয়া যায়নি।',
        });
        if (!data.configured) {
          setServerStatus({
            configured: false,
            status: 'NOT_CONFIGURED',
            message: 'API Key এখনো বসানো হয়নি',
          });
        }
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'সার্ভার বা নেটওয়ার্ক সংযোগ পাওয়া যায়নি।',
        detail: err.message || 'ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন।',
      });
    } finally {
      setIsTesting(false);
    }
  };

  // ক্লিপবোর্ডে টেক্সট কপি হেল্পার
  const copyToClipboard = async (text: string, type: 'name' | 'url') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'name') {
        setCopiedKeyName(true);
        setTimeout(() => setCopiedKeyName(false), 2500);
      } else {
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2500);
      }
    } catch {
      // fallback
    }
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-5 animate-fade-in pb-20 max-w-2xl mx-auto">
      {/* ১. টপ হেডার ও মোবাইল ফ্রেন্ডলি পরিচিতি */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white leading-tight">
                  AI API সংযোগ (OpenRouter Setup)
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                  Android গাইড
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                সহজ ৫টি ধাপে আপনার ফোনে OpenRouter এআই মডেল সক্রিয় করুন
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('ai')}
            type="button"
            className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1 shrink-0"
            title="এআই চ্যাটে ফিরে যান"
          >
            <span>চ্যাট</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* বর্তমান সিস্টেম সংযোগ স্ট্যাটাস কার্ড */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">বর্তমান স্ট্যাটাস:</span>
            {isCheckingInitial ? (
              <span className="text-slate-400 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                যাচাই করা হচ্ছে...
              </span>
            ) : serverStatus?.configured ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                কনফিগার করা আছে ({serverStatus.keyPreview || 'সংরক্ষিত'})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                API Key এখনো বসানো হয়নি
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>১০০% সার্ভার সিক্রেট সুরক্ষিত</span>
          </div>
        </div>

        {/* যদি সিক্রেট নাম OPENROUTER_MODEL রাখা থাকে তার পরামর্শ */}
        {serverStatus?.isMismatchedEnvName && (
          <div className="mt-3 p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="leading-relaxed">
              <strong>টিপস:</strong> আপনার OpenRouter Key সক্রিয় রয়েছে। তবে গুগল এআই স্টুডিও সিক্রেটসে এর নাম <code className="font-mono font-bold text-amber-300 bg-slate-950 px-1 py-0.5 rounded">OPENROUTER_API_KEY</code> রাখলে সবচেয়ে মানসম্মত হবে।
            </div>
          </div>
        )}
      </div>

      {/* ২. ধাপে ধাপে অগ্রগতি ইন্ডিকেটর (Step Progress Chips) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 shadow-md">
        <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-0.5">
          {[
            { step: 1, title: '১. Key সংগ্রহ' },
            { step: 2, title: '২. Secrets মেনু' },
            { step: 3, title: '৩. Name নির্ধারণ' },
            { step: 4, title: '৪. Key পেস্ট ও Save' },
            { step: 5, title: '৫. সংযোগ পরীক্ষা' },
          ].map((item) => {
            const isActive = currentStep === item.step;
            const isCompleted = currentStep > item.step;
            return (
              <button
                key={item.step}
                type="button"
                onClick={() => setCurrentStep(item.step)}
                className={`flex-1 min-w-[92px] px-2 py-1.5 rounded-xl text-center text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-teal-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                    : isCompleted
                    ? 'bg-slate-800/90 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  {isCompleted && <Check className="w-3 h-3 text-emerald-400" />}
                  <span>{item.title}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* অগ্রগতি বার */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-400 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* ৩. মূল কন্টেন্ট কার্ড (সক্রিয় ধাপ অনুযায়ী রেন্ডার) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        
        {/* ======================================================== */}
        {/* ধাপ ১: API Key সংগ্রহ করুন */}
        {/* ======================================================== */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/40">
                ১
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  ধাপ ১: OpenRouter API Key সংগ্রহ করুন
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  OpenRouter একটি আন্তর্জাতিক এআই প্ল্যাটফর্ম যা দিয়ে DeepSeek, Llama 3, ও ওপেন সোর্স মডেল সম্পূর্ণ ফ্রিতে বা স্বল্পমূল্যে চালানো যায়।
                </p>
              </div>
            </div>

            {/* নির্দেশিকা বক্স */}
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs text-slate-200">
                <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-indigo-400" />
                  <span>আপনার Android ফোনে যা করতে হবে:</span>
                </div>
                
                <ol className="list-decimal list-inside space-y-2 leading-relaxed text-slate-300">
                  <li>
                    নিচের বাটনে চাপ দিয়ে <strong>openrouter.ai/keys</strong> ওয়েবসাইটটি খুলুন।
                  </li>
                  <li>
                    আপনার <strong>Google</strong> বা <strong>GitHub</strong> অ্যাকাউন্ট দিয়ে ফ্রিতে সাইন-ইন (Sign In) করুন।
                  </li>
                  <li>
                    স্ক্রিনে <strong>Create Key</strong> বা <strong>New Key</strong> বোতাম দেখতে পাবেন, তাতে চাপ দিন।
                  </li>
                  <li>
                    যেকোনো একটি নাম দিন (যেমন: <code className="text-teal-300 font-mono bg-slate-900 px-1 py-0.5 rounded">MDR-AI</code>) এবং নিশ্চিত করুন।
                  </li>
                  <li>
                    স্ক্রিনে আপনার নতুন Key দেখতে পাবেন (যা সাধারণত <code className="text-amber-300 font-mono bg-slate-900 px-1 py-0.5 rounded">sk-or-v1-...</code> দিয়ে শুরু হয়)।
                  </li>
                  <li>
                    সেটির পাশে থাকা <strong>Copy</strong> আইকনে চাপ দিয়ে কী-টি কপি করে নিন।
                  </li>
                </ol>
              </div>

              {/* ওয়েবসাইট ওপেন ও কপি লিংক বক্স */}
              <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="min-w-0">
                  <span className="text-[11px] text-indigo-300 font-semibold block">ওয়েবসাইট ঠিকানা:</span>
                  <span className="font-mono text-xs text-white truncate block">
                    https://openrouter.ai/keys
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => copyToClipboard('https://openrouter.ai/keys', 'url')}
                    className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-1.5"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? 'কপি হয়েছে' : 'লিংক কপি'}</span>
                  </button>

                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30"
                  >
                    <span>OpenRouter খুলুন</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* সতর্কতা টিপ */}
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-[11px] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>মনে রাখবেন:</strong> OpenRouter Key শুধুমাত্র একবারই সম্পূর্ণ দেখায়। কপি করার পর নিরাপদে রাখুন যাতে ভুলে না যান।
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ধাপ ২: Secrets খুলুন */}
        {/* ======================================================== */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-xl bg-teal-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md shadow-teal-600/40">
                ২
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  ধাপ ২: Google AI Studio-তে Secrets অপশন খুলুন
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  API Key নিরাপদে রাখতে Google AI Studio-তে “Secrets” সুবিধা দেওয়া আছে।
                </p>
              </div>
            </div>

            {/* ফোনের ইন্টারফেস নির্দেশিকা */}
            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs text-slate-200">
                <div className="font-semibold text-teal-300 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-teal-400" />
                  <span>মোবাইল স্ক্রিনে Secrets খুঁজে পাওয়ার সহজ উপায়:</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      ১
                    </span>
                    <div>
                      <strong className="text-white block">মেনু বা গিয়ার আইকন দেখুন:</strong>
                      <span className="text-slate-300 leading-relaxed block mt-0.5">
                        আপনার ফোনের স্ক্রিনের বাম বা ডান কোণায় থাকা <strong>Settings ⚙️</strong> বা <strong>Project Settings</strong> অপশনে যান।
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      ২
                    </span>
                    <div>
                      <strong className="text-white block">Secrets বা Environment Variables ট্যাব:</strong>
                      <span className="text-slate-300 leading-relaxed block mt-0.5">
                        সেটিংস তালিকার মধ্যে <strong>Secrets</strong> অথবা <strong>Environment Variables</strong> লেখা ট্যাবটি সিলেক্ট করুন।
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      ৩
                    </span>
                    <div>
                      <strong className="text-white block">+ Add Secret চাপুন:</strong>
                      <span className="text-slate-300 leading-relaxed block mt-0.5">
                        নতুন সিক্রেট যুক্ত করতে <strong>“+ Add Secret”</strong> বা <strong>“New Secret”</strong> বোতামে স্পর্শ করুন।
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* চিত্ররূপ দৃশ্যমান বক্স */}
              <div className="p-3.5 rounded-2xl bg-teal-950/30 border border-teal-500/30 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="text-xs text-teal-200 leading-relaxed">
                  <strong>কেন Secrets ব্যবহার করব?</strong>
                  <p className="text-[11px] text-teal-300/80 mt-0.5">
                    Secrets-এ Key রাখলে তা সার্ভারের ভেতর এনক্রিপ্ট থাকে। কোনো বহিরাগত বা ব্রাউজার এটি দেখতে পায় না।
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ধাপ ৩: OPENROUTER_API_KEY নাম দিন */}
        {/* ======================================================== */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-xl bg-cyan-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md shadow-cyan-600/40">
                ৩
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  ধাপ ৩: Secret Name হিসেবে “OPENROUTER_API_KEY” লিখুন
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  সিস্টেম স্বয়ংক্রিয়ভাবে এই নির্দিষ্ট নামে আপনার কী-টি খুঁজে নেবে।
                </p>
              </div>
            </div>

            {/* হুবহু নাম কপি বক্স */}
            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-xs text-slate-300">
                  <span className="text-cyan-400 font-semibold block mb-1">
                    Secret Name ঘরে নিচের নামটি হুবহু লিখুন বা কপি করুন:
                  </span>
                  <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/40 flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-sm sm:text-base text-cyan-300 tracking-wider select-all">
                      OPENROUTER_API_KEY
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('OPENROUTER_API_KEY', 'name')}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm shrink-0"
                    >
                      {copiedKeyName ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKeyName ? 'কপি হয়েছে!' : 'কপি করুন'}</span>
                    </button>
                  </div>
                </div>

                {/* সতর্কবার্তা */}
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-rose-300">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>ভুল হওয়া এড়াতে সতর্কতা:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-200/90 pl-1">
                    <li>সবগুলো অক্ষর বড় হাতের (Uppercase) হতে হবে।</li>
                    <li>কোনো স্পেস (Space) বা খালি জায়গা দেওয়া যাবে না।</li>
                    <li>আন্ডারস্কোর (<code className="font-mono font-bold">_</code>) সঠিক স্থানে থাকতে হবে।</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ধাপ ৪: Value ঘরে Key বসিয়ে Save করুন */}
        {/* ======================================================== */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/40">
                ৪
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  ধাপ ৪: Value ঘরে Key বসিয়ে Save করুন
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  ধাপ ১-এ সংগ্রহ করা OpenRouter Key পেস্ট করে সংরক্ষণ সম্পন্ন করুন।
                </p>
              </div>
            </div>

            {/* সেভ করার নির্দেশিকা */}
            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs text-slate-200">
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 font-semibold block text-[11px]">১. Value বা Secret Value ঘর:</span>
                    <p className="text-slate-200 mt-1 leading-relaxed">
                      যেখানে <strong>Value</strong> লেখা রয়েছে, সেখানে ট্যাপ করে চেপে ধরে <strong>Paste</strong> চাপুন। আপনার কী-টি বসে যাবে (যেমন: <span className="font-mono text-emerald-400">sk-or-v1-xxxx...</span>)।
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 font-semibold block text-[11px]">২. Save / Add বোতাম:</span>
                    <p className="text-slate-200 mt-1 leading-relaxed">
                      নিচে থাকা <strong>Save</strong> বা <strong>Add Secret</strong> নীল বোতামে স্পর্শ করুন।
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 font-semibold block text-[11px]">৩. অ্যাপে ফিরে আসা:</span>
                    <p className="text-slate-200 mt-1 leading-relaxed">
                      সেভ হয়ে গেলে আপনার মোবাইল ব্রাউজারের ট্যাব সুইচ করে বা ব্যাক করে সরাসরি আবার আমাদের এই অ্যাপে ফিরে আসুন।
                    </p>
                  </div>
                </div>

                {/* নিরাপত্তা নিশ্চয়তা */}
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>নিরাপত্তা নীতি:</strong> আমরা কখনোই আপনার API Key ব্রাউজারে বা পাবলিক ফ্রন্টএন্ড কোডে রাখি না। এটি সুরক্ষিত ব্যাকএন্ড সিক্রেট থেকে সক্রিয় হয়।
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ধাপ ৫: সংযোগ পরীক্ষা করুন */}
        {/* ======================================================== */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-xl bg-purple-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md shadow-purple-600/40">
                ৫
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  ধাপ ৫: সংযোগ পরীক্ষা করুন
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  বাস্তব সার্ভার রিকোয়েস্ট পাঠিয়ে যাচাই করুন OpenRouter সক্রিয় হয়েছে কি না।
                </p>
              </div>
            </div>

            {/* সংযোগ পরীক্ষা অ্যাকশন ও স্ট্যাটাস বক্স */}
            <div className="space-y-3 pt-2">
              {/* স্ট্যাটাস কার্ড */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
                {isTesting ? (
                  <div className="py-4 space-y-2">
                    <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                    <p className="text-xs font-semibold text-indigo-300">
                      সার্ভার থেকে OpenRouter API রিকোয়েস্ট যাচাই করা হচ্ছে...
                    </p>
                    <span className="text-[11px] text-slate-400">
                      অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন
                    </span>
                  </div>
                ) : testResult ? (
                  <div className={`p-4 rounded-xl border text-left space-y-2 ${
                    testResult.success 
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100' 
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-100'
                  }`}>
                    <div className="flex items-center gap-2">
                      {testResult.success ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                      )}
                      <strong className="text-sm">
                        {testResult.message}
                      </strong>
                    </div>

                    {testResult.detail && (
                      <p className="text-xs text-slate-300 leading-relaxed pl-7">
                        {testResult.detail}
                      </p>
                    )}

                    {testResult.success && testResult.keyPreview && (
                      <div className="mt-2 pl-7 flex items-center gap-2 text-[11px] font-mono text-emerald-300">
                        <span>কী প্রিভিউ:</span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                          {testResult.keyPreview}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-2 space-y-1.5 text-center">
                    <Server className="w-8 h-8 text-slate-500 mx-auto" />
                    <p className="text-xs text-slate-300">
                      {serverStatus?.configured 
                        ? 'আপনার সার্ভারে API Key পাওয়া গেছে। নিচে চাপ দিয়ে সংযোগ টেস্ট করুন।' 
                        : 'এখনো সংযোগ পরীক্ষা করা হয়নি।'}
                    </p>
                    {!serverStatus?.configured && (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        API Key এখনো বসানো হয়নি
                      </span>
                    )}
                  </div>
                )}

                {/* টেস্ট সংযোগ বাটন */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-teal-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isTesting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>পরীক্ষা করা হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-amber-300" />
                        <span>সংযোগ পরীক্ষা করুন</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* পরবর্তী পদক্ষেপ */}
              {testResult?.success && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-950 border border-emerald-500/30 flex items-center justify-between gap-3 animate-fade-in">
                  <div>
                    <span className="text-xs font-bold text-emerald-300 block">অভিনন্দন! সেটআপ সম্পূর্ণ।</span>
                    <span className="text-[11px] text-slate-400">এখন যেকোনো এআই মোডে প্রশ্ন করতে পারেন।</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('ai')}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm shrink-0"
                  >
                    চ্যাট শুরু করুন ➔
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ৪. পূর্ববর্তী ও পরবর্তী বোতাম (Next / Prev Navigation) */}
        {/* ======================================================== */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700 transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>আগের ধাপ</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5 active:scale-95 cursor-pointer ml-auto"
            >
              <span>পরবর্তী ধাপ</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigateTab('ai')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700 transition flex items-center gap-1.5 active:scale-95 cursor-pointer ml-auto"
            >
              <span>এআই চ্যাটে যান</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ৫. অ্যান্ড্রয়েড ব্যবহারকারীদের সাধারণ প্রশ্নোত্তর ও টিপস */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-2.5">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
          <HelpCircle className="w-4 h-4" />
          <span>Android ফোন ব্যবহারের দরকারী টিপস:</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed pl-1">
          <li>
            <strong>ট্যাব বদল:</strong> Chrome ব্রাউজারে উপরে ট্যাবের সংখ্যায় ট্যাপ করে সহজেই এক ট্যাব থেকে অন্য ট্যাবে যাওয়া যায়।
          </li>
          <li>
            <strong>কপি-পেস্ট:</strong> যেকোনো লেখার উপর আঙুল দিয়ে ২ সেকেন্ড চেপে রাখলে <em>Copy</em> বা <em>Paste</em> অপশন ভেসে ওঠে।
          </li>
          <li>
            <strong>কখনো ফ্রন্টএন্ডে নয়:</strong> ব্রাউজার হিস্ট্রি বা স্টোরেজে আপনার গোপন কী থাকে না, ফলে আপনার ফোন সম্পূর্ণ নিরাপদ।
          </li>
        </ul>
      </div>
    </div>
  );
};
