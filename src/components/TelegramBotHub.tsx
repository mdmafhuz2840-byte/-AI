import React, { useState, useEffect } from 'react';
import { 
  Send, 
  RefreshCw, 
  Play, 
  Pause, 
  ExternalLink, 
  Copy, 
  Check, 
  MessageSquare, 
  Bot, 
  Smartphone, 
  Code, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Clock, 
  Sparkles,
  Terminal,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Language } from '../utils/translations';
import { AppTab } from './Navbar';

interface TelegramBotHubProps {
  lang: Language;
  onNavigateTab: (tab: AppTab) => void;
}

interface TelegramLog {
  id: string;
  timestamp: string;
  chatId: number | string;
  fromUser: string;
  userMessage: string;
  botReply: string;
  model: string;
  agentId: string;
  status: 'success' | 'error';
}

interface TelegramStatusData {
  isRunning: boolean;
  botInfo: {
    id: number;
    username: string;
    first_name: string;
  } | null;
  totalMessages: number;
  recentLogs: TelegramLog[];
  tokenPreview: string;
  botUrl: string;
}

export const TelegramBotHub: React.FC<TelegramBotHubProps> = ({ lang, onNavigateTab }) => {
  const [activeTab, setActiveTab] = useState<'live' | 'logs' | 'python-guide'>('live');
  const [statusData, setStatusData] = useState<TelegramStatusData | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [copiedPython, setCopiedPython] = useState(false);
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);

  // টেস্ট মেসেজ ফর্ম স্টেট
  const [testChatId, setTestChatId] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testNotice, setTestNotice] = useState<{ success: boolean; msg: string } | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/telegram/status');
      const data = await res.json();
      setStatusData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleBot = async () => {
    setIsToggling(true);
    try {
      const res = await fetch('/api/telegram/toggle', { method: 'POST' });
      const data = await res.json();
      if (statusData) {
        setStatusData({ ...statusData, isRunning: data.isRunning });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsToggling(false);
    }
  };

  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testChatId.trim()) return;

    setIsSendingTest(true);
    setTestNotice(null);

    try {
      const res = await fetch('/api/telegram/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: testChatId.trim(),
          message: testMessage.trim() || undefined,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setTestNotice({ success: true, msg: 'মেসেজ সফলভাবে টেলিগ্রামে পৌঁছেছে!' });
        setTestMessage('');
        fetchStatus();
      } else {
        setTestNotice({ success: false, msg: data.message || 'মেসেজ পাঠানো ব্যর্থ হয়েছে।' });
      }
    } catch (err: any) {
      setTestNotice({ success: false, msg: err.message || 'সার্ভার সংযোগ সমস্যা।' });
    } finally {
      setIsSendingTest(false);
    }
  };

  const copyPythonCode = async () => {
    const code = `import os
import time
import requests
import google.generativeai as genai

TELEGRAM_BOT_TOKEN = "8843464101:AAFR2n7aqB0yjZv6RCbUMiXVwsHPjE2wJkU"
GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"

genai.configure(api_key=GEMINI_API_KEY)
system_instruction = """
You are "মাহফুজুর রহমান AI" — an advanced, multi-task AI second brain for Mahfuzur Rahman.
ALWAYS start EVERY response with your exact active identity tag:
🤖 [মাহফুজুর রহমান AI — জেনারেল এআই]
"""

model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    system_instruction=system_instruction
)

TELEGRAM_URL = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}"

def get_updates(offset=None):
    url = f"{TELEGRAM_URL}/getUpdates?timeout=60"
    if offset:
        url += f"&offset={offset}"
    return requests.get(url).json()

def send_message(chat_id, text):
    url = f"{TELEGRAM_URL}/sendMessage"
    payload = {"chat_id": chat_id, "text": text}
    requests.post(url, json=payload)

print("🤖 মাহফুজুর রহমান AI টেলিগ্রাম বট এখন লাইভ ও রানিং...")

last_update_id = None
while True:
    try:
        updates = get_updates(last_update_id)
        if "result" in updates:
            for update in updates["result"]:
                last_update_id = update["update_id"] + 1
                if "message" in update and "text" in update["message"]:
                    chat_id = update["message"]["chat"]["id"]
                    user_text = update["message"]["text"]
                    print(f"মেসেজ: {user_text}")
                    response = model.generate_content(user_text)
                    send_message(chat_id, response.text)
    except Exception as e:
        print(f"Error: {e}")
        time.sleep(2)
`;
    await navigator.clipboard.writeText(code);
    setCopiedPython(true);
    setTimeout(() => setCopiedPython(false), 2500);
  };

  const botUsername = statusData?.botInfo?.username || 'mahfuzur_rahman_ai_bot';
  const botLink = `https://t.me/${botUsername}`;

  return (
    <div className="space-y-5 animate-fade-in pb-20 max-w-4xl mx-auto">
      {/* ১. টপ হিরো কার্ড */}
      <div className="relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>টেলিগ্রাম স্মার্ট ইন্টিগ্রেশন</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <span>🤖 মাহফুজুর রহমান AI টেলিগ্রাম বট</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300">
              ইউজারনেম: <strong className="text-cyan-300 font-mono">@{botUsername}</strong> | আপনার পুরো এআই সেকেন্ড ব্রেন এখন সরাসরি টেলিগ্রামে সার্বক্ষণিক সক্রিয়!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={botLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-95 cursor-pointer"
            >
              <span>টেলিগ্রামে চ্যাট শুরু করুন</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={handleToggleBot}
              disabled={isToggling}
              type="button"
              className={`px-3 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 border active:scale-95 cursor-pointer ${
                statusData?.isRunning
                  ? 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border-rose-500/40'
                  : 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {statusData?.isRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>বট থামান</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>বট চালু করুন</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* বট হেলথ ও কানেকশন স্ট্যাটাস বার */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">সার্ভার স্ট্যাটাস:</span>
            {statusData?.isRunning ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                লাইভ ও সক্রিয় (Online & Running)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                স্থগিত রয়েছে (Paused)
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-slate-300 text-[11px] font-mono">
            <span>মোট প্রক্রিয়াকৃত বার্তা: <strong className="text-cyan-400 font-bold">{statusData?.totalMessages ?? 0}</strong></span>
            <span>টোকেন: <span className="text-slate-400">{statusData?.tokenPreview || '8843464101:•••'}</span></span>
          </div>
        </div>
      </div>

      {/* ২. সাব-ন্যাভিগেশন ট্যাব */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('live')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'live'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>লাইভ কন্ট্রোল ও টেস্ট</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>মেসেজ হিস্ট্রি ({statusData?.recentLogs?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('python-guide')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'python-guide'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>পাইথন স্ক্রিপ্ট ও টারমাক্স</span>
        </button>
      </div>

      {/* ৩. ট্যাব ১: লাইভ কন্ট্রোল ও টেস্ট */}
      {activeTab === 'live' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ফিচার ও স্বয়ংক্রিয় ক্ষমতা */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3.5">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>টেলিগ্রাম বটের সক্ষমতা ও স্বয়ংক্রিয় সুবিধা</span>
            </h3>

            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">স্বয়ংক্রিয় ১১টি এজেন্ট রাউটিং:</strong>
                  <span>ব্যবহারকারী টেলিগ্রামে Vivo Y21 আনলক, কিস্তির মেমো, আইনি অভিযোগ বা কোডিং নিয়ে লিখলে সিস্টেম স্বয়ংক্রিয়ভাবে সংশ্লিষ্ট এজেন্টে উত্তর তৈরি করে।</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">৪-টিয়ার ফলব্যাক প্রটেকশন:</strong>
                  <span>OpenAI ➔ Gemini 3.8 Flash ➔ OpenRouter ➔ অফলাইন নলেজ ইঞ্জিন ব্যাকআপ থাকায় বট কখনোই ক্র্যাশ বা বন্ধ হয় না।</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">যেকোনো ডিভাইসে কাজ করে:</strong>
                  <span>আপনার ক্লায়েন্টরা কোনো অ্যাপ ইনস্টল না করেই সরাসরি টেলিগ্রামে যেকোনো সময় সহায়তা পেতে পারে।</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={botLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs transition flex items-center justify-center gap-1.5 border border-cyan-500/30"
              >
                <span>বটের সাথে চ্যাট ওপেন করুন (@{botUsername})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* টেস্ট মেসেজ পাঠানোর ফর্ম */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3.5">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Send className="w-4 h-4 text-cyan-400" />
              <span>টেলিগ্রামে টেস্ট বার্তা পাঠান</span>
            </h3>

            <p className="text-xs text-slate-400">
              আপনার টেলিগ্রাম Chat ID লিখে সরাসরি এই প্যানেল থেকে টেস্ট বার্তা পাঠাতে পারেন।
            </p>

            <form onSubmit={handleSendTestMessage} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">টেলিগ্রাম Chat ID (সংখ্যার আইডি):</label>
                <input
                  type="text"
                  value={testChatId}
                  onChange={(e) => setTestChatId(e.target.value)}
                  placeholder="যেমন: 123456789 (টেলিগ্রামে @userinfobot থেকে পাওয়া যায়)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">টেস্ট বার্তা (ঐচ্ছিক):</label>
                <input
                  type="text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="ডিফল্ট নোটিফিকেশন পাঠাতে খালি রাখুন"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {testNotice && (
                <div className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                  testNotice.success ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                }`}>
                  {testNotice.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
                  <span>{testNotice.msg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSendingTest || !testChatId.trim()}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition active:scale-98 disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSendingTest ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>পাঠানো হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>টেস্ট বার্তা পাঠান</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ৪. ট্যাব ২: মেসেজ হিস্ট্রি ও লাইভ কনসোল */}
      {activeTab === 'logs' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>সাম্প্রতিক টেলিগ্রাম বার্তা ও স্বয়ংক্রিয় উত্তর</span>
            </h3>
            <button
              onClick={fetchStatus}
              type="button"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>রিফ্রেশ</span>
            </button>
          </div>

          {statusData?.recentLogs && statusData.recentLogs.length > 0 ? (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {statusData.recentLogs.map((log) => (
                <div key={log.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-bold text-slate-200">
                      👤 {log.fromUser} <span className="font-mono text-slate-500">(Chat ID: {log.chatId})</span>
                    </span>
                    <span className="flex items-center gap-1 text-[10px]">
                      <Clock className="w-3 h-3" />
                      {log.timestamp}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-medium">
                    <span className="text-cyan-400 font-semibold block text-[10px]">প্রশ্ন / বার্তা:</span>
                    {log.userMessage}
                  </div>

                  <div className="p-2 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-slate-200">
                    <div className="flex items-center justify-between text-[10px] text-indigo-300 mb-1">
                      <span>🤖 মাহফুজুর রহমান AI উত্তর ({log.agentId}):</span>
                      <button
                        onClick={async () => {
                          await navigator.clipboard.writeText(log.botReply);
                          setCopiedLogId(log.id);
                          setTimeout(() => setCopiedLogId(null), 2000);
                        }}
                        className="p-0.5 text-slate-400 hover:text-white"
                        title="কপি করুন"
                      >
                        {copiedLogId === log.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed text-[11px]">
                      {log.botReply}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Bot className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs">এখনো কোনো বার্তা আসেনি। টেলিগ্রামে বটে মেসেজ পাঠিয়ে পরীক্ষা করুন।</p>
              <a
                href={botLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
              >
                <span>@{botUsername} ওপেন করুন</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* ৫. ট্যাব ৩: পাইথন স্ক্রিপ্ট ও টারমাক্স গাইড */}
      {activeTab === 'python-guide' && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>স্ট্যান্ডঅ্যালোন পাইথন স্ক্রিপ্ট (Standalone Python Script)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  আপনি চাইলে আমাদের ক্লাউড সার্ভারের পাশাপাশি আপনার নিজের কম্পিউটার বা অ্যান্ড্রয়েড ফোনেও এই কোড চালাতে পারেন।
                </p>
              </div>

              <button
                onClick={copyPythonCode}
                type="button"
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
              >
                {copiedPython ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPython ? 'কপি হয়েছে' : 'কোড কপি করুন'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-[350px]">
{`# 🤖 মাহফুজুর রহমান AI — টেলিগ্রাম বট কোড
# ফাইল: telegram_bot.py (প্রজেক্টে সেভ করা আছে)
import os, time, requests, google.generativeai as genai

TELEGRAM_BOT_TOKEN = "8843464101:AAFR2n7aqB0yjZv6RCbUMiXVwsHPjE2wJkU"
GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    system_instruction='You are "মাহফুজুর রহমান AI" — ALWAYS start with 🤖 [মাহফুজুর রহমান AI — জেনারেল এআই]'
)

TELEGRAM_URL = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}"

# লং পোলিং লুপ দিয়ে স্বয়ংক্রিয় উত্তর পাঠানো...`}
            </pre>
          </div>

          {/* Android Termux গাইড */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>Android ফোনে Termux দিয়ে চালানোর ৩টি সহজ ধাপ:</span>
            </h3>

            <div className="space-y-2 text-slate-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-white block">১. Termux ইনস্টল ও লাইব্রেরি সেটআপ:</span>
                <code className="text-cyan-300 font-mono block mt-1 p-2 rounded bg-slate-900">
                  pkg update && pkg install python<br />
                  pip install requests google-generativeai
                </code>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-white block">২. স্ক্রিপ্ট রান করুন:</span>
                <code className="text-cyan-300 font-mono block mt-1 p-2 rounded bg-slate-900">
                  python telegram_bot.py
                </code>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-white block">৩. ২৪ ঘণ্টা ব্যাকগ্রাউন্ডে চালু রাখার ট্রিক:</span>
                <p className="mt-1">
                  ফোনের নোটিফিকেশন থেকে Termux-এর <strong>Acquire Wakelock</strong> সিলেক্ট করুন যাতে স্ক্রিন অফ হলেও বট বন্ধ না হয়।
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
