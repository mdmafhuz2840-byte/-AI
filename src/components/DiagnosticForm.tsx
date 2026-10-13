import React, { useState } from 'react';
import { 
  Smartphone, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  RotateCcw, 
  Copy, 
  Check, 
  ShieldCheck, 
  ChevronRight, 
  Info,
  CheckSquare,
  Square,
  Share2,
  X,
  Volume2
} from 'lucide-react';
import { Language, t } from '../utils/translations';
import { PHONE_BRANDS, LOCK_MESSAGES, DIAGNOSTIC_GUIDES } from '../data/mockData';

interface DiagnosticFormProps {
  lang: Language;
  initialBrand?: string;
  initialModel?: string;
}

export const DiagnosticForm: React.FC<DiagnosticFormProps> = ({
  lang,
  initialBrand = 'vivo',
  initialModel = 'Vivo Y21',
}) => {
  const strings = t[lang];

  // ফর্ম স্টেট
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [selectedModel, setSelectedModel] = useState(initialModel);
  const [selectedLockId, setSelectedLockId] = useState('vivo_y21_stuck');
  const [imei, setImei] = useState('');
  const [hasInvoice, setHasInvoice] = useState(true);

  // ফলাফল প্রদর্শন ও ইন্টারেক্টিভ স্টেপ স্টেট
  const [diagnosisResult, setDiagnosisResult] = useState<any | null>(null);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  // ডেটা মোছার সতর্কতামূলক কনফার্মেশন মডাল স্টেট
  const [showDataWipeModal, setShowDataWipeModal] = useState(false);
  const [pendingWipeStepIndex, setPendingWipeStepIndex] = useState<number | null>(null);
  const [wipeRiskAcknowledged, setWipeRiskAcknowledged] = useState(false);

  // ব্র্যান্ড পরিবর্তনের সাথে মডেল আপডেট
  const currentBrandObj = PHONE_BRANDS.find((b) => b.id === selectedBrand) || PHONE_BRANDS[0];

  const handleBrandChange = (brandId: string) => {
    setSelectedBrand(brandId);
    const brand = PHONE_BRANDS.find((b) => b.id === brandId);
    if (brand && brand.models.length > 0) {
      setSelectedModel(brand.models[0]);
    }
  };

  // ডায়াগনস্টিক শুরু
  const handleDiagnose = (e: React.FormEvent) => {
    e.preventDefault();

    const lockObj = LOCK_MESSAGES.find((l) => l.id === selectedLockId);
    const lockType = lockObj ? lockObj.type : 'screen_lock';

    let guideKey = lockType;
    if (selectedModel.toLowerCase().includes('y21') && (lockType === 'vivo_y21' || lockType === 'screen_lock')) {
      guideKey = 'vivo_y21';
    } else if (!DIAGNOSTIC_GUIDES[guideKey]) {
      guideKey = 'screen_lock';
    }

    const guide = DIAGNOSTIC_GUIDES[guideKey] || DIAGNOSTIC_GUIDES.screen_lock;

    setDiagnosisResult({
      brand: currentBrandObj.name,
      model: selectedModel,
      lockMessage: lang === 'bn' ? lockObj?.labelBn : lockObj?.labelEn,
      lockType,
      imei: imei.trim() || null,
      hasInvoice,
      guide,
      timestamp: new Date().toISOString(),
    });
    setCheckedSteps({});
    setWipeRiskAcknowledged(false);
  };

  const handleReset = () => {
    setDiagnosisResult(null);
    setCheckedSteps({});
  };

  // স্টেপ চেকবক্স টগল (ডেটা লস স্টেপের জন্য স্পেশাল ওয়ার্নিং)
  const handleToggleStep = (index: number, stepText: string) => {
    const isWipeStep = stepText.includes('Clear all data') || stepText.includes('Factory reset') || stepText.includes('Wipe data');

    if (isWipeStep && !checkedSteps[index] && !wipeRiskAcknowledged) {
      setPendingWipeStepIndex(index);
      setShowDataWipeModal(true);
      return;
    }

    setCheckedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const confirmWipeStep = () => {
    if (pendingWipeStepIndex !== null) {
      setWipeRiskAcknowledged(true);
      setCheckedSteps((prev) => ({
        ...prev,
        [pendingWipeStepIndex]: true,
      }));
    }
    setShowDataWipeModal(false);
    setPendingWipeStepIndex(null);
  };

  const copyGuide = () => {
    if (!diagnosisResult) return;
    const steps = lang === 'bn' ? diagnosisResult.guide.stepsBn : diagnosisResult.guide.stepsEn;
    const text = `[Mafhuz Device Recovery - ${diagnosisResult.model}]\nলক ধরন: ${diagnosisResult.lockMessage}\n\nধাপসমূহ:\n${steps.join('\n')}\n\nঅফিসিয়াল পরামর্শ: ${
      lang === 'bn' ? diagnosisResult.guide.officialNoticeBn : diagnosisResult.guide.officialNoticeEn
    }`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareGuide = async () => {
    if (!diagnosisResult || typeof navigator === 'undefined' || !navigator.share) return;
    try {
      await navigator.share({
        title: `Mafhuz Device Recovery: ${diagnosisResult.model}`,
        text: `অফিসিয়াল রিকভারি নির্দেশিকা (${diagnosisResult.model}): ${diagnosisResult.lockMessage}`,
      });
    } catch {}
  };

  return (
    <div className="space-y-5 animate-fade-in pb-16">
      {/* হেডার */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-emerald-400" />
          <span>{strings.diagFormTitle}</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          {strings.diagFormSubtitle}
        </p>
      </div>

      {/* ১. ডায়াগনস্টিক ইনপুট ফর্ম */}
      {!diagnosisResult ? (
        <form onSubmit={handleDiagnose} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          {/* ব্র্যান্ড নির্বাচন */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {strings.selectBrand}
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PHONE_BRANDS.map((brand) => (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => handleBrandChange(brand.id)}
                  className={`p-2.5 rounded-xl text-xs font-medium border text-center transition active:scale-95 cursor-pointer ${
                    selectedBrand === brand.id
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20 font-bold'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/80'
                  }`}
                >
                  {brand.name}
                </button>
              ))}
            </div>
          </div>

          {/* মডেল ড্রপডাউন */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {strings.selectModel} ({currentBrandObj.name})
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
            >
              {currentBrandObj.models.map((mod) => (
                <option key={mod} value={mod}>
                  {mod} {mod === 'Vivo Y21' ? '⭐ (স্পেশাল হাব)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* লকের ধরন বা স্ক্রিনের বার্তা */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {strings.selectLockType}
            </label>
            <div className="space-y-2">
              {LOCK_MESSAGES.map((msg) => (
                <label
                  key={msg.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    selectedLockId === msg.id
                      ? 'bg-emerald-950/30 border-emerald-500/60 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="lockMessage"
                    value={msg.id}
                    checked={selectedLockId === msg.id}
                    onChange={() => setSelectedLockId(msg.id)}
                    className="mt-0.5 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-semibold block">
                      {lang === 'bn' ? msg.labelBn : msg.labelEn}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* ঐচ্ছিক IMEI নম্বর */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {strings.imeiOptional}
            </label>
            <input
              type="text"
              maxLength={15}
              value={imei}
              onChange={(e) => setImei(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 864219053124891"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              {lang === 'bn' 
                ? 'আইএমইআই ফোন ডায়ালারে *#06# চেপে পাওয়া যায়। কোনো পাসওয়ার্ড বা সংবেদনশীল ডেটা প্রয়োজন নেই।'
                : 'Dial *#06# to see IMEI. No passwords or credentials are ever requested.'}
            </p>
          </div>

          {/* ক্রয় রশিদ বা চালান চেকবক্স */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasInvoice}
                onChange={(e) => setHasInvoice(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-900 border-slate-700 cursor-pointer"
              />
              <span className="text-xs text-slate-300 font-medium">
                {strings.purchaseProofQuestion}
              </span>
            </label>
          </div>

          {/* সাবমিট বাটন */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/25 transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{strings.startDiagnosis}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      ) : (
        /* ২. ডায়াগনস্টিক রেজাল্ট ও বৈধ রিকভারি গাইড */
        <div className="space-y-4 animate-fade-in">
          {/* রেজাল্ট হেডার কার্ড */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {diagnosisResult.brand}
                </span>
                <h3 className="text-base font-bold text-white">
                  {diagnosisResult.model}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'bn' ? 'চিহ্নিত সমস্যা:' : 'Identified Lock:'} <span className="text-slate-200 font-medium">{diagnosisResult.lockMessage}</span>
              </p>
              {diagnosisResult.imei && (
                <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                  IMEI: {diagnosisResult.imei}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={shareGuide}
                  type="button"
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                  title="শেয়ার করুন"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={copyGuide}
                type="button"
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition active:scale-95 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied') : (lang === 'bn' ? 'কপি গাইড' : 'Copy Guide')}</span>
              </button>

              <button
                onClick={handleReset}
                type="button"
                className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition active:scale-95 cursor-pointer"
                title="নতুন অনুসন্ধান"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{strings.resetForm}</span>
              </button>
            </div>
          </div>

          {/* Vivo Y21 কী-কম্বিনেশন বিশেষ সাহায্য কার্ড */}
          {diagnosisResult.model.toLowerCase().includes('y21') && (
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 text-cyan-200 space-y-2">
              <span className="font-bold text-xs uppercase tracking-wide text-cyan-300 block">
                ⚡ Vivo Y21 ফাস্টবুট হার্ডওয়্যার কী সিকোয়েন্স:
              </span>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2 py-1 rounded bg-slate-900 border border-cyan-500/30 text-white font-bold">
                  Power Off
                </span>
                <span>➡️</span>
                <span className="px-2 py-1 rounded bg-slate-900 border border-cyan-500/30 text-emerald-400 font-bold">
                  Volume Up (+) + Power
                </span>
                <span>➡️</span>
                <span className="px-2 py-1 rounded bg-slate-900 border border-cyan-500/30 text-cyan-300 font-bold">
                  Recovery Mode
                </span>
              </div>
            </div>
          )}

          {/* ডেটা হারানোর সতর্কতা (High-Visibility Data Loss Warning) */}
          {diagnosisResult.guide.requiresDataLossWarning && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border-2 border-rose-500/60 text-rose-200 space-y-1.5 shadow-lg">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 animate-bounce" />
                <span>{lang === 'bn' ? 'জরুরি সতর্কতা: ডেটা মুছে যাওয়ার ঝুঁকি!' : 'CRITICAL WARNING: Permanent Data Loss!'}</span>
              </div>
              <p className="text-xs text-rose-200/90 leading-relaxed">
                {lang === 'bn'
                  ? 'এই পদ্ধতির কিছু ধাপে (যেমন: Factory Reset বা Clear All Data) ফোনের সমস্ত সংরক্ষিত ছবি, ভিডিও, অ্যাপ ও কন্ট্যাক্ট চিরতরে মুছে যাবে। যদি গুগল ক্লাউড ব্যাকআপ না থাকে, তবে তা ফেরত পাওয়া সম্ভব নয়। আপনি ঝুঁকি বুঝতে পারলে তবেই অগ্রসর হোন।'
                  : 'Proceeding with a factory reset will PERMANENTLY ERASE all personal files, photos, contacts, and WhatsApp chats. Ensure you understand the consequences before proceeding.'}
              </p>
            </div>
          )}

          {/* ধাপে ধাপে ইন্টারেক্টিভ অনুমোদিত গাইড (Interactive Checklist) */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>{lang === 'bn' ? diagnosisResult.guide.titleBn : diagnosisResult.guide.titleEn}</span>
              </h4>
              <span className="text-[11px] text-slate-400">
                {Object.values(checkedSteps).filter(Boolean).length} / {(lang === 'bn' ? diagnosisResult.guide.stepsBn : diagnosisResult.guide.stepsEn).length} ধাপ সম্পন্ন
              </span>
            </div>

            <div className="space-y-2.5">
              {(lang === 'bn' ? diagnosisResult.guide.stepsBn : diagnosisResult.guide.stepsEn).map((step: string, idx: number) => {
                const isChecked = Boolean(checkedSteps[idx]);
                const isWipeStep = step.includes('Clear all data') || step.includes('Factory reset') || step.includes('Wipe data');

                return (
                  <div
                    key={idx}
                    onClick={() => handleToggleStep(idx, step)}
                    className={`p-3.5 rounded-2xl border text-xs sm:text-sm leading-relaxed flex items-start gap-3 cursor-pointer transition select-none ${
                      isChecked
                        ? 'bg-emerald-950/20 border-emerald-500/50 text-slate-200'
                        : isWipeStep
                        ? 'bg-rose-950/20 border-rose-500/40 text-rose-200 hover:bg-rose-950/30'
                        : 'bg-slate-950/70 border-slate-800 text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="pt-0.5 shrink-0">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Square className={`w-4 h-4 ${isWipeStep ? 'text-rose-400' : 'text-slate-500'}`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={isChecked ? 'line-through opacity-70' : ''}>{step}</p>
                      {isWipeStep && !isChecked && (
                        <span className="inline-block mt-1 text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                          ⚠️ ডেটা মুছে ফেলার ধাপ (ক্লিক করে নিশ্চিত করুন)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* অফিশিয়াল সার্ভিস সেন্টার ও আইনি পরামর্শ */}
            <div className="mt-4 p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold text-cyan-300 block mb-0.5">
                  {lang === 'bn' ? 'অফিসিয়াল পরামর্শ ও ওয়ারেন্টি নোটিশ:' : 'Official Recommendation & Warranty Notice:'}
                </span>
                <p>
                  {lang === 'bn'
                    ? diagnosisResult.guide.officialNoticeBn
                    : diagnosisResult.guide.officialNoticeEn}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ডেটা মুছে ফেলার কনফার্মেশন পপআপ (Data Wipe Safety Confirmation Modal) */}
      {showDataWipeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border-2 border-rose-500 rounded-3xl p-5 text-slate-200 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="text-base font-bold text-rose-300">
                  চূড়ান্ত সতর্কতা: ডেটা মুছে যাবে!
                </h4>
                <p className="text-xs text-rose-200/90 mt-1 leading-relaxed">
                  আপনি যে ধাপটিতে অগ্রসর হচ্ছেন তা ডিভাইসের <strong>সমস্ত ছবি, ভিডিও, কন্ট্যাক্ট, ফাইল এবং অ্যাপ চিরতরে মুছে ফেলবে</strong>।
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400">
              <p>• ফ্যাক্টরি রিসেটের পর ফোন চালুর জন্য পূর্বের Google Account পাসওয়ার্ড প্রয়োজন হবে।</p>
              <p>• ব্যাকআপ না থাকলে এই ডেটা আর কখনো পুনরুদ্ধার করা সম্ভব নয়।</p>
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDataWipeModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={confirmWipeStep}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                আমি ঝুঁকি বুঝেছি, চালিয়ে যান
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
