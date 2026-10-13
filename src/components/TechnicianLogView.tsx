import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  Download, 
  Share2, 
  Wrench, 
  Cpu, 
  Smartphone, 
  Check, 
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Language } from '../utils/translations';
import { TechnicianLog } from '../types/recovery';

interface TechnicianLogViewProps {
  lang: Language;
}

// Initial realistic sample data
const DEFAULT_LOGS: TechnicianLog[] = [
  {
    id: 'tech-log-1',
    logNo: 'LOG-2026-0101',
    technicianName: 'মাহফুজুর রহমান',
    deviceModel: 'Vivo Y21 (V2111)',
    imeiOrSerial: '864201045239105',
    customerName: 'মোহাম্মদ তারেক',
    customerPhone: '01812345678',
    issueDescription: 'প্যাটার্ন ভুলে যাওয়া ও রিস্টার্ট লুপ',
    toolsUsed: ['Fastboot CLI', 'Vivo Recovery Mode', 'Cache Wipe'],
    actionTaken: 'পাওয়ার অফ করার পর ভলিউম আপ + পাওয়ার কী চেপে রিকভারি মোডে প্রবেশ। Clear Cache সম্পাদন। কোনো ডেটা ক্ষতি ছাড়াই সফল বুট।',
    unlockNotes: 'গ্রাহকের মূল ক্যাশমেমো ও এনআইডি যাচাইকৃত। ডিভাইস সফলভাবে চালু হয়েছে।',
    status: 'completed',
    serviceFee: 600,
    timestamp: '১০ অক্টোবর ২০২৬, দুপুর ০২:৩০',
  },
  {
    id: 'tech-log-2',
    logNo: 'LOG-2026-0102',
    technicianName: 'জুয়েল আহমেদ',
    deviceModel: 'Samsung Galaxy A12',
    imeiOrSerial: '358240107849122',
    customerName: 'আরিফ হোসেন',
    customerPhone: '01798765432',
    issueDescription: 'গুগল FRP লক ও ফার্মওয়্যার হ্যাং',
    toolsUsed: ['Samsung Odin v3.14', 'Official Service Portal', 'Smart Switch'],
    actionTaken: 'অফিশিয়াল 4-ফাইল ফার্মওয়্যার (BL/AP/CP/CSC) ফ্ল্যাশ ও স্যামসাং অ্যাকাউন্ট ভেরিফিকেশন।',
    unlockNotes: 'বৈধ ক্রয়ের প্রমাণ সাপেক্ষে অফিশিয়াল ভেরিফিকেশন সম্পন্ন।',
    status: 'completed',
    serviceFee: 800,
    timestamp: '০৯ অক্টোবর ২০২৬, বিকাল ০৪:১৫',
  },
  {
    id: 'tech-log-3',
    logNo: 'LOG-2026-0103',
    technicianName: 'মাহফুজুর রহমান',
    deviceModel: 'Redmi Note 11',
    imeiOrSerial: '867823059918234',
    customerName: 'কামরুল হাসান',
    customerPhone: '01911223344',
    issueDescription: 'ডিসপ্লে ব্ল্যাক ও চার্জিং আইসি চেক',
    toolsUsed: ['Multimeter', 'Hot Air Rework Station'],
    actionTaken: 'মাদারবোর্ড ভোল্টেজ পরীক্ষা চলমান। VBUS 5V ইনপুট স্বাভাবিক, ডিসপ্লে কানেক্টর পরিষ্কার করা হচ্ছে।',
    unlockNotes: 'নতুন ওলেড ডিসপ্লে পার্টসের অপেক্ষা চলছে।',
    status: 'pending_parts',
    serviceFee: 1500,
    timestamp: '০৮ অক্টোবর ২০২৬, সকাল ১১:০০',
  },
];

const AVAILABLE_TOOLS = [
  'Fastboot CLI',
  'Vivo Recovery Mode',
  'Samsung Odin',
  'SP Flash Tool',
  'Mi Flash Tool',
  'Chimera Tool',
  'UnlockTool',
  'UMT Dongle',
  'Miracle Box',
  'Multimeter',
  'Hot Air Rework',
  'Official Service Portal',
];

export const TechnicianLogView: React.FC<TechnicianLogViewProps> = ({ lang }) => {
  const [logs, setLogs] = useState<TechnicianLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress' | 'pending_parts'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [technicianName, setTechnicianName] = useState('মাহফুজুর রহমান');
  const [deviceModel, setDeviceModel] = useState('Vivo Y21');
  const [imeiOrSerial, setImeiOrSerial] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [selectedTools, setSelectedTools] = useState<string[]>(['Fastboot CLI', 'Vivo Recovery Mode']);
  const [actionTaken, setActionTaken] = useState('');
  const [unlockNotes, setUnlockNotes] = useState('');
  const [status, setStatus] = useState<TechnicianLog['status']>('completed');
  const [serviceFee, setServiceFee] = useState(500);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mdr_tech_logs');
      if (stored) {
        setLogs(JSON.parse(stored));
      } else {
        setLogs(DEFAULT_LOGS);
        localStorage.setItem('mdr_tech_logs', JSON.stringify(DEFAULT_LOGS));
      }
    } catch {
      setLogs(DEFAULT_LOGS);
    }
  }, []);

  const saveLogs = (newLogs: TechnicianLog[]) => {
    setLogs(newLogs);
    try {
      localStorage.setItem('mdr_tech_logs', JSON.stringify(newLogs));
    } catch {
      // ignore
    }
  };

  const handleToggleTool = (tool: string) => {
    if (selectedTools.includes(tool)) {
      setSelectedTools(selectedTools.filter((t) => t !== tool));
    } else {
      setSelectedTools([...selectedTools, tool]);
    }
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: TechnicianLog = {
      id: `tech-log-${Date.now()}`,
      logNo: `LOG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      technicianName: technicianName.trim() || 'Technician',
      deviceModel: deviceModel.trim() || 'Android Device',
      imeiOrSerial: imeiOrSerial.trim() || 'N/A',
      customerName: customerName.trim() || (lang === 'bn' ? 'সাধারণ গ্রাহক' : 'Customer'),
      customerPhone: customerPhone.trim() || 'N/A',
      issueDescription: issueDescription.trim() || (lang === 'bn' ? 'লক ও ডায়াগনস্টিক সার্ভিস' : 'Lock diagnosis'),
      toolsUsed: selectedTools.length > 0 ? selectedTools : ['Manual Recovery'],
      actionTaken: actionTaken.trim() || 'Successfully verified and recovered.',
      unlockNotes: unlockNotes.trim() || 'Legitimate ownership checked.',
      status,
      serviceFee: Number(serviceFee),
      timestamp: new Date().toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    };

    saveLogs([newLog, ...logs]);
    setIsModalOpen(false);

    // Reset some form fields
    setCustomerName('');
    setCustomerPhone('');
    setImeiOrSerial('');
    setIssueDescription('');
    setActionTaken('');
    setUnlockNotes('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm(lang === 'bn' ? 'আপনি কি এই লগ এন্ট্রিটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this log?')) {
      const updated = logs.filter((l) => l.id !== id);
      saveLogs(updated);
    }
  };

  const handleExportCsv = () => {
    const headers = ['Log No', 'Date', 'Technician', 'Device', 'IMEI', 'Customer', 'Phone', 'Tools Used', 'Status', 'Fee (BDT)'];
    const rows = logs.map((l) => [
      l.logNo,
      `"${l.timestamp}"`,
      `"${l.technicianName}"`,
      `"${l.deviceModel}"`,
      `"${l.imeiOrSerial}"`,
      `"${l.customerName}"`,
      `"${l.customerPhone}"`,
      `"${l.toolsUsed.join(', ')}"`,
      l.status,
      l.serviceFee,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `technician_activity_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered logs
  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      log.deviceModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.imeiOrSerial.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.toolsUsed.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* হেডার ও অ্যাকশন বার */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>{lang === 'bn' ? 'টেকনিশিয়ান অ্যাক্টিভিটি লগ ও আনলক হিস্ট্রি' : 'Technician Activity Log & Unlock Notes'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                  {logs.length} {lang === 'bn' ? 'লগ' : 'Logs'}
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                {lang === 'bn'
                  ? 'ব্যবহৃত টুলস, আনলক নোট ও ডিভাইসের মেরামত কাজের রেকর্ড সংরক্ষণ করুন।'
                  : 'Track tools used, hardware actions, unlock notes, and technician records.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition active:scale-95 cursor-pointer"
              title="Export CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'bn' ? 'CSV এক্সপোর্ট' : 'Export CSV'}</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'bn' ? 'নতুন কাজ যুক্ত করুন' : 'New Job Log'}</span>
            </button>
          </div>
        </div>

        {/* সার্চ ও ফিল্টার বার */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'bn' ? 'মডেল, গ্রাহক, IMEI বা টুল দিয়ে খুঁজুন...' : 'Search by model, customer, IMEI or tool...'}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(['all', 'completed', 'in_progress', 'pending_parts'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-indigo-600/30 border border-indigo-500 text-indigo-300'
                    : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === 'all'
                  ? (lang === 'bn' ? 'সকল' : 'All')
                  : st === 'completed'
                  ? (lang === 'bn' ? 'সম্পন্ন' : 'Done')
                  : st === 'in_progress'
                  ? (lang === 'bn' ? 'চলমান' : 'Running')
                  : (lang === 'bn' ? 'অপেক্ষমাণ' : 'Pending')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* লগ তালিকা */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-sm">
            {lang === 'bn' ? 'কোনো লগ রেকর্ড পাওয়া যায়নি।' : 'No activity logs found matching criteria.'}
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3.5 hover:border-slate-700 transition"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800">
                    {log.logNo}
                  </span>
                  <span className="text-xs text-slate-400">{log.timestamp}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      log.status === 'completed'
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                        : log.status === 'in_progress'
                        ? 'bg-cyan-950/60 text-cyan-300 border-cyan-700/60'
                        : 'bg-amber-950/60 text-amber-300 border-amber-700/60'
                    }`}
                  >
                    {log.status === 'completed'
                      ? (lang === 'bn' ? '✓ সম্পন্ন' : 'Completed')
                      : log.status === 'in_progress'
                      ? (lang === 'bn' ? '⏳ চলমান' : 'In Progress')
                      : (lang === 'bn' ? '⚠️ পার্টস বাকি' : 'Pending Parts')}
                  </span>

                  <button
                    onClick={() => handleDelete(log.id)}
                    className="p-1 rounded-lg hover:bg-rose-950/50 text-slate-500 hover:text-rose-400 transition"
                    title="Delete log"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* ডিভাইসের ও কাস্টমার তথ্য */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-400 block text-[11px]">{lang === 'bn' ? 'ডিভাইস ও আইএমইআই' : 'Device & IMEI'}</span>
                  <span className="font-bold text-white block mt-0.5">{log.deviceModel}</span>
                  <span className="text-[11px] font-mono text-slate-400">{log.imeiOrSerial}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">{lang === 'bn' ? 'গ্রাহক ও টেকনিশিয়ান' : 'Customer & Tech'}</span>
                  <span className="font-semibold text-white block mt-0.5">{log.customerName} ({log.customerPhone})</span>
                  <span className="text-[11px] text-indigo-400">টেক: {log.technicianName}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">{lang === 'bn' ? 'সমস্যার ধরন ও বিল' : 'Issue & Fee'}</span>
                  <span className="font-semibold text-slate-200 block mt-0.5">{log.issueDescription}</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">৳{log.serviceFee} বিল</span>
                </div>
              </div>

              {/* ব্যবহৃত টুলস পিলস */}
              <div>
                <span className="text-[11px] font-medium text-slate-400 block mb-1.5">
                  {lang === 'bn' ? 'ব্যবহৃত টুলস ও মেথড:' : 'Tools & Methods Used:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {log.toolsUsed.map((tool, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-700/80 text-[11px] text-slate-300 font-mono"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* অ্যাকশন ও আনলক নোটস */}
              <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 text-xs space-y-1">
                <div>
                  <span className="font-bold text-slate-300">{lang === 'bn' ? 'গৃহীত পদক্ষেপ: ' : 'Action Taken: '}</span>
                  <span className="text-slate-300">{log.actionTaken}</span>
                </div>
                <div>
                  <span className="font-bold text-amber-400">{lang === 'bn' ? 'আনলক ও ভেরিফিকেশন নোট: ' : 'Unlock Note: '}</span>
                  <span className="text-slate-400">{log.unlockNotes}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* নতুন কাজ যুক্ত করার মোডাল */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                <span>{lang === 'bn' ? 'নতুন টেকনিশিয়ান কাজ ও আনলক লগ' : 'Add Technician Activity Log'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLog} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">{lang === 'bn' ? 'টেকনিশিয়ান নাম' : 'Technician Name'}</label>
                  <input
                    type="text"
                    required
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">{lang === 'bn' ? 'ডিভাইস মডেল' : 'Device Model'}</label>
                  <input
                    type="text"
                    required
                    value={deviceModel}
                    onChange={(e) => setDeviceModel(e.target.value)}
                    placeholder="Vivo Y21 / Galaxy A12..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">{lang === 'bn' ? 'IMEI বা সিরিয়াল নং' : 'IMEI or Serial'}</label>
                  <input
                    type="text"
                    value={imeiOrSerial}
                    onChange={(e) => setImeiOrSerial(e.target.value)}
                    placeholder="864201045239105"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">{lang === 'bn' ? 'গ্রাহকের নাম ও ফোন' : 'Customer Info'}</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={lang === 'bn' ? 'নাম ও ফোন নম্বর' : 'Name and phone'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* সমস্যা বিবরণ */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{lang === 'bn' ? 'সমস্যার ধরন ও বিবরণ' : 'Problem / Issue'}</label>
                <input
                  type="text"
                  required
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমন: প্যাটার্ন লক রিকভারি, হ্যাং অন লোগো' : 'Pattern lock, Bootloop...'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* টুলস নির্বাচন */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">{lang === 'bn' ? 'ব্যবহৃত টুলস নির্বাচন করুন:' : 'Select Tools Used:'}</label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_TOOLS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleToggleTool(t)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                        selectedTools.includes(t)
                          ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* অ্যাকশন ও আনলক নোটস */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">{lang === 'bn' ? 'গৃহীত কারিগরি পদক্ষেপ' : 'Action Taken'}</label>
                  <textarea
                    rows={2}
                    value={actionTaken}
                    onChange={(e) => setActionTaken(e.target.value)}
                    placeholder={lang === 'bn' ? 'ক্যাশে ক্লিয়ার, হার্ডওয়্যার কী সিকোয়েন্স...' : 'Hardware key combo, clear cache...'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">{lang === 'bn' ? 'মালিকানা যাচাই ও নোট' : 'Ownership & Unlock Notes'}</label>
                  <textarea
                    rows={2}
                    value={unlockNotes}
                    onChange={(e) => setUnlockNotes(e.target.value)}
                    placeholder={lang === 'bn' ? 'ক্যাশমেমো যাচাইকৃত, ডেটা অক্ষত...' : 'Receipt checked, data preserved...'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* স্ট্যাটাস ও সার্ভিস ফি */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">{lang === 'bn' ? 'কাজের স্ট্যাটাস' : 'Status'}</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="completed">সম্পন্ন (Completed)</option>
                    <option value="in_progress">চলমান (In Progress)</option>
                    <option value="pending_parts">পার্টসের অপেক্ষায় (Pending Parts)</option>
                    <option value="cancelled">বাতিল (Cancelled)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">{lang === 'bn' ? 'সার্ভিস ফি (৳)' : 'Service Fee (৳)'}</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={serviceFee}
                    onChange={(e) => setServiceFee(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* সাবমিট বাটন */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30"
                >
                  {lang === 'bn' ? 'লগ সংরক্ষণ করুন' : 'Save Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
