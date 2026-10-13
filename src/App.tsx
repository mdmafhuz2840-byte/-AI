/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  RefreshCw, 
  AlertTriangle, 
  KeyRound, 
  MessageSquareText, 
  Sparkles,
  History,
  Clock,
  Plus,
  Mic,
  MicOff,
  Paperclip,
  Globe,
  X,
  FileText,
  BadgeInfo
} from 'lucide-react';
import { Navbar, AppTab } from './components/Navbar';
import { HomeOverview } from './components/HomeOverview';
import { DiagnosticForm } from './components/DiagnosticForm';
import { InstallmentManager } from './components/InstallmentManager';
import { ComplaintAssistance } from './components/ComplaintAssistance';
import { PrivacyPage } from './components/PrivacyPage';
import { DeviceTracker } from './components/DeviceTracker';
import { ProToolsHub } from './components/ProToolsHub';
import { AnswerArea } from './components/AnswerArea';
import { ConversationThread } from './components/ConversationThread';
import { ChatHistoryDrawer } from './components/ChatHistoryDrawer';
import { QuickPrompts } from './components/QuickPrompts';
import { ErrorAlert, ErrorDetails } from './components/ErrorAlert';
import { ConfigGuideModal } from './components/ConfigGuideModal';
import { ApkGuideModal } from './components/ApkGuideModal';
import { AgentSelector } from './components/AgentSelector';
import { SystemStateMonitorModal } from './components/SystemStateMonitorModal';
import { SuperAdminPanel } from './components/SuperAdminPanel';
import { VersionInfoModal } from './components/VersionInfoModal';
import { ApiSetupPage } from './components/ApiSetupPage';
import { TelegramBotHub } from './components/TelegramBotHub';
import { DownloadPage } from './components/DownloadPage';
import { AI_AGENTS, Agent } from './types/agents';
import { Language, t } from './utils/translations';
import { ChatSession, ChatMessage, GroundingSource } from './types/recovery';

interface ServerStatus {
  appName: string;
  configured: boolean;
  keyPreview: string | null;
  model: string;
  fallbackSystem?: {
    active: boolean;
    geminiReady: boolean;
    secondaryOpenAiReady: boolean;
    openRouterReady: boolean;
  };
}

export default function App() {
  // ০. থিম মোড স্টেট (ডিফল্ট ডার্ক, লোকালস্টোরেজ থেকে লোড)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('mdr_theme');
      return saved === 'light' || saved === 'dark' ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  // ১. ভাষা ও প্রধান নেভিগেশন স্টেট (ডিফল্ট: বাংলা)
  const [lang, setLang] = useState<Language>('bn');
  const [currentTab, setCurrentTab] = useState<AppTab>(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/download')) {
      return 'download';
    }
    return 'home';
  });

  // থিম ক্লাস সিঙ্ক
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    try {
      localStorage.setItem('mdr_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // ২. ডায়াগনস্টিক শর্টকাট স্টেট (যেমন Vivo Y21 সরাসরি সিলেক্ট করার জন্য)
  const [diagBrand, setDiagBrand] = useState('vivo');
  const [diagModel, setDiagModel] = useState('Vivo Y21');

  // ৩. এআই সহকারী ও পারসিস্টেন্ট মেমোরি স্টেট
  const [selectedAgent, setSelectedAgent] = useState<Agent>(AI_AGENTS[0]);
  const [answeringAgent, setAnsweringAgent] = useState<Agent>(AI_AGENTS[0]);
  const [question, setQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState<string | null>(null);
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const [answerTimestamp, setAnswerTimestamp] = useState<string | null>(null);
  const [usedModel, setUsedModel] = useState<string | null>(null);

  // ৩.১ চ্যাট সেশন ও পারসিস্টেন্ট মেমোরি হিস্ট্রি
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('mdr_chat_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('mdr_active_session_id') || null;
    } catch {
      return null;
    }
  });
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  // লোকাল স্টোরেজে সেশন সিঙ্ক
  useEffect(() => {
    try {
      localStorage.setItem('mdr_chat_sessions', JSON.stringify(sessions));
      if (activeSessionId) {
        localStorage.setItem('mdr_active_session_id', activeSessionId);
      } else {
        localStorage.removeItem('mdr_active_session_id');
      }
    } catch {
      // storage error fallback
    }
  }, [sessions, activeSessionId]);

  // অ্যাক্টিভ সেশনের মেসেজসমূহ
  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const activeMessages: ChatMessage[] = activeSession ? activeSession.messages : [];


  // ৪. লোডিং, এরর ও ফলব্যাক স্টেট
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorDetails | null>(null);
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const [fallbackReason, setFallbackReason] = useState<string | null>(null);
  const [fallbackProvider, setFallbackProvider] = useState<string | null>(null);

  // ৫. সার্ভার ও কনফিগারেশন স্টেট
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isApkGuideOpen, setIsApkGuideOpen] = useState(false);
  const [isStateMonitorOpen, setIsStateMonitorOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; detail?: string } | null>(null);

  // ৬. টেক্সট এরিয়া ও ইনপুট রেফারেন্স
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // ৬.১ মাল্টিমোডাল অ্যাটাচমেন্ট, ভয়েস ইনপুট ও ওয়েব সার্চ স্টেট
  const [currentSources, setCurrentSources] = useState<GroundingSource[] | null>(null);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [enableWebSearch, setEnableWebSearch] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    mimeType: string;
    data: string;
    previewUrl?: string;
  } | null>(null);

  // বাংলা ভয়েস ইনপুট (Speech-to-Text) টগল
  const handleToggleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        lang === 'bn'
          ? 'আপনার ব্রাউজারে ভয়েস রিকগনিশন সাপোর্ট নেই। Chrome বা Edge ব্রাউজার ব্যবহার করুন।'
          : 'Speech recognition is not supported in this browser.'
      );
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'bn-BD'; // বাংলা (বাংলাদেশ)
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setQuestion((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // ছবি বা ফাইল নির্বাচন হ্যান্ডলার
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert(lang === 'bn' ? 'ফাইলের আকার ৮MB এর কম হতে হবে।' : 'File size must be under 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAttachedFile({
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        data: result,
        previewUrl: file.type.startsWith('image/') ? result : undefined,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveAttachment = () => {
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // পৃষ্ঠা লোড হলে সার্ভার স্ট্যাটাস যাচাই
  useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setServerStatus(data);
      } else {
        setServerStatus({
          appName: 'Mafhuz Device Recovery',
          configured: false,
          keyPreview: null,
          model: 'gpt-4o-mini',
        });
      }
    } catch {
      setServerStatus({
        appName: 'Mafhuz Device Recovery',
        configured: false,
        keyPreview: null,
        model: 'gpt-4o-mini',
      });
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      setTestResult(data);
      await checkServerStatus();
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি।',
        detail: err.message,
      });
    } finally {
      setIsTesting(false);
    }
  };

  // সেশন ও মেমোরি হ্যান্ডলার ফাংশনসমূহ
  const handleStartNewChat = () => {
    setActiveSessionId(null);
    setCurrentAnswer(null);
    setLastQuestion(null);
    setCurrentSources(null);
    setAttachedFile(null);
    setQuestion('');
    setError(null);
  };

  const handleSelectSession = (session: ChatSession) => {
    setActiveSessionId(session.id);
    const matchedAgent = AI_AGENTS.find((a) => a.id === session.agentId);
    if (matchedAgent) {
      setSelectedAgent(matchedAgent);
      setAnsweringAgent(matchedAgent);
    }
    const lastMsg = [...session.messages].reverse().find((m) => m.role === 'assistant');
    if (lastMsg) {
      setCurrentAnswer(lastMsg.content);
      setUsedModel(lastMsg.model || null);
      setAnswerTimestamp(lastMsg.timestamp);
      setFallbackUsed(Boolean(lastMsg.fallbackUsed));
      setFallbackProvider(lastMsg.provider || null);
      setCurrentSources(lastMsg.sources || null);
    } else {
      setCurrentAnswer(null);
      setCurrentSources(null);
    }
    setIsHistoryDrawerOpen(false);
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
      setCurrentAnswer(null);
      setCurrentSources(null);
    }
  };

  const handleClearAllHistory = () => {
    setSessions([]);
    setActiveSessionId(null);
    setCurrentAnswer(null);
    setCurrentSources(null);
    setAttachedFile(null);
    localStorage.removeItem('mdr_chat_sessions');
    localStorage.removeItem('mdr_active_session_id');
  };

  // এআই চ্যাট সাবমিট (মেমোরি, অ্যাটাচমেন্ট ও ওয়েব সার্চ কনটেক্সট সহ)
  const handleAiSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedQuestion = question.trim();
    if ((!trimmedQuestion && !attachedFile) || isLoading) return;

    const actualPrompt = trimmedQuestion || (attachedFile ? `এই ${attachedFile.name} ফাইলটি বা ছবিটি বিশ্লেষণ করে প্রয়োজনীয় তথ্য দিন।` : '');

    setError(null);
    setFallbackUsed(false);
    setFallbackReason(null);
    setFallbackProvider(null);
    setIsLoading(true);
    setLastQuestion(actualPrompt);
    setAnsweringAgent(selectedAgent);

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsLoading(false);
      setError({
        error: 'NETWORK_OFFLINE',
        message: lang === 'bn' 
          ? 'ইন্টারনেট সংযোগ বিচ্ছিন্ন রয়েছে। অনুগ্রহ করে চেক করুন।' 
          : 'Internet connection is offline. Please check network.',
      });
      return;
    }

    // ইউজার মেসেজ অবজেক্ট (অ্যাটাচমেন্ট সহ)
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      role: 'user',
      content: actualPrompt,
      timestamp: new Date().toISOString(),
      agentId: selectedAgent.id,
      attachment: attachedFile ? {
        name: attachedFile.name,
        mimeType: attachedFile.mimeType,
        data: attachedFile.data,
      } : undefined,
    };

    // বর্তমান সেশন খুঁজে বের করা বা নতুন সেশন তৈরি
    let currentOrNewSessionId = activeSessionId;
    let existingMessages: ChatMessage[] = [];

    if (currentOrNewSessionId) {
      const found = sessions.find((s) => s.id === currentOrNewSessionId);
      if (found) {
        existingMessages = found.messages;
      } else {
        currentOrNewSessionId = `session-${Date.now()}`;
      }
    } else {
      currentOrNewSessionId = `session-${Date.now()}`;
    }

    const updatedMessagesWithUser = [...existingMessages, userMessage];

    // সেশন তৈরি/আপডেট করা এবং ইউজার মেসেজ সাথে সাথে সেভ
    setSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === currentOrNewSessionId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          updatedAt: new Date().toISOString(),
          messages: updatedMessagesWithUser,
        };
        return copy;
      } else {
        const newSession: ChatSession = {
          id: currentOrNewSessionId!,
          title: actualPrompt.slice(0, 45) + (actualPrompt.length > 45 ? '...' : ''),
          agentId: selectedAgent.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: updatedMessagesWithUser,
        };
        return [newSession, ...prev];
      }
    });
    setActiveSessionId(currentOrNewSessionId);

    // সার্ভারে প্রেরণের জন্য ফরম্যাটেড হিস্ট্রি প্রস্তুত (অনধিক পূর্ববর্তী ১০টি মেসেজ)
    const historyPayload = existingMessages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: actualPrompt,
          chatHistory: historyPayload,
          conversation: historyPayload,
          agentId: selectedAgent.id,
          attachment: attachedFile ? {
            name: attachedFile.name,
            mimeType: attachedFile.mimeType,
            data: attachedFile.data,
          } : null,
          enableWebSearch: Boolean(enableWebSearch),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError({
          error: data.error || 'SERVER_ERROR',
          message: data.message || 'একটি অপ্রত্যাশিত সমস্যা হয়েছে।',
          hint: data.hint,
          detail: data.detail,
          configured: data.configured,
        });
        setCurrentAnswer(null);
      } else {
        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          role: 'assistant',
          content: data.answer,
          timestamp: data.timestamp || new Date().toISOString(),
          agentId: data.agentId || selectedAgent.id,
          model: data.model || 'gpt-4o-mini',
          fallbackUsed: Boolean(data.fallbackUsed),
          provider: data.provider || null,
          sources: data.sources || null,
        };

        // সেশনে এআই উত্তর যুক্ত ও সংরক্ষণ
        setSessions((prev) => {
          return prev.map((s) => {
            if (s.id === currentOrNewSessionId) {
              return {
                ...s,
                updatedAt: new Date().toISOString(),
                messages: [...s.messages, assistantMessage],
              };
            }
            return s;
          });
        });

        setCurrentAnswer(data.answer);
        setCurrentSources(data.sources || null);
        setAnswerTimestamp(data.timestamp || new Date().toISOString());
        setUsedModel(data.model || 'gpt-4o-mini');
        setFallbackUsed(Boolean(data.fallbackUsed));
        setFallbackReason(data.fallbackReason || null);
        setFallbackProvider(data.provider || null);

        if (data.agentId) {
          const matched = AI_AGENTS.find((a) => a.id === data.agentId);
          if (matched) setAnsweringAgent(matched);
        }

        setQuestion('');
        setAttachedFile(null);
      }
    } catch (err: any) {
      setError({
        error: 'CLIENT_NETWORK_ERROR',
        message: 'সার্ভার সংযোগ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।',
        detail: err.message,
      });
      setCurrentAnswer(null);
    } finally {
      setIsLoading(false);
      checkServerStatus();
    }
  };

  // কিবোর্ড এন্টার সাবমিট
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAiSubmit();
    }
  };

  // ভাষা টগল
  const toggleLanguage = () => {
    setLang((prev) => (prev === 'bn' ? 'en' : 'bn'));
  };

  // Vivo Y21 হাবের শর্টকাট ক্লিক
  const handleSelectVivoY21 = () => {
    setDiagBrand('vivo');
    setDiagModel('Vivo Y21');
    setCurrentTab('diagnostic');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* ১. শীর্ষ ও বটম ন্যাভিগেশন বার */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        lang={lang}
        onToggleLang={toggleLanguage}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenApkGuide={() => setIsApkGuideOpen(true)}
        onOpenStateMonitor={() => setIsStateMonitorOpen(true)}
        selectedAgent={selectedAgent}
        onSelectAgent={(agent) => {
          setSelectedAgent(agent);
          if (textareaRef.current) textareaRef.current.focus();
        }}
      />

      {/* ২. মূল স্ক্রিন কন্টেন্ট (ট্যাব অনুযায়ী রেন্ডার) */}
      <main className={`flex-1 w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 ${currentTab === 'admin' || currentTab === 'home' ? 'max-w-6xl' : 'max-w-3xl'}`}>
        {/* ক. হোম স্ক্রিন */}
        {currentTab === 'home' && (
          <HomeOverview
            lang={lang}
            onNavigate={setCurrentTab}
            onSelectVivoY21={handleSelectVivoY21}
            onOpenApkGuide={() => setIsApkGuideOpen(true)}
            onOpenStateMonitor={() => setIsStateMonitorOpen(true)}
            onOpenHistory={() => setIsHistoryDrawerOpen(true)}
            onOpenVersionModal={() => setIsVersionModalOpen(true)}
            onSelectAgent={setSelectedAgent}
          />
        )}

        {/* খ. ডায়াগনস্টিক ও রিকভারি গাইড */}
        {currentTab === 'diagnostic' && (
          <DiagnosticForm
            lang={lang}
            initialBrand={diagBrand}
            initialModel={diagModel}
          />
        )}

        {/* গ. লাইভ জিপিএস ও অ্যান্ড্রয়েড ডিভাইস ট্র্যাকার */}
        {currentTab === 'tracker' && (
          <DeviceTracker lang={lang} />
        )}

        {/* ঘ. প্রো সার্ভিসিং ও টেকনিশিয়ান টুলস হাব */}
        {currentTab === 'tools' && (
          <ProToolsHub lang={lang} />
        )}

        {/* ঙ. কিস্তি ও পেমেন্ট রশিদ */}
        {currentTab === 'installments' && (
          <InstallmentManager lang={lang} />
        )}

        {/* চ. পেমেন্ট-পরবর্তী অভিযোগ সহায়তা */}
        {currentTab === 'complaints' && (
          <ComplaintAssistance lang={lang} />
        )}

        {/* ছ. গোপনীয়তা ও ব্যাকআপ */}
        {currentTab === 'privacy' && (
          <PrivacyPage lang={lang} />
        )}

        {/* জ. সুপার এডমিন প্যানেল */}
        {currentTab === 'admin' && (
          <SuperAdminPanel
            lang={lang}
            onNavigateTab={setCurrentTab}
            selectedAgent={selectedAgent}
            onSelectAgent={setSelectedAgent}
          />
        )}

        {/* ঞ. AI API সংযোগ ও OpenRouter সেটআপ (Settings) */}
        {currentTab === 'settings' && (
          <ApiSetupPage
            lang={lang}
            onNavigateTab={setCurrentTab}
          />
        )}

        {/* ট. টেলিগ্রাম বট হাব (@mahfuzur_rahman_ai_bot) */}
        {currentTab === 'telegram' && (
          <TelegramBotHub
            lang={lang}
            onNavigateTab={setCurrentTab}
          />
        )}

        {/* ঠ. অফিসিয়াল অ্যান্ড্রয়েড APK ডাউনলোড পেজ */}
        {currentTab === 'download' && (
          <DownloadPage
            lang={lang}
            onNavigateTab={setCurrentTab}
            onOpenApkGuide={() => setIsApkGuideOpen(true)}
          />
        )}

        {/* চ. এআই উপদেষ্টা ও চ্যাট সহকারী */}
        {currentTab === 'ai' && (
          <div className="space-y-4 animate-fade-in pb-16">
            {/* এআই অ্যাসিস্ট্যান্ট হেডার ও হিস্ট্রি মেমোরি বাটন */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-slate-900/80 border border-slate-800">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <span>{lang === 'bn' ? 'মাহফুজুর রহমান AI - এআই উপদেষ্টা' : 'Mahfuzur Rahman AI - Smart Advisor'}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'bn'
                    ? 'স্মার্ট মেমোরি সংযুক্ত: আপনার অতীতের প্রশ্ন মনে রেখে ধারাবাহিক উত্তর দেয়।'
                    : 'Persistent memory enabled: Remembers past turns across conversations.'}
                </p>
              </div>

              {/* মেমোরি হিস্ট্রি, নতুন চ্যাট ও সংস্করণ বাটন */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsHistoryDrawerOpen(true)}
                  type="button"
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 transition flex items-center gap-1.5 shadow-sm"
                  title={lang === 'bn' ? 'সংরক্ষিত কথোপকথনের ইতিহাস' : 'Saved Chat History'}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'স্মৃতি ও হিস্ট্রি' : 'Memory'}</span>
                  {sessions.length > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-bold">
                      {sessions.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={handleStartNewChat}
                  type="button"
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1 shadow-sm"
                  title={lang === 'bn' ? 'নতুন আলোচনা শুরু করুন' : 'Start New Conversation'}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'নতুন চ্যাট' : 'New Chat'}</span>
                </button>

                <button
                  onClick={() => setIsVersionModalOpen(true)}
                  type="button"
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1 shadow-sm"
                  title="অ্যাপের সংস্করণ ও আপডেট বিবরণী"
                >
                  <BadgeInfo className="w-3.5 h-3.5 text-cyan-400" />
                  <span>v3.5.0</span>
                </button>

                <button
                  onClick={() => setCurrentTab('settings')}
                  type="button"
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-teal-950/70 hover:bg-teal-900/70 text-teal-300 border border-teal-500/40 transition flex items-center gap-1 shadow-sm"
                  title="AI API সংযোগ (OpenRouter Setup)"
                >
                  <KeyRound className="w-3.5 h-3.5 text-teal-400" />
                  <span>API সেটআপ</span>
                </button>

                <button
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  type="button"
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  title="এআই সংযোগ স্থিতি পরীক্ষা"
                >
                  {isTesting ? 'টেস্টিং...' : 'API টেস্ট'}
                </button>
              </div>
            </div>

            {/* এজেন্ট সিলেক্টর */}
            <AgentSelector
              selectedAgent={selectedAgent}
              onSelectAgent={(agent) => {
                setSelectedAgent(agent);
                if (textareaRef.current) textareaRef.current.focus();
              }}
              disabled={isLoading}
            />

            {/* এরর এলার্ট */}
            {error && (
              <ErrorAlert
                error={error}
                onRetry={lastQuestion ? () => handleAiSubmit() : undefined}
                onOpenGuide={() => setIsGuideOpen(true)}
              />
            )}

            {/* কথোপকথনের ধারাবাহিক থ্রেড (মেমোরি সহ) */}
            {activeMessages.length > 0 ? (
              <ConversationThread
                messages={activeMessages}
                isLoading={isLoading}
                answeringAgent={answeringAgent}
                lang={lang}
              />
            ) : (
              (isLoading || currentAnswer) && (
                <AnswerArea
                  answer={currentAnswer}
                  question={lastQuestion}
                  isLoading={isLoading}
                  timestamp={answerTimestamp}
                  model={usedModel}
                  agent={answeringAgent}
                  fallbackUsed={fallbackUsed}
                  fallbackReason={fallbackReason}
                  provider={fallbackProvider}
                  sources={currentSources}
                />
              )
            )}

            {/* প্রশ্ন ইনপুট বক্স ও মাল্টিমোডাল টুলবার */}
            <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl">
              <form onSubmit={handleAiSubmit} className="space-y-3">
                <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <MessageSquareText className={`w-4 h-4 ${selectedAgent.colorClass.text}`} />
                    <span>{lang === 'bn' ? `আপনার প্রশ্ন লিখুন (${selectedAgent.name})` : `Ask your question (${selectedAgent.role})`}</span>
                  </span>
                  <span className="text-[11px] font-normal text-slate-400">
                    (Shift+Enter for newline)
                  </span>
                </div>

                {/* ভয়েস লিসেনিং স্টেট ব্যানার */}
                {isListening && (
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs animate-pulse">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                      <span className="font-semibold">🎙️ শুনছি... অনুগ্রহ করে বাংলায় আপনার প্রশ্ন বলুন।</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleVoiceInput}
                      className="px-2 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold"
                    >
                      থামান
                    </button>
                  </div>
                )}

                {/* অ্যাটাচমেন্ট প্রিভিউ কার্ড */}
                {attachedFile && (
                  <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-950 border border-blue-500/40 text-xs">
                    {attachedFile.previewUrl ? (
                      <img
                        src={attachedFile.previewUrl}
                        alt="প্রিভিউ"
                        className="w-12 h-12 object-cover rounded-xl border border-slate-700"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-slate-200 block truncate">{attachedFile.name}</span>
                      <span className="text-[10px] text-blue-300 font-mono">
                        সংযুক্ত করা হয়েছে • এআই বিশ্লেষণ করবে
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveAttachment}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="অ্যাটাচমেন্ট সরান"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <textarea
                  ref={textareaRef}
                  id="ai-input"
                  rows={3}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    lang === 'bn' 
                      ? 'এখানে আপনার প্রশ্ন বা ডিভাইস সমস্যার বিবরণ লিখুন (অথবা মাইক চেপে মুখে বলুন)...' 
                      : 'Type your issue, query, or tap the microphone to speak...'
                  }
                  disabled={isLoading}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />

                {/* টুলবার ও সাবমিট অ্যাকশন */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* বাংলা ভয়েস ইনপুট বাটন */}
                    <button
                      type="button"
                      onClick={handleToggleVoiceInput}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                        isListening
                          ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-400 shadow-lg shadow-rose-600/30'
                          : 'bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-slate-800'
                      }`}
                      title={isListening ? 'ভয়েস বন্ধ করুন' : 'বাংলায় ভয়েস ইনপুট দিন'}
                    >
                      {isListening ? <MicOff className="w-3.5 h-3.5 text-white" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                      <span>{isListening ? 'শুনছি...' : 'ভয়েস ইনপুট'}</span>
                    </button>

                    {/* ছবি/ফাইল অ্যাটাচমেন্ট বাটন */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                        attachedFile
                          ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      }`}
                      title="ছবি বা ডকুমেন্ট আপলোড করে প্রশ্ন করুন"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>{attachedFile ? 'ফাইল রেডি' : 'ছবি/ডকুমেন্ট'}</span>
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf,.txt,.json,.doc,.docx"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    {/* লাইভ গুগল ওয়েব সার্চ টগল */}
                    <button
                      type="button"
                      onClick={() => setEnableWebSearch(!enableWebSearch)}
                      className={`px-2.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                        enableWebSearch
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
                      }`}
                      title="গুগল সার্চ গ্রাউন্ডিং দিয়ে রিয়েল-টাইম তথ্য ও সোর্স লিংক পান"
                    >
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{enableWebSearch ? 'ওয়েব সার্চ সক্রিয় ✓' : 'ওয়েব সার্চ'}</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || (!question.trim() && !attachedFile)}
                    className="w-full sm:w-auto ml-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/20 transition active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>প্রসেসিং...</span>
                      </>
                    ) : (
                      <>
                        <span>প্রশ্ন করুন</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>

            {/* কুইক প্রম্পট */}
            <QuickPrompts
              prompts={selectedAgent.starterPrompts}
              agentName={selectedAgent.name}
              onSelectPrompt={(text) => {
                setQuestion(text);
                if (textareaRef.current) textareaRef.current.focus();
              }}
              disabled={isLoading}
            />
          </div>
        )}
      </main>

      {/* কনফিগারেশন গাইড মডাল */}
      <ConfigGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        isConfigured={Boolean(serverStatus?.configured)}
        keyPreview={serverStatus?.keyPreview || null}
        onTestConnection={handleTestConnection}
        isTesting={isTesting}
        testResult={testResult}
      />

      {/* অ্যান্ড্রয়েড APK ও ইনস্টলেশন নির্দেশিকা মডাল */}
      <ApkGuideModal
        isOpen={isApkGuideOpen}
        onClose={() => setIsApkGuideOpen(false)}
        lang={lang}
      />

      {/* সিস্টেম স্টেট ও পারসিস্টেন্ট মেমোরি মনিটর মডাল */}
      <SystemStateMonitorModal
        isOpen={isStateMonitorOpen}
        onClose={() => setIsStateMonitorOpen(false)}
        lang={lang}
        activeModel={serverStatus?.model}
      />

      {/* এআই চ্যাট মেমোরি ও হিস্ট্রি সাইডবার ড্রয়ার */}
      <ChatHistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleStartNewChat}
        onDeleteSession={handleDeleteSession}
        onClearAllHistory={handleClearAllHistory}
        lang={lang}
      />

      {/* অ্যাপ সংস্করণ ও আপডেট বিবরণী মডাল */}
      <VersionInfoModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        lang={lang}
      />
    </div>
  );
}

