import React from 'react';
import { AlertCircle, RefreshCw, Key, WifiOff, HelpCircle } from 'lucide-react';

export interface ErrorDetails {
  error?: string;
  message: string;
  hint?: string;
  detail?: string;
  configured?: boolean;
}

interface ErrorAlertProps {
  error: ErrorDetails;
  onRetry?: () => void;
  onOpenGuide: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  onRetry,
  onOpenGuide,
}) => {
  const isKeyMissing =
    error.error === 'OPENAI_API_KEY_NOT_CONFIGURED' ||
    error.error === 'OPENAI_API_KEY_MISSING' ||
    error.configured === false;

  const isNetwork =
    error.error === 'SERVER_NETWORK_ERROR' ||
    error.error === 'NETWORK_ERROR' ||
    error.error === 'TIMEOUT';

  return (
    <div
      role="alert"
      className="w-full p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 shadow-lg animate-fade-in"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
          {isNetwork ? (
            <WifiOff className="w-5 h-5" />
          ) : isKeyMissing ? (
            <Key className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
        </div>

        <div className="flex-1">
          <h4 className="font-bold text-sm sm:text-base text-rose-100 flex items-center gap-1.5">
            {isKeyMissing ? 'OpenAI API কী প্রয়োজন' : 'ত্রুটি ঘটেছে (Error)'}
          </h4>
          
          <p className="text-xs sm:text-sm text-rose-200 mt-1 leading-relaxed">
            {error.message}
          </p>

          {error.hint && (
            <div className="mt-2 text-xs text-rose-300/90 bg-rose-900/30 p-2.5 rounded-lg border border-rose-700/40 font-mono">
              💡 পরামর্শ: {error.hint}
            </div>
          )}

          {error.detail && (
            <div className="mt-1.5 text-[11px] text-slate-400 font-mono bg-slate-900/60 p-2 rounded border border-slate-800">
              বিস্তারিত: {error.detail}
            </div>
          )}

          {/* অ্যাকশন বাটনসমূহ */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                পুনরায় চেষ্টা করুন
              </button>
            )}

            {isKeyMissing && (
              <button
                onClick={onOpenGuide}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                কীভাবে সেট করবেন দেখুন
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
