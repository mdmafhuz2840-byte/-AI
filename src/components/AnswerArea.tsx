import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, Copy, Check, Volume2, VolumeX, Sparkles, Clock, Share2, ShieldCheck, Zap, Globe, ExternalLink } from 'lucide-react';

import { Agent } from '../types/agents';
import { GroundingSource } from '../types/recovery';

interface AnswerAreaProps {
  answer: string | null;
  question: string | null;
  isLoading: boolean;
  timestamp?: string | null;
  model?: string | null;
  agent?: Agent | null;
  fallbackUsed?: boolean;
  fallbackReason?: string | null;
  provider?: string | null;
  sources?: GroundingSource[] | null;
}

export const AnswerArea: React.FC<AnswerAreaProps> = ({
  answer,
  question,
  isLoading,
  timestamp,
  model,
  agent,
  fallbackUsed,
  fallbackReason,
  provider,
  sources,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(
    typeof window !== 'undefined' && 'speechSynthesis' in window
  );

  const handleCopy = async () => {
    if (!answer) return;
    try {
      await navigator.clipboard.writeText(answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleShare = async () => {
    if (!answer || typeof navigator === 'undefined' || !navigator.share) return;
    try {
      await navigator.share({
        title: 'মাহফুজুর রহমান AI এর উত্তর',
        text: `প্রশ্ন: ${question}\n\nউত্তর: ${answer}`,
      });
    } catch {
      // ignored
    }
  };

  const handleToggleSpeech = () => {
    if (!speechSupported || !answer) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      // ক্লিন টেক্সট
      const cleanText = answer.replace(/[#*`_~]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'bn-BD'; // বাংলা ভাষা
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // যদি লোডিং হয়
  if (isLoading) {
    return (
      <section 
        aria-live="polite" 
        className="w-full bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden transition-all animate-pulse"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Bot className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="h-4 w-36 bg-slate-700 rounded mb-1.5" />
            <div className="h-3 w-24 bg-slate-700/60 rounded" />
          </div>
        </div>

        <div className="space-y-3 py-2">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>উত্তর তৈরি করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</span>
          </div>
          <div className="h-3.5 bg-slate-700/70 rounded w-5/6" />
          <div className="h-3.5 bg-slate-700/50 rounded w-full" />
          <div className="h-3.5 bg-slate-700/40 rounded w-4/6" />
        </div>
      </section>
    );
  }

  // যদি এখনও কোনো উত্তর না থাকে
  if (!answer) {
    return null;
  }

  return (
    <section 
      aria-label="এআই উত্তর এরিয়া" 
      className="w-full bg-slate-800/90 border border-slate-700 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-sm relative transition-all"
    >
      {/* উত্তর হেডার */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-700/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
              <span>মাহফুজুর রহমান AI</span>
              {agent && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${agent.colorClass.bg} ${agent.colorClass.text} border ${agent.colorClass.border}`}>
                  {agent.name}
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              {timestamp && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {new Date(timestamp).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              {model && (
                <span className="px-1.5 py-0.5 rounded bg-slate-900/60 font-mono text-[10px] text-slate-400">
                  {model}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* অ্যাকশন বাটনসমূহ (কপি, সাউন্ড, শেয়ার) */}
        <div className="flex items-center gap-1">
          {speechSupported && (
            <button
              onClick={handleToggleSpeech}
              type="button"
              className={`p-2 rounded-lg text-xs font-medium transition ${
                isSpeaking 
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' 
                  : 'hover:bg-slate-700/70 text-slate-300'
              }`}
              title={isSpeaking ? 'পড়া বন্ধ করুন' : 'উচ্চস্বরে পড়ে শোনান'}
              aria-label="পড়ে শোনান"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleShare}
              type="button"
              className="p-2 rounded-lg hover:bg-slate-700/70 text-slate-300 text-xs font-medium transition"
              title="শেয়ার করুন"
              aria-label="শেয়ার করুন"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleCopy}
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-700/80 text-slate-200 text-xs font-medium border border-slate-700 transition active:scale-95"
            title="উত্তর কপি করুন"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">কপি হয়েছে</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>কপি করুন</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* যদি সংশ্লিষ্ট প্রশ্ন থাকে তবে প্রিভিউ */}
      {question && (
        <div className="mb-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300">
          <span className="font-semibold text-emerald-400 block mb-0.5">আপনার প্রশ্ন:</span>
          <p className="line-clamp-2 text-slate-200">{question}</p>
        </div>
      )}

      {/* ফলব্যাক নোটিফিকেশন ব্যানার (যদি ব্যাকআপ মডেল ব্যবহৃত হয়ে থাকে) */}
      {fallbackUsed && (
        <div className="mb-4 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-xs flex items-start gap-2.5 shadow-sm">
          <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="flex-1">
            <span className="font-semibold text-cyan-300 block">
              স্বয়ংক্রিয় ব্যাকআপ মডেল সক্রিয় ({provider === 'gemini' ? 'Google Gemini 3.8 Flash' : provider === 'openrouter' ? `OpenRouter (${model})` : provider === 'offline-knowledge' ? 'অফলাইন নলেজ ইঞ্জিন' : model})
            </span>
            <p className="text-[11px] text-cyan-300/80 mt-0.5 leading-relaxed">
              {fallbackReason || 'OpenAI কোটা বা রেট লিমিটের কারণে অ্যাপটি নির্বিঘ্নে চালু রাখতে ব্যাকআপ মডেলে উত্তর তৈরি করা হয়েছে।'}
            </p>
          </div>
        </div>
      )}

      {/* মূল উত্তরের এলাকা (Formatted Markdown) */}
      <div className="prose-bengali text-slate-100 selection:bg-emerald-600/30 selection:text-white overflow-x-auto">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ ...props }) => (
              <a
                {...props}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 underline font-medium"
              />
            ),
            code: ({ inline, className, children, ...props }: any) => {
              if (inline) {
                return (
                  <code className="bg-slate-900/80 text-emerald-300 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                    {children}
                  </code>
                );
              }
              return (
                <div className="relative my-3 group">
                  <pre className="bg-slate-950 p-3 sm:p-4 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto text-emerald-200">
                    <code {...props}>{children}</code>
                  </pre>
                </div>
              );
            },
          }}
        >
          {answer}
        </ReactMarkdown>
      </div>

      {/* ওয়েব সার্চ সূত্র ও রেফারেন্স লিংক */}
      {sources && sources.length > 0 && (
        <div className="mt-5 pt-3.5 border-t border-slate-700/60">
          <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2.5">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>গুগল সার্চ ও নির্ভরযোগ্য তথ্যের উৎস ({sources.length}টি লিংক):</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {sources.map((src, idx) => (
              <a
                key={idx}
                href={src.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-700/80 text-cyan-300 text-[11px] border border-cyan-500/20 transition hover:border-cyan-500/40 max-w-full truncate group"
              >
                <span className="truncate max-w-[220px]">{src.title || src.uri}</span>
                <ExternalLink className="w-2.5 h-2.5 text-cyan-400/70 group-hover:text-cyan-300 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
