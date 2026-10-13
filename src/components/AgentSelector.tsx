import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Palette,
  KeyRound, 
  Receipt, 
  MessageSquareWarning, 
  Headset, 
  Calculator, 
  Cpu, 
  TrendingUp, 
  MessageCircle, 
  Share2, 
  Video,
  Code2, 
  PenTool, 
  GraduationCap, 
  Languages, 
  ChevronDown, 
  Check,
  Bot,
  HeartHandshake
} from 'lucide-react';
import { Agent, AI_AGENTS, AgentIconName } from '../types/agents';

interface AgentSelectorProps {
  selectedAgent: Agent;
  onSelectAgent: (agent: Agent) => void;
  disabled?: boolean;
}

// আইকন ম্যাপার হেল্পার
export const renderAgentIcon = (iconName: AgentIconName, className: string = 'w-4 h-4') => {
  switch (iconName) {
    case 'Palette':
      return <Palette className={className} />;
    case 'KeyRound':
      return <KeyRound className={className} />;
    case 'Receipt':
      return <Receipt className={className} />;
    case 'MessageSquareWarning':
      return <MessageSquareWarning className={className} />;
    case 'Headset':
      return <Headset className={className} />;
    case 'Calculator':
      return <Calculator className={className} />;
    case 'Cpu':
      return <Cpu className={className} />;
    case 'TrendingUp':
      return <TrendingUp className={className} />;
    case 'MessageCircle':
      return <MessageCircle className={className} />;
    case 'Share2':
      return <Share2 className={className} />;
    case 'Video':
      return <Video className={className} />;
    case 'Code2':
      return <Code2 className={className} />;
    case 'PenTool':
      return <PenTool className={className} />;
    case 'GraduationCap':
      return <GraduationCap className={className} />;
    case 'Languages':
      return <Languages className={className} />;
    case 'HeartHandshake':
      return <HeartHandshake className={className} />;
    case 'Sparkles':
    default:
      return <Sparkles className={className} />;
  }
};

export const AgentSelector: React.FC<AgentSelectorProps> = ({
  selectedAgent,
  onSelectAgent,
  disabled = false,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // বাইরে ক্লিক করলে ড্রপডাউন বন্ধ হবে
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className="w-full space-y-2.5">
      {/* ১. শীর্ষ বার: ড্রপডাউন সিলেক্টর ও টাইটেল */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
          <span className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-1.5">
            বিশেষজ্ঞ এআই সহকারী মোড:
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60 font-mono">
            {AI_AGENTS.length} টি মোড সক্রিয়
          </span>
        </div>

        {/* ড্রপডাউন সিলেক্টর বাটন */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm rounded-xl font-semibold transition-all duration-200 border shadow-md active:scale-95 disabled:opacity-50 cursor-pointer ${
              isDropdownOpen
                ? 'bg-slate-800 text-emerald-300 border-emerald-500/50 ring-2 ring-emerald-500/20'
                : 'bg-slate-800/90 hover:bg-slate-800 text-slate-100 border-slate-700 hover:border-slate-600'
            }`}
            title="সবগুলো সহকারী মোড তালিকা থেকে বেছে নিন"
          >
            <span className={selectedAgent.colorClass.text}>
              {renderAgentIcon(selectedAgent.iconName, 'w-4 h-4')}
            </span>
            <span className="truncate max-w-[130px] sm:max-w-[180px] font-bold">
              {selectedAgent.name}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 text-slate-300 hidden xs:inline">
              {selectedAgent.badge}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-emerald-400' : ''}`} />
          </button>

          {/* ড্রপডাউন পপআপ মেনু */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 z-50 bg-slate-900/98 backdrop-blur-xl border border-slate-700/90 rounded-2xl shadow-2xl p-2 space-y-1 max-h-[75vh] overflow-y-auto scrollbar-thin">
              <div className="px-2.5 py-2 border-b border-slate-800 mb-1 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  সহকারী নির্বাচন করুন ({AI_AGENTS.length})
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  MDR Specialized AI
                </span>
              </div>

              {AI_AGENTS.map((agent) => {
                const isSelected = agent.id === selectedAgent.id;
                return (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => {
                      onSelectAgent(agent);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 text-white font-medium ring-1 ring-emerald-500/40 shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${agent.colorClass.bg} ${agent.colorClass.text} border ${agent.colorClass.border}`}>
                      {renderAgentIcon(agent.iconName, 'w-4 h-4')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold truncate text-white">
                          {agent.name}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal shrink-0 ${agent.colorClass.bg} ${agent.colorClass.text}`}>
                          {agent.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {agent.description}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ২. অনুভূমিক স্ক্রোলযোগ্য কুইক-সিলেক্ট ট্যাব বার (সব ১১টি মোড) */}
      <div className="relative">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-0.5 scrollbar-thin snap-x">
          {AI_AGENTS.map((agent) => {
            const isSelected = agent.id === selectedAgent.id;

            return (
              <button
                key={agent.id}
                type="button"
                disabled={disabled}
                onClick={() => onSelectAgent(agent)}
                className={`snap-start shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border active:scale-95 disabled:opacity-50 cursor-pointer ${
                  isSelected
                    ? `${agent.colorClass.activeBg} text-white border-transparent shadow-lg ${agent.colorClass.glow} scale-[1.02]`
                    : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className={isSelected ? 'text-white' : agent.colorClass.text}>
                  {renderAgentIcon(agent.iconName, 'w-4 h-4')}
                </span>
                <span className="whitespace-nowrap">{agent.name}</span>

                {/* ব্যাজ */}
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                    isSelected
                      ? 'bg-black/30 text-white'
                      : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                  }`}
                >
                  {agent.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ৩. নির্বাচিত এজেন্টের সক্রিয় ভূমিকা ও বিবরণ কার্ড */}
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
        <div className={`p-2.5 rounded-xl ${selectedAgent.colorClass.bg} ${selectedAgent.colorClass.text} border ${selectedAgent.colorClass.border} shrink-0`}>
          {renderAgentIcon(selectedAgent.iconName, 'w-5 h-5')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white text-sm">{selectedAgent.name}</span>
            <span className="text-[11px] text-slate-400 font-mono">({selectedAgent.role})</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${selectedAgent.colorClass.bg} ${selectedAgent.colorClass.text} border ${selectedAgent.colorClass.border}`}>
              সক্রিয়
            </span>
          </div>
          <p className="text-slate-300 text-xs mt-1 leading-relaxed line-clamp-2">
            {selectedAgent.description}
          </p>
        </div>
      </div>
    </div>
  );
};
