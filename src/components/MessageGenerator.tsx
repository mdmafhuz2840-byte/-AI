import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Copy, 
  Check, 
  Smartphone, 
  Share2, 
  Sparkles, 
  RotateCcw,
  CheckCircle2,
  Calendar,
  CreditCard,
  Wrench,
  ShieldAlert
} from 'lucide-react';
import { Language } from '../utils/translations';

interface MessageGeneratorProps {
  lang: Language;
}

type TemplateCategory = 
  | 'installment_due' 
  | 'payment_received' 
  | 'repair_received' 
  | 'repair_ready' 
  | 'unlock_completed' 
  | 'data_warning';

export const MessageGenerator: React.FC<MessageGeneratorProps> = ({ lang }) => {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('installment_due');
  const [customerName, setCustomerName] = useState('মোহাম্মদ রহিম');
  const [customerPhone, setCustomerPhone] = useState('01712345678');
  const [deviceModel, setDeviceModel] = useState('Vivo Y21');
  const [amount, setAmount] = useState('3500');
  const [dueDate, setDueDate] = useState('২৫ অক্টোবর ২০২৬');
  const [ticketNo, setTicketNo] = useState('MDR-2026-8812');
  const [shopName, setShopName] = useState('মাহফুজ ডিভাইস সার্ভিস হাব');
  const [shopHotline, setShopHotline] = useState('01800000000');
  const [copied, setCopied] = useState(false);

  // Template definitions
  const buildMessage = (category: TemplateCategory, language: Language): string => {
    const isBn = language === 'bn';

    switch (category) {
      case 'installment_due':
        return isBn
          ? `আসসালামু আলাইকুম ${customerName} সাহেব, ${shopName} থেকে বিনীতভাবে জানানো যাচ্ছে যে, আপনার ${deviceModel} ফোনটির কিস্তি বাবদ ৳${amount} আগামী ${dueDate} তারিখের মধ্যে পরিশোধের জন্য অনুরোধ করা হলো। বিকাশ/নগদ বা শপে এসে সরাসরি পরিশোধ করতে পারেন। হটলাইন: ${shopHotline}। ধন্যবাদ!`
          : `Dear ${customerName}, this is a gentle reminder from ${shopName} that an installment of BDT ${amount} for your ${deviceModel} is due on ${dueDate}. Please complete payment via bKash/Nagad or visit our shop. Support: ${shopHotline}. Thank you!`;

      case 'payment_received':
        return isBn
          ? `প্রিয় ${customerName}, ${shopName} এ আপনার ${deviceModel} ফোনের কিস্তির ৳${amount} সফলভাবে গৃহীত হয়েছে। রসিদ নং: ${ticketNo}। সময়মতো পরিশোধের জন্য আন্তরিক ধন্যবাদ। যেকোনো প্রয়োজনে যোগাযোগ: ${shopHotline}।`
          : `Dear ${customerName}, payment of BDT ${amount} for ${deviceModel} has been successfully received at ${shopName}. Receipt No: ${ticketNo}. Thank you for your timely payment. Hotline: ${shopHotline}.`;

      case 'repair_received':
        return isBn
          ? `প্রিয় ${customerName}, আপনার ${deviceModel} ফোনটি সার্ভিসিং ও মেরামতের জন্য সফলভাবে গ্রহণ করা হয়েছে। জব ট্র্যাকিং নং: ${ticketNo}। আমাদের টেকনিশিয়ান কাজ শেষ করার পর আপনাকে অবগত করবেন। সার্ভিস হাব: ${shopName}, ফোন: ${shopHotline}।`
          : `Dear ${customerName}, your ${deviceModel} has been received for service. Job Ticket: ${ticketNo}. We will notify you once diagnosis is completed. ${shopName}, Hotline: ${shopHotline}.`;

      case 'repair_ready':
        return isBn
          ? `শুভ সংবাদ ${customerName} সাহেব! আপনার ${deviceModel} ফোনটির মেরামত ও টেস্টিং সফলভাবে সম্পন্ন হয়েছে। নির্ধারিত সার্ভিস বিল ৳${amount}। শপ থেকে আপনার ফোনটি সংগ্রহ করার জন্য অনুরোধ করা হলো। ${shopName}, যোগাযোগ: ${shopHotline}।`
          : `Good news ${customerName}! Your ${deviceModel} repair and quality check are complete and ready for pickup. Total Bill: BDT ${amount}. Please collect your device from ${shopName}. Phone: ${shopHotline}.`;

      case 'unlock_completed':
        return isBn
          ? `সম্মানিত ${customerName}, আপনার ${deviceModel} ফোনের অফিশিয়াল পাসওয়ার্ড/রিকভারি সার্ভিস সফলভাবে সম্পন্ন করা হয়েছে। ক্যাশমেমো ও এনআইডি কপি প্রদর্শন করে ডিভাইসটি বুঝে নিন। সার্ভিস হাব: ${shopName}, ফোন: ${shopHotline}।`
          : `Dear ${customerName}, legitimate recovery for your ${deviceModel} is complete. Please collect your device with original purchase receipt. ${shopName}, Hotline: ${shopHotline}.`;

      case 'data_warning':
        return isBn
          ? `জরুরি সতর্কতা: প্রিয় ${customerName}, আপনার ${deviceModel} ফোনে ফ্যাক্টরি রিসেট বা হার্ডওয়্যার রিকভারির পূর্বে গুগল অ্যাকাউন্ট (FRP) ক্রেডেনশিয়াল ও ব্যাকআপ নিশ্চিত করুন। রিসেট করলে ফোনের অভ্যন্তরীণ সকল ডেটা মুছে যাবে। সহায়তা: ${shopHotline}।`
          : `Security Alert: Dear ${customerName}, before performing recovery on your ${deviceModel}, please verify Google account credentials. A factory reset will erase all internal device data. Helpline: ${shopHotline}.`;
    }
  };

  const currentMessage = buildMessage(selectedCategory, lang);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const sanitizedPhone = customerPhone.replace(/\D/g, '');
    const intlPhone = sanitizedPhone.startsWith('0') ? `88${sanitizedPhone}` : sanitizedPhone;
    const url = `https://wa.me/${intlPhone}?text=${encodeURIComponent(currentMessage)}`;
    window.open(url, '_blank');
  };

  const handleOpenSms = () => {
    const url = `sms:${customerPhone}?body=${encodeURIComponent(currentMessage)}`;
    window.location.href = url;
  };

  const categories = [
    { id: 'installment_due', labelBn: 'কিস্তি বকেয়া তাগাদা', labelEn: 'Installment Due Reminder', icon: CreditCard },
    { id: 'payment_received', labelBn: 'পেমেন্ট গ্রহণ কনফার্ম', labelEn: 'Payment Received', icon: CheckCircle2 },
    { id: 'repair_received', labelBn: 'মেরামত গ্রহণ রসিদ', labelEn: 'Job Ticket Received', icon: Wrench },
    { id: 'repair_ready', labelBn: 'মেরামত ডেলিভারি প্রস্তুত', labelEn: 'Ready for Pickup', icon: Sparkles },
    { id: 'unlock_completed', labelBn: 'বৈধ আনলক সম্পন্ন', labelEn: 'Unlock Completed', icon: Smartphone },
    { id: 'data_warning', labelBn: 'ডেটা ও ব্যাকআপ নোটিশ', labelEn: 'Data Loss Warning', icon: ShieldAlert },
  ];

  return (
    <div className="space-y-6">
      {/* হেডার */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span>{lang === 'bn' ? 'স্বয়ংক্রিয় SMS ও WhatsApp টেমপ্লেট জেনারেটর' : 'Automated SMS & WhatsApp Message Generator'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-700/50">
                1-Click Send
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {lang === 'bn'
                ? 'কিস্তির তাগাদা, পেমেন্ট প্রাপ্তি এবং রিপেয়ার স্ট্যাটাসের স্বয়ংক্রিয় মেসেজ প্রস্তুত করুন।'
                : 'Instantly generate customer reminders, receipts, and repair status messages.'}
            </p>
          </div>
        </div>

        {/* ক্যাটাগরি পিলস বাটন */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id as TemplateCategory)}
                className={`p-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer text-left ${
                  isSelected
                    ? 'bg-teal-600/20 border-teal-500 text-teal-300 shadow-md shadow-teal-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-teal-400' : 'text-slate-400'}`} />
                <span className="truncate">{lang === 'bn' ? cat.labelBn : cat.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* ভ্যারিয়েবল কাস্টমাইজেশন ফিল্ড */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
          <span className="text-xs font-bold text-slate-300 block">
            {lang === 'bn' ? 'গ্রাহক ও মেসেজ তথ্য কাস্টমাইজ করুন:' : 'Customize Customer & Message Details:'}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">{lang === 'bn' ? 'গ্রাহকের নাম' : 'Customer Name'}</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">{lang === 'bn' ? 'গ্রাহকের মোবাইল' : 'Phone Number'}</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">{lang === 'bn' ? 'ফোনের মডেল' : 'Device Model'}</label>
              <input
                type="text"
                value={deviceModel}
                onChange={(e) => setDeviceModel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">{lang === 'bn' ? 'টাকার পরিমাণ (৳)' : 'Amount (৳)'}</label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">{lang === 'bn' ? 'বিল/রসিদ/টিকেট নং' : 'Ticket/Receipt No'}</label>
              <input
                type="text"
                value={ticketNo}
                onChange={(e) => setTicketNo(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">{lang === 'bn' ? 'শেষ তারিখ / সময়' : 'Due Date'}</label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* লাইভ মেসেজ প্রিভিউ */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'জেনারেটকৃত লাইভ মেসেজ প্রিভিউ:' : 'Generated Live Message Preview:'}</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {currentMessage.length} {lang === 'bn' ? 'অক্ষর' : 'chars'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-teal-500/30 text-white font-sans text-xs sm:text-sm leading-relaxed whitespace-pre-wrap select-all">
            {currentMessage}
          </div>
        </div>

        {/* অ্যাকশন বাটনসমূহ (WhatsApp, SMS, কপি) */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition active:scale-95 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
            <span>{copied ? (lang === 'bn' ? 'কপি সম্পন্ন!' : 'Copied!') : (lang === 'bn' ? 'মেসেজ কপি' : 'Copy Message')}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenSms}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 transition active:scale-95 shadow-md shadow-cyan-600/20 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{lang === 'bn' ? 'সরাসরি SMS পাঠান' : 'Send SMS'}</span>
            </button>

            <button
              onClick={handleOpenWhatsApp}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 transition active:scale-95 shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{lang === 'bn' ? 'WhatsApp এ পাঠান' : 'Open WhatsApp'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
