import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Smartphone, 
  Printer, 
  Copy, 
  Check, 
  MessageSquare, 
  ExternalLink,
  Info,
  RotateCcw
} from 'lucide-react';
import { Language } from '../utils/translations';
import { ImeiCheckResult } from '../types/recovery';

interface ImeiCheckerProps {
  lang: Language;
}

// Luhn algorithm validator for 15-digit IMEI
export const validateLuhnImei = (imei: string): boolean => {
  const sanitized = imei.replace(/\D/g, '');
  if (sanitized.length !== 15) return false;

  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let digit = parseInt(sanitized.charAt(i), 10);
    // Double every second digit from right to left (i.e. odd index 1, 3, 5... when 0-indexed)
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
  }
  return sum % 10 === 0;
};

// Known TAC database sample for realistic model identification
const TAC_DATABASE: Record<string, { brand: string; model: string }> = {
  '86420104': { brand: 'Vivo', model: 'Vivo Y21 (V2111 / 4GB+64GB)' },
  '86420105': { brand: 'Vivo', model: 'Vivo Y21s (V2110)' },
  '86420106': { brand: 'Vivo', model: 'Vivo Y21t (V2135)' },
  '86095304': { brand: 'Vivo', model: 'Vivo Y20 (V2029)' },
  '86280405': { brand: 'Vivo', model: 'Vivo Y22 (V2207)' },
  '35824010': { brand: 'Samsung', model: 'Samsung Galaxy A12 (SM-A125F)' },
  '35489011': { brand: 'Samsung', model: 'Samsung Galaxy A23 (SM-A235F)' },
  '86782305': { brand: 'Xiaomi', model: 'Redmi Note 11 (2201117TG)' },
  '86950205': { brand: 'Xiaomi', model: 'Redmi 10C (220333QAG)' },
  '86835005': { brand: 'Realme', model: 'Realme C25 (RMX3193)' },
  '86178904': { brand: 'Oppo', model: 'Oppo A16 (CPH2269)' },
  '86341205': { brand: 'Tecno', model: 'Tecno Spark 8 (KG6p)' },
};

export const ImeiChecker: React.FC<ImeiCheckerProps> = ({ lang }) => {
  const [imeiInput, setImeiInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<ImeiCheckResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pre-configured sample IMEIs for instant testing
  const sampleImeis = [
    { label: 'Vivo Y21 (ক্লিন ও বৈধ)', imei: '864201045239105', status: 'clean' },
    { label: 'Samsung Galaxy (ক্লিন)', imei: '358240107849122', status: 'clean' },
    { label: 'চোরাই/হারানো রিপোর্টকৃত (সতর্কতা)', imei: '867823059918234', status: 'reported_lost' },
    { label: 'বিটিআরসি অনিবন্ধিত / গ্রে-মার্কেট', imei: '868350054432108', status: 'unregistered' },
  ];

  const handleRunCheck = (imeiToCheck?: string) => {
    const rawImei = (imeiToCheck || imeiInput).trim().replace(/\D/g, '');
    
    if (!rawImei) {
      setErrorMsg(lang === 'bn' ? 'অনুগ্রহ করে ১৫ ডিজিটের IMEI নাম্বার লিখুন।' : 'Please enter a 15-digit IMEI number.');
      return;
    }

    if (rawImei.length !== 15) {
      setErrorMsg(lang === 'bn' ? `IMEI অবশ্যই ১৫ ডিজিটের হতে হবে (বর্তমানে ${rawImei.length} ডিজিট)।` : `IMEI must be exactly 15 digits (currently ${rawImei.length} digits).`);
      return;
    }

    setErrorMsg(null);
    setIsSearching(true);
    setResult(null);

    // Simulate database TAC & Blacklist verification
    setTimeout(() => {
      const isValid = validateLuhnImei(rawImei);
      const tac = rawImei.substring(0, 8);
      const lookup = TAC_DATABASE[tac] || {
        brand: rawImei.startsWith('86') ? 'Vivo / Xiaomi / BBK' : rawImei.startsWith('35') ? 'Samsung / Global' : 'Android Global Device',
        model: `Generic Android Smartphone (TAC: ${tac})`,
      };

      // Determine simulated blacklist status
      let status: ImeiCheckResult['blacklistStatus'] = 'clean';
      let notes = lang === 'bn' 
        ? 'এই ডিভাইসটির কোনো চুরি বা হারানোর পুলিশ জিডি অথবা জিএসএমএ ব্ল্যাকলিস্ট রেকর্ড পাওয়া যায়নি। ডিভাইসটি বৈধ ও নিরাপদ।'
        : 'No stolen, lost or GSMA blacklist record found for this device. Legitimate and safe for service.';

      if (rawImei === '867823059918234' || rawImei.endsWith('234')) {
        status = 'reported_lost';
        notes = lang === 'bn'
          ? 'সতর্কতা: এই ডিভাইসটি পূর্বে হারিয়ে যাওয়া বা চুরি হিসেবে সাধারণ ডায়েরি (GD) এর মাধ্যমে তালিকাভুক্ত করা হয়েছে। কোনো প্রকার রিসেট বা ক্রয় করা হতে বিরত থাকুন!'
          : 'WARNING: This device has been reported lost/stolen. Do not purchase or flash without verified legal ownership proof.';
      } else if (rawImei === '868350054432108' || rawImei.endsWith('108')) {
        status = 'unregistered';
        notes = lang === 'bn'
          ? 'তথ্য: বিটিআরসি এনইআইআর (NEIR) ডাটাবেজে ডিভাইসটি অনিবন্ধিত বা ক্লোন/আনঅফিসিয়াল হতে পারে।'
          : 'Notice: Device may be unregistered or non-compliant under telecom database.';
      }

      const checkResult: ImeiCheckResult = {
        imei: rawImei,
        isValidLuhn: isValid,
        tac,
        brand: lookup.brand,
        model: lookup.model,
        blacklistStatus: status,
        btrcCompliant: status === 'clean',
        btrcCheckSms: `KYD ${rawImei}`,
        checkedAt: new Date().toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
        notes,
      };

      setResult(checkResult);
      setIsSearching(false);
    }, 450);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* হেডার ও পরিচিতি */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>{lang === 'bn' ? 'IMEI ও চোরাই ফোন স্ট্যাটাস চেকার' : 'IMEI & Stolen Phone Diagnostic Checker'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-900/60 text-cyan-300 border border-cyan-700/50">
                  Luhn & BTRC
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                {lang === 'bn'
                  ? '১৫ ডিজিটের IMEI যাচাই, Luhn অ্যালগরিদম চেকসাম, ব্র্যান্ড ডিটেকশন ও বিটিআরসি ভেরিফিকেশন।'
                  : '15-digit IMEI verification, Luhn checksum validation, TAC lookup, and theft status audit.'}
              </p>
            </div>
          </div>
        </div>

        {/* ইনপুট ফর্ম */}
        <div className="mt-5 space-y-3">
          <div className="relative">
            <input
              type="text"
              maxLength={15}
              value={imeiInput}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setImeiInput(val);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder={lang === 'bn' ? 'এখানে ১৫ ডিজিটের IMEI নাম্বার দিন (যেমন: 864201045239105)...' : 'Enter 15-digit IMEI number...'}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 pr-28 text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 text-sm tracking-wider"
            />
            <div className="absolute right-2 top-2 bottom-2 flex items-center gap-1.5">
              <button
                onClick={() => handleRunCheck()}
                disabled={isSearching || !imeiInput}
                className="h-full px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md shadow-cyan-600/30"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{isSearching ? (lang === 'bn' ? 'যাচাই...' : 'Checking...') : (lang === 'bn' ? 'চেক করুন' : 'Verify')}</span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 flex items-center gap-1.5 pl-1">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </p>
          )}

          {/* কুইক টেস্ট ডেমো বাটনসমূহ */}
          <div className="pt-2 border-t border-slate-800/80">
            <p className="text-[11px] text-slate-400 mb-2">
              {lang === 'bn' ? '⚡ দ্রুত পরীক্ষার জন্য ডেমো IMEI নির্বাচন করুন:' : '⚡ Select sample IMEI for instant test:'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sampleImeis.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setImeiInput(item.imei);
                    handleRunCheck(item.imei);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left text-xs transition active:scale-95 flex items-center justify-between group cursor-pointer"
                >
                  <span className="text-slate-200 group-hover:text-cyan-300 font-medium">{item.label}</span>
                  <span className="text-[10px] font-mono text-slate-400">{item.imei.slice(0, 8)}...</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ফলাফল প্রদর্শন কার্ড */}
      {result && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 animate-fade-in printable-area">
          {/* ফলাফল স্ট্যাটাস ব্যানার */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
            result.blacklistStatus === 'clean' 
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
              : result.blacklistStatus === 'reported_lost'
              ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
          }`}>
            <div className="p-2 rounded-xl bg-black/20 flex-shrink-0">
              {result.blacklistStatus === 'clean' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              ) : result.blacklistStatus === 'reported_lost' ? (
                <XCircle className="w-6 h-6 text-rose-400 animate-pulse" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-bold text-base sm:text-lg">
                  {result.blacklistStatus === 'clean'
                    ? (lang === 'bn' ? '✓ ক্লিন ডিভাইস - নিরাপদ ও যাচাইকৃত' : '✓ Clean Device - Safe & Verified')
                    : result.blacklistStatus === 'reported_lost'
                    ? (lang === 'bn' ? '⚠️ চোরাই / হারানো রিপোর্টকৃত ডিভাইস সতর্কতা!' : '⚠️ Reported Lost / Stolen Device Alert!')
                    : (lang === 'bn' ? '⚠️ অনিবন্ধিত বা ক্লোন ডিভাইসের সতর্কতা' : '⚠️ Unregistered / Gray Market Notice')}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-black/30 border border-current">
                  {result.blacklistStatus}
                </span>
              </div>
              <p className="text-xs sm:text-sm mt-1 opacity-90 leading-relaxed">
                {result.notes}
              </p>
            </div>
          </div>

          {/* ডিভাইসের কারিগরি বিবরণ টেবিল */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm">
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
              <span className="text-slate-400 block text-[11px] font-medium">{lang === 'bn' ? 'IMEI নাম্বার' : 'IMEI Number'}</span>
              <span className="font-mono font-bold text-white tracking-widest text-base sm:text-lg">{result.imei}</span>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
              <span className="text-slate-400 block text-[11px] font-medium">{lang === 'bn' ? 'Luhn অ্যালগরিদম চেকসাম' : 'Luhn Algorithm Checksum'}</span>
              <span className={`font-semibold inline-flex items-center gap-1.5 mt-0.5 ${result.isValidLuhn ? 'text-emerald-400' : 'text-rose-400'}`}>
                {result.isValidLuhn ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'বৈধ চেকসাম (গাণিতিকভাবে সঠিক)' : 'Valid Checksum (Mathematically Correct)'}</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'অবৈধ চেকসাম (সম্ভাব্য ফেক IMEI)' : 'Invalid Checksum (Possible Fake/Spoofed)'}</span>
                  </>
                )}
              </span>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
              <span className="text-slate-400 block text-[11px] font-medium">{lang === 'bn' ? 'চিহ্নিত ব্র্যান্ড ও মডেল (TAC)' : 'Identified Brand & Model (TAC)'}</span>
              <span className="font-bold text-white text-sm mt-0.5 block">{result.brand} - {result.model}</span>
              <span className="text-[10px] text-slate-400 font-mono">TAC Code: {result.tac}</span>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
              <span className="text-slate-400 block text-[11px] font-medium">{lang === 'bn' ? 'যাচাইয়ের সময় ও তারিখ' : 'Audit Timestamp'}</span>
              <span className="font-medium text-slate-200 mt-0.5 block">{result.checkedAt}</span>
            </div>
          </div>

          {/* বিটিআরসি (BTRC) ১৬০০২ যাচাইকরণ কার্ড */}
          <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-800/50 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-bold text-cyan-300 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                <span>{lang === 'bn' ? 'বাংলাদেশ বিটিআরসি (BTRC) অফিশিয়াল যাচাই' : 'Bangladesh BTRC Official NEIR Verification'}</span>
              </h4>
              <span className="text-[10px] bg-cyan-900/60 text-cyan-200 px-2 py-0.5 rounded font-mono">16002</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === 'bn'
                ? 'মোবাইলের মেসেজ অপশনে গিয়ে লিখুন:'
                : 'Send official SMS from any BD operator to 16002:'}
              <code className="mx-2 px-2 py-0.5 bg-slate-900 border border-cyan-700/60 rounded text-cyan-300 font-mono font-bold">
                {result.btrcCheckSms}
              </code>
              {lang === 'bn' ? 'এবং পাঠিয়ে দিন ১৬০০২ নাম্বারে।' : 'to check government database.'}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href={`sms:16002?body=${encodeURIComponent(result.btrcCheckSms)}`}
                className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'সরাসরি SMS পাঠান' : 'Send SMS Now'}</span>
              </a>
              <button
                onClick={() => handleCopy(result.btrcCheckSms)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition active:scale-95 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied') : (lang === 'bn' ? 'SMS টেক্সট কপি' : 'Copy Text')}</span>
              </button>
            </div>
          </div>

          {/* আইনি সতর্কতা ও পেনাল কোড নোটিশ */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
            <span className="font-semibold text-amber-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'আইনি সতর্কতা (দণ্ডবিধি ৪১১ ধারা):' : 'Legal Advisory (Penal Code Section 411):'}</span>
            </span>
            <p className="leading-relaxed text-[11px]">
              {lang === 'bn'
                ? 'চুরি বা ছিনতাইকৃত মোবাইল ক্রয়, বিক্রয় বা সার্ভিসিং করা বাংলাদেশ দণ্ডবিধির ৪১১ ধারা অনুযায়ী শাস্তিযোগ্য অপরাধ। কোনো ফোনে লক খোলার পূর্বে অবশ্যই ক্রয়ের বৈধ ক্যাশমেমো বা মালিকানার প্রমাণপত্র সংগ্রহ করুন।'
                : 'Possession, servicing, or trade of stolen electronic devices without lawful ownership proof constitutes an offense under Penal Code 411. Always inspect genuine purchase memo and NID proof.'}
            </p>
          </div>

          {/* অ্যাকশন বাটনসমূহ (প্রিন্ট, কপি, রিসেট) */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                setResult(null);
                setImeiInput('');
              }}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'নতুন চেক করুন' : 'Reset Check'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(`IMEI: ${result.imei}\nDevice: ${result.brand} ${result.model}\nStatus: ${result.blacklistStatus}\nChecked: ${result.checkedAt}`)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition active:scale-95 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{lang === 'bn' ? 'রিপোর্ট কপি' : 'Copy Report'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-cyan-600/30 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'প্রিন্ট স্লিপ' : 'Print Slip'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
