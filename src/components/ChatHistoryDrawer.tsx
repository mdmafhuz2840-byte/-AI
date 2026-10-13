import React, { useState } from 'react';
import { 
  History, 
  MessageSquare, 
  Trash2, 
  Plus, 
  ChevronRight, 
  Clock, 
  Bot, 
  User, 
  Check, 
  Copy,
  Sparkles,
  ChevronDown,
  X
} from 'lucide-react';
import { ChatSession, ChatMessage } from '../types/recovery';
import { Language } from '../utils/translations';
import { AI_AGENTS } from '../types/agents';

interface ChatHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (session: ChatSession) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
  onClearAllHistory: () => void;
  lang: Language;
}

export const ChatHistoryDrawer: React.FC<ChatHistoryDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClearAllHistory,
  lang,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* ব্যাকড্রপ ক্লিক ক্লোজ */}
      <div className="fixed inset-0" onClick={onClose} />

      <aside className="relative z-10 w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden">
        {/* টপ হেডার */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">
                {lang === 'bn' ? 'স্মৃতি ও কথোপকথন ইতিহাস' : 'Chat History & Memory'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {sessions.length} {lang === 'bn' ? 'টি সংরক্ষিত সেশন' : 'saved sessions'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onNewChat}
              className="p-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition"
              title={lang === 'bn' ? 'নতুন চ্যাট শুরু করুন' : 'Start New Chat'}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'নতুন চ্যাট' : 'New'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* কনটেক্সট ইনফো ব্যানার */}
        <div className="px-4 py-2 bg-emerald-950/30 border-b border-emerald-800/30 text-[11px] text-emerald-300 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            {lang === 'bn'
              ? 'এআই আপনার অতীতের প্রশ্নগুলো মনে রাখে এবং ধারাবাহিক উত্তর দেয়।'
              : 'AI retains context across previous turns for coherent responses.'}
          </span>
        </div>

        {/* সেশন তালিকা */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {sessions.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <MessageSquare className="w-10 h-10 mx-auto opacity-30 text-slate-400" />
              <p className="text-xs">
                {lang === 'bn' ? 'এখনো কোনো অতীতের কথোপকথন জমা হয়নি।' : 'No saved conversations yet.'}
              </p>
              <p className="text-[11px] text-slate-600">
                {lang === 'bn' ? 'এআই-কে প্রশ্ন করলে স্বয়ংক্রিয়ভাবে হিস্ট্রি তৈরি হবে।' : 'Chats will automatically be remembered here.'}
              </p>
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const agent = AI_AGENTS.find((a) => a.id === session.agentId);
              const messageCount = session.messages.length;

              return (
                <div
                  key={session.id}
                  className={`group relative p-3 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-slate-800/90 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div
                    onClick={() => onSelectSession(session)}
                    className="cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                        {agent?.name || 'এআই'}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(session.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-200 line-clamp-2 leading-relaxed">
                      {session.title || (lang === 'bn' ? 'কথোপকথন' : 'Conversation')}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                      <span>{messageCount} {lang === 'bn' ? 'টি মেসেজ' : 'messages'}</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition ${isActive ? 'text-emerald-400 translate-x-0.5' : 'text-slate-600'}`} />
                    </div>
                  </div>

                  {/* ডিলিট বাটন */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="absolute top-2.5 right-2 p-1 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition rounded hover:bg-rose-950/40"
                    title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* ফুটার কন্ট্রোল */}
        {sessions.length > 0 && (
          <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
            <button
              onClick={() => {
                if (window.confirm(lang === 'bn' ? 'সব কথোপকথনের স্মৃতি মুছে ফেলতে চান?' : 'Clear all conversation history?')) {
                  onClearAllHistory();
                }
              }}
              className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-rose-950/30 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'সকল হিস্ট্রি ক্লিয়ার' : 'Clear All'}</span>
            </button>

            <span className="text-[10px] text-slate-500">
              {lang === 'bn' ? 'লোকাল ব্রাউজারে সংরক্ষিত' : 'Stored Locally'}
            </span>
          </div>
        )}
      </aside>
    </div>
  );
};
