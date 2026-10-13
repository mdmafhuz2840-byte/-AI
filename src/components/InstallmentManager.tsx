import React, { useState } from 'react';
import { 
  Receipt, 
  Search, 
  Plus, 
  CheckCircle, 
  Clock, 
  Printer, 
  Smartphone, 
  X, 
  Phone, 
  Share2,
  Trash2,
  Copy,
  Check,
  Filter
} from 'lucide-react';
import { Language, t } from '../utils/translations';
import { InstallmentRecord } from '../types/recovery';
import { INITIAL_INSTALLMENTS } from '../data/mockData';

interface InstallmentManagerProps {
  lang: Language;
}

export const InstallmentManager: React.FC<InstallmentManagerProps> = ({ lang }) => {
  const strings = t[lang];

  // রেকর্ড তালিকা স্টেট
  const [installments, setInstallments] = useState<InstallmentRecord[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mdr_installments');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_INSTALLMENTS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<InstallmentRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activePlanForPayment, setActivePlanForPayment] = useState<InstallmentRecord | null>(null);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // নতুন কিস্তির ফর্ম স্টেট
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDeviceModel, setNewDeviceModel] = useState('Vivo Y21');
  const [newImei, setNewImei] = useState('');
  const [newTotalPrice, setNewTotalPrice] = useState<number>(15500);
  const [newDownPayment, setNewDownPayment] = useState<number>(5000);
  const [newTotalInstallments, setNewTotalInstallments] = useState<number>(6);

  // পেমেন্ট এন্ট্রি স্টেট
  const [paymentAmount, setPaymentAmount] = useState<number>(1750);
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Cash' | 'Bank'>('bKash');
  const [paymentNote, setPaymentNote] = useState('');

  // লোকাল স্টোরেজে সেভ
  const saveInstallments = (updated: InstallmentRecord[]) => {
    setInstallments(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mdr_installments', JSON.stringify(updated));
    }
  };

  // ফিল্টার করা তালিকা
  const filteredInstallments = installments.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      item.customerName.toLowerCase().includes(q) ||
      item.phone.includes(q) ||
      item.receiptNo.toLowerCase().includes(q) ||
      item.deviceModel.toLowerCase().includes(q) ||
      item.deviceImeiOrSerial.includes(q);

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && item.status === statusFilter;
  });

  // নতুন কিস্তি রেকর্ড সংরক্ষণ
  const handleCreateInstallment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName || !newPhone) return;

    const remaining = Math.max(0, newTotalPrice - newDownPayment);
    const instAmount = Math.ceil(remaining / (newTotalInstallments || 1));
    const randomReceiptNum = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRecord: InstallmentRecord = {
      id: `inst-${Date.now()}`,
      receiptNo: randomReceiptNum,
      customerName: newCustomerName.trim(),
      phone: newPhone.trim(),
      deviceModel: newDeviceModel,
      deviceImeiOrSerial: newImei.trim() || 'N/A',
      totalPrice: Number(newTotalPrice),
      downPayment: Number(newDownPayment),
      totalInstallments: Number(newTotalInstallments),
      paidInstallments: 0,
      installmentAmount: instAmount,
      lastPaymentDate: new Date().toISOString().split('T')[0],
      nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
      paymentHistory: [
        {
          paymentId: `pay-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          amount: Number(newDownPayment),
          method: 'Cash',
          receivedBy: 'কাউন্টার ম্যানেজার',
          receiptNote: 'ডাউন পেমেন্ট ও হ্যান্ডসেট ডেলিভারি',
        },
      ],
    };

    saveInstallments([newRecord, ...installments]);
    setIsAddModalOpen(false);
    setSelectedReceipt(newRecord);

    setNewCustomerName('');
    setNewPhone('');
    setNewImei('');
  };

  // কিস্তি পেমেন্ট জমা
  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePlanForPayment) return;

    const newPaidCount = activePlanForPayment.paidInstallments + 1;
    const isFinished = newPaidCount >= activePlanForPayment.totalInstallments;

    const updated = installments.map((plan) => {
      if (plan.id === activePlanForPayment.id) {
        return {
          ...plan,
          paidInstallments: newPaidCount,
          status: isFinished ? ('completed' as const) : ('active' as const),
          lastPaymentDate: new Date().toISOString().split('T')[0],
          nextDueDate: isFinished
            ? (lang === 'bn' ? 'সম্পূর্ণ পরিশোধিত' : 'Fully Cleared')
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          paymentHistory: [
            ...plan.paymentHistory,
            {
              paymentId: `pay-${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              amount: Number(paymentAmount),
              method: paymentMethod,
              receivedBy: 'কাউন্টার ক্যাশিয়ার',
              receiptNote: paymentNote || `কিস্তি #${newPaidCount} পরিশোধ`,
            },
          ],
        };
      }
      return plan;
    });

    saveInstallments(updated);
    setIsPaymentModalOpen(false);
    const updatedSelected = updated.find((p) => p.id === activePlanForPayment.id);
    if (updatedSelected) setSelectedReceipt(updatedSelected);
  };

  // রেকর্ড মুছে ফেলা
  const handleDeleteRecord = (id: string) => {
    const updated = installments.filter((item) => item.id !== id);
    saveInstallments(updated);
    setDeleteConfirmId(null);
    if (selectedReceipt?.id === id) setSelectedReceipt(null);
  };

  // রশিদের টেক্সট কপি
  const handleCopyReceiptText = () => {
    if (!selectedReceipt) return;
    const due = Math.max(
      0,
      selectedReceipt.totalPrice -
        (selectedReceipt.downPayment + selectedReceipt.paidInstallments * selectedReceipt.installmentAmount)
    );
    const text = `[MAFHUZ DEVICE RECOVERY - অফিশিয়াল ক্যাশ মেমো]\nরশিদ নং: ${selectedReceipt.receiptNo}\nগ্রাহক: ${selectedReceipt.customerName} (${selectedReceipt.phone})\nডিভাইস: ${selectedReceipt.deviceModel} (IMEI: ${selectedReceipt.deviceImeiOrSerial})\nমোট মূল্য: ৳${selectedReceipt.totalPrice}\nপরিশোধিত কিস্তি: ${selectedReceipt.paidInstallments}/${selectedReceipt.totalInstallments}\nবর্তমান বকেয়া: ৳${due}\nপরবর্তী তারিখ: ${selectedReceipt.nextDueDate}`;
    navigator.clipboard.writeText(text);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2000);
  };

  // রশিদ শেয়ার
  const handleShareReceipt = async () => {
    if (!selectedReceipt || typeof navigator === 'undefined' || !navigator.share) return;
    try {
      await navigator.share({
        title: `রশিদ: ${selectedReceipt.receiptNo}`,
        text: `Mafhuz Device Recovery পেমেন্ট রশিদ: ${selectedReceipt.receiptNo} - গ্রাহক: ${selectedReceipt.customerName}`,
      });
    } catch {}
  };

  return (
    <div className="space-y-5 animate-fade-in pb-16">
      {/* হেডার ও অ্যাকশন বার */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <span>{strings.receiptsTitle}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {strings.receiptsSubtitle}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          type="button"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/20 transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{strings.newPaymentBtn}</span>
        </button>
      </div>

      {/* সার্চ ও ফিল্টার বার */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={strings.searchReceipts}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* ফিল্টার বাটনসমূহ */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setStatusFilter('all')}
            type="button"
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              statusFilter === 'all'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            সব ({installments.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            type="button"
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              statusFilter === 'active'
                ? 'bg-amber-600 text-white border-amber-500'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            চলমান
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            type="button"
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            পরিশোধিত
          </button>
        </div>
      </div>

      {/* কিস্তির কার্ড তালিকা */}
      <div className="space-y-3">
        {filteredInstallments.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-3xl text-slate-400 text-xs">
            {lang === 'bn' ? 'কোনো কিস্তি রেকর্ড পাওয়া যায়নি।' : 'No installment records found.'}
          </div>
        ) : (
          filteredInstallments.map((item) => {
            const totalPaid = item.downPayment + item.paidInstallments * item.installmentAmount;
            const remainingDue = Math.max(0, item.totalPrice - totalPaid);

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-3 shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                        {item.receiptNo}
                      </span>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${
                          item.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {item.status === 'completed'
                          ? (lang === 'bn' ? 'পরিশোধিত' : 'Completed')
                          : (lang === 'bn' ? 'চলমান কিস্তি' : 'Active Plan')}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-white mt-1.5">
                      {item.customerName}
                    </h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span>{item.phone}</span>
                      <span>•</span>
                      <Smartphone className="w-3 h-3 text-slate-500" />
                      <span>{item.deviceModel}</span>
                    </p>
                  </div>

                  {/* বাটনসমূহ */}
                  <div className="flex items-center gap-1.5">
                    {item.status !== 'completed' && (
                      <button
                        onClick={() => {
                          setActivePlanForPayment(item);
                          setPaymentAmount(item.installmentAmount);
                          setIsPaymentModalOpen(true);
                        }}
                        type="button"
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition active:scale-95 cursor-pointer"
                      >
                        {lang === 'bn' ? 'কিস্তি জমা' : 'Pay EMI'}
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedReceipt(item)}
                      type="button"
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition active:scale-95 flex items-center gap-1 cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'রশিদ' : 'Receipt'}</span>
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(item.id)}
                      type="button"
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition cursor-pointer"
                      title="মুছুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* মুছে ফেলার কনফার্মেশন */}
                {deleteConfirmId === item.id && (
                  <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/40 flex items-center justify-between text-xs text-rose-200">
                    <span>আপনি কি এই কিস্তি রেকর্ডটি মুছে ফেলতে চান?</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteRecord(item.id)}
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

                {/* হিসাব ও অগ্রগতি বার */}
                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">{strings.totalPrice}</span>
                    <span className="font-semibold text-slate-200">৳ {item.totalPrice.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">{strings.paidInstallment}</span>
                    <span className="font-semibold text-emerald-400">
                      {item.paidInstallments} / {item.totalInstallments}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">{strings.remainingDue}</span>
                    <span className="font-semibold text-amber-400">৳ {remainingDue.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">{strings.nextDueDate}</span>
                    <span className="font-semibold text-slate-300">{item.nextDueDate}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ২. প্রিন্ট বা ডিজিটাল রশিদ পপআপ */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-5 sm:p-6 text-slate-200 my-8 max-h-[90vh] overflow-y-auto print:bg-white print:text-black print:border-none print:shadow-none">
            <button
              onClick={() => setSelectedReceipt(null)}
              type="button"
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* রশিদের মূল ভাউচার ডিজাইন */}
            <div className="border border-dashed border-slate-700 p-5 rounded-2xl bg-slate-950/70 space-y-4 print:border-black print:bg-white">
              <div className="text-center border-b border-slate-800 pb-3 print:border-black">
                <h3 className="font-extrabold text-base sm:text-lg text-white print:text-black">
                  MAFHUZ DEVICE RECOVERY
                </h3>
                <p className="text-[11px] text-slate-400 print:text-gray-700">
                  স্মার্টফোন কিস্তি ও অফিসিয়াল সার্ভিস ক্যাশ মেমো
                </p>
                <div className="inline-block mt-1 font-mono text-xs px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 print:border-black print:text-black">
                  রশিদ নং: {selectedReceipt.receiptNo}
                </div>
              </div>

              {/* গ্রাহক ও ডিভাইস পরিচিতি */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block print:text-gray-600">গ্রাহকের নাম:</span>
                  <span className="font-bold text-white print:text-black">{selectedReceipt.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block print:text-gray-600">ফোন নম্বর:</span>
                  <span className="font-bold text-white print:text-black">{selectedReceipt.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block print:text-gray-600">ডিভাইস মডেল:</span>
                  <span className="font-semibold text-slate-200 print:text-black">{selectedReceipt.deviceModel}</span>
                </div>
                <div>
                  <span className="text-slate-500 block print:text-gray-600">IMEI / Serial:</span>
                  <span className="font-mono text-slate-300 print:text-black">{selectedReceipt.deviceImeiOrSerial}</span>
                </div>
              </div>

              {/* কিস্তির অর্থসংক্রান্ত সারাংশ */}
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5 print:bg-gray-100 print:border-black">
                <div className="flex justify-between">
                  <span className="text-slate-400 print:text-gray-700">ডিভাইসের মোট মূল্য:</span>
                  <span className="font-bold">৳ {selectedReceipt.totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 print:text-gray-700">ডাউন পেমেন্ট:</span>
                  <span className="font-semibold text-emerald-400 print:text-black">৳ {selectedReceipt.downPayment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 print:text-gray-700">মোট কিস্তি:</span>
                  <span>{selectedReceipt.totalInstallments} টি (প্রতি কিস্তি ৳ {selectedReceipt.installmentAmount})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 print:text-gray-700">পরিশোধিত কিস্তি:</span>
                  <span className="font-bold text-emerald-400 print:text-black">{selectedReceipt.paidInstallments} টি</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800 print:border-black font-bold">
                  <span className="text-amber-300 print:text-black">বর্তমান বকেয়া:</span>
                  <span className="text-amber-400 print:text-black">
                    ৳ {Math.max(0, selectedReceipt.totalPrice - (selectedReceipt.downPayment + selectedReceipt.paidInstallments * selectedReceipt.installmentAmount)).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* লেনদেন ইতিহাস */}
              <div>
                <h5 className="text-xs font-bold text-slate-300 print:text-black mb-1.5">
                  পেমেন্ট ও ভাউচার ইতিহাস:
                </h5>
                <div className="space-y-1 text-[11px]">
                  {selectedReceipt.paymentHistory.map((h, i) => (
                    <div key={i} className="flex justify-between p-1.5 rounded bg-slate-900/40 border border-slate-800/60 print:bg-white print:border-gray-300">
                      <span>{h.date} • {h.method}</span>
                      <span className="font-semibold text-emerald-400 print:text-black">৳ {h.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ফুটার নোট ও স্বাক্ষর */}
              <div className="text-[10px] text-slate-500 pt-3 border-t border-slate-800 print:border-black flex justify-between items-end">
                <div>
                  <p>• কিস্তি পরিশোধের পর ফোন ২৪ ঘণ্টার মধ্যে আনলক না হলে যোগাযোগ করুন।</p>
                  <p>• জেনারেট তারিখ: {new Date().toLocaleDateString('bn-BD')}</p>
                </div>
                <div className="text-center font-mono">
                  <div className="h-6 border-b border-slate-600 w-24 mb-1"></div>
                  <span>অনুমোদিত স্বাক্ষর</span>
                </div>
              </div>
            </div>

            {/* অ্যাকশন বাটনসমূহ */}
            <div className="mt-4 flex flex-wrap justify-end gap-2 print:hidden">
              <button
                onClick={handleCopyReceiptText}
                type="button"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5"
              >
                {copiedReceipt ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedReceipt ? 'কপি হয়েছে' : 'টেক্সট কপি'}</span>
              </button>

              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={handleShareReceipt}
                  type="button"
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5"
                >
                  <Share2 className="w-4 h-4" />
                  <span>শেয়ার</span>
                </button>
              )}

              <button
                onClick={() => window.print()}
                type="button"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>রশিদ প্রিন্ট / সংরক্ষণ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ৩. নতুন কিস্তি তৈরির মডাল */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 text-slate-200 shadow-2xl my-8">
            <button
              onClick={() => setIsAddModalOpen(false)}
              type="button"
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              <span>নতুন কিস্তি ও রসিদ যোগ করুন</span>
            </h3>

            <form onSubmit={handleCreateInstallment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">গ্রাহকের নাম *</label>
                <input
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="যেমন: মো: কামরুল হাসান"
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">মোবাইল নম্বর *</label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="017xxxxxxxx"
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ডিভাইস মডেল</label>
                  <input
                    type="text"
                    value={newDeviceModel}
                    onChange={(e) => setNewDeviceModel(e.target.value)}
                    placeholder="Vivo Y21"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">IMEI (১৫ ডিজিট)</label>
                  <input
                    type="text"
                    maxLength={15}
                    value={newImei}
                    onChange={(e) => setNewImei(e.target.value)}
                    placeholder="8642..."
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">মোট মূল্য (৳)</label>
                  <input
                    type="number"
                    value={newTotalPrice}
                    onChange={(e) => setNewTotalPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ডাউন পেমেন্ট (৳)</label>
                  <input
                    type="number"
                    value={newDownPayment}
                    onChange={(e) => setNewDownPayment(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">মোট কিস্তি সংখ্যা</label>
                  <input
                    type="number"
                    value={newTotalInstallments}
                    onChange={(e) => setNewTotalInstallments(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                >
                  রশিদ তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ৪. কিস্তি জমার পেমেন্ট মডাল */}
      {isPaymentModalOpen && activePlanForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-5 text-slate-200 shadow-2xl">
            <button
              onClick={() => setIsPaymentModalOpen(false)}
              type="button"
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-bold text-white mb-2">
              কিস্তি জমা: {activePlanForPayment.customerName}
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              রশিদ নং: {activePlanForPayment.receiptNo} ({activePlanForPayment.deviceModel})
            </p>

            <form onSubmit={handleAddPayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">জমার পরিমাণ (৳)</label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">পেমেন্ট মাধ্যম</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl cursor-pointer"
                >
                  <option value="bKash">বিকাশ (bKash)</option>
                  <option value="Nagad">নগদ (Nagad)</option>
                  <option value="Cash">নগদ ক্যাশ (Cash Counter)</option>
                  <option value="Bank">ব্যাংক ডিপোজিট (Bank)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">ট্রানজেকশন আইডি বা নোট</label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="TrxID / ভাউচার রেফারেন্স"
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                >
                  জমা নিশ্চিত করুন ও রশিদ আপডেট
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
