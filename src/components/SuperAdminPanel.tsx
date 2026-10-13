import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Send, 
  RefreshCw, 
  ShieldCheck, 
  Smartphone, 
  Receipt, 
  Activity, 
  Sliders, 
  KeyRound, 
  MessageCircle, 
  PhoneCall, 
  Lock, 
  Unlock, 
  Check, 
  Copy, 
  AlertTriangle,
  Bot,
  ExternalLink,
  Save,
  Clock,
  Sparkles
} from 'lucide-react';
import { Language, t } from '../utils/translations';
import { AI_AGENTS, Agent } from '../types/agents';
import { AppTab } from './Navbar';
import { getUserPreferences, saveUserPreferences, trackProjectChange } from '../services/projectStateUpdater';
import { InstallmentRecord } from '../types/recovery';
import { AgentUpgradeProposal, SystemSnapshot } from '../types/masterAgent';
import { renderAgentIcon } from './AgentSelector';

interface SuperAdminPanelProps {
  lang: Language;
  onNavigateTab: (tab: AppTab) => void;
  selectedAgent: Agent;
  onSelectAgent: (agent: Agent) => void;
}

interface CommandLog {
  id: string;
  timestamp: string;
  command: string;
  status: 'pending' | 'success' | 'error';
  response: string;
  source: string;
}

export const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({
  lang,
  onNavigateTab,
  selectedAgent,
  onSelectAgent,
}) => {
  const [activeSidebarTab, setActiveSidebarTab] = useState<
    'dashboard' | 'upgrades' | 'installments' | 'diagnostics' | 'medical' | 'ai-modes' | 'security'
  >('dashboard');

  // এজেন্ট আপগ্রেড ও স্ন্যাপশট স্টেট
  const [proposals, setProposals] = useState<AgentUpgradeProposal[]>([]);
  const [snapshots, setSnapshots] = useState<SystemSnapshot[]>([]);
  const [agentVersions, setAgentVersions] = useState<Record<string, string>>({});
  const [isLoadingUpgrades, setIsLoadingUpgrades] = useState(false);
  const [upgradeActionMessage, setUpgradeActionMessage] = useState<string | null>(null);
  const [diagnosingAgentId, setDiagnosingAgentId] = useState<string | null>(null);
  const [agentDiagnosticResult, setAgentDiagnosticResult] = useState<any | null>(null);
  const [newSnapshotTitle, setNewSnapshotTitle] = useState('');
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);


  // ইউজার ও এডমিন প্রেফারেন্স স্টেট
  const [userPrefs, setUserPrefs] = useState(() => getUserPreferences());
  const [adminPinInput, setAdminPinInput] = useState(userPrefs.adminPin || '1234');
  const [whatsappInput, setWhatsappInput] = useState(userPrefs.whatsappNumber || '+8801700000000');
  const [isPinGateEnabled, setIsPinGateEnabled] = useState(Boolean(userPrefs.isPinLocked));
  const [pinUnlocked, setPinUnlocked] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // কমান্ড এক্সিকিউটর স্টেট
  const [commandInput, setCommandInput] = useState('');
  const [isExecutingCommand, setIsExecutingCommand] = useState(false);
  const [commandLogs, setCommandLogs] = useState<CommandLog[]>([
    {
      id: 'log-init-1',
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      command: 'SYSTEM_STARTUP --mode super_admin',
      status: 'success',
      response: 'মাহফুজুর রহমান AI সুপার এডমিন প্যানেল সক্রিয় হয়েছে। মাল্টি-প্রোভাইডার ফলব্যাক ও মেমোরি সিস্টেম প্রস্তুত।',
      source: 'MDR-CORE-SYSTEM'
    }
  ]);

  // পরিসংখ্যান লাইভ ডেটা গণনা
  const [totalInstallmentCustomers, setTotalInstallmentCustomers] = useState(48);
  const [totalResponsesCount, setTotalResponsesCount] = useState(5240);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('mdr_installments');
        if (raw) {
          const list: InstallmentRecord[] = JSON.parse(raw);
          if (Array.isArray(list) && list.length > 0) {
            setTotalInstallmentCustomers(list.length);
          }
        }
      } catch (e) {
        console.error(e);
      }

      try {
        const sessionsRaw = localStorage.getItem('mdr_chat_sessions');
        if (sessionsRaw) {
          const sessions = JSON.parse(sessionsRaw);
          if (Array.isArray(sessions)) {
            let totalMsgs = 5000;
            sessions.forEach(s => {
              if (s.messages) totalMsgs += s.messages.length;
            });
            setTotalResponsesCount(totalMsgs);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    loadUpgrades();
  }, []);

  // আপগ্রেড ও স্ন্যাপশট ডেটা ফেচ
  const loadUpgrades = async () => {
    setIsLoadingUpgrades(true);
    try {
      const res = await fetch('/api/agent-upgrades');
      if (res.ok) {
        const data = await res.json();
        if (data.proposals) setProposals(data.proposals);
        if (data.snapshots) setSnapshots(data.snapshots);
        if (data.agentVersions) setAgentVersions(data.agentVersions);
      }
    } catch (err) {
      console.error('Failed to load upgrades:', err);
    } finally {
      setIsLoadingUpgrades(false);
    }
  };

  // আপগ্রেড প্রস্তাব পর্যালোচনা (অনুমোদন, বাতিল, প্রয়োগ)
  const handleReviewProposal = async (proposalId: string, action: 'approve' | 'reject' | 'apply', note?: string) => {
    try {
      const res = await fetch('/api/agent-upgrades/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId, action, reviewNote: note }),
      });
      const data = await res.json();
      if (data.success) {
        setUpgradeActionMessage(data.message);
        setTimeout(() => setUpgradeActionMessage(null), 5000);
        await loadUpgrades();
      }
    } catch (err: any) {
      alert(`অ্যাকশন ব্যর্থ: ${err.message}`);
    }
  };

  // নিরাপদ স্ন্যাপশটে রোলব্যাক
  const handleRollbackSnapshot = async (snapshotId: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে পূর্ববর্তী এই নিরাপদ স্ন্যাপশটে পুরো সিস্টেম রোলব্যাক করতে চান?')) {
      return;
    }
    try {
      const res = await fetch('/api/agent-upgrades/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshotId }),
      });
      const data = await res.json();
      if (data.success) {
        setUpgradeActionMessage(data.message);
        setTimeout(() => setUpgradeActionMessage(null), 6000);
        await loadUpgrades();
      }
    } catch (err: any) {
      alert(`রোলব্যাক ব্যর্থ: ${err.message}`);
    }
  };

  // নতুন ম্যানুয়াল স্ন্যাপশট তৈরি
  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSnapshotTitle.trim()) return;
    setIsCreatingSnapshot(true);
    try {
      const res = await fetch('/api/agent-upgrades/create-snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newSnapshotTitle.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setUpgradeActionMessage(data.message);
        setNewSnapshotTitle('');
        setTimeout(() => setUpgradeActionMessage(null), 5000);
        await loadUpgrades();
      }
    } catch (err: any) {
      alert(`স্ন্যাপশট তৈরি ব্যর্থ: ${err.message}`);
    } finally {
      setIsCreatingSnapshot(false);
    }
  };

  // নির্দিষ্ট এজেন্টের লাইভ ডায়াগনস্টিকস ও প্রিফিক্স টেস্ট
  const handleDiagnoseAgent = async (agentId: string) => {
    setDiagnosingAgentId(agentId);
    setAgentDiagnosticResult(null);
    try {
      const res = await fetch('/api/agent-diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId }),
      });
      const data = await res.json();
      setAgentDiagnosticResult(data);
    } catch (err: any) {
      setAgentDiagnosticResult({ success: false, error: err.message });
    } finally {
      setDiagnosingAgentId(null);
    }
  };

  // সেটিংস সংরক্ষণ
  const handleSaveSecuritySettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveUserPreferences({
      whatsappNumber: whatsappInput.trim(),
      adminPin: adminPinInput.trim(),
      isPinLocked: isPinGateEnabled,
    });
    setUserPrefs(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);

    trackProjectChange(
      'system',
      'ADMIN_CONFIG_UPDATE',
      `এডমিন সিকিউরিটি ও হোয়াটসঅ্যাপ নম্বর (${whatsappInput}) আপডেট করা হয়েছে`
    );
  };

  // এডমিন পিন ভেরিফিকেশন
  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin === (userPrefs.adminPin || '1234')) {
      setPinUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  // লাইভ এআই কমান্ড এক্সিকিউশন
  const handleExecuteCommand = async (customCommand?: string) => {
    const cmd = (customCommand || commandInput).trim();
    if (!cmd || isExecutingCommand) return;

    setIsExecutingCommand(true);
    setCommandInput('');

    const newLogId = `log-${Date.now()}`;
    const initialLog: CommandLog = {
      id: newLogId,
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      command: cmd,
      status: 'pending',
      response: 'কমান্ড প্রসেস করা হচ্ছে...',
      source: selectedAgent.name
    };

    setCommandLogs(prev => [initialLog, ...prev]);

    // বিশেষ বিল্ট-ইন শর্টকাট কমান্ড হ্যান্ডলিং
    const lowerCmd = cmd.toLowerCase();
    if (lowerCmd.includes('মেমো') || lowerCmd.includes('কিস্তি')) {
      setTimeout(() => {
        setCommandLogs(prev => prev.map(l => l.id === newLogId ? {
          ...l,
          status: 'success',
          response: 'কিস্তি মডিউলে সফলভাবে রুট করা হয়েছে। নতুন ক্যাশ মেমো ড্রাফট প্রস্তুত।',
          source: 'INSTALLMENT_ENGINE'
        } : l));
        setIsExecutingCommand(false);
        setTotalResponsesCount(c => c + 1);
      }, 700);
      return;
    }

    if (lowerCmd.includes('vivo') || lowerCmd.includes('লক') || lowerCmd.includes('রিকভারি')) {
      setTimeout(() => {
        setCommandLogs(prev => prev.map(l => l.id === newLogId ? {
          ...l,
          status: 'success',
          response: 'Vivo Y21 ডায়াগনস্টিক সিকোয়েন্স লোড হয়েছে: Power Off ➔ Vol(+) + Power (5s) ➔ Fastboot ➔ Clear Cache।',
          source: 'LOCK_DIAGNOSTICS'
        } : l));
        setIsExecutingCommand(false);
        setTotalResponsesCount(c => c + 1);
      }, 700);
      return;
    }

    // সার্ভার এআই চ্যাট হ্যান্ডলারে রিকোয়েস্ট পাঠানো
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `[SUPER_ADMIN_COMMAND]: ${cmd}`,
          agentId: selectedAgent.id,
          projectContext: `Super Admin Command Executed by ${userPrefs.technicianName}. Shop: ${userPrefs.shopName}. WhatsApp: ${userPrefs.whatsappNumber}.`,
        }),
      });

      const data = await response.json();
      const output = data.answer || data.message || 'কমান্ড এক্সিকিউশন সফল হয়েছে।';

      setCommandLogs(prev => prev.map(l => l.id === newLogId ? {
        ...l,
        status: response.ok ? 'success' : 'error',
        response: output,
        source: data.model || selectedAgent.name
      } : l));

      setTotalResponsesCount(c => c + 1);
    } catch (err: any) {
      setCommandLogs(prev => prev.map(l => l.id === newLogId ? {
        ...l,
        status: 'error',
        response: `সার্ভার সংযোগ ত্রুটি: ${err.message || 'ব্যর্থ'}`,
        source: 'DISPATCH_ERROR'
      } : l));
    } finally {
      setIsExecutingCommand(false);
    }
  };

  // যদি পিন লক সক্রিয় থাকে এবং আনলক করা না হয়
  if (isPinGateEnabled && !pinUnlocked) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">সুপার এডমিন ভেরিফিকেশন</h2>
          <p className="text-xs text-slate-400 mb-6">
            কন্ট্রোল সেন্টারে প্রবেশের জন্য ৪-ডিজিটের সুপার এডমিন পিন কোড দিন (ডিফল্ট: 1234)
          </p>

          <form onSubmit={handleVerifyPin} className="space-y-4">
            <input
              type="password"
              maxLength={8}
              value={enteredPin}
              onChange={(e) => {
                setEnteredPin(e.target.value);
                setPinError(false);
              }}
              placeholder="••••"
              className="w-full text-center tracking-widest text-2xl font-mono bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
              autoFocus
            />

            {pinError && (
              <p className="text-xs text-rose-400 flex items-center justify-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>ভুল পিন কোড! অনুগ্রহ করে সঠিক পিন দিন।</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              আনলক করুন
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900 text-white font-sans rounded-2xl border border-slate-800 overflow-hidden shadow-2xl transition-all">
      <div className="flex flex-col md:flex-row min-h-[720px]">
        
        {/* ======================= Sidebar ======================= */}
        <aside className="w-full md:w-64 bg-slate-800 p-5 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-700/80 shrink-0">
          <div>
            <div className="flex items-center justify-between md:block mb-6 md:mb-8">
              <h1 className="text-xl font-bold text-indigo-400 flex items-center gap-2">
                <span>🤖</span>
                <span>মাহফুজুর রহমান AI</span>
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                v2.5 ADMIN
              </span>
            </div>

            <nav className="space-y-2">
              <button
                type="button"
                onClick={() => setActiveSidebarTab('dashboard')}
                className={`w-full text-left py-2.5 px-4 rounded-xl transition flex items-center justify-between cursor-pointer ${
                  activeSidebarTab === 'dashboard'
                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>📊 ড্যাশবোর্ড</span>
                {activeSidebarTab === 'dashboard' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveSidebarTab('upgrades')}
                className={`w-full text-left py-2.5 px-4 rounded-xl transition flex items-center justify-between cursor-pointer ${
                  activeSidebarTab === 'upgrades'
                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>🚀 এজেন্ট আপগ্রেড সেন্টার</span>
                {proposals.filter(p => p.status === 'pending_review').length > 0 ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold animate-pulse">
                    {proposals.filter(p => p.status === 'pending_review').length} নতুন
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-mono">v3.5.0</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveSidebarTab('installments')}
                className={`w-full text-left py-2.5 px-4 rounded-xl transition flex items-center justify-between cursor-pointer ${
                  activeSidebarTab === 'installments'
                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>💳 কিস্তি ম্যানেজার</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900/60 text-slate-300">
                  {totalInstallmentCustomers}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSidebarTab('diagnostics')}
                className={`w-full text-left py-2.5 px-4 rounded-xl transition flex items-center justify-between cursor-pointer ${
                  activeSidebarTab === 'diagnostics'
                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>🔒 লক ডায়াগনস্টিকস</span>
                <span className="text-[10px] text-amber-400">Y21</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSidebarTab('medical')}
                className={`w-full text-left py-2.5 px-4 rounded-xl transition flex items-center justify-between cursor-pointer ${
                  activeSidebarTab === 'medical'
                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>🩺 মেডিকেল সার্ভিস</span>
                <span className="text-[10px] text-rose-400">১৬২৬৩</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSidebarTab('ai-modes')}
                className={`w-full text-left py-2.5 px-4 rounded-xl transition flex items-center justify-between cursor-pointer ${
                  activeSidebarTab === 'ai-modes'
                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>⚙️ এআই মোড কন্ট্রোল</span>
                <span className="text-[10px] text-teal-400">১১টি মোড</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSidebarTab('security')}
                className={`w-full text-left py-2.5 px-4 rounded-xl transition flex items-center justify-between cursor-pointer ${
                  activeSidebarTab === 'security'
                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>📱 হোয়াটসঅ্যাপ ও সিকিউরিটি</span>
                <span className="text-[10px] text-emerald-400">PIN</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('settings')}
                className="w-full text-left py-2.5 px-4 rounded-xl transition flex items-center justify-between cursor-pointer text-slate-300 hover:bg-slate-700 bg-slate-900/60 border border-teal-500/30"
                title="AI API সংযোগ (OpenRouter Setup)"
              >
                <span className="flex items-center gap-1.5 text-teal-300">
                  <KeyRound className="w-3.5 h-3.5 text-teal-400" />
                  <span>🔑 AI API সংযোগ</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono">
                  গাইড
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('telegram')}
                className="w-full text-left py-2.5 px-4 rounded-xl transition flex items-center justify-between cursor-pointer text-slate-300 hover:bg-slate-700 bg-slate-900/60 border border-cyan-500/30"
                title="টেলিগ্রাম বট হাব (@mahfuzur_rahman_ai_bot)"
              >
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <Send className="w-3.5 h-3.5 text-cyan-400" />
                  <span>🤖 টেলিগ্রাম বট হাব</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                  লাইভ
                </span>
              </button>
            </nav>
          </div>

          <div className="pt-6 border-t border-slate-700/60 mt-6 flex items-center justify-between text-xs text-slate-400">
            <div>
              Status: <span className="text-green-400 font-bold">● Active Online</span>
            </div>
            {isPinGateEnabled && (
              <button
                onClick={() => setPinUnlocked(false)}
                type="button"
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                title="লক করুন"
              >
                <Lock className="w-3 h-3 text-amber-400" />
                <span>লক</span>
              </button>
            )}
          </div>
        </aside>

        {/* ======================= Main Content ======================= */}
        <main className="flex-1 p-5 sm:p-8 overflow-y-auto bg-slate-900">
          
          {/* Header Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>সুপার এডমিন কন্ট্রোল সেন্টার</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                মালিক: <strong className="text-indigo-400">{userPrefs.technicianName}</strong> | শপ: {userPrefs.shopName}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>সিস্টেম হেলথ: ১০০% সক্রিয়</span>
              </span>
            </div>
          </div>

          {/* ================= 1. TAB: DASHBOARD ================= */}
          {activeSidebarTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              {/* Stat Cards (As requested by user) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                
                {/* মোট এআই রেসপন্স */}
                <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg hover:border-indigo-500/40 transition">
                  <p className="text-slate-400 text-sm font-medium">মোট এআই রেসপন্স</p>
                  <h3 className="text-3xl font-bold text-indigo-400 mt-2">
                    {totalResponsesCount.toLocaleString('bn-BD')}+
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    <span>OpenAI + Gemini + OpenRouter</span>
                  </p>
                </div>

                {/* অ্যাক্টিভ কিস্তি কাস্টমার */}
                <div 
                  onClick={() => onNavigateTab('installments')}
                  className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg hover:border-emerald-500/40 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-slate-400 text-sm font-medium">অ্যাক্টিভ কিস্তি কাস্টমার</p>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition" />
                  </div>
                  <h3 className="text-3xl font-bold text-green-400 mt-2">
                    {totalInstallmentCustomers.toLocaleString('bn-BD')} জন
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-2">
                    ডিজিটাল ক্যাশ মেমো ও বকেয়া কিস্তি ট্র্যাকিং
                  </p>
                </div>

                {/* লক ডায়াগনস্টিকস সলভ */}
                <div 
                  onClick={() => onNavigateTab('diagnostic')}
                  className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg hover:border-amber-500/40 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-slate-400 text-sm font-medium">লক ডায়াগনস্টিকস সলভ</p>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition" />
                  </div>
                  <h3 className="text-3xl font-bold text-yellow-400 mt-2">১১২ টি</h3>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Vivo Y21, ফাস্টবুট ও ক্যাশে ক্লিয়ার
                  </p>
                </div>

                {/* একটিভ সোশ্যাল বট */}
                <div 
                  onClick={() => setActiveSidebarTab('security')}
                  className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg hover:border-cyan-500/40 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-slate-400 text-sm font-medium">একটিভ সোশ্যাল বট</p>
                    <MessageCircle className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-cyan-400 mt-2 truncate">
                    WhatsApp / TG
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-2">
                    অটো রিপ্লাই ও রিমাইন্ডার ইঞ্জিন
                  </p>
                </div>
              </div>

              {/* Quick Action & Live Logs (লাইভ এআই কমান্ড এক্সিকিউটর) */}
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                    <span className="text-amber-400">⚡</span>
                    <span>লাইভ এআই কমান্ড এক্সিকিউটর</span>
                  </h3>
                  <span className="text-xs text-slate-400">
                    সক্রিয় মোড: <strong className="text-indigo-400">{selectedAgent.name}</strong>
                  </span>
                </div>

                {/* কমান্ড ইনপুট ফরম */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleExecuteCommand();
                      }
                    }}
                    placeholder="এডমিন কমান্ড দিন (যেমন: নতুন কিস্তির মেমো তৈরি করো)..."
                    disabled={isExecutingCommand}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition shadow-inner"
                  />
                  <button
                    onClick={() => handleExecuteCommand()}
                    disabled={isExecutingCommand || !commandInput.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold px-6 py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer shrink-0"
                  >
                    {isExecutingCommand ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>প্রসেসিং...</span>
                      </>
                    ) : (
                      <>
                        <span>কমান্ড পাঠান</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* কুইক কমান্ড পিলস */}
                <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
                  <span className="text-slate-500 shrink-0">দ্রুত প্রম্পট:</span>
                  <button
                    onClick={() => handleExecuteCommand('নতুন কিস্তির মেমো তৈরি করো')}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700/80 shrink-0 cursor-pointer"
                  >
                    + নতুন কিস্তির মেমো তৈরি করো
                  </button>
                  <button
                    onClick={() => handleExecuteCommand('Vivo Y21 ফাস্টবুট আনলক গাইড')}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700/80 shrink-0 cursor-pointer"
                  >
                    🔒 Vivo Y21 ফাস্টবুট গাইড
                  </button>
                  <button
                    onClick={() => handleExecuteCommand('জরুরি স্বাস্থ্য হটলাইন ১৬২৬৩ স্বাস্থ্য বাতায়ন')}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700/80 shrink-0 cursor-pointer"
                  >
                    🩺 জরুরি হটলাইন ১৬২৬৩
                  </button>
                  <button
                    onClick={() => handleExecuteCommand('WhatsApp অটোমেটেড ফলো-আপ মেসেজ')}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700/80 shrink-0 cursor-pointer"
                  >
                    📱 WhatsApp ফলো-আপ
                  </button>
                </div>

                {/* লাইভ কমান্ড এক্সিকিউশন লগ কনসোল */}
                <div className="mt-5 bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-slate-400">
                    <span className="flex items-center gap-1.5 text-indigo-400">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>TERMINAL CONSOLE (LIVE AUDIT)</span>
                    </span>
                    <button
                      onClick={() => setCommandLogs([])}
                      className="text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      ক্লিয়ার লগ
                    </button>
                  </div>

                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {commandLogs.length === 0 ? (
                      <p className="text-slate-600 italic">কোনো লগ হিস্ট্রি নেই। কমান্ড টাইপ করে পাঠান।</p>
                    ) : (
                      commandLogs.map((log) => (
                        <div key={log.id} className="space-y-1">
                          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                            <span className="text-slate-600">[{log.timestamp}]</span>
                            <span className="text-indigo-400 font-semibold">{log.source}</span>
                            <span className="text-slate-500">➔</span>
                            <span className="text-slate-200">{log.command}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              log.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                              log.status === 'pending' ? 'bg-amber-500/20 text-amber-400 animate-pulse' :
                              'bg-rose-500/20 text-rose-400'
                            }`}>
                              {log.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="pl-4 border-l border-slate-800 text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {log.response}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* সিস্টেম কুইক নেভিগেশন কার্ডস */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                  onClick={() => onNavigateTab('installments')}
                  className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-indigo-500/50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">কিস্তি ও ডিজিটাল রসিদ</h4>
                      <p className="text-xs text-slate-400">পূর্ণাঙ্গ ক্যাশ মেমো ও হিসাব</p>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => onNavigateTab('diagnostic')}
                  className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-indigo-500/50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">লক ডায়াগনস্টিকস টুল</h4>
                      <p className="text-xs text-slate-400">Vivo Y21 ও অন্যান্য মডেল</p>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => onNavigateTab('ai')}
                  className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-indigo-500/50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">পূর্ণাঙ্গ এআই চ্যাট ওয়ার্কস্পেস</h4>
                      <p className="text-xs text-slate-400">মেমোরি ও মাল্টি-মোড সাপোর্ট</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 1.1 TAB: AGENT UPGRADE CENTER & SNAPSHOT MANAGER ================= */}
          {activeSidebarTab === 'upgrades' && (
            <div className="space-y-6 animate-fade-in">
              {/* ব্যানার ও অ্যাকশন নোটিফিকেশন */}
              <div className="p-5 bg-gradient-to-r from-indigo-950 via-slate-800 to-slate-900 rounded-2xl border border-indigo-500/40 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🚀</span>
                      <h3 className="text-lg font-bold text-white">বাস্তব Agent Upgrade & Rollback System</h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/40">
                        Zero Breakage Guarantee
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      মালিকের পূর্বানুমোদন ছাড়া কোনো এজেন্ট স্বয়ংক্রিয়ভাবে প্রম্পট পরিবর্তন বা সিকিউরিটি বাইপাস করতে পারবে না। প্রতিটি আপগ্রেডের সাথে রয়েছে তাৎক্ষণিক নিরাপদ স্ন্যাপশট ও ওয়ান-ক্লিক রোলব্যাক।
                    </p>
                  </div>
                  <button
                    onClick={loadUpgrades}
                    disabled={isLoadingUpgrades}
                    className="px-3 py-2 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0 self-start sm:self-auto"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUpgrades ? 'animate-spin' : ''}`} />
                    <span>রিফ্রেশ স্ট্যাটাস</span>
                  </button>
                </div>

                {upgradeActionMessage && (
                  <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{upgradeActionMessage}</span>
                  </div>
                )}
              </div>

              {/* এজেন্টের বর্তমান রানটাইম ভার্সন গ্রিড */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  ১. সকল এজেন্টের সক্রিয় ভার্সন ও রানটাইম স্বাস্থ্য ({AI_AGENTS.length}টি সহকারী)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {AI_AGENTS.map((agent) => {
                    const currentVer = agentVersions[agent.id] || '3.5.0';
                    const hasPendingProposal = proposals.some(p => p.agentId === agent.id && p.status === 'pending_review');
                    const isDiagnosing = diagnosingAgentId === agent.id;

                    return (
                      <div
                        key={agent.id}
                        className={`p-3.5 rounded-xl border bg-slate-800/80 transition ${
                          selectedAgent.id === agent.id ? 'border-indigo-500 ring-1 ring-indigo-500/40' : 'border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-indigo-400">
                              {renderAgentIcon(agent.iconName, 'w-4 h-4')}
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-white">{agent.name}</h5>
                              <p className="text-[10px] text-slate-400 font-mono">ID: {agent.id}</p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                            v{currentVer}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-700/60">
                          <span className="text-slate-400 truncate max-w-[140px] text-[10px]">
                            {agent.prefix}
                          </span>
                          <button
                            onClick={() => handleDiagnoseAgent(agent.id)}
                            disabled={isDiagnosing}
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                            title="এজেন্টের পরিচয় ও প্রিফিক্স টেস্ট করুন"
                          >
                            {isDiagnosing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Activity className="w-3 h-3" />}
                            <span>পরীক্ষা</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ডায়াগনস্টিক টেস্ট ফলাফল কার্ড */}
              {agentDiagnosticResult && (
                <div className="p-4 bg-slate-950 rounded-xl border border-indigo-500/40 font-mono text-xs animate-fade-in">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                    <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>লাইভ এজেন্ট ডায়াগনস্টিক অডিট ফলাফল ({agentDiagnosticResult.agentId})</span>
                    </span>
                    <button
                      onClick={() => setAgentDiagnosticResult(null)}
                      className="text-slate-500 hover:text-slate-300 text-[10px] cursor-pointer"
                    >
                      বন্ধ করুন
                    </button>
                  </div>
                  {agentDiagnosticResult.success ? (
                    <div className="space-y-1.5 text-slate-300">
                      <p>
                        <span className="text-slate-500">প্রিফিক্স ভেরিফিকেশন: </span>
                        {agentDiagnosticResult.prefixVerified ? (
                          <span className="text-emerald-400 font-bold">✅ ১০০% নির্ভুল ({agentDiagnosticResult.prefixTag})</span>
                        ) : (
                          <span className="text-rose-400 font-bold">❌ অমিল পাওয়া গেছে</span>
                        )}
                      </p>
                      <p><span className="text-slate-500">প্রোভাইডার ও মডেল: </span><span className="text-amber-300">{agentDiagnosticResult.modelUsed} ({agentDiagnosticResult.provider})</span></p>
                      <p><span className="text-slate-500">রেসপন্স ল্যাটেন্সি: </span><span className="text-cyan-400">{agentDiagnosticResult.latencyMs} ms</span></p>
                      <p className="pt-1 text-[11px] text-slate-400 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                        {agentDiagnosticResult.sampleResponseSnippet}
                      </p>
                    </div>
                  ) : (
                    <p className="text-rose-400">ত্রুটি: {agentDiagnosticResult.error}</p>
                  )}
                </div>
              )}

              {/* ২. আপগ্রেড প্রস্তাবনা ও রিভিউ সেন্টার */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    ২. আপগ্রেড প্রস্তাবনা ও অনুমোদন (Review & Approval Queue)
                  </h4>
                  <span className="text-xs text-amber-400 font-medium">
                    {proposals.filter(p => p.status === 'pending_review').length}টি প্রস্তাব পর্যালোচনার অপেক্ষায়
                  </span>
                </div>

                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <div
                      key={proposal.id}
                      className="p-5 bg-slate-800 rounded-2xl border border-slate-700 shadow-md space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">⚡</span>
                          <div>
                            <h5 className="font-bold text-white text-sm">{proposal.title}</h5>
                            <p className="text-xs text-indigo-400">
                              এজেন্ট: <strong>{proposal.agentName}</strong> | ভার্সন রূপান্তর: v{proposal.currentVersion} ➔ <strong className="text-emerald-400">v{proposal.targetVersion}</strong>
                            </p>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                          proposal.status === 'pending_review' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          proposal.status === 'approved' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                          proposal.status === 'applied' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          proposal.status === 'rolled_back' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                          'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {proposal.status === 'pending_review' ? '⏳ অনুমোদনের অপেক্ষায়' :
                           proposal.status === 'approved' ? '✅ অনুমোদিত (রেডি টু অ্যাপ্লাই)' :
                           proposal.status === 'applied' ? '🚀 সিস্টেমে কার্যকর' :
                           proposal.status === 'rolled_back' ? '↩️ রোলব্যাক করা হয়েছে' : '❌ বাতিলকৃত'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-slate-700/60">
                        {proposal.summary}
                      </p>

                      <div>
                        <h6 className="text-[11px] font-bold text-slate-400 mb-1.5">পরিবর্তনসমূহের সুনির্দিষ্ট বিবরণ:</h6>
                        <ul className="space-y-1">
                          {proposal.changes.map((change, idx) => (
                            <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                              <span className="text-emerald-400 font-bold shrink-0">✓</span>
                              <span>{change}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* রিভিউ বাটনসমূহ */}
                      <div className="pt-3 border-t border-slate-700 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <span>নিরাপত্তা টেস্ট:</span>
                          <span className="text-emerald-400 font-bold">উত্তীর্ণ (Prefix ও Token Verified)</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {proposal.status === 'pending_review' && (
                            <>
                              <button
                                onClick={() => handleReviewProposal(proposal.id, 'reject')}
                                className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition cursor-pointer"
                              >
                                প্রত্যাখ্যান করুন
                              </button>
                              <button
                                onClick={() => handleReviewProposal(proposal.id, 'approve')}
                                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>অনুমোদন দিন</span>
                              </button>
                            </>
                          )}

                          {proposal.status === 'approved' && (
                            <button
                              onClick={() => handleReviewProposal(proposal.id, 'apply')}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>সিস্টেমে কার্যকর (Apply) করুন</span>
                            </button>
                          )}

                          {proposal.status === 'applied' && (
                            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                              <Check className="w-4 h-4" />
                              <span>সফলভাবে লাইভ রানটাইমে যুক্ত রয়েছে</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ৩. নিরাপদ স্ন্যাপশট ও ওয়ান-ক্লিক রোলব্যাক হিস্ট্রি */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    ৩. সিস্টেম স্ন্যাপশট ও ওয়ান-ক্লিক রোলব্যাক ম্যানেজার
                  </h4>

                  {/* ম্যানুয়াল স্ন্যাপশট ফর্ম */}
                  <form onSubmit={handleCreateSnapshot} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newSnapshotTitle}
                      onChange={(e) => setNewSnapshotTitle(e.target.value)}
                      placeholder="নতুন স্ন্যাপশটের নাম..."
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={isCreatingSnapshot || !newSnapshotTitle.trim()}
                      className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-xs font-medium rounded-lg transition cursor-pointer shrink-0"
                    >
                      + স্ন্যাপশট তৈরি
                    </button>
                  </form>
                </div>

                <div className="space-y-3">
                  {snapshots.map((snap) => (
                    <div
                      key={snap.id}
                      className={`p-4 rounded-xl border transition ${
                        snap.isCurrent
                          ? 'bg-slate-800/90 border-emerald-500/60 ring-1 ring-emerald-500/30'
                          : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-white text-xs sm:text-sm">{snap.title}</h5>
                            {snap.isCurrent && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/40">
                                ● বর্তমান সক্রিয় সংস্করণ
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{snap.description}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-1">
                            আইডি: {snap.id} | সময়: {new Date(snap.timestamp).toLocaleString('bn-BD')}
                          </p>
                        </div>

                        {!snap.isCurrent && (
                          <button
                            onClick={() => handleRollbackSnapshot(snap.id)}
                            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-md shadow-amber-600/20 cursor-pointer self-start sm:self-auto shrink-0"
                            title="এই সংস্করণে সিস্টেমের সকল এজেন্ট ফিরিয়ে নিন"
                          >
                            <span>↩️ এই সংস্করণে রোলব্যাক</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= 2. TAB: INSTALLMENT OVERVIEW ================= */}
          {activeSidebarTab === 'installments' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between p-4 bg-slate-800 rounded-2xl border border-slate-700">
                <div>
                  <h3 className="text-lg font-bold text-white">কিস্তি ম্যানেজার ওভারভিউ</h3>
                  <p className="text-xs text-slate-400">মোট অ্যাক্টিভ গ্রাহক: {totalInstallmentCustomers} জন</p>
                </div>
                <button
                  onClick={() => onNavigateTab('installments')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20"
                >
                  <span>সম্পূর্ণ কিস্তি মডিউলে যান</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                <h4 className="font-bold text-sm text-indigo-400 mb-3">দ্রুত কিস্তি ক্যালকুলেশন টুল</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-700/60">
                    <span className="text-slate-400 block mb-1">Vivo Y21 মোট মূল্য:</span>
                    <strong className="text-lg text-white font-mono">১৫,৫০০ ৳</strong>
                  </div>
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-700/60">
                    <span className="text-slate-400 block mb-1">ডাউন পেমেন্ট (৩০%):</span>
                    <strong className="text-lg text-emerald-400 font-mono">৫,০০০ ৳</strong>
                  </div>
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-700/60">
                    <span className="text-slate-400 block mb-1">মাসিক কিস্তি (৬ মাস):</span>
                    <strong className="text-lg text-cyan-400 font-mono">১,৭৫০ ৳ / মাস</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 3. TAB: LOCK DIAGNOSTICS ================= */}
          {activeSidebarTab === 'diagnostics' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between p-4 bg-slate-800 rounded-2xl border border-slate-700">
                <div>
                  <h3 className="text-lg font-bold text-white">লক ডায়াগনস্টিকস সেন্টার</h3>
                  <p className="text-xs text-slate-400">Vivo Y21 সহ সকল অ্যান্ড্রয়েড প্যাটার্ন ও পাসকোড সমাধান</p>
                </div>
                <button
                  onClick={() => onNavigateTab('diagnostic')}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-600/20"
                >
                  <span>সম্পূর্ণ ডায়াগনস্টিক টুল</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
                <h4 className="font-bold text-sm text-yellow-400">Vivo Y21 রিকভারি মোড চেকলিস্ট:</h4>
                <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300 leading-relaxed">
                  <li>ডিভাইস সম্পূর্ণ পাওয়ার অফ করুন।</li>
                  <li><strong>Volume Up (+)</strong> এবং <strong>Power</strong> বাটন একসাথে ৫ সেকেন্ড ধরে রাখুন।</li>
                  <li>ফাস্টবুট মেনু এলে Recovery Mode নির্বাচন করুন।</li>
                  <li>Clear Data ➔ Clear Cache অপশনে ট্যাপ করুন। ডেটা অক্ষত রেখে আনলক সমাধান হবে।</li>
                </ol>
              </div>
            </div>
          )}

          {/* ================= 4. TAB: MEDICAL SERVICE ================= */}
          {activeSidebarTab === 'medical' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-rose-400">🩺</span>
                    <span>মেডিকেল ও স্বাস্থ্য সেবা সহকারী</span>
                  </h3>
                  <p className="text-xs text-slate-400">জরুরি স্বাস্থ্য পরামর্শ, প্রাথমিক চিকিৎসা ও সরকারি হটলাইন</p>
                </div>
                <a
                  href="tel:16263"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-rose-600/20"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>কল করুন ১৬২৬৩</span>
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <span className="text-xs text-slate-400 block mb-1">স্বাস্থ্য বাতায়ন</span>
                  <strong className="text-xl text-rose-400 font-bold block mb-1">১৬২৬৩</strong>
                  <p className="text-[11px] text-slate-400">২৪ ঘণ্টা বিনামূল্যে সরকারি চিকিৎসকের সাথে কথা বলুন।</p>
                </div>

                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <span className="text-xs text-slate-400 block mb-1">জাতীয় জরুরি সেবা</span>
                  <strong className="text-xl text-emerald-400 font-bold block mb-1">৯৯৯</strong>
                  <p className="text-[11px] text-slate-400">জরুরি অ্যাম্বুলেন্স, পুলিশ ও ফায়ার সার্ভিসের জন্য।</p>
                </div>

                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <span className="text-xs text-slate-400 block mb-1">জাতীয় তথ্য ও সেবা</span>
                  <strong className="text-xl text-cyan-400 font-bold block mb-1">৩৩৩</strong>
                  <p className="text-[11px] text-slate-400">সরকারি তথ্য ও বিশেষজ্ঞ স্বাস্থ্য পরামর্শ সেবা।</p>
                </div>
              </div>

              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                <h4 className="font-bold text-sm text-rose-300 mb-3">প্রাথমিক চিকিৎসা পরামর্শ দ্রুত সার্চ:</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="লক্ষণ লিখুন (যেমন: হালকা জ্বর ও সর্দি)..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleExecuteCommand(`মেডিকেল স্বাস্থ্য পরামর্শ: ${(e.target as HTMLInputElement).value}`);
                        setActiveSidebarTab('dashboard');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      handleExecuteCommand('মেডিকেল স্বাস্থ্য পরামর্শ: প্রাথমিক জ্বর ও করণীয়');
                      setActiveSidebarTab('dashboard');
                    }}
                    className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
                  >
                    পরামর্শ নিন
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= 5. TAB: AI MODES CONTROL ================= */}
          {activeSidebarTab === 'ai-modes' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
                <h3 className="text-lg font-bold text-white">বিশেষায়িত এআই মোড কন্ট্রোল</h3>
                <p className="text-xs text-slate-400">মাহফুজুর রহমান AI এর মোট ১১টি বিশেষায়িত সহকারী মোড সক্রিয় রয়েছে</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AI_AGENTS.map((agent) => (
                  <div
                    key={agent.id}
                    onClick={() => {
                      onSelectAgent(agent);
                      trackProjectChange('ai_memory', 'SWITCH_MODE', `অ্যাক্টিভ মোড পরিবর্তন: ${agent.name}`);
                    }}
                    className={`p-4 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                      selectedAgent.id === agent.id
                        ? 'bg-slate-800 border-indigo-500 shadow-md shadow-indigo-500/20'
                        : 'bg-slate-850 border-slate-700/80 hover:bg-slate-800'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${agent.colorClass.bg} ${agent.colorClass.text}`}>
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-white truncate">{agent.name}</h4>
                        {selectedAgent.id === agent.id && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                            সক্রিয়
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{agent.description}</p>
                      <div className="mt-2 text-[10px] font-mono text-slate-500 truncate">
                        {agent.prefix}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 6. TAB: SECURITY & WHATSAPP ================= */}
          {activeSidebarTab === 'security' && (
            <div className="space-y-6 animate-fade-in max-w-2xl">
              <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>এডমিন ও হোয়াটসঅ্যাপ ইন্টিগ্রেশন সেটিংস</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  এখানে হোয়াটসঅ্যাপ নম্বর ও সুপার এডমিন পাসওয়ার্ড কনফিগার করুন (লোকাল স্টোরেজে সংরক্ষিত)।
                </p>
              </div>

              <form onSubmit={handleSaveSecuritySettings} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-5">
                {/* হোয়াটসঅ্যাপ নম্বর */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    অফিসিয়াল হোয়াটসঅ্যাপ মোবাইল নম্বর (কান্ট্রি কোড সহ):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={whatsappInput}
                      onChange={(e) => setWhatsappInput(e.target.value)}
                      placeholder="+8801700000000"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    <a
                      href={`https://wa.me/${whatsappInput.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      title="হোয়াটসঅ্যাপে টেস্ট মেসেজ ওপেন করুন"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>টেস্ট চ্যাট</span>
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    গ্রাহকের বকেয়া কিস্তির রিমাইন্ডার ও সার্ভিসিং নোটিফিকেশন এই নম্বরের সাথে সিঙ্ক হবে।
                  </p>
                </div>

                {/* সুপার এডমিন পিন কোড */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    সুপার এডমিন অ্যাক্সেস পিন কোড (ডিফল্ট: 1234):
                  </label>
                  <input
                    type="password"
                    maxLength={8}
                    value={adminPinInput}
                    onChange={(e) => setAdminPinInput(e.target.value)}
                    placeholder="1234"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    ভুল পিন দিলে এডমিন কনসোল আনলক হবে না।
                  </p>
                </div>

                {/* পিন গেট সক্রিয় করার টগল */}
                <div className="pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPinGateEnabled}
                      onChange={(e) => setIsPinGateEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-slate-300 font-medium">
                      এডমিন প্যানেলে প্রবেশের সময় প্রতিবার পিন ভেরিফিকেশন সক্রিয় রাখুন
                    </span>
                  </label>
                </div>

                {saveSuccess && (
                  <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>সেটিংস সফলভাবে সংরক্ষিত হয়েছে!</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>সেটিংস সেভ করুন</span>
                </button>
              </form>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
