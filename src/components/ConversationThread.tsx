import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Bot, 
  User, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Clock, 
  Share2, 
  Zap,
  RotateCcw,
  Globe,
  ExternalLink,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import { ChatMessage } from '../types/recovery';
import { Agent } from '../types/agents';
import { Language } from '../utils/translations';

interface ConversationThreadProps {
  messages: ChatMessage[];
  isLoading: boolean;
  answeringAgent: Agent;
  lang: Language;
  onClearThread?: () => void;
}

export const ConversationThread: React.FC<ConversationThreadProps> = ({
  messages,
  isLoading,
  answeringAgent,
  lang,
  onClearThread,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleToggleSpeech = (text: string, id: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    } else {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[#*`_~]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'bn-BD';
      utterance.rate = 0.95;
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      window.speechSynthesis.speak(utterance);
      setSpeakingId(id);
    }
  };

  if (messages.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="space-y-4">
      {messages.map((msg) => {
        const isUser = msg.role === 'user';
        return (
          <div
            key={msg.id}
            className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} transition-all`}
          >
            {/* প্রেরক পরিচিতি ও টাইমস্ট্যাম্প */}
            <div className={`flex items-center gap-2 mb-1 px-1 text-[11px] text-slate-400 ${isUser ? 'flex-row-reverse' : ''}`}>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  isUser
                    ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
                    : 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
              </div>
              <span className="font-semibold text-slate-300">
                {isUser ? (lang === 'bn' ? 'আপনি' : 'You') : (lang === 'bn' ? 'মাহফুজুর রহমান AI' : 'MDR AI')}
              </span>
              <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {msg.model && !isUser && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono">
                  {msg.model}
                </span>
              )}
            </div>

            {/* মেসেজ বাবল */}
            <div
              className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 shadow-lg text-sm relative transition-all ${
                isUser
                  ? 'bg-blue-600/15 border border-blue-500/30 text-slate-100 rounded-tr-sm'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-tl-sm backdrop-blur-sm'
              }`}
            >
              {/* ফলব্যাক নোটিস */}
              {!isUser && msg.fallbackUsed && (
                <div className="mb-2 px-2.5 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-[11px] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0 animate-pulse" />
                  <span>
                    {msg.provider === 'gemini'
                      ? 'স্বয়ংক্রিয় Google Gemini ব্যাকআপ থেকে উত্তর প্রস্তুত'
                      : msg.provider === 'openrouter'
                      ? 'স্বয়ংক্রিয় OpenRouter (DeepSeek / Llama) ব্যাকআপ থেকে প্রস্তুত'
                      : msg.provider === 'offline-knowledge'
                      ? 'স্বয়ংক্রিয় অফলাইন নলেজ ইঞ্জিন থেকে উত্তর প্রস্তুত'
                      : 'বিকল্প ফলব্যাক মডেলে প্রস্তুত'}
                  </span>
                </div>
              )}

              {/* অ্যাটাচমেন্ট (যদি ব্যবহারকারী ছবি বা ফাইল আপলোড করে থাকেন) */}
              {isUser && msg.attachment && (
                <div className="mb-2.5">
                  {msg.attachment.mimeType.startsWith('image/') ? (
                    <div className="relative inline-block rounded-xl overflow-hidden border border-blue-400/40 max-w-[200px] max-h-[160px] bg-slate-950">
                      <img
                        src={msg.attachment.data.startsWith('data:') ? msg.attachment.data : `data:${msg.attachment.mimeType};base64,${msg.attachment.data}`}
                        alt={msg.attachment.name || 'সংযুক্ত ছবি'}
                        className="object-cover w-full h-full rounded-xl"
                      />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-white font-mono">
                        {msg.attachment.name || 'ছবি'}
                      </span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-950/60 border border-blue-400/30 text-blue-200 text-xs font-mono">
                      <FileText className="w-3.5 h-3.5 text-blue-300" />
                      <span>{msg.attachment.name || 'সংযুক্ত ডকুমেন্ট'}</span>
                    </div>
                  )}
                </div>
              )}

              {/* কন্টেন্ট */}
              {isUser ? (
                <p className="whitespace-pre-wrap leading-relaxed text-slate-100">{msg.content}</p>
              ) : (
                <div className="prose-bengali text-slate-100 selection:bg-emerald-600/30 selection:text-white overflow-x-auto text-xs sm:text-sm">
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
                            <code className="bg-slate-950 text-emerald-300 px-1.5 py-0.5 rounded text-xs font-mono border border-slate-800" {...props}>
                              {children}
                            </code>
                          );
                        }
                        return (
                          <div className="relative my-2.5 group">
                            <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto text-emerald-200">
                              <code {...props}>{children}</code>
                            </pre>
                          </div>
                        );
                      },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>

                  {/* ওয়েব সার্চ সোর্স ও রেফারেন্স লিংক */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3.5 pt-2.5 border-t border-slate-800">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-1.5">
                        <Globe className="w-3 h-3 text-cyan-400" />
                        <span>অনুসন্ধানের উৎস ও লিংক:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((src, sIdx) => (
                          <a
                            key={sIdx}
                            href={src.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-cyan-300 text-[10px] border border-cyan-500/20 max-w-[200px] truncate"
                          >
                            <span className="truncate">{src.title || src.uri}</span>
                            <ExternalLink className="w-2 h-2 text-cyan-400 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* মেসেজ টুলবার */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopy(msg.content, msg.id)}
                    className="p-1 rounded hover:bg-slate-800 hover:text-slate-200 transition flex items-center gap-1 text-[11px]"
                    title="কপি করুন"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 text-[10px]">কপি হয়েছে</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span className="text-[10px]">কপি</span>
                      </>
                    )}
                  </button>

                  {!isUser && (
                    <button
                      onClick={() => handleToggleSpeech(msg.content, msg.id)}
                      className="p-1 rounded hover:bg-slate-800 hover:text-slate-200 transition text-[11px] ml-1"
                      title={speakingId === msg.id ? 'থামান' : 'শুনুন'}
                    >
                      {speakingId === msg.id ? (
                        <VolumeX className="w-3 h-3 text-rose-400" />
                      ) : (
                        <Volume2 className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* চলমান লোডিং ইন্ডিকেটর */}
      {isLoading && (
        <div className="flex flex-col items-start animate-pulse">
          <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-slate-400">
            <div className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <Bot className="w-3 h-3 animate-spin" />
            </div>
            <span className="font-semibold text-slate-300">
              {lang === 'bn' ? 'মাহফুজুর রহমান AI' : 'MDR AI'}
            </span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm p-4 text-xs text-emerald-400 flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>
              {lang === 'bn'
                ? 'অতীত প্রসঙ্গ মনে রেখে উত্তর তৈরি করা হচ্ছে...'
                : 'Thinking with conversation history context...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
