import React, { useState } from 'react';
import { 
  MessageSquareWarning, 
  FileText, 
  Copy, 
  Check, 
  Printer, 
  ShieldCheck, 
  Plus, 
  X, 
  Trash2,
  RefreshCw,
  Share2
} from 'lucide-react';
import { Language, t } from '../utils/translations';
import { ComplaintTicket } from '../types/recovery';
import { INITIAL_COMPLAINTS } from '../data/mockData';

interface ComplaintAssistanceProps {
  lang: Language;
}

export const ComplaintAssistance: React.FC<ComplaintAssistanceProps> = ({ lang }) => {
  const strings = t[lang];

  const [complaints, setComplaints] = useState<ComplaintTicket[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mdr_complaints');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_COMPLAINTS;
  });

  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<ComplaintTicket | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'under_review' | 'resolved'>('all');

  // অভিযোগ তৈরির ফর্ম স্টেট
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [deviceModel, setDeviceModel] = useState('Vivo Y21');
  const [imei, setImei] = useState('');
  const [dealerName, setDealerName] = useState('স্মার্টফোন শোরুম ও ডিলার পয়েন্ট');
  const [receiptNo, setReceiptNo] = useState('REC-2026-1042');
  const [clearanceDate, setClearanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [amountPaid, setAmountPaid] = useState('15,500');
  const [daysLocked, setDaysLocked] = useState('৩');

  const saveComplaints = (updated: ComplaintTicket[]) => {
    setComplaints(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mdr_complaints', JSON.stringify(updated));
    }
  };

  // জেনারেট হওয়া আনুষ্ঠানিক ড্রাফট টেক্সট
  const generateFormalDraft = () => {
    if (lang === 'bn') {
      return `বরাবর,
ব্যবস্থাপক / কাস্টমার কেয়ার প্রধান
${dealerName || 'অনুমোদিত ডিলার/বিক্রেতা প্রতিষ্ঠান'}

বিষয়: কিস্তি সম্পূর্ণ পরিশোধ সত্ত্বেও হ্যান্ডসেট (${deviceModel}) আনলক না হওয়া প্রসঙ্গে অভিযোগ ও প্রতিকার প্রার্থনা।

মহোদয়,
বিনীত নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী ${customerName || '[গ্রাহকের নাম]'}, মোবাইল নং: ${phone || '[ফোন নম্বর]'}। আপনার শোরুম/প্রতিষ্ঠান থেকে কিস্তির সুবিধায় একটি ${deviceModel} হ্যান্ডসেট (IMEI: ${imei || '[IMEI নম্বর]'}) ক্রয় করেছিলাম।

আমি অত্র হ্যান্ডসেটের সমুদয় কিস্তি ও বকেয়া অর্থ (মোট ৳ ${amountPaid}) গত ${clearanceDate} তারিখে যথাযথ রশিদের (রশিদ নং: ${receiptNo}) মাধ্যমে সম্পূর্ণ পরিশোধ করেছি। 

কিন্তু অত্যন্ত পরিতাপের বিষয় এই যে, কিস্তি পরিশোধের পর ${daysLocked} দিন অতিবাহিত হলেও ডিভাইসের ফাইন্যান্স/কিস্তির লক (Device Locked) দূর করা হয়নি। ফলে আমি হ্যান্ডসেটটি ব্যবহার করতে পারছি না, যা ভোক্তা অধিকারের স্পষ্ট লঙ্ঘন।

এমতাবস্থায়, অবিলম্বে ক্লাউড সার্ভার হতে উক্ত ডিভাইসের লক মুক্ত করার জন্য এবং হ্যান্ডসেটটি সচল করার জন্য আপনার সুবিবেচনা ও দ্রুত কার্যকর পদক্ষেপ গ্রহণের বিনীত অনুরোধ জানাচ্ছি।

বিনীত,
${customerName || '[গ্রাহকের নাম]'}
ফোন: ${phone || '[ফোন নম্বর]'}
তারিখ: ${new Date().toLocaleDateString('bn-BD')}
সংযুক্তি: কিস্তির পরিশোধিত ক্যাশ মেমো ও ট্রানজেকশন স্লিপ।`;
    }

    return `To,
The Branch Manager / Customer Service Authority
${dealerName || 'Authorized Smartphone Retailer / Finance Provider'}

Subject: Formal complaint regarding failure to remove device lock after complete installment settlement.

Dear Sir/Madam,
I, the undersigned ${customerName || '[Customer Name]'}, Phone: ${phone || '[Phone Number]'}, purchased a ${deviceModel} handset (IMEI: ${imei || '[IMEI Number]'}) under an installment contract.

I have completely cleared all installment dues totaling BDT ${amountPaid} on ${clearanceDate} against official receipt number ${receiptNo}.

However, despite clearing all liabilities ${daysLocked} days ago, the handset remains restricted by the Finance/Device Lock, rendering it completely inoperable.

Therefore, I formally request your prompt intervention to send the remote unlock clearance signal to remove the restriction immediately.

Sincerely,
${customerName || '[Customer Name]'}
Contact: ${phone || '[Phone Number]'}
Date: ${new Date().toLocaleDateString()}
Enclosure: Verified payment receipt and transaction clearance slips.`;
  };

  // ফর্ম সাবমিট ও টিকিট সংরক্ষণ
  const handleSaveComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone) return;

    const newTicketNo = `MDR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullText = generateFormalDraft();

    const newTicket: ComplaintTicket = {
      id: `comp-${Date.now()}`,
      ticketNo: newTicketNo,
      customerName: customerName.trim(),
      phone: phone.trim(),
      deviceModel: deviceModel.trim(),
      issueType: 'emi_lock',
      description: fullText,
      status: 'submitted',
      submittedDate: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0],
      resolutionNote: 'আনুষ্ঠানিক ড্রাফট প্রস্তুত ও ডিলার নোটিশে সংরক্ষিত।',
    };

    const updated = [newTicket, ...complaints];
    saveComplaints(updated);

    setSelectedTicket(newTicket);
    setIsDraftModalOpen(false);
  };

  // স্ট্যাটাস পরিবর্তন
  const handleToggleStatus = (id: string) => {
    const statusCycle: ComplaintTicket['status'][] = ['submitted', 'under_review', 'resolved'];
    const updated = complaints.map((t) => {
      if (t.id === id) {
        const nextIndex = (statusCycle.indexOf(t.status) + 1) % statusCycle.length;
        const newStatus = statusCycle[nextIndex];
        return {
          ...t,
          status: newStatus,
          updatedDate: new Date().toISOString().split('T')[0],
          resolutionNote:
            newStatus === 'resolved'
              ? 'ডিভাইসের লক সফলভাবে ক্লিয়ার ও সমাধান সম্পন্ন হয়েছে।'
              : newStatus === 'under_review'
              ? 'ডিলার সার্ভারে যাচাইয়ের জন্য পাঠানো হয়েছে।'
              : 'প্রাথমিক অভিযোগ দাখিল সম্পন্ন।',
        };
      }
      return t;
    });

    saveComplaints(updated);
    if (selectedTicket?.id === id) {
      const u = updated.find((x) => x.id === id);
      if (u) setSelectedTicket(u);
    }
  };

  // অভিযোগ মুছে ফেলা
  const handleDeleteComplaint = (id: string) => {
    const updated = complaints.filter((c) => c.id !== id);
    saveComplaints(updated);
    setDeleteConfirmId(null);
    if (selectedTicket?.id === id) setSelectedTicket(null);
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredComplaints = complaints.filter((t) => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  return (
    <div className="space-y-5 animate-fade-in pb-16">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <MessageSquareWarning className="w-5 h-5 text-amber-400" />
            <span>{strings.complaintsTitle}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {strings.complaintsSubtitle}
          </p>
        </div>

        <button
          onClick={() => setIsDraftModalOpen(true)}
          type="button"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-amber-600/20 transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{strings.newComplaintBtn}</span>
        </button>
      </div>

      {/* নির্দেশনামূলক পরামর্শ ব্যানার */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1.5">
        <h4 className="font-bold text-white flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{lang === 'bn' ? 'ভোক্তা অধিকার ও আইনি সুরক্ষার নিয়ম' : 'Consumer Rights Advisory'}</span>
        </h4>
        <p className="text-slate-400 leading-relaxed">
          {lang === 'bn'
            ? 'কিস্তি পরিশোধের পর যদি বিক্রেতা ফোন আনলক না করে, তবে ফোনে কোনো অননুমোদিত ফ্ল্যাশ না দিয়ে লিখিত অভিযোগ দাখিল করুন। ভোক্তা অধিকার সংরক্ষণ অধিদপ্তরে এই অভিযোগপত্র সরাসরি প্রামাণ্য দলিল হিসেবে গ্রহণযোগ্য।'
            : 'If a merchant fails to unlock an EMI-cleared handset, do not attempt unauthorized firmware tampering. Submitting this structured formal grievance serves as verified proof for consumer arbitration.'}
        </p>
      </div>

      {/* ফিল্টার বার */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
            statusFilter === 'all'
              ? 'bg-amber-600 text-white border-amber-500'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
        >
          সব ({complaints.length})
        </button>
        <button
          onClick={() => setStatusFilter('submitted')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
            statusFilter === 'submitted'
              ? 'bg-amber-600 text-white border-amber-500'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
        >
          দাখিলকৃত
        </button>
        <button
          onClick={() => setStatusFilter('under_review')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
            statusFilter === 'under_review'
              ? 'bg-cyan-600 text-white border-cyan-500'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
        >
          পর্যালোচনায়
        </button>
        <button
          onClick={() => setStatusFilter('resolved')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
            statusFilter === 'resolved'
              ? 'bg-emerald-600 text-white border-emerald-500'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
        >
          সমাধানকৃত
        </button>
      </div>

      {/* বিদ্যমান অভিযোগ তালিকা */}
      <div className="space-y-3">
        {filteredComplaints.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-3xl text-slate-400 text-xs">
            {lang === 'bn' ? 'কোনো অভিযোগ সংরক্ষিত নেই।' : 'No complaints found.'}
          </div>
        ) : (
          filteredComplaints.map((ticket) => (
            <div
              key={ticket.id}
              className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-3 shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/40 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                      {ticket.ticketNo}
                    </span>
                    <button
                      onClick={() => handleToggleStatus(ticket.id)}
                      type="button"
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold cursor-pointer border flex items-center gap-1 transition ${
                        ticket.status === 'resolved'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : ticket.status === 'under_review'
                          ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      }`}
                      title="স্ট্যাটাস পরিবর্তন করতে ক্লিক করুন"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      <span>
                        {ticket.status === 'resolved'
                          ? (lang === 'bn' ? 'সমাধানকৃত' : 'Resolved')
                          : ticket.status === 'under_review'
                          ? (lang === 'bn' ? 'পর্যালোচনায়' : 'Under Review')
                          : (lang === 'bn' ? 'দাখিলকৃত' : 'Submitted')}
                      </span>
                    </button>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-white mt-1.5">
                    {ticket.customerName} • {ticket.deviceModel}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    দাখিলের তারিখ: {ticket.submittedDate} • ফোন: {ticket.phone}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    type="button"
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition active:scale-95 flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === 'bn' ? 'চিঠি দেখুন' : 'View Letter'}</span>
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(ticket.id)}
                    type="button"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition cursor-pointer"
                    title="মুছুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* মুছে ফেলার কনফার্মেশন */}
              {deleteConfirmId === ticket.id && (
                <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/40 flex items-center justify-between text-xs text-rose-200">
                  <span>আপনি কি এই অভিযোগটি মুছে ফেলতে চান?</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteComplaint(ticket.id)}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px]"
                    >
                      হ্যাঁ, মুছুন
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px]"
                    >
                      বাতিল
                    </button>
                  </div>
                </div>
              )}

              {ticket.resolutionNote && (
                <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 bg-slate-950/50 p-2.5 rounded-2xl">
                  <span className="font-semibold text-slate-300 block mb-0.5">সর্বশেষ অবস্থা / নোট:</span>
                  <p className="text-[11px] text-slate-400">{ticket.resolutionNote}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* অভিযোগ তৈরির ফর্ম মডাল */}
      {isDraftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 text-slate-200 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsDraftModalOpen(false)}
              type="button"
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <MessageSquareWarning className="w-5 h-5 text-amber-400" />
              <span>আইনি ও আনুষ্ঠানিক অভিযোগ প্রস্তুত করুন</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              নিচের তথ্যগুলো দিন, সিস্টেম স্বয়ংক্রিয়ভাবে একটি বিধিসম্মত আনুষ্ঠানিক অভিযোগপত্র তৈরি করবে। কোনো পাসওয়ার্ড বা সংবেদনশীল ডেটা প্রয়োজন নেই।
            </p>

            <form onSubmit={handleSaveComplaint} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">গ্রাহকের নাম *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="যেমন: মো: নাজমুল হুদা"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">মোবাইল নম্বর *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="019xxxxxxxx"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ডিভাইস মডেল</label>
                  <input
                    type="text"
                    value={deviceModel}
                    onChange={(e) => setDeviceModel(e.target.value)}
                    placeholder="Vivo Y21"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">IMEI নম্বর</label>
                  <input
                    type="text"
                    maxLength={15}
                    value={imei}
                    onChange={(e) => setImei(e.target.value)}
                    placeholder="8642190..."
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ডিলার / শো-রুমের নাম</label>
                  <input
                    type="text"
                    value={dealerName}
                    onChange={(e) => setDealerName(e.target.value)}
                    placeholder="স্মার্টফোন গ্যাজেট পয়েন্ট"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">পরিশোধিত রশিদ নম্বর</label>
                  <input
                    type="text"
                    value={receiptNo}
                    onChange={(e) => setReceiptNo(e.target.value)}
                    placeholder="REC-2026-1042"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">মোট পরিশোধ (৳)</label>
                  <input
                    type="text"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="15,500"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">পরিশোধের তারিখ</label>
                  <input
                    type="date"
                    value={clearanceDate}
                    onChange={(e) => setClearanceDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">লক থাকার দিন</label>
                  <input
                    type="number"
                    value={daysLocked}
                    onChange={(e) => setDaysLocked(e.target.value)}
                    placeholder="3"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDraftModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-amber-600/30"
                >
                  অভিযোগপত্র তৈরি ও সংরক্ষণ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* অভিযোগ চিঠি প্রিভিউ ও প্রিন্ট মডাল */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 text-slate-200 shadow-2xl my-8 max-h-[90vh] overflow-y-auto print:bg-white print:text-black print:border-none print:shadow-none">
            <button
              onClick={() => setSelectedTicket(null)}
              type="button"
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 print:border-black print:text-black">
                রেফারেন্স আইডি: {selectedTicket.ticketNo}
              </span>
              <span className="text-xs text-slate-400">
                তারিখ: {selectedTicket.submittedDate}
              </span>
            </div>

            {/* চিঠির ফরম্যাট */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 font-sans text-xs sm:text-sm whitespace-pre-wrap leading-relaxed text-slate-200 print:bg-white print:text-black print:border-none">
              {selectedTicket.description}
            </div>

            {/* অ্যাকশন বাটনসমূহ */}
            <div className="mt-4 flex flex-wrap justify-end gap-2 print:hidden">
              <button
                onClick={() => copyText(selectedTicket.description)}
                type="button"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'কপি হয়েছে' : 'চিঠি কপি করুন'}</span>
              </button>

              <button
                onClick={() => window.print()}
                type="button"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>প্রিন্ট / সেভ করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
