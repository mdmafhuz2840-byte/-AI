import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Navigation, 
  Battery, 
  BatteryCharging, 
  Cpu, 
  Wifi, 
  WifiOff, 
  Radio, 
  ShieldCheck, 
  AlertTriangle, 
  Play, 
  Square, 
  Download, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Share2, 
  Clock, 
  Layers, 
  Smartphone,
  Gauge,
  HardDrive
} from 'lucide-react';
import { Language } from '../utils/translations';
import { LocationPoint, BatteryState, DeviceInfo } from '../types/recovery';

interface DeviceTrackerProps {
  lang: Language;
}

export const DeviceTracker: React.FC<DeviceTrackerProps> = ({ lang }) => {
  // ১. জিপিএস লোকেশন স্টেট
  const [currentLocation, setCurrentLocation] = useState<LocationPoint | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');

  // ২. লাইভ ব্যাকগ্রাউন্ড ট্র্যাকিং স্টেট
  const [isTracking, setIsTracking] = useState(false);
  const [trackingInterval, setTrackingInterval] = useState<number>(10); // সেকেন্ড
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [locationHistory, setLocationHistory] = useState<LocationPoint[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mdr_location_history');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [];
  });
  const [newLocationNote, setNewLocationNote] = useState('');
  const [copiedCoord, setCopiedCoord] = useState(false);
  const [sosCopied, setSosCopied] = useState(false);

  // ৩. ব্যাটারি স্টেট
  const [battery, setBattery] = useState<BatteryState>({
    supported: false,
    level: 85,
    charging: false,
  });

  // ৪. ডিভাইস ও সিস্টেম তথ্য স্টেট
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    browser: 'Android Browser',
    os: 'Android',
    platform: 'Android Mobile',
    screenResolution: '1080 x 2400',
    language: 'bn-BD',
    onlineStatus: true,
    isNativeAndroid: true,
  });
  const [storageEstimate, setStorageEstimate] = useState<{ quotaGb: number; usageGb: number } | null>(null);
  const [gpuInfo, setGpuInfo] = useState<string>('Mali / Adreno GPU');

  const watchIdRef = useRef<number | null>(null);
  const intervalIdRef = useRef<any>(null);

  // পেজ লোডে পারমিশন, ব্যাটারি ও ডিভাইস ডেটা রিড
  useEffect(() => {
    inspectDeviceAndSystem();
    initBatteryListener();
    checkGeoPermission();

    const handleOnline = () => setDeviceInfo((prev) => ({ ...prev, onlineStatus: true }));
    const handleOffline = () => setDeviceInfo((prev) => ({ ...prev, onlineStatus: false }));
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      stopTracking();
    };
  }, []);

  // ব্রাউজার অডিও বিপ সাউন্ড
  const playBeep = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
      osc.stop(ctx.currentTime + 0.2);
    } catch {}
  };

  // পারমিশন স্ট্যাটাস চেক
  const checkGeoPermission = async () => {
    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      try {
        const res = await (navigator.permissions as any).query({ name: 'geolocation' });
        setPermissionState(res.state);
        res.onchange = () => {
          setPermissionState(res.state);
        };
      } catch {
        setPermissionState('unknown');
      }
    }
  };

  // ব্যাটারি এপিআই লিসেনার
  const initBatteryListener = async () => {
    if (typeof navigator !== 'undefined' && 'getBattery' in (navigator as any)) {
      try {
        const bat = await (navigator as any).getBattery();
        const updateBat = () => {
          setBattery({
            supported: true,
            level: Math.round(bat.level * 100),
            charging: bat.charging,
            chargingTime: bat.chargingTime,
            dischargingTime: bat.dischargingTime,
          });
        };
        updateBat();
        bat.addEventListener('chargingchange', updateBat);
        bat.addEventListener('levelchange', updateBat);
      } catch {
        setBattery({ supported: false, level: 75, charging: false });
      }
    } else {
      setBattery({ supported: false, level: 75, charging: false });
    }
  };

  // ডিভাইস ও হার্ডওয়্যার তথ্য সংগ্রহ
  const inspectDeviceAndSystem = async () => {
    const ua = navigator.userAgent;
    let os = 'Android';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    else if (ua.includes('Macintosh')) os = 'macOS';
    else if (ua.includes('Linux') && !ua.includes('Android')) os = 'Linux';

    const screenRes = `${window.screen.width * window.devicePixelRatio} x ${window.screen.height * window.devicePixelRatio} (${window.screen.width}x${window.screen.height} CSS)`;

    let connType = '4G / Wi-Fi';
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      connType = conn.effectiveType ? `${conn.effectiveType.toUpperCase()} (${conn.downlink || 0} Mbps)` : 'Wi-Fi/Cellular';
    }

    setDeviceInfo({
      browser: ua.includes('Chrome') ? 'Google Chrome / WebView' : 'Mobile Web Browser',
      os,
      platform: navigator.platform || 'Linux aarch64',
      screenResolution: screenRes,
      language: navigator.language || 'bn-BD',
      onlineStatus: navigator.onLine,
      cores: navigator.hardwareConcurrency || 8,
      memoryGb: (navigator as any).deviceMemory || 4,
      connectionType: connType,
      isNativeAndroid: ua.includes('Android'),
    });

    // স্টোরেজ পরিমাপ
    if (navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        if (estimate.quota && estimate.usage !== undefined) {
          setStorageEstimate({
            quotaGb: +(estimate.quota / (1024 * 1024 * 1024)).toFixed(2),
            usageGb: +(estimate.usage / (1024 * 1024 * 1024)).toFixed(2),
          });
        }
      } catch {}
    }

    // WebGL GPU রেন্ডারার
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          if (renderer) setGpuInfo(renderer);
        }
      }
    } catch {}
  };

  // লাইভ GPS লোকেশন নেওয়া
  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError(lang === 'bn' ? 'আপনার ব্রাউজার বা ডিভাইসে GPS সুবিধা পাওয়া যায়নি।' : 'Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const point: LocationPoint = {
          id: `loc-${Date.now()}`,
          timestamp: new Date().toISOString(),
          latitude: +pos.coords.latitude.toFixed(6),
          longitude: +pos.coords.longitude.toFixed(6),
          accuracy: Math.round(pos.coords.accuracy),
          speed: pos.coords.speed ? +(pos.coords.speed * 3.6).toFixed(1) : 0,
          heading: pos.coords.heading ? Math.round(pos.coords.heading) : null,
          note: newLocationNote.trim() || undefined,
        };

        setCurrentLocation(point);
        addLocationToHistory(point);
        setIsLocating(false);
        setNewLocationNote('');
        playBeep();
      },
      (err) => {
        setIsLocating(false);
        let msg = err.message;
        if (err.code === 1) {
          msg = lang === 'bn' 
            ? 'লোকেশনের অনুমতি দেওয়া হয়নি। ব্রাউজার বা অ্যান্ড্রয়েড সেটিংসে লোকেশন পারমিশন দিন।' 
            : 'Location permission was denied. Please allow GPS access in browser settings.';
        } else if (err.code === 2) {
          msg = lang === 'bn' 
            ? 'GPS স্যাটেলাইট বা নেটওয়ার্ক থেকে সিগন্যাল পাওয়া যায়নি।' 
            : 'GPS position unavailable. Ensure device location is turned ON.';
        } else if (err.code === 3) {
          msg = lang === 'bn' 
            ? 'লোকেশন খুঁজতে সময় বেশি লেগেছে (Timeout)। আবার চেষ্টা করুন।' 
            : 'Location request timed out. Please try again.';
        }
        setGpsError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // হিস্ট্রিতে যোগ করা ও সেভ
  const addLocationToHistory = (point: LocationPoint) => {
    setLocationHistory((prev) => {
      const updated = [point, ...prev.slice(0, 49)];
      if (typeof window !== 'undefined') {
        localStorage.setItem('mdr_location_history', JSON.stringify(updated));
      }
      return updated;
    });
  };

  // ব্যাকগ্রাউন্ড / লাইভ ট্র্যাকিং শুরু
  const startTracking = () => {
    if (!navigator.geolocation) {
      setGpsError(lang === 'bn' ? 'আপনার ডিভাইসে GPS সুবিধা পাওয়া যায়নি।' : 'Geolocation not supported.');
      return;
    }

    setIsTracking(true);
    setGpsError(null);
    fetchCurrentLocation();

    // ওয়াচ পজিশন
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const point: LocationPoint = {
          id: `loc-${Date.now()}`,
          timestamp: new Date().toISOString(),
          latitude: +pos.coords.latitude.toFixed(6),
          longitude: +pos.coords.longitude.toFixed(6),
          accuracy: Math.round(pos.coords.accuracy),
          speed: pos.coords.speed ? +(pos.coords.speed * 3.6).toFixed(1) : 0,
          heading: pos.coords.heading ? Math.round(pos.coords.heading) : null,
        };
        setCurrentLocation(point);
        addLocationToHistory(point);
        playBeep();
      },
      (err) => {
        console.warn('Watch position error:', err);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 5000,
      }
    );
  };

  // ট্র্যাকিং বন্ধ
  const stopTracking = () => {
    setIsTracking(false);
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  };

  // কোঅর্ডিনেট কপি
  const handleCopyCoordinates = () => {
    if (!currentLocation) return;
    const text = `${currentLocation.latitude}, ${currentLocation.longitude} (Accuracy: ±${currentLocation.accuracy}m)`;
    navigator.clipboard.writeText(text);
    setCopiedCoord(true);
    setTimeout(() => setCopiedCoord(false), 2500);
  };

  // ইমার্জেন্সি এসওএস বার্তা তৈরি ও কপি/শেয়ার
  const handleEmergencySOS = () => {
    const lat = currentLocation ? currentLocation.latitude : '23.8103';
    const lon = currentLocation ? currentLocation.longitude : '90.4125';
    const mapsLink = `https://www.google.com/maps?q=${lat},${lon}`;
    const batPercent = battery.level;
    const time = new Date().toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US');

    const sosMsg = lang === 'bn'
      ? `🚨 জরুরি লোকেশন অ্যালার্ট (Mafhuz Device Recovery)
বর্তমান অবস্থান: ${lat}, ${lon}
গুগল ম্যাপ লিংক: ${mapsLink}
ব্যাটারি চার্জ: ${batPercent}%
সময়: ${time}
অনুগ্রহ করে ডিভাইসের অবস্থান পরীক্ষা করুন!`
      : `🚨 EMERGENCY LOCATION ALERT (Mafhuz Device Recovery)
Coordinates: ${lat}, ${lon}
Google Maps: ${mapsLink}
Battery Level: ${batPercent}%
Time: ${time}
Please check device location!`;

    if (navigator.share) {
      navigator.share({
        title: 'Emergency Device Location',
        text: sosMsg,
        url: mapsLink,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(sosMsg);
      setSosCopied(true);
      setTimeout(() => setSosCopied(false), 2500);
    }
  };

  // হিস্ট্রি ডাউনলোড (JSON)
  const handleExportHistory = () => {
    if (locationHistory.length === 0) return;
    const blob = new Blob([JSON.stringify(locationHistory, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MDR_Location_History_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // হিস্ট্রি ক্লিয়ার
  const handleClearHistory = () => {
    if (confirm(lang === 'bn' ? 'আপনি কি সমস্ত সংরক্ষিত লোকেশন হিস্ট্রি মুছে ফেলতে চান?' : 'Clear all saved location history?')) {
      setLocationHistory([]);
      localStorage.removeItem('mdr_location_history');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in pb-16">
      {/* ১. শীর্ষ পরিচিতি ও স্ট্যাটাস ব্যানার */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 p-5 sm:p-6 border border-slate-700/80 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span>{lang === 'bn' ? 'লাইভ জিপিএস ও অ্যান্ড্রয়েড সিস্টেম তথ্য' : 'Live GPS & Android Diagnostics'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {lang === 'bn' ? 'ডিভাইস ট্র্যাকার ও সিস্টেম অডিট' : 'Device Tracker & System Audit'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {lang === 'bn' 
                ? 'অনুমোদিত GPS লাইভ ট্র্যাকিং, ব্যাটারি স্বাস্থ্য এবং হার্ডওয়্যার ডায়াগনস্টিকস।' 
                : 'Authorized GPS tracking, battery health monitoring, and hardware diagnostics.'}
            </p>
          </div>

          {/* এসওএস ইমার্জেন্সি শেয়ার বাটন */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleEmergencySOS}
              type="button"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition active:scale-95 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{sosCopied ? (lang === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (lang === 'bn' ? '🚨 SOS লোকেশন' : '🚨 SOS Alert')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ২. দৃশ্যমান ব্যাকগ্রাউন্ড ট্র্যাকিং অ্যাক্টিভ ব্যানার (User-controlled persistent notification) */}
      {isTracking && (
        <div className="rounded-2xl bg-gradient-to-r from-emerald-950/90 via-teal-950/90 to-cyan-950/90 border-2 border-emerald-500/60 p-4 shadow-xl shadow-emerald-500/10 animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                <Navigation className="w-5 h-5 animate-spin" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs sm:text-sm font-bold text-emerald-300">
                    {lang === 'bn' ? 'দৃশ্যমান ব্যাকগ্রাউন্ড লোকেশন ট্র্যাকিং সক্রিয় রয়েছে' : 'Visible Background Location Tracking Active'}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {lang === 'bn' 
                    ? 'আপনার ডিভাইসের GPS অবস্থান নিরবচ্ছিন্নভাবে রেকর্ড হচ্ছে। এটি বন্ধ করতে ডানপাশের বাটনে চাপুন।' 
                    : 'GPS coordinates are being actively logged. Click stop anytime to end tracking.'}
                </p>
              </div>
            </div>

            <button
              onClick={stopTracking}
              type="button"
              className="px-4 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>{lang === 'bn' ? 'ট্র্যাকিং বন্ধ করুন' : 'Stop Tracking'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ৩. লাইভ জিপিএস লোকেশন ও ইন্টারেক্টিভ ম্যাপ কার্ড */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {lang === 'bn' ? 'লাইভ GPS কোঅর্ডিনেট ও মানচিত্র' : 'Live GPS Coordinates & Map'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {permissionState === 'granted' 
                  ? (lang === 'bn' ? '✅ GPS অনুমতি প্রদান করা হয়েছে' : '✅ Geolocation Granted') 
                  : permissionState === 'denied'
                  ? (lang === 'bn' ? '❌ লোকেশন পারমিশন ব্লকড' : '❌ Geolocation Denied')
                  : (lang === 'bn' ? 'ব্রাউজার পারমিশন নিশ্চিত করুন' : 'Click to acquire position')}
              </p>
            </div>
          </div>

          {/* কন্ট্রোল বাটনসমূহ */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              type="button"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
              title={soundEnabled ? 'সাউন্ড বন্ধ করুন' : 'সাউন্ড চালু করুন'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {!isTracking ? (
              <button
                onClick={startTracking}
                type="button"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{lang === 'bn' ? 'লাইভ ট্র্যাকিং শুরু' : 'Start Live Tracking'}</span>
              </button>
            ) : (
              <button
                onClick={stopTracking}
                type="button"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{lang === 'bn' ? 'থামান' : 'Stop'}</span>
              </button>
            )}

            <button
              onClick={fetchCurrentLocation}
              disabled={isLocating}
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{isLocating ? (lang === 'bn' ? 'খোঁজা হচ্ছে...' : 'Locating...') : (lang === 'bn' ? 'অবস্থান রিফ্রেশ' : 'Refresh')}</span>
            </button>
          </div>
        </div>

        {/* এরর মেসেজ যদি থাকে */}
        {gpsError && (
          <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">{gpsError}</p>
              <p className="text-[11px] text-rose-300/80">
                {lang === 'bn' 
                  ? 'টিপস: ফোনের সেটিংসে গিয়ে লোকেশন অন রাখুন এবং ব্রাউজারকে লোকেশন ব্যবহারের অনুমতি দিন।' 
                  : 'Tip: Make sure Device Location is switched ON and Browser has permission.'}
              </p>
            </div>
          </div>
        )}

        {/* বর্তমান লোকেশন মেট্রিক্স গ্রিড */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">{lang === 'bn' ? 'অক্ষাংশ (Latitude)' : 'Latitude'}</span>
            <p className="text-sm sm:text-base font-bold text-white font-mono">
              {currentLocation ? currentLocation.latitude : '23.810332'}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">{lang === 'bn' ? 'দ্রাঘিমাংশ (Longitude)' : 'Longitude'}</span>
            <p className="text-sm sm:text-base font-bold text-white font-mono">
              {currentLocation ? currentLocation.longitude : '90.412518'}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">{lang === 'bn' ? 'নির্ভুলতা (Accuracy)' : 'Accuracy'}</span>
            <p className="text-sm sm:text-base font-bold text-emerald-400 font-mono">
              {currentLocation ? `±${currentLocation.accuracy} m` : '±12 m'}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">{lang === 'bn' ? 'গতি (Speed)' : 'Speed'}</span>
            <p className="text-sm sm:text-base font-bold text-cyan-400 font-mono">
              {currentLocation?.speed ? `${currentLocation.speed} km/h` : '0 km/h'}
            </p>
          </div>
        </div>

        {/* ইন্টারেক্টিভ ম্যাপ ভিউয়ার (OpenStreetMap Embed & Coordinates Navigation) */}
        <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 relative">
          <div className="h-64 sm:h-72 w-full relative">
            {currentLocation ? (
              <iframe
                title="Location Map"
                className="w-full h-full border-0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${currentLocation.longitude - 0.008}%2C${currentLocation.latitude - 0.005}%2C${currentLocation.longitude + 0.008}%2C${currentLocation.latitude + 0.005}&layer=mapnik&marker=${currentLocation.latitude}%2C${currentLocation.longitude}`}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-950/90">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 animate-bounce">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {lang === 'bn' ? 'লাইভ ম্যাপ দেখতে অবস্থান নির্ধারণ করুন' : 'Acquire GPS to View Live Map'}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    {lang === 'bn'
                      ? 'উপরের "অবস্থান রিফ্রেশ" বা "লাইভ ট্র্যাকিং শুরু" বাটনে ক্লিক করে ফোনের বর্তমান জিপিএস কোঅর্ডিনেট দেখুন।'
                      : 'Click "Refresh" or "Start Live Tracking" to pinpoint device on map.'}
                  </p>
                </div>
                <button
                  onClick={fetchCurrentLocation}
                  type="button"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {lang === 'bn' ? 'অবস্থান শনাক্ত করুন' : 'Locate Device Now'}
                </button>
              </div>
            )}
          </div>

          {/* ম্যাপ ওভারলে বার */}
          <div className="p-3 bg-slate-900/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="font-mono text-emerald-400 font-semibold">
                {currentLocation 
                  ? `${currentLocation.latitude}, ${currentLocation.longitude}` 
                  : 'Coordinates: Ready to scan'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCoordinates}
                type="button"
                disabled={!currentLocation}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition active:scale-95 disabled:opacity-40 cursor-pointer"
              >
                {copiedCoord ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCoord ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied') : (lang === 'bn' ? 'কোঅর্ডিনেট কপি' : 'Copy')}</span>
              </button>

              {currentLocation && (
                <a
                  href={`https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 text-xs font-medium border border-cyan-500/40 transition active:scale-95"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ৪. ব্যাটারির অবস্থা ও স্বাস্থ্য অডিট (Battery Health & Diagnostics) */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {battery.charging ? <BatteryCharging className="w-5 h-5 text-emerald-400" /> : <Battery className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              {lang === 'bn' ? 'ব্যাটারির অবস্থা ও পাওয়ার ডায়াগনস্টিকস' : 'Battery Status & Power Diagnostics'}
            </h2>
            <p className="text-[11px] text-slate-400">
              {lang === 'bn' ? 'Android Battery API এর মাধ্যমে লাইভ স্ট্যাটাস' : 'Live hardware telemetry via Battery Status API'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* ব্যাটারি লেভেল মিটার */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium">{lang === 'bn' ? 'চার্জের পরিমাণ' : 'Charge Level'}</span>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-2xl font-black ${
                  battery.level > 50 ? 'text-emerald-400' : battery.level > 20 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {battery.level}%
                </span>
                <span className="text-xs text-slate-500">
                  {battery.charging ? (lang === 'bn' ? 'চার্জিং' : 'Charging') : (lang === 'bn' ? 'ডিসচার্জিং' : 'Discharging')}
                </span>
              </div>
            </div>

            {/* ভিউয়াল ব্যাটারি গ্রাফিক */}
            <div className="w-14 h-7 rounded-lg border-2 border-slate-600 p-0.5 flex items-center relative">
              <div 
                className={`h-full rounded-sm transition-all duration-500 ${
                  battery.level > 50 ? 'bg-emerald-500' : battery.level > 20 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.max(8, battery.level)}%` }}
              />
              <div className="absolute -right-2 top-1.5 w-1.5 h-3 bg-slate-600 rounded-r-sm" />
            </div>
          </div>

          {/* চার্জিং পাওয়ার সোর্স */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-medium">{lang === 'bn' ? 'পাওয়ার সংযোগ' : 'Power Connection'}</span>
            <div className="flex items-center gap-2 pt-0.5">
              {battery.charging ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-bold text-emerald-300">
                    {lang === 'bn' ? 'অ্যাডাপ্টার / USB কানেক্টেড' : 'AC Adapter / USB Connected'}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                  <span className="text-sm font-bold text-slate-300">
                    {lang === 'bn' ? 'ব্যাটারি পাওয়ারে চলছে' : 'Running on Internal Battery'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* সেফটি রিকমেন্ডেশন */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-medium">{lang === 'bn' ? 'রিকভারি নিরাপত্তা' : 'Recovery Safety'}</span>
            <p className="text-xs font-semibold text-slate-200">
              {battery.level >= 50 ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'রিসেট বা রিকভারির জন্য নিরাপদ' : 'Safe for Recovery Operations'}</span>
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'সতর্কতা: ৫০%+ চার্জ করে নিন' : 'Charge above 50% first!'}</span>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* গুরুত্বপূর্ণ নির্দেশিকা নোট */}
        <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {lang === 'bn'
              ? 'জরুরি নিয়ম: যেকোনো অ্যান্ড্রয়েড ফোনের ফাস্টবুট, রিকভারি মোড বা ফার্মওয়্যার ফ্ল্যাশিংয়ের আগে ব্যাটারি কমপক্ষে ৫০% অথবা চার্জারে প্লাগড রাখা উচিত। প্রসেসের মাঝে ব্যাটারি বন্ধ হলে ফোন ব্রিক (Brick) হতে পারে।'
              : 'Safety Rule: Always maintain at least 50% battery before performing recovery mode, cache clears, or software procedures to prevent sudden power cutoff and bricking.'}
          </p>
        </div>
      </div>

      {/* ৫. বৈধ Android ডিভাইস ও হার্ডওয়্যার স্পেসিফিকেশন */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              {lang === 'bn' ? 'Android ও সিস্টেম হার্ডওয়্যার অডিট' : 'Android & Hardware System Audit'}
            </h2>
            <p className="text-[11px] text-slate-400">
              {lang === 'bn' ? 'ব্রাউজার ও সিস্টেম আর্কিটেকচার থেকে প্রাপ্ত বৈধ তথ্য' : 'Legitimately queried system parameters & capabilities'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === 'bn' ? 'অপারেটিং সিস্টেম' : 'Operating System'}</span>
            </div>
            <p className="text-sm font-bold text-white">{deviceInfo.os} ({deviceInfo.platform})</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>{lang === 'bn' ? 'ডিসপ্লে রেজোলিউশন' : 'Display Resolution'}</span>
            </div>
            <p className="text-sm font-bold text-white">{deviceInfo.screenResolution}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'bn' ? 'প্রসেসর কোর (Cores)' : 'CPU Cores'}</span>
            </div>
            <p className="text-sm font-bold text-white">{deviceInfo.cores} Cores (Logical)</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'bn' ? 'ডিভাইস মেমোরি (RAM)' : 'Device RAM (Est)'}</span>
            </div>
            <p className="text-sm font-bold text-white">~{deviceInfo.memoryGb} GB RAM</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              {deviceInfo.onlineStatus ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-rose-400" />}
              <span>{lang === 'bn' ? 'নেটওয়ার্ক সংযোগ' : 'Network Type'}</span>
            </div>
            <p className="text-sm font-bold text-white">{deviceInfo.connectionType}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <HardDrive className="w-3.5 h-3.5 text-teal-400" />
              <span>{lang === 'bn' ? 'ব্রাউজার স্টোরেজ কোটা' : 'Storage Quota'}</span>
            </div>
            <p className="text-sm font-bold text-white">
              {storageEstimate ? `${storageEstimate.usageGb} GB / ${storageEstimate.quotaGb} GB` : 'Available'}
            </p>
          </div>
        </div>

        {/* GPU গ্রাফিক্স তথ্য */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">{lang === 'bn' ? 'গ্রাফিক্স রেন্ডারার (GPU):' : 'Graphics Renderer (GPU):'}</span>
          <span className="font-mono text-cyan-300 font-semibold truncate max-w-xs">{gpuInfo}</span>
        </div>
      </div>

      {/* ৬. অনুমতিসহ লোকেশন হিস্ট্রি তালিকা (Location History Log) */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {lang === 'bn' ? 'অনুমতিসহ লোকেশন হিস্ট্রি ও লগ' : 'Location History & Breadcrumbs'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {lang === 'bn' ? `মোট ${locationHistory.length}টি রেকর্ড সংরক্ষিত আছে` : `${locationHistory.length} positions recorded`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportHistory}
              disabled={locationHistory.length === 0}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition active:scale-95 disabled:opacity-40 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON Export</span>
            </button>

            <button
              onClick={handleClearHistory}
              disabled={locationHistory.length === 0}
              type="button"
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 transition active:scale-95 disabled:opacity-40 cursor-pointer"
              title="হিস্ট্রি মুছুন"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ম্যানুয়াল নোট ইনপুট */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newLocationNote}
            onChange={(e) => setNewLocationNote(e.target.value)}
            placeholder={lang === 'bn' ? 'পরবর্তী লোকেশনের নোট লিখুন (যেমন: কাস্টমার শোরুম, সার্ভিস পয়েন্ট)...' : 'Note for next checkpoint (e.g. Service Center)...'}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          <button
            onClick={fetchCurrentLocation}
            type="button"
            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition cursor-pointer"
          >
            {lang === 'bn' ? 'লগ করুন' : 'Log Point'}
          </button>
        </div>

        {/* হিস্ট্রি তালিকা */}
        {locationHistory.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-950/50 border border-dashed border-slate-800 text-slate-500 text-xs">
            {lang === 'bn' 
              ? 'এখনো কোনো লোকেশন হিস্ট্রি সংরক্ষিত হয়নি। লাইভ ট্র্যাকিং শুরু করলে এখানে পয়েন্টগুলো যুক্ত হবে।' 
              : 'No location history recorded yet. Start tracking to see coordinate breadcrumbs.'}
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {locationHistory.map((item, idx) => (
              <div 
                key={item.id || idx}
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-400 font-bold">
                      {item.latitude}, {item.longitude}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      ±{item.accuracy}m
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span>{new Date(item.timestamp).toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US')}</span>
                    {item.note && <span className="text-amber-400">📝 {item.note}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="Google Maps"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
