import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Smartphone, 
  Radio, 
  Lock, 
  Brain, 
  AlertTriangle, 
  ShieldAlert, 
  Receipt, 
  Cpu, 
  Send, 
  RefreshCw, 
  Bot, 
  User, 
  Check, 
  Copy, 
  Globe, 
  Code, 
  Database, 
  Settings, 
  CheckCircle2, 
  ExternalLink,
  MessageSquare,
  Wrench,
  ShieldCheck,
  Zap,
  KeyRound
} from 'lucide-react';
import { Language, t } from '../utils/translations';
import { Agent, AI_AGENTS } from '../types/agents';
import { AppTab } from './Navbar';
import { ApkDownloadCard } from './ApkDownloadCard';

interface HomeOverviewProps {
  lang: Language;
  onNavigate: (tab: AppTab) => void;
  onSelectVivoY21: () => void;
  onOpenApkGuide: () => void;
  onOpenStateMonitor?: () => void;
  onOpenHistory?: () => void;
  onOpenVersionModal?: () => void;
  onSelectAgent?: (agent: Agent) => void;
}

export const HomeOverview: React.FC<HomeOverviewProps> = ({
  lang,
  onNavigate,
  onSelectVivoY21,
  onOpenApkGuide,
  onOpenStateMonitor,
  onOpenHistory,
  onOpenVersionModal,
  onSelectAgent,
}) => {
  const strings = t[lang];

  // লাইভ ড্যাশবোর্ড কুইক চ্যাট স্টেট
  const [quickQuestion, setQuickQuestion] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatNotice, setChatNotice] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [chatLog, setChatLog] = useState<Array<{ role: 'user' | 'ai'; text: string; time: string }>>([
    {
      role: 'ai',
      text: '🤖 [মাহফুজুর রহমান AI — জেনারেল এআই]\n\nআসসালামু আলাইকুম! আমি মাহফুজুর রহমান AI — আপনার ব্যক্তিগত সুপার অ্যাসিস্ট্যান্ট। আপনার ডিভাইসের সমস্যা, সফটওয়্যার কোডিং বা যেকোনো প্রশ্ন নিচে লিখুন।',
      time: 'সক্রিয়',
    },
  ]);

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = quickQuestion.trim();
    if (!prompt || isChatLoading) return;

    const userTime = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
    const userMsg = { role: 'user' as const, text: prompt, time: userTime };
    setChatLog((prev) => [...prev, userMsg]);
    setQuickQuestion('');
    setIsChatLoading(true);
    setChatNotice('এআই সার্ভার থেকে উত্তর প্রস্তুত করা হচ্ছে...');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          agentId: 'general',
        }),
      });

      const data = await res.json();
      const aiTime = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });

      if (res.ok && data.answer) {
        setChatLog((prev) => [
          ...prev,
          {
            role: 'ai',
            text: data.answer,
            time: aiTime,
          },
        ]);
        setChatNotice(
          data.fallbackUsed
            ? `উত্তর প্রস্তুত! (ব্যাকআপ মডেল: ${data.provider === 'gemini' ? 'Google Gemini 3.8 Flash' : data.model})`
            : 'উত্তর প্রস্তুত করা হয়েছে।'
        );
      } else {
        setChatLog((prev) => [
          ...prev,
          {
            role: 'ai',
            text: data.message || 'সার্ভার সংযোগে সাময়িক সমস্যা হয়েছে।',
            time: aiTime,
          },
        ]);
        setChatNotice('প্রসেসিং সম্পন্ন। পূর্ণাঙ্গ চ্যাটে বিস্তারিত দেখুন।');
      }
    } catch (err: any) {
      const errTime = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
      setChatLog((prev) => [
        ...prev,
        {
          role: 'ai',
          text: 'সার্ভার সংযোগ পাওয়া যায়নি। অফলাইন ইঞ্জিন সক্রিয় রয়েছে।',
          time: errTime,
        },
      ]);
      setChatNotice('সংযোগ বিঘ্নিত হয়েছে।');
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleCopyMessage = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleToolClick = (toolName: string) => {
    switch (toolName) {
      case 'chat':
        onNavigate('ai');
        break;
      case 'code':
        const codeAgent = AI_AGENTS.find((a) => a.id === 'hardware-software-specialist');
        if (codeAgent && onSelectAgent) onSelectAgent(codeAgent);
        onNavigate('ai');
        break;
      case 'research':
        const genAgent = AI_AGENTS.find((a) => a.id === 'general');
        if (genAgent && onSelectAgent) onSelectAgent(genAgent);
        onNavigate('ai');
        break;
      case 'knowledge':
        if (onOpenHistory) onOpenHistory();
        else if (onOpenStateMonitor) onOpenStateMonitor();
        else onNavigate('ai');
        break;
      case 'diagnostics':
        onNavigate('diagnostic');
        break;
      case 'admin':
        onNavigate('admin');
        break;
      default:
        onNavigate('ai');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* ১. টপবার হেডার */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#24354b]/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#f2f7ff] tracking-tight flex items-center gap-2">
            <span>AI ড্যাশবোর্ড</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#1d4f883b] text-[#38e2dc] border border-[#347ed94d]">
              PREMIUM
            </span>
          </h1>
          <div className="text-xs sm:text-sm text-[#93a7c1] mt-0.5">
            আপনার ডিজিটাল AI কর্মক্ষেত্র ও ডিভাইস ম্যানেজমেন্ট হাব
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => (onOpenVersionModal ? onOpenVersionModal() : null)}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#102c40] hover:bg-[#153a55] text-[#38e2dc] border border-[#2b6586] transition active:scale-95 shadow-sm"
            title="অ্যাপের সংস্করণ ও আপডেট তথ্য"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>✦ VERSION 3.5.0</span>
          </button>
        </div>
      </header>

      {/* ২. হিরো সেকশন */}
      <section className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-[#28527b] bg-gradient-to-br from-[#142946] via-[#101a2b] to-[#080d19] shadow-2xl">
        {/* ব্যাকগ্রাউন্ড সার্কেল রাডার ডেকোরেশন */}
        <div className="absolute right-[-45px] top-[-50px] w-48 h-48 rounded-full border border-[#39cfe82b] pointer-events-none shadow-[0_0_0_20px_#39cfe80b,0_0_0_42px_#39cfe807]" />
        
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#102c40] text-[#38e2dc] border border-[#2b6586]">
            <span>✧ NEXT-GEN AI WORKSPACE</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#f2f7ff] tracking-tight leading-snug">
            স্বাগতম{' '}
            <span className="bg-gradient-to-r from-[#69a9ff] to-[#48e9dc] bg-clip-text text-transparent">
              মাহফুজুর রহমান AI
            </span>
            -তে
          </h2>

          <p className="text-xs sm:text-sm text-[#b1c4db] leading-relaxed">
            আপনার আইডিয়া, প্রশ্ন, সফটওয়্যার পরিকল্পনা, ডিভাইস রিকভারি ও দৈনন্দিন কাজের
            জন্য একটি আধুনিক AI কর্মক্ষেত্র। আপনার নির্দেশ দিন এবং নতুন কাজ শুরু করুন।
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('ai')}
              type="button"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#367df8] to-[#19bfc6] hover:brightness-110 text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#197df833] transition active:scale-95 cursor-pointer"
            >
              <span>✧ AI-এর সঙ্গে কথা বলুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('diagnostic')}
              type="button"
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#111e30] hover:bg-[#172b44] text-[#f2f7ff] font-semibold text-xs sm:text-sm border border-[#24354b] transition active:scale-95 cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-[#38e2dc]" />
              <span>ডিভাইস ডায়াগনস্টিকস</span>
            </button>

            <button
              onClick={onSelectVivoY21}
              type="button"
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#111e30] hover:bg-[#172b44] text-[#38e2dc] font-semibold text-xs sm:text-sm border border-[#24354b] transition active:scale-95 cursor-pointer"
            >
              <Cpu className="w-4 h-4 text-[#438cff]" />
              <span>Vivo Y21 স্পেশাল হাব</span>
            </button>

            <button
              onClick={() => onNavigate('settings')}
              type="button"
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#111e30] hover:bg-[#172b44] text-[#38e2dc] font-semibold text-xs sm:text-sm border border-[#24354b] transition active:scale-95 cursor-pointer"
              title="AI API সংযোগ (OpenRouter Setup)"
            >
              <KeyRound className="w-4 h-4 text-[#38e2dc]" />
              <span>AI API সংযোগ</span>
            </button>

            <button
              onClick={() => onNavigate('telegram')}
              type="button"
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/50 hover:to-blue-600/50 text-cyan-300 font-semibold text-xs sm:text-sm border border-cyan-500/40 transition active:scale-95 cursor-pointer"
              title="টেলিগ্রাম বট হাব (@mahfuzur_rahman_ai_bot)"
            >
              <Send className="w-4 h-4 text-cyan-400" />
              <span>টেলিগ্রাম বট (@bot)</span>
            </button>
          </div>
        </div>
      </section>

      {/* মাহফুজুর রহমান AI অ্যাপ ডাউনলোড কার্ড */}
      <ApkDownloadCard lang={lang} onOpenGuide={onOpenApkGuide} />

      {/* ৩. স্ট্যাটস কার্ড গ্রিড (৪টি কার্ড) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#132138] to-[#0e1828] border border-[#24354b] shadow-lg">
          <div className="text-xl sm:text-2xl text-[#38e2dc] mb-2 font-bold">✧</div>
          <div className="text-2xl sm:text-3xl font-black text-[#f2f7ff] tracking-tight">11+</div>
          <div className="text-xs text-[#9db0c9] mt-1 font-medium">বিশেষায়িত AI মোড</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#132138] to-[#0e1828] border border-[#24354b] shadow-lg">
          <div className="text-xl sm:text-2xl text-[#438cff] mb-2 font-bold">⌘</div>
          <div className="text-2xl sm:text-3xl font-black text-[#f2f7ff] tracking-tight">AI</div>
          <div className="text-xs text-[#9db0c9] mt-1 font-medium">সহকারী ও প্রো টুলস</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#132138] to-[#0e1828] border border-[#24354b] shadow-lg">
          <div className="text-xl sm:text-2xl text-emerald-400 mb-2 font-bold">▣</div>
          <div className="text-2xl sm:text-3xl font-black text-[#f2f7ff] tracking-tight">24/7</div>
          <div className="text-xs text-[#9db0c9] mt-1 font-medium">ইন্টারফেস ও অফলাইন ইঞ্জিন</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#132138] to-[#0e1828] border border-[#24354b] shadow-lg">
          <div className="text-xl sm:text-2xl text-purple-400 mb-2 font-bold">⬡</div>
          <div className="text-2xl sm:text-3xl font-black text-[#f2f7ff] tracking-tight">v3.5</div>
          <div className="text-xs text-[#9db0c9] mt-1 font-medium">ড্যাশবোর্ড সংস্করণ</div>
        </div>
      </section>

      {/* ৪. আপনার AI টুলস (৬টি টুলস কার্ড) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-[#f2f7ff] flex items-center gap-2">
            <span>✦ আপনার AI টুলস</span>
          </h2>
          <span className="text-[11px] font-semibold text-[#7187a4] tracking-wider uppercase">
            QUICK ACCESS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {/* টুল ১: AI চ্যাট */}
          <button
            onClick={() => handleToolClick('chat')}
            type="button"
            className="p-5 rounded-2xl bg-gradient-to-br from-[#132138] to-[#0e1828] border border-[#24354b] hover:border-[#438cff] hover:-translate-y-1 transition duration-200 text-left group shadow-lg cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-[#214e783f] border border-[#32659b55] flex items-center justify-center text-xl text-[#38e2dc] mb-3 group-hover:scale-110 transition">
              ✧
            </div>
            <h3 className="text-sm font-bold text-[#f2f7ff] group-hover:text-[#438cff] transition">
              AI অ্যাসিস্ট্যান্ট
            </h3>
            <p className="text-xs text-[#93a7c1] leading-relaxed mt-1">
              প্রশ্ন করুন, আইডিয়া নিন এবং ১১টি বিশেষায়িত মোডে সাবলীল বাংলায় সহায়তা পান।
            </p>
          </button>

          {/* টুল ২: কোড জেনারেটর */}
          <button
            onClick={() => handleToolClick('code')}
            type="button"
            className="p-5 rounded-2xl bg-gradient-to-br from-[#132138] to-[#0e1828] border border-[#24354b] hover:border-[#438cff] hover:-translate-y-1 transition duration-200 text-left group shadow-lg cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-[#214e783f] border border-[#32659b55] flex items-center justify-center text-xl text-[#438cff] mb-3 group-hover:scale-110 transition">
              ⌘
            </div>
            <h3 className="text-sm font-bold text-[#f2f7ff] group-hover:text-[#438cff] transition">
              কোড জেনারেটর
            </h3>
            <p className="text-xs text-[#93a7c1] leading-relaxed mt-1">
              সফটওয়্যার পরিকল্পনা, ফুল-স্ট্যাক কোডিং ও হার্ডওয়্যার মাদারবোর্ড ট্রাবলশুটিং।
            </p>
          </button>

          {/* টুল ৩: ওয়েব রিসার্চ */}
          <button
            onClick={() => handleToolClick('research')}
            type="button"
            className="p-5 rounded-2xl bg-gradient-to-br from-[#132138] to-[#0e1828] border border-[#24354b] hover:border-[#438cff] hover:-translate-y-1 transition duration-200 text-left group shadow-lg cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-[#214e783f] border border-[#32659b55] flex items-center justify-center text-xl text-cyan-300 mb-3 group-hover:scale-110 transition">
              ◎
            </div>
            <h3 className="text-sm font-bold text-[#f2f7ff] group-hover:text-[#438cff] transition">
              ওয়েব রিসার্চ
            </h3>
            <p className="text-xs text-[#93a7c1] leading-relaxed mt-1">
              লাইভ গুগল সার্চ গ্রাউন্ডিং দিয়ে সাম্প্রতিক তথ্যের অনুসন্ধান ও সোর্স লিংক।
            </p>
          </button>

          {/* টুল ৪: নিজস্ব জ্ঞানভান্ডার */}
          <button
            onClick={() => handleToolClick('knowledge')}
            type="button"
            className="p-5 rounded-2xl bg-gradient-to-br from-[#132138] to-[#0e1828] border border-[#24354b] hover:border-[#438cff] hover:-translate-y-1 transition duration-200 text-left group shadow-lg cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-[#214e783f] border border-[#32659b55] flex items-center justify-center text-xl text-emerald-400 mb-3 group-hover:scale-110 transition">
              ▤
            </div>
            <h3 className="text-sm font-bold text-[#f2f7ff] group-hover:text-[#438cff] transition">
              নিজস্ব জ্ঞানভান্ডার
            </h3>
            <p className="text-xs text-[#93a7c1] leading-relaxed mt-1">
              সংরক্ষিত অতীত কথোপকথনের মেমোরি ও অটো-আপডেটার প্রজেক্ট স্টেট মনিটর।
            </p>
          </button>

          {/* টুল ৫: ডিভাইস ডায়াগনস্টিকস */}
          <button
            onClick={() => handleToolClick('diagnostics')}
            type="button"
            className="p-5 rounded-2xl bg-gradient-to-br from-[#132138] to-[#0e1828] border border-[#24354b] hover:border-[#438cff] hover:-translate-y-1 transition duration-200 text-left group shadow-lg cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-[#214e783f] border border-[#32659b55] flex items-center justify-center text-xl text-amber-400 mb-3 group-hover:scale-110 transition">
              ▣
            </div>
            <h3 className="text-sm font-bold text-[#f2f7ff] group-hover:text-[#438cff] transition">
              ডিভাইস ডায়াগনস্টিকস
            </h3>
            <p className="text-xs text-[#93a7c1] leading-relaxed mt-1">
              অ্যান্ড্রয়েড প্যাটার্ন, পিন, FRP ও হার্ডওয়্যার সমস্যা নির্ণয়ের নিরাপদ সমাধান।
            </p>
          </button>

          {/* টুল ৬: অ্যাডমিন কন্ট্রোল */}
          <button
            onClick={() => handleToolClick('admin')}
            type="button"
            className="p-5 rounded-2xl bg-gradient-to-br from-[#132138] to-[#0e1828] border border-[#24354b] hover:border-[#438cff] hover:-translate-y-1 transition duration-200 text-left group shadow-lg cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-[#214e783f] border border-[#32659b55] flex items-center justify-center text-xl text-purple-400 mb-3 group-hover:scale-110 transition">
              ⬡
            </div>
            <h3 className="text-sm font-bold text-[#f2f7ff] group-hover:text-[#438cff] transition">
              অ্যাডমিন কন্ট্রোল
            </h3>
            <p className="text-xs text-[#93a7c1] leading-relaxed mt-1">
              সুপার এডমিন কন্ট্রোল সেন্টার, লাইভ টার্মিনাল কমান্ড ও সার্ভিস স্ট্যাটাস।
            </p>
          </button>
        </div>
      </section>

      {/* ৫. লোয়ার সেকশন: লাইভ AI চ্যাট প্রিভিউ + সিস্টেম তথ্য */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ক. লাইভ AI চ্যাট কার্ড (৭ কলাম) */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#132138] to-[#0e1828] border border-[#24354b] shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#24354b]">
              <h2 className="text-base font-bold text-[#f2f7ff] flex items-center gap-2">
                <span className="text-[#38e2dc]">✧</span>
                <span>AI চ্যাট প্রিভিউ</span>
              </h2>
              <button
                onClick={() => onNavigate('ai')}
                type="button"
                className="text-xs text-[#38e2dc] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>পূর্ণাঙ্গ চ্যাটে যান</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* চ্যাট লগ স্ক্রল এরিয়া */}
            <div className="min-h-[160px] max-h-[280px] overflow-y-auto space-y-3 pr-1">
              {chatLog.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed transition ${
                    msg.role === 'ai'
                      ? 'bg-[#1a2a40] border-l-4 border-[#38e2dc] text-[#f2f7ff]'
                      : 'bg-[#15273f] border-l-4 border-[#438cff] text-[#f2f7ff]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 text-[11px] text-[#93a7c1]">
                    <span className="font-semibold text-slate-300">
                      {msg.role === 'ai' ? '🤖 মাহফুজুর রহমান AI' : '👤 আপনি'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">{msg.time}</span>
                      <button
                        onClick={() => handleCopyMessage(msg.text, idx)}
                        type="button"
                        className="text-slate-400 hover:text-white"
                        title="কপি করুন"
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>
              ))}

              {isChatLoading && (
                <div className="p-3.5 rounded-2xl bg-[#1a2a40] border-l-4 border-[#38e2dc] text-xs text-[#38e2dc] flex items-center gap-2 animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>উত্তর তৈরি করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</span>
                </div>
              )}
            </div>
          </div>

          {/* প্রশ্ন ইনপুট ফর্ম */}
          <div className="mt-4 pt-3 border-t border-[#24354b]">
            <form onSubmit={handleQuickSubmit} className="flex gap-2">
              <textarea
                rows={2}
                value={quickQuestion}
                onChange={(e) => setQuickQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleQuickSubmit(e);
                  }
                }}
                placeholder="আপনার প্রশ্ন লিখুন (যেমন: Vivo Y21 এর প্যাটার্ন লক ভুলে গেছি)..."
                disabled={isChatLoading}
                className="flex-1 bg-[#091321] text-[#f2f7ff] placeholder-[#93a7c1] border border-[#30435b] focus:border-[#438cff] rounded-xl p-3 text-xs sm:text-sm outline-none resize-none transition"
              />
              <button
                type="submit"
                disabled={isChatLoading || !quickQuestion.trim()}
                className="px-4 rounded-xl bg-[#2768c7] hover:bg-[#347ed9] text-white font-bold transition active:scale-95 disabled:opacity-40 flex items-center justify-center cursor-pointer shadow-md"
                title="কমান্ড পাঠান"
              >
                {isChatLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>

            {chatNotice && (
              <div className="text-[11px] text-[#38e2dc] mt-2 font-medium">
                {chatNotice}
              </div>
            )}
            <p className="text-[11px] text-[#7187a4] mt-1.5">
              লাইভ AI সংযোগ সক্রিয়: প্রশ্ন করার সাথে সাথে ৪-টিয়ার ফলব্যাক ইঞ্জিন থেকে উত্তর আসবে।
            </p>
          </div>
        </div>

        {/* খ. সিস্টেম তথ্য ও অ্যাক্টিভিটি কার্ড (৫ কলাম) */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#132138] to-[#0e1828] border border-[#24354b] shadow-2xl space-y-4">
          <div className="pb-3 border-b border-[#24354b] flex items-center justify-between">
            <h2 className="text-base font-bold text-[#f2f7ff] flex items-center gap-2">
              <span>▤ সিস্টেম তথ্য ও স্থিতি</span>
            </h2>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Active</span>
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#101a2b] border border-[#24354b]">
              <span className="text-lg text-emerald-400">◈</span>
              <div>
                <strong className="text-[#f2f7ff] block">UI ইন্টারফেস প্রস্তুত</strong>
                <span className="text-[#93a7c1] text-[11px]">
                  প্রিমিয়াম ড্যাশবোর্ড v3.5.0 সক্রিয় ও সম্পূর্ণ অপ্টিমাইজড
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#101a2b] border border-[#24354b]">
              <span className="text-lg text-[#38e2dc]">⌘</span>
              <div>
                <strong className="text-[#f2f7ff] block">AI মাল্টি-টিয়ার ফলব্যাক</strong>
                <span className="text-[#93a7c1] text-[11px]">
                  OpenAI ➔ Gemini ➔ OpenRouter (DeepSeek) ➔ MDR অফলাইন মেমোরি
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#101a2b] border border-[#24354b]">
              <span className="text-lg text-purple-400">⬡</span>
              <div>
                <strong className="text-[#f2f7ff] block">১০০% নিরাপত্তা ও গোপনীয়তা</strong>
                <span className="text-[#93a7c1] text-[11px]">
                  সমস্ত API Key সার্ভারে সুরক্ষিত; চ্যাট ডাটা লোকাল ব্রাউজারে সংরক্ষিত
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#101a2b] border border-[#24354b]">
              <span className="text-lg text-amber-400">▣</span>
              <div>
                <strong className="text-[#f2f7ff] block">ডিভাইস ও সার্ভিসিং হাব</strong>
                <span className="text-[#93a7c1] text-[11px]">
                  Vivo Y21 ও অ্যান্ড্রয়েড রিকভারি, ডিজিটাল কিস্তি মেমো ও অভিযোগ ড্রাফট
                </span>
              </div>
            </div>
          </div>

          {/* শর্টকাট অ্যাকশন বাটনসমূহ */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => (onOpenStateMonitor ? onOpenStateMonitor() : null)}
              type="button"
              className="flex-1 py-2 px-3 rounded-xl bg-[#152a42] hover:bg-[#1a3554] text-[#38e2dc] text-xs font-semibold border border-[#2a5078] transition active:scale-95 text-center cursor-pointer"
            >
              মেমোরি মনিটর
            </button>
            <button
              onClick={onOpenApkGuide}
              type="button"
              className="flex-1 py-2 px-3 rounded-xl bg-[#152a42] hover:bg-[#1a3554] text-slate-200 text-xs font-semibold border border-[#24354b] transition active:scale-95 text-center cursor-pointer"
            >
              APK বিল্ড গাইড
            </button>
          </div>
        </div>
      </section>

      {/* ৬. ফুটার ক্রেডিট */}
      <footer className="pt-6 pb-2 text-center text-[#7388a4] text-xs border-t border-[#24354b]/40">
        মাহফুজুর রহমান AI · Premium Workspace · v3.5.0 · স্বয়ংক্রিয় এআই সুপার প্ল্যাটফর্ম
      </footer>
    </div>
  );
};
