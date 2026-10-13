import React from 'react';
import { Bot, HelpCircle, Activity, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  isConfigured: boolean;
  onOpenGuide: () => void;
  onTestConnection: () => void;
  isTesting: boolean;
  modelName?: string;
  hasFallback?: boolean;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isConfigured,
  onOpenGuide,
  onTestConnection,
  isTesting,
  modelName,
  hasFallback = false,
  theme = 'dark',
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-md">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* ব্র্যান্ডিং ও লোগো */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
              title={isConfigured ? 'API সংযুক্ত' : 'কনফিগারেশন প্রয়োজন'}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                মাহফুজুর রহমান AI
              </h1>
              <span className="inline-flex items-center px-1.5 py-0.5 text-[11px] font-mono rounded bg-slate-800 text-emerald-400 border border-slate-700">
                {modelName || 'gpt-4o-mini'}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <span>{isConfigured ? 'সক্রিয় ও প্রস্তুত' : 'কনফিগারেশন প্রয়োজন'}</span>
              {hasFallback && (
                <span className="text-[10px] text-cyan-400 font-medium bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800/60">
                  + ফলব্যাক
                </span>
              )}
            </p>
          </div>
        </div>

        {/* অ্যাকশন বাটনসমূহ */}
        <div className="flex items-center gap-2">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              type="button"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition active:scale-95 cursor-pointer"
              title={theme === 'dark' ? 'লাইট মোড চালু করুন' : 'ডার্ক মোড চালু করুন'}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xs:inline">
                {theme === 'dark' ? 'লাইট মোড' : 'ডার্ক মোড'}
              </span>
            </button>
          )}

          {/* টেস্ট কানেকশন বাটন */}
          <button
            onClick={onTestConnection}
            disabled={isTesting}
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-95 disabled:opacity-50"
            title="সার্ভার ও API সংযোগ পরীক্ষা করুন"
          >
            <Activity className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-teal-400' : 'text-slate-400'}`} />
            <span className="hidden xs:inline">
              {isTesting ? 'যাচাই হচ্ছে...' : 'সংযোগ টেস্ট'}
            </span>
          </button>

          {/* সেটআপ নির্দেশিকা বাটন */}
          <button
            onClick={onOpenGuide}
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 transition active:scale-95"
            title="সেটআপ নির্দেশিকা খুলুন"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">নির্দেশিকা</span>
          </button>
        </div>
      </div>
    </header>
  );
};
