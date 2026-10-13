import React from 'react';
import { Lightbulb, Sparkles } from 'lucide-react';

interface QuickPromptsProps {
  prompts: string[];
  agentName: string;
  onSelectPrompt: (prompt: string) => void;
  disabled: boolean;
}

export const QuickPrompts: React.FC<QuickPromptsProps> = ({
  prompts,
  agentName,
  onSelectPrompt,
  disabled,
}) => {
  if (!prompts || prompts.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-2.5">
        <div className="flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>নমুনা প্রশ্ন ({agentName} এর জন্য):</span>
        </div>
        <span className="text-[11px] text-slate-500">ট্যাপ করে ইনপুটে বসান</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            type="button"
            disabled={disabled}
            onClick={() => onSelectPrompt(prompt)}
            className="text-left text-xs text-slate-300 bg-slate-900/80 hover:bg-slate-800 hover:text-white p-2.5 sm:p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none line-clamp-2"
          >
            "{prompt}"
          </button>
        ))}
      </div>
    </div>
  );
};
