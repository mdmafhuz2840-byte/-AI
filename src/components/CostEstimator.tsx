import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Wrench, 
  Smartphone, 
  Battery, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  Printer, 
  Copy, 
  Check, 
  Share2, 
  Tag, 
  Clock, 
  Trash2, 
  FileText,
  RotateCcw
} from 'lucide-react';
import { Language } from '../utils/translations';
import { RepairEstimate } from '../types/recovery';

interface CostEstimatorProps {
  lang: Language;
}

// Preset defaults for common repairs to save technician time
const REPAIR_PRESETS: Record<string, { parts: number; labor: number; time: string }> = {
  'screen_amoled': { parts: 3800, labor: 700, time: '৪৫-৬০ মিনিট' },
  'screen_lcd': { parts: 1600, labor: 500, time: '৩০-৪৫ মিনিট' },
  'battery': { parts: 1200, labor: 400, time: '২০-৩০ মিনিট' },
  'charging_port': { parts: 350, labor: 350, time: '২০-৩০ মিনিট' },
  'motherboard': { parts: 1800, labor: 1200, time: '১-২ দিন' },
  'authorized_flashing': { parts: 0, labor: 800, time: '৩০-৪৫ মিনিট' },
  'back_glass': { parts: 650, labor: 350, time: '৩০-৪০ মিনিট' },
};

export const CostEstimator: React.FC<CostEstimatorProps> = ({ lang }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [brand, setBrand] = useState('Vivo');
  const [model, setModel] = useState('Vivo Y21');
  const [repairCategory, setRepairCategory] = useState<RepairEstimate['repairCategory']>('screen');
  const [partQuality, setPartQuality] = useState<RepairEstimate['partQuality']>('original');
  const [partsCost, setPartsCost] = useState<number>(1800);
  const [laborCost, setLaborCost] = useState<number>(500);
  const [discount, setDiscount] = useState<number>(0);
  const [warranty, setWarranty] = useState('30 দিন');
  const [savedEstimates, setSavedEstimates] = useState<RepairEstimate[]>([]);
  const [activeQuotation, setActiveQuotation] = useState<RepairEstimate | null>(null);
  const [copied, setCopied] = useState(false);

  // Load saved estimates from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mdr_repair_estimates');
      if (stored) {
        setSavedEstimates(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveEstimatesToStorage = (newList: RepairEstimate[]) => {
    setSavedEstimates(newList);
    try {
      localStorage.setItem('mdr_repair_estimates', JSON.stringify(newList));
    } catch {
      // ignore
    }
  };

  // Adjust preset costs when category changes
  const handleCategoryChange = (cat: RepairEstimate['repairCategory']) => {
    setRepairCategory(cat);
    let presetKey = 'screen_lcd';
    if (cat === 'screen') presetKey = partQuality === 'original' || partQuality === 'oled' ? 'screen_amoled' : 'screen_lcd';
    else if (cat === 'battery') presetKey = 'battery';
    else if (cat === 'charging_port') presetKey = 'charging_port';
    else if (cat === 'motherboard') presetKey = 'motherboard';
    else if (cat === 'authorized_flashing') presetKey = 'authorized_flashing';
    else if (cat === 'back_glass') presetKey = 'back_glass';

    const preset = REPAIR_PRESETS[presetKey];
    if (preset) {
      setPartsCost(preset.parts);
      setLaborCost(preset.labor);
    }
  };

  // Calculate totals
  const subtotal = Number(partsCost) + Number(laborCost);
  const total = Math.max(0, subtotal - Number(discount));
  const approximateUsd = (total / 122).toFixed(2); // approx 1 USD = 122 BDT

  const handleGenerateQuotation = () => {
    const estNo = `EST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const quotation: RepairEstimate = {
      id: Date.now().toString(),
      estimateNo: estNo,
      customerName: customerName.trim() || (lang === 'bn' ? 'সাধারণ গ্রাহক' : 'Customer'),
      customerPhone: customerPhone.trim() || 'N/A',
      deviceBrand: brand,
      deviceModel: model,
      repairCategory,
      partQuality,
      partsCost: Number(partsCost),
      laborCost: Number(laborCost),
      discount: Number(discount),
      totalCost: total,
      warrantyPeriod: warranty,
      estimatedTime: '৩০-৬০ মিনিট',
      createdAt: new Date().toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    };

    setActiveQuotation(quotation);
    const updated = [quotation, ...savedEstimates.slice(0, 19)];
    saveEstimatesToStorage(updated);
  };

  const handleCopyQuotation = () => {
    if (!activeQuotation) return;
    const memo = `📋 সার্ভিস এস্টিমেট ও মেরামত কোটেশন
স্লিপ নং: ${activeQuotation.estimateNo}
গ্রাহক: ${activeQuotation.customerName} (${activeQuotation.customerPhone})
ডিভাইস: ${activeQuotation.deviceBrand} ${activeQuotation.deviceModel}
সার্ভিস: ${activeQuotation.repairCategory} (${activeQuotation.partQuality})
পার্টস মূল্য: ৳${activeQuotation.partsCost}
টেকনিশিয়ান চার্জ: ৳${activeQuotation.laborCost}
ডিসকাউন্ট: ৳${activeQuotation.discount}
মোট প্রদেয়: ৳${activeQuotation.totalCost} (~$${(activeQuotation.totalCost / 122).toFixed(2)})
ওয়ারেন্টি: ${activeQuotation.warrantyPeriod}
তারিখ: ${activeQuotation.createdAt}
- Mafhuz Device Recovery & Service Hub`;

    navigator.clipboard.writeText(memo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteEstimate = (id: string) => {
    const filtered = savedEstimates.filter((e) => e.id !== id);
    saveEstimatesToStorage(filtered);
    if (activeQuotation?.id === id) {
      setActiveQuotation(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* হেডার ও ক্যালকুলেটর ফরম */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span>{lang === 'bn' ? 'সার্ভিস চার্জ ও মেরামত খরচ ক্যালকুলেটর' : 'Repair Cost & Service Fee Estimator'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                BDT (৳)
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {lang === 'bn'
                ? 'ডিসপ্লে, ব্যাটারি, চার্জিং পোর্ট ও আনলক সার্ভিসের যন্ত্রাংশ ও টেকনিশিয়ান ফি হিসাব করুন।'
                : 'Calculate spare parts, labor cost, discounts, warranty, and generate formal quotations.'}
            </p>
          </div>
        </div>

        {/* ফর্ম ইনপুট গ্রিড */}
        <div className="mt-5 space-y-4">
          {/* গ্রাহক তথ্য (ঐচ্ছিক) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {lang === 'bn' ? 'গ্রাহকের নাম (ঐচ্ছিক)' : 'Customer Name (Optional)'}
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={lang === 'bn' ? 'যেমন: মোহাম্মদ রহিম' : 'e.g. John Doe'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {lang === 'bn' ? 'মোবাইল নাম্বার (ঐচ্ছিক)' : 'Phone Number (Optional)'}
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* ব্র্যান্ড ও মডেল */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {lang === 'bn' ? 'ডিভাইস ব্র্যান্ড' : 'Device Brand'}
              </label>
              <select
                value={brand}
                onChange={(e) => {
                  setBrand(e.target.value);
                  if (e.target.value === 'Vivo') setModel('Vivo Y21');
                  else if (e.target.value === 'Samsung') setModel('Galaxy A12');
                  else if (e.target.value === 'Xiaomi') setModel('Redmi Note 11');
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="Vivo">Vivo (ভিভো)</option>
                <option value="Samsung">Samsung (স্যামসাং)</option>
                <option value="Xiaomi">Xiaomi / Redmi (শাওমি)</option>
                <option value="Realme">Realme (রিয়েলমি)</option>
                <option value="Oppo">Oppo (অপ্পো)</option>
                <option value="Tecno">Tecno / Infinix (টেকনো)</option>
                <option value="Apple">Apple iPhone</option>
                <option value="Other">অন্যান্য (Other)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {lang === 'bn' ? 'নির্দিষ্ট মডেল' : 'Specific Model'}
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Vivo Y21 / Galaxy A12..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* মেরামত ক্যাটাগরি */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              {lang === 'bn' ? 'মেরামত বা সার্ভিসের ধরন' : 'Repair Category'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'screen', labelBn: 'স্ক্রিন / ডিসপ্লে', labelEn: 'Display Screen' },
                { id: 'battery', labelBn: 'ব্যাটারি পরিবর্তন', labelEn: 'Battery Replace' },
                { id: 'charging_port', labelBn: 'চার্জিং পোর্ট / পিন', labelEn: 'Charging Port' },
                { id: 'motherboard', labelBn: 'মাদারবোর্ড / শর্ট', labelEn: 'Motherboard IC' },
                { id: 'authorized_flashing', labelBn: 'অফিশিয়াল ফ্ল্যাশ/লক', labelEn: 'Firmware Flash' },
                { id: 'back_glass', labelBn: 'ব্যাকগ্লাস / বডি', labelEn: 'Back Housing' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleCategoryChange(item.id as any)}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-medium transition cursor-pointer text-left ${
                    repairCategory === item.id
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  {lang === 'bn' ? item.labelBn : item.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* যন্ত্রাংশ ও লেবার চার্জ ইনপুট */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {lang === 'bn' ? 'যন্ত্রাংশের মূল্য (৳)' : 'Spare Parts Cost (৳)'}
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={partsCost}
                onChange={(e) => setPartsCost(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {lang === 'bn' ? 'টেকনিশিয়ান লেবার ফি (৳)' : 'Technician Labor Fee (৳)'}
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={laborCost}
                onChange={(e) => setLaborCost(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {lang === 'bn' ? 'ডিসকাউন্ট / ছাড় (৳)' : 'Discount (৳)'}
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-emerald-500 text-amber-400"
              />
            </div>
          </div>

          {/* ওয়ারেন্টি ড্রপডাউন */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {lang === 'bn' ? 'সার্ভিস ওয়ারেন্টি' : 'Service Warranty'}
              </label>
              <select
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="ওয়ারেন্টি প্রযোজ্য নয়">কোনো ওয়ারেন্টি নেই (No Warranty)</option>
                <option value="৭ দিন চেকিং">৭ দিন চেকিং (7 Days Testing)</option>
                <option value="৩০ দিন ওয়ারেন্টি">৩০ দিন পার্টস ওয়ারেন্টি (30 Days)</option>
                <option value="৯০ দিন ওয়ারেন্টি">৩ মাস ওয়ারেন্টি (90 Days)</option>
                <option value="১৮০ দিন ওয়ারেন্টি">৬ মাস ওয়ারেন্টি (180 Days)</option>
              </select>
            </div>

            {/* হিসাবের সারাংশ প্রিভিউ বক্স */}
            <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-2xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-emerald-400 block font-medium">
                  {lang === 'bn' ? 'মোট আনুমানিক খরচ:' : 'Total Estimated Cost:'}
                </span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
                  ৳{total.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">
                  {lang === 'bn' ? 'আন্তর্জাতিক মূল্য:' : 'Approx USD:'}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-300">
                  ${approximateUsd}
                </span>
              </div>
            </div>
          </div>

          {/* জেনারেট কোটেশন বাটন */}
          <div className="pt-2">
            <button
              onClick={handleGenerateQuotation}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>{lang === 'bn' ? 'কোটেশন স্লিপ তৈরি ও সেভ করুন' : 'Generate & Save Quotation Memo'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* অ্যাক্টিভ কোটেশন স্লিপ ভিউ */}
      {activeQuotation && (
        <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 printable-area">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-mono font-bold border border-emerald-800">
                  {activeQuotation.estimateNo}
                </span>
                <span className="text-xs text-slate-400">{activeQuotation.createdAt}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                {lang === 'bn' ? 'আনুষ্ঠানিক সার্ভিস কোটেশন স্লিপ' : 'Formal Service Estimate Slip'}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-emerald-400 block">Mafhuz Recovery</span>
              <span className="text-[10px] text-slate-400">Verified Workshop Memo</span>
            </div>
          </div>

          {/* বিস্তারিত বিবরণ */}
          <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px]">{lang === 'bn' ? 'গ্রাহক' : 'Customer'}</span>
              <span className="font-semibold text-white">{activeQuotation.customerName}</span>
              <span className="text-slate-400 block text-[11px] font-mono mt-0.5">{activeQuotation.customerPhone}</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px]">{lang === 'bn' ? 'ডিভাইস' : 'Device'}</span>
              <span className="font-semibold text-white">{activeQuotation.deviceBrand} {activeQuotation.deviceModel}</span>
              <span className="text-emerald-400 block text-[11px] font-medium mt-0.5">{activeQuotation.repairCategory}</span>
            </div>
          </div>

          {/* খরচের ব্রেকডাউন */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between text-slate-300">
              <span>{lang === 'bn' ? 'যন্ত্রাংশের নির্ধারিত মূল্য' : 'Spare Part Price'}:</span>
              <span className="font-mono">৳{activeQuotation.partsCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>{lang === 'bn' ? 'টেকনিশিয়ান সার্ভিস চার্জ' : 'Labor & Service Fee'}:</span>
              <span className="font-mono">৳{activeQuotation.laborCost.toLocaleString()}</span>
            </div>
            {activeQuotation.discount > 0 && (
              <div className="flex justify-between text-amber-400">
                <span>{lang === 'bn' ? 'বিশেষ ডিসকাউন্ট' : 'Discount'}:</span>
                <span className="font-mono">-৳{activeQuotation.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-sm sm:text-base font-bold text-white">
              <span>{lang === 'bn' ? 'সর্বমোট প্রদেয়' : 'Net Total Amount'}:</span>
              <span className="text-emerald-400 font-mono text-lg">৳{activeQuotation.totalCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 pt-1">
              <span>{lang === 'bn' ? 'ওয়ারেন্টি সুবিধা' : 'Warranty'}: {activeQuotation.warrantyPeriod}</span>
              <span>{lang === 'bn' ? 'সম্ভাব্য সময়' : 'Estimated Time'}: {activeQuotation.estimatedTime}</span>
            </div>
          </div>

          {/* অ্যাকশন বাটনসমূহ */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setActiveQuotation(null)}
              className="text-xs text-slate-400 hover:text-white transition cursor-pointer"
            >
              {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyQuotation}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition active:scale-95 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied') : (lang === 'bn' ? 'টেক্সট কপি' : 'Copy Text')}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-emerald-600/30 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'প্রিন্ট স্লিপ' : 'Print Slip'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* পূর্বে সেভকৃত কোটেশনের হিস্ট্রি তালিকা */}
      {savedEstimates.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'bn' ? 'পূর্বে তৈরিকৃত কোটেশন তালিকা' : 'Saved Estimate Quotations'}</span>
            </h3>
            <span className="text-xs text-slate-400">({savedEstimates.length})</span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {savedEstimates.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition"
              >
                <div 
                  className="cursor-pointer flex-1"
                  onClick={() => setActiveQuotation(item)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-400">{item.estimateNo}</span>
                    <span className="text-xs font-semibold text-white">{item.deviceBrand} {item.deviceModel}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>{item.customerName}</span>
                    <span>•</span>
                    <span>৳{item.totalCost}</span>
                    <span>•</span>
                    <span>{item.createdAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveQuotation(item)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs"
                    title="View"
                  >
                    {lang === 'bn' ? 'দেখুন' : 'View'}
                  </button>
                  <button
                    onClick={() => handleDeleteEstimate(item.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
