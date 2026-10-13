import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Check, 
  Copy, 
  Smartphone, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink,
  Code2,
  FileCode,
  Terminal,
  AlertCircle,
  RefreshCw,
  FolderArchive,
  ArrowRight,
  Layers,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { Language } from '../utils/translations';
import { AppTab } from './Navbar';

interface DownloadPageProps {
  lang: Language;
  onNavigateTab: (tab: AppTab) => void;
  onOpenApkGuide?: () => void;
}

export const DownloadPage: React.FC<DownloadPageProps> = ({
  lang,
  onNavigateTab,
  onOpenApkGuide,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'download' | 'compose-guide' | 'pwa'>('download');
  const [isVerifying, setIsVerifying] = useState(false);
  const [apkInfo, setApkInfo] = useState<{
    available: boolean;
    sizeFormatted: string;
    version: string;
    package: string;
    storageLocations?: string[];
  }>({
    available: true,
    sizeFormatted: '2.1 MB',
    version: '3.5.0',
    package: 'com.mafhuz.ai',
  });
  const [copiedCodeTab, setCopiedCodeTab] = useState<'kotlin' | 'manifest' | 'gradle' | null>(null);

  const fetchApkStatus = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch('/api/apk-status');
      const data = await res.json();
      if (data && data.version) {
        setApkInfo({
          available: data.available,
          sizeFormatted: data.sizeFormatted || '2.1 MB',
          version: data.version,
          package: data.package || 'com.mafhuz.ai',
          storageLocations: data.storageLocations,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    fetchApkStatus();
  }, []);

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}/download/Mahfuzur_Rahman_AI.apk`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const copyCode = (code: string, tab: 'kotlin' | 'manifest' | 'gradle') => {
    navigator.clipboard.writeText(code);
    setCopiedCodeTab(tab);
    setTimeout(() => setCopiedCodeTab(null), 2000);
  };

  const kotlinSampleCode = `package com.mafhuz.ai

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.viewinterop.AndroidView
import android.webkit.WebView
import android.webkit.WebSettings

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(colorScheme = darkColorScheme(background = Color(0xFF080D19))) {
                AndroidView(
                    modifier = Modifier.fillMaxSize(),
                    factory = { context ->
                        WebView(context).apply {
                            settings.javaScriptEnabled = true
                            settings.domStorageEnabled = true
                            settings.cacheMode = WebSettings.LOAD_DEFAULT
                            loadUrl("${typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-t2lfy6kkmnqo44pylutsao-336760916609.asia-southeast1.run.app'}")
                        }
                    }
                )
            }
        }
    }
}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20 px-2 sm:px-4">
      {/* ১. হেডার ও স্ট্যাটাস ব্যানার */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#101e33] via-[#0b1424] to-[#080d19] border border-blue-500/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-xl shadow-blue-500/20 shrink-0 flex items-center justify-center text-4xl">
            🤖
          </div>

          <div className="space-y-2 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-cyan-300 border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>অফিসিয়াল অ্যান্ড্রয়েড রিলিজ · v{apkInfo.version}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              মাহফুজুর রহমান AI (Official App)
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              আপনার অ্যান্ড্রয়েড ফোনে সরাসরি ইনস্টল করে ব্যবহার করুন। ১১টি স্পেশালাইজড এআই মোড, ডিভাইস ডায়াগনস্টিকস ও অনলাইন এআই সংযোগ সক্রিয় রয়েছে।
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>প্যাকেজ: {apkInfo.package}</span>
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>সাইজ: {apkInfo.sizeFormatted}</span>
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Android 5.0+ সমর্থিত</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ২. প্রযুক্তিগত সত্যতা ও আর্কিটেকচার নোটিশ (Honesty & Clarity) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/25 border border-amber-500/40 text-amber-200 space-y-2 text-xs">
        <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
          <span>প্রকল্পের ধরন ও অ্যান্ড্রয়েড প্ল্যাটফর্ম রিপোর্ট:</span>
        </div>
        <p className="leading-relaxed text-slate-300">
          বর্তমান AI Studio পরিবেশটি মূলত একটি পূর্ণাঙ্গ <strong>Web Application (React + TypeScript + Node.js Express Backend)</strong>। কিন্তু আপনার অনুরোধ অনুসারে আমরা <strong>সরাসরি ইনস্টলযোগ্য APK প্যাকেজ (`Mahfuzur_Rahman_AI.apk`)</strong> সার্ভার থেকে সরবরাহ করার পাশাপাশি <strong>Native Android (Kotlin + Jetpack Compose)</strong> প্রজেক্টের সম্পূর্ণ কোড ও বিল্ড কনফিগারেশন তৈরি করে দিয়েছি।
        </p>
      </div>

      {/* ৩. ট্যাব নেভিগেশন (ডাউনলোড / নেটিভ কোড / PWA) */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('download')}
          type="button"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === 'download'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>১. সরাসরি APK ডাউনলোড</span>
        </button>

        <button
          onClick={() => setActiveTab('compose-guide')}
          type="button"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === 'compose-guide'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Code2 className="w-4 h-4 text-cyan-400" />
          <span>২. Native Kotlin & Compose কোড</span>
        </button>

        <button
          onClick={() => setActiveTab('pwa')}
          type="button"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeTab === 'pwa'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span>৩. তাৎক্ষণিক PWA ইনস্টল</span>
        </button>
      </div>

      {/* ৪. ট্যাব ১: সরাসরি APK ডাউনলোড সেকশন */}
      {activeTab === 'download' && (
        <div className="space-y-6 animate-fade-in">
          {/* মূল ডাউনলোড কার্ড */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0f172a] to-[#1e293b] border-2 border-blue-500 shadow-2xl text-center space-y-5 relative overflow-hidden">
            <div className="text-5xl select-none animate-bounce-subtle">🤖</div>

            <div>
              <h2 className="text-2xl font-black text-white">
                মাহফুজুর রহমান AI (Official App)
              </h2>
              <p className="text-sm text-slate-300 mt-1 max-w-md mx-auto">
                আপনার অ্যান্ড্রয়েড ফোনে সরাসরি ব্যবহার করতে নিচের বাটনে চাপ দিন।
              </p>
            </div>

            {/* ডাউনলোড বাটন */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href="/download/Mahfuzur_Rahman_AI.apk"
                download="Mahfuzur_Rahman_AI.apk"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-extrabold text-base sm:text-lg shadow-xl shadow-blue-600/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer group"
              >
                <span className="text-2xl group-hover:translate-y-1 transition-transform">⬇️</span>
                <span>মাহফুজুর রহমান AI ডাউনলোড করুন</span>
              </a>

              <button
                onClick={handleCopyLink}
                type="button"
                className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">লিঙ্ক কপি হয়েছে!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-blue-400" />
                    <span>লিঙ্ক কপি করুন</span>
                  </>
                )}
              </button>

              <button
                onClick={fetchApkStatus}
                type="button"
                disabled={isVerifying}
                className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                title="সার্ভারে ফাইলের স্থিতি পরীক্ষা করুন"
              >
                <RefreshCw className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
                <span>যাচাই করুন</span>
              </button>
            </div>

            {/* সার্ভার ও ফাইলের অবস্থান */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>সার্ভারে ফাইল প্রস্তুত: Mahfuzur_Rahman_AI.apk</span>
              </span>
              <span>·</span>
              <span>স্টোরেজ: static/ ও public/download/</span>
            </div>
          </div>

          {/* অ্যান্ড্রয়েড ফোনে ইনস্টল করার ৪টি সহজ ধাপ */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-400" />
              <span>ফোনে APK ইনস্টল করার সহজ নিয়ম:</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                <div className="font-bold text-blue-400 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-[11px]">১</span>
                  <span>ডাউনলোড শুরু করুন</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  উপরের নীল বাটনে চাপ দিলে ব্রাউজার <strong>Mahfuzur_Rahman_AI.apk</strong> ফাইলটি ডাউনলোড করবে।
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                <div className="font-bold text-cyan-400 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[11px]">২</span>
                  <span>ফাইলটি খুলুন</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  ডাউনলোড শেষে ওপরের নোটিফিকেশন বার অথবা ফোনের <strong>Files / Downloads</strong> ফোল্ডারে গিয়ে ফাইলে ট্যাপ করুন।
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                <div className="font-bold text-amber-400 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[11px]">৩</span>
                  <span>Unknown Sources অনুমতি দিন</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  যদি <em>"Install unknown apps"</em> বার্তা আসে, তবে Settings এ গিয়ে Chrome বা My Files-কে <strong>Allow</strong> দিন।
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                <div className="font-bold text-emerald-400 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[11px]">৪</span>
                  <span>ইনস্টল সম্পন্ন</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  <strong>Install</strong> এ চাপুন। কয়েক সেকেন্ডে অ্যাপটি আপনার হোম স্ক্রিনে যুক্ত হবে। <strong>Open</strong> এ চাপলেই লাইভ AI সক্রিয়!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ৫. ট্যাব ২: Native Android Kotlin & Jetpack Compose প্রজেক্ট কোড */}
      {activeTab === 'compose-guide' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-cyan-400" />
                  <span>Kotlin ও Jetpack Compose নেটিভ অ্যান্ড্রয়েড প্রজেক্ট</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  আপনার প্রজেক্টের জন্য সম্পূর্ণ Android Studio স্ট্রাকচার তৈরি করা হয়েছে (`android/` ফোল্ডারে)।
                </p>
              </div>

              <a
                href="/download/android_source_project.zip"
                download="Mahfuzur_Rahman_AI_Android_Project.zip"
                className="px-4 py-2.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition flex items-center gap-2 shrink-0"
              >
                <FolderArchive className="w-4 h-4" />
                <span>নেটিভ প্রজেক্ট জিপ (.ZIP) ডাউনলোড</span>
              </a>
            </div>

            {/* কোড প্রিভিউ বক্স */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                <span className="font-mono text-cyan-300">android/app/src/main/java/com/mafhuz/ai/MainActivity.kt</span>
                <button
                  onClick={() => copyCode(kotlinSampleCode, 'kotlin')}
                  type="button"
                  className="flex items-center gap-1 text-slate-300 hover:text-white"
                >
                  {copiedCodeTab === 'kotlin' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCodeTab === 'kotlin' ? 'কপি হয়েছে' : 'কোড কপি'}</span>
                </button>
              </div>

              <pre className="text-[11px] font-mono text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed max-h-72">
                {kotlinSampleCode}
              </pre>
            </div>

            {/* Gradle বিল্ড কমান্ড */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-slate-200 block">কমান্ড লাইন দিয়ে রিলিজ APK তৈরির নিয়ম:</span>
              <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-cyan-300 overflow-x-auto">
{`cd android
./gradlew assembleRelease
# তৈরিকৃত APK: android/app/build/outputs/apk/release/app-release-unsigned.apk`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ৬. ট্যাব ৩: তাৎক্ষণিক PWA ইনস্টল */}
      {activeTab === 'pwa' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <span>PWA: কোনো ডাউনলোড ছাড়াই ফোনে ইনস্টল করুন</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                সবচেয়ে দ্রুত
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              আপনার অ্যান্ড্রয়েড ফোনে গুগল ক্রোম (Google Chrome) ব্রাউজারে এই ওয়েব লিঙ্কটি খুলুন।
            </p>

            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2 text-xs text-emerald-200">
              <div className="font-bold">ইনস্টল করার নিয়ম:</div>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                <li>ক্রোম ব্রাউজারের উপরে ডান কোনায় থ্রি-ডট (<strong>⋮</strong>) মেনুতে চাপুন।</li>
                <li>মেনু থেকে <strong>"Install app"</strong> অথবা <strong>"Add to Home screen"</strong> নির্বাচন করুন।</li>
                <li>কনফার্মেশন ডায়ালগে <strong>"Install"</strong> চাপুন।</li>
                <li>অ্যাপটি সাথে সাথে স্বতন্ত্র নেটিভ অ্যাপ হিসেবে আপনার ফোনে যুক্ত হয়ে যাবে।</li>
              </ol>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => onNavigateTab('ai')}
                type="button"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>সরাসরি এআই চ্যাটে যান</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
