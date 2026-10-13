import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Calculator, 
  MessageSquare, 
  ClipboardList, 
  Wrench,
  Sparkles
} from 'lucide-react';
import { Language } from '../utils/translations';
import { ImeiChecker } from './ImeiChecker';
import { CostEstimator } from './CostEstimator';
import { MessageGenerator } from './MessageGenerator';
import { TechnicianLogView } from './TechnicianLogView';

interface ProToolsHubProps {
  lang: Language;
  initialSubTab?: 'imei' | 'estimator' | 'messages' | 'logs';
}

export type ProToolSubTab = 'imei' | 'estimator' | 'messages' | 'logs';

export const ProToolsHub: React.FC<ProToolsHubProps> = ({ 
  lang, 
  initialSubTab = 'imei' 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<ProToolSubTab>(initialSubTab);

  const subTabs = [
    {
      id: 'imei' as ProToolSubTab,
      labelBn: 'IMEI ও চোরাই ফোন চেকার',
      labelEn: 'IMEI & Blacklist Check',
      shortBn: 'IMEI চেকার',
      shortEn: 'IMEI Check',
      icon: ShieldCheck,
      color: 'text-cyan-400',
      activeBg: 'bg-cyan-600/20 border-cyan-500 text-cyan-300',
    },
    {
      id: 'estimator' as ProToolSubTab,
      labelBn: 'সার্ভিস চার্জ ক্যালকুলেটর',
      labelEn: 'Repair Cost Estimator',
      shortBn: 'চার্জ ক্যালকুলেটর',
      shortEn: 'Cost Calculator',
      icon: Calculator,
      color: 'text-emerald-400',
      activeBg: 'bg-emerald-600/20 border-emerald-500 text-emerald-300',
    },
    {
      id: 'messages' as ProToolSubTab,
      labelBn: 'SMS ও WhatsApp টেমপ্লেট',
      labelEn: 'SMS & WhatsApp Generator',
      shortBn: 'মেসেজ টেমপ্লেট',
      shortEn: 'Messages',
      icon: MessageSquare,
      color: 'text-teal-400',
      activeBg: 'bg-teal-600/20 border-teal-500 text-teal-300',
    },
    {
      id: 'logs' as ProToolSubTab,
      labelBn: 'টেকনিশিয়ান অ্যাক্টিভিটি লগ',
      labelEn: 'Technician Work Log',
      shortBn: 'টেকনিশিয়ান লগ',
      shortEn: 'Tech Logs',
      icon: ClipboardList,
      color: 'text-indigo-400',
      activeBg: 'bg-indigo-600/20 border-indigo-500 text-indigo-300',
    },
  ];

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* সাব-ট্যাব ন্যাভিগেশন পিলস */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2 rounded-2xl shadow-lg sticky top-16 z-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 text-center ${
                  isActive
                    ? `${tab.activeBg} font-bold shadow-sm`
                    : 'bg-slate-950/60 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? tab.color : 'text-slate-500'}`} />
                <span className="truncate hidden sm:inline">
                  {lang === 'bn' ? tab.labelBn : tab.labelEn}
                </span>
                <span className="truncate sm:hidden">
                  {lang === 'bn' ? tab.shortBn : tab.shortEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* সাব-ট্যাব কন্টেন্ট */}
      <div>
        {activeSubTab === 'imei' && <ImeiChecker lang={lang} />}
        {activeSubTab === 'estimator' && <CostEstimator lang={lang} />}
        {activeSubTab === 'messages' && <MessageGenerator lang={lang} />}
        {activeSubTab === 'logs' && <TechnicianLogView lang={lang} />}
      </div>
    </div>
  );
};
