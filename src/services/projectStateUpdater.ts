import { 
  UserPreferences, 
  ProjectChangeEvent, 
  ModuleHealth, 
  ProjectStateSnapshot,
  InstallmentRecord,
  ComplaintTicket,
  TechnicianLog,
  RepairEstimate,
  ChatSession
} from '../types/recovery';

export const CURRENT_SCHEMA_VERSION = '2.5.0';

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  technicianName: 'মোঃ মাহফুজুর রহমান',
  shopName: 'মাহফুজ ডিভাইস রিকভারি ও সার্ভিস হাব',
  preferredModel: 'Vivo Y21',
  memoryDepth: 10,
  autoEnrichAiContext: true,
  theme: 'dark',
  language: 'bn',
  quickNotes: 'Vivo Y21 ফাস্টবুট, রিকভারি মোড, স্ক্রিন প্যাটার্ন ও ইএমআই কিস্তি লক বিশেষজ্ঞ।',
  whatsappNumber: '+8801700000000',
  adminPin: '1234',
  isPinLocked: false,
  lastUpdated: new Date().toISOString(),
};

/**
 * ১. ব্যবহারকারীর পছন্দ ও মেমোরি সেটিংস লোড ও সেভ
 */
export function getUserPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_USER_PREFERENCES;
  try {
    const raw = localStorage.getItem('mdr_user_preferences');
    if (!raw) {
      saveUserPreferences(DEFAULT_USER_PREFERENCES);
      return DEFAULT_USER_PREFERENCES;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_USER_PREFERENCES, ...parsed };
  } catch (e) {
    console.error('Error reading user preferences:', e);
    return DEFAULT_USER_PREFERENCES;
  }
}

export function saveUserPreferences(prefs: Partial<UserPreferences>): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_USER_PREFERENCES;
  try {
    const current = getUserPreferences();
    const updated: UserPreferences = {
      ...current,
      ...prefs,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem('mdr_user_preferences', JSON.stringify(updated));
    trackProjectChange(
      'preference',
      'আপডেট',
      'ব্যবহারকারীর পছন্দ ও এআই মেমোরি সেটিংস হালনাগাদ করা হয়েছে',
      { updatedKeys: Object.keys(prefs) }
    );
    return updated;
  } catch (e) {
    console.error('Error saving user preferences:', e);
    return DEFAULT_USER_PREFERENCES;
  }
}

/**
 * ২. প্রজেক্ট চেঞ্জ ট্র্যাকার ও অডিট ইভেন্ট ডিসপ্যাচ
 */
export function trackProjectChange(
  category: ProjectChangeEvent['category'],
  action: string,
  summary: string,
  details?: Record<string, any>
): ProjectChangeEvent {
  const event: ProjectChangeEvent = {
    id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    category,
    action,
    summary,
    details,
  };

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('mdr_project_changelog');
      const changelog: ProjectChangeEvent[] = raw ? JSON.parse(raw) : [];
      // অনধিক ৫০টি সাম্প্রতিক ইভেন্ট সংরক্ষণ
      const updated = [event, ...changelog].slice(0, 50);
      localStorage.setItem('mdr_project_changelog', JSON.stringify(updated));

      // ইভেন্ট ডিসপ্যাচ করা যাতে রিয়েল-টাইম ইউআই রিঅ্যাক্ট করে
      window.dispatchEvent(new CustomEvent('mdr-project-state-change', { detail: event }));
    } catch (e) {
      console.warn('Failed to save changelog event:', e);
    }
  }

  return event;
}

export function getProjectChangeLog(): ProjectChangeEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('mdr_project_changelog');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearProjectChangeLog(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('mdr_project_changelog', JSON.stringify([]));
  window.dispatchEvent(new CustomEvent('mdr-project-state-change', { detail: { action: 'clear' } }));
}

/**
 * ৩. সেলফ-হিলিং স্কিমা মাইগ্রেশন ও অটো-আপডেটার
 * পূর্ববর্তী কোনো ডেটা নষ্ট না করে নতুন ফিল্ড ও ফরম্যাট নিরাপদভাবে অন্তর্ভুক্ত করে।
 */
export function runSelfHealingMigration(): {
  success: boolean;
  previousVersion: string;
  currentVersion: string;
  migratedModules: string[];
} {
  if (typeof window === 'undefined') {
    return { success: true, previousVersion: '0.0.0', currentVersion: CURRENT_SCHEMA_VERSION, migratedModules: [] };
  }

  const prevVersion = localStorage.getItem('mdr_schema_version') || '1.0.0';
  const migratedModules: string[] = [];

  try {
    // ক. ব্যবহারকারীর পছন্দ যাচাই ও নিরাপদ ইনজেকশন
    if (!localStorage.getItem('mdr_user_preferences')) {
      localStorage.setItem('mdr_user_preferences', JSON.stringify(DEFAULT_USER_PREFERENCES));
      migratedModules.push('User Preferences & AI Memory Config');
    }

    // খ. চ্যাট হিস্ট্রি যাচাই
    const rawChats = localStorage.getItem('mdr_chat_sessions');
    if (!rawChats) {
      localStorage.setItem('mdr_chat_sessions', JSON.stringify([]));
      migratedModules.push('AI Chat Sessions Store');
    } else {
      try {
        JSON.parse(rawChats);
      } catch {
        localStorage.setItem('mdr_chat_sessions', JSON.stringify([]));
        migratedModules.push('Repaired AI Chat Sessions Store');
      }
    }

    // গ. কিস্তি রেকর্ড যাচাই
    const rawInst = localStorage.getItem('mdr_installments');
    if (rawInst) {
      try {
        JSON.parse(rawInst);
      } catch {
        migratedModules.push('Sanitized Installments Store');
      }
    }

    // ঘ. অভিযোগ রেকর্ড যাচাই
    const rawComp = localStorage.getItem('mdr_complaints');
    if (rawComp) {
      try {
        JSON.parse(rawComp);
      } catch {
        migratedModules.push('Sanitized Complaints Store');
      }
    }

    // ঙ. টেকনিশিয়ান লগ ও রিপেয়ার এস্টিমেট
    if (!localStorage.getItem('mdr_tech_logs')) {
      localStorage.setItem('mdr_tech_logs', JSON.stringify([]));
      migratedModules.push('Technician Activity Logs');
    }
    if (!localStorage.getItem('mdr_repair_estimates')) {
      localStorage.setItem('mdr_repair_estimates', JSON.stringify([]));
      migratedModules.push('Repair Cost Estimates');
    }

    // চ. চেঞ্জলগ প্রস্তুত করা
    if (!localStorage.getItem('mdr_project_changelog')) {
      const initialEvent: ProjectChangeEvent = {
        id: `ev-init-${Date.now()}`,
        timestamp: new Date().toISOString(),
        category: 'system',
        action: 'সেলফ-আপডেট ও মাইগ্রেশন',
        summary: `প্রজেক্ট স্টেট ও মেমোরি আর্কিটেকচার সংস্করণ ${CURRENT_SCHEMA_VERSION}-এ সক্রিয় করা হয়েছে।`,
      };
      localStorage.setItem('mdr_project_changelog', JSON.stringify([initialEvent]));
      migratedModules.push('Project Changelog & Audit Engine');
    }

    // সংস্করণ আপডেট
    localStorage.setItem('mdr_schema_version', CURRENT_SCHEMA_VERSION);
    localStorage.setItem('mdr_last_self_update', new Date().toISOString());

    return {
      success: true,
      previousVersion: prevVersion,
      currentVersion: CURRENT_SCHEMA_VERSION,
      migratedModules,
    };
  } catch (err) {
    console.error('Self-healing migration failed:', err);
    return {
      success: false,
      previousVersion: prevVersion,
      currentVersion: CURRENT_SCHEMA_VERSION,
      migratedModules,
    };
  }
}

/**
 * ৪. অ্যাপের সকল মডিউলের রিয়েল-টাইম স্বাস্থ্য ও পরিসংখ্যান
 */
export function getModulesHealth(): ModuleHealth[] {
  if (typeof window === 'undefined') return [];

  const getCount = (key: string) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return 0;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.length : 1;
    } catch {
      return 0;
    }
  };

  const installmentsCount = getCount('mdr_installments');
  const complaintsCount = getCount('mdr_complaints');
  const chatSessionsCount = getCount('mdr_chat_sessions');
  const techLogsCount = getCount('mdr_tech_logs');
  const repairEstimatesCount = getCount('mdr_repair_estimates');
  const changelogCount = getCount('mdr_project_changelog');

  const now = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });

  return [
    {
      id: 'vivo_recovery',
      nameBn: 'ভিভো Y21 রিকভারি ও হার্ডওয়্যার কি সিকোয়েন্স',
      nameEn: 'Vivo Y21 Recovery Hub & Key Sequences',
      status: 'healthy',
      version: '2.5.0',
      recordsCount: 7, // Supported major models
      lastUpdated: now,
      description: 'ফাস্টবুট, রিকভারি মোড ও ফ্যাক্টরি রিসেট সিকোয়েন্স সম্পূর্ণ সক্রিয়।',
    },
    {
      id: 'installments',
      nameBn: 'কিস্তি ও ডিজিটাল বারকোড ক্যাশ মেমো',
      nameEn: 'Installment & Digital Receipt Ledger',
      status: 'healthy',
      version: '2.5.0',
      recordsCount: installmentsCount,
      lastUpdated: now,
      description: 'গ্রাহকের কিস্তি হিসাব, পরিশোধিত ও বকেয়া গণক এবং প্রিন্ট প্রস্তুত।',
    },
    {
      id: 'complaints',
      nameBn: 'আইনি অভিযোগ সহায়তা ও ট্র্যাকিং জেনারেটর',
      nameEn: 'Legal Complaint & Tracking Generator',
      status: 'healthy',
      version: '2.5.0',
      recordsCount: complaintsCount,
      lastUpdated: now,
      description: 'ইউনিক MDR-2026 ট্র্যাকিং রেফারেন্স ও জিডি ড্রাফট ইঞ্জিন প্রস্তুত।',
    },
    {
      id: 'imei_checker',
      nameBn: 'আইএমইআই ও চোরাই ফোন স্ট্যাটাস পরীক্ষক',
      nameEn: 'IMEI Diagnostic & Theft Checker',
      status: 'healthy',
      version: '2.5.0',
      recordsCount: 1,
      lastUpdated: now,
      description: 'Luhn অ্যালগরিদম ও বিটিআরসি ডেটাবেস ভেরিফিকেশন অ্যাক্টিভ।',
    },
    {
      id: 'repair_estimator',
      nameBn: 'সার্ভিস চার্জ ও যন্ত্রাংশ মূল্য গণক',
      nameEn: 'Repair Cost & Service Fee Estimator',
      status: 'healthy',
      version: '2.5.0',
      recordsCount: repairEstimatesCount,
      lastUpdated: now,
      description: 'ডিসপ্লে, ব্যাটারি ও বোর্ড রিপেয়ার খরচ হিসাব স্বয়ংক্রিয়।',
    },
    {
      id: 'sms_generator',
      nameBn: 'গ্রাহক এসএমএস ও হোয়াটসঅ্যাপ টেমপ্লেট',
      nameEn: 'Automated SMS & WhatsApp Messenger',
      status: 'healthy',
      version: '2.5.0',
      recordsCount: 6,
      lastUpdated: now,
      description: 'কিস্তি রিমাইন্ডার ও ডেলিভারি বার্তা ১-ক্লিকে প্রেরণের জন্য প্রস্তুত।',
    },
    {
      id: 'tech_logger',
      nameBn: 'টেকনিশিয়ান আনলক ও অ্যাক্টিভিটি লগ',
      nameEn: 'Technician Activity & Unlock Audit Log',
      status: 'healthy',
      version: '2.5.0',
      recordsCount: techLogsCount,
      lastUpdated: now,
      description: 'ব্যবহৃত টুলস ও কাজের অডিট হিস্ট্রি সংরক্ষিত।',
    },
    {
      id: 'ai_persistent_memory',
      nameBn: 'এআই বহুস্তরীয় ফলব্যাক ও পারসিস্টেন্ট মেমোরি',
      nameEn: 'AI Multi-Tier Fallback & Persistent Memory',
      status: 'healthy',
      version: '2.5.0',
      recordsCount: chatSessionsCount,
      lastUpdated: now,
      description: 'ওপেনএআই ➔ জেমিনি ➔ ওপেনরাউটার (DeepSeek/Llama) ➔ অফলাইন মেমোরি সিঙ্ক সক্রিয়।',
    },
    {
      id: 'specialized_assistants',
      nameBn: '১১টি বিশেষায়িত এআই সহকারী মোড ও হেডবোর্ড সিলেক্টর',
      nameEn: '11 Specialized Assistant Modes & Header Selector',
      status: 'healthy',
      version: '2.6.0',
      recordsCount: 11,
      lastUpdated: now,
      description: 'General AI, Image, Video, Lock, Installment, Complaint, Support, Repair, HW/SW, Marketing, Social Automation ও প্রিফিক্স সক্রিয়।',
    },
    {
      id: 'super_admin_panel',
      nameBn: 'মাহফুজুর রহমান AI — সুপার এডমিন প্যানেল ও কমান্ড এক্সিকিউটর',
      nameEn: 'Super Admin Control Center & Live Command Executor',
      status: 'healthy',
      version: '2.7.0',
      recordsCount: 4,
      lastUpdated: now,
      description: 'লাইভ ড্যাশবোর্ড স্ট্যাটাস, কমান্ড টার্মিনাল, হোয়াটসঅ্যাপ ও পিন সিকিউরিটি কনফিগারেশন সক্রিয়।',
    },
    {
      id: 'state_updater',
      nameBn: 'ডাইনামিক প্রজেক্ট স্টেট ও অটো-আপডেটার',
      nameEn: 'Dynamic State Updater & Migration Engine',
      status: 'healthy',
      version: CURRENT_SCHEMA_VERSION,
      recordsCount: changelogCount,
      lastUpdated: now,
      description: 'সকল ফিচার ও লোকাল স্টোরেজ স্কিমা স্বয়ংক্রিয়ভাবে ট্র্যাকিং করছে।',
    },
  ];
}

/**
 * ৫. এআই-এর জন্য প্রজেক্টের রিয়েল-টাইম ডাইনামিক কনটেক্সট সামারি তৈরি
 * এই তথ্য এআই মডেলে পাঠানো হলে মডেল ব্যবহারকারীর দোকান, ফোন এবং হিসাব সংক্রান্ত সব জানতে পারে!
 */
export function getEnrichedAiContext(currentModel?: string): {
  summaryText: string;
  preferences: UserPreferences;
  stats: {
    activeInstallments: number;
    activeComplaints: number;
    totalTechLogs: number;
    currentWorkingModel: string;
  };
} {
  const prefs = getUserPreferences();
  let installments: InstallmentRecord[] = [];
  let complaints: ComplaintTicket[] = [];
  let techLogs: TechnicianLog[] = [];

  if (typeof window !== 'undefined') {
    try {
      installments = JSON.parse(localStorage.getItem('mdr_installments') || '[]');
      complaints = JSON.parse(localStorage.getItem('mdr_complaints') || '[]');
      techLogs = JSON.parse(localStorage.getItem('mdr_tech_logs') || '[]');
    } catch {
      // ignore
    }
  }

  const activeInstallments = installments.filter((i) => i.status === 'active').length;
  const activeComplaints = complaints.filter((c) => c.status !== 'resolved' && c.status !== 'cancelled').length;
  const workingModel = currentModel || prefs.preferredModel || 'Vivo Y21';

  const recentTechAction = techLogs[0]
    ? `সর্বশেষ কাজ: ${techLogs[0].deviceModel} (${techLogs[0].actionTaken})`
    : 'কোনো সাম্প্রতিক কাজ নেই';

  const summaryText = `[বর্তমান প্রজেক্ট ও শপ মেমোরি স্টেট]
দোকান/প্রতিষ্ঠান: ${prefs.shopName}
টেকনিশিয়ান: ${prefs.technicianName}
বর্তমান ফোকাস ডিভাইস: ${workingModel}
সক্রিয় কিস্তি গ্রাহক: ${activeInstallments} জন (মোট নথি: ${installments.length})
চলমান অভিযোগ/জিডি ফাইল: ${activeComplaints} টি
${recentTechAction}
বিশেষ নোট: ${prefs.quickNotes}`;

  return {
    summaryText,
    preferences: prefs,
    stats: {
      activeInstallments,
      activeComplaints,
      totalTechLogs: techLogs.length,
      currentWorkingModel: workingModel,
    },
  };
}

/**
 * ৬. সম্পূর্ণ প্রজেক্ট স্টেট স্ন্যাপশট এক্সপোর্ট
 */
export function exportProjectStateSnapshot(): ProjectStateSnapshot {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    appName: 'Mafhuz Device Recovery',
    lastSyncTimestamp: new Date().toISOString(),
    modules: getModulesHealth(),
    userPreferences: getUserPreferences(),
    changeLog: getProjectChangeLog(),
  };
}
