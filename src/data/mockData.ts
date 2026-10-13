import { InstallmentRecord, ComplaintTicket, DiagnosticItem } from '../types/recovery';

export interface PhoneBrand {
  id: string;
  name: string;
  models: string[];
}

export const PHONE_BRANDS: PhoneBrand[] = [
  {
    id: 'vivo',
    name: 'Vivo',
    models: [
      'Vivo Y21',
      'Vivo Y21s',
      'Vivo Y21t',
      'Vivo Y20',
      'Vivo Y22',
      'Vivo Y16',
      'Vivo V23',
      'Vivo V25',
    ],
  },
  {
    id: 'samsung',
    name: 'Samsung',
    models: [
      'Galaxy A14',
      'Galaxy A24',
      'Galaxy A54',
      'Galaxy M14',
      'Galaxy F13',
      'Galaxy S21 FE',
    ],
  },
  {
    id: 'xiaomi',
    name: 'Xiaomi / Redmi',
    models: [
      'Redmi Note 11',
      'Redmi Note 12',
      'Redmi 10C',
      'Redmi 12',
      'Poco M4 Pro',
    ],
  },
  {
    id: 'realme',
    name: 'Realme',
    models: [
      'Realme C35',
      'Realme C55',
      'Realme 9 Pro',
      'Realme 10',
      'Realme Narzo 50',
    ],
  },
  {
    id: 'oppo',
    name: 'Oppo',
    models: [
      'Oppo A16',
      'Oppo A17',
      'Oppo A57',
      'Oppo Reno 8',
    ],
  },
  {
    id: 'tecno_infinix',
    name: 'Tecno / Infinix',
    models: [
      'Tecno Spark 10 Pro',
      'Tecno Camon 20',
      'Infinix Hot 30',
      'Infinix Note 30',
    ],
  },
];

export const LOCK_MESSAGES = [
  {
    id: 'screen_forgot',
    labelBn: 'পিন বা প্যাটার্ন ভুলে গেছেন (Too many attempts)',
    labelEn: 'Forgot PIN / Pattern / Password',
    type: 'screen_lock',
  },
  {
    id: 'google_frp_prompt',
    labelBn: 'রিসেটের পর পূর্বের Google Account চাওয়া (FRP Lock)',
    labelEn: 'Verify your Google account (Factory Reset Protection)',
    type: 'google_frp',
  },
  {
    id: 'emi_finance_locked',
    labelBn: 'কিস্তি বকেয়া জনিত লক (Device Locked by Retailer / EMI)',
    labelEn: 'Device Locked by Finance/Retailer (EMI Overdue)',
    type: 'installment_lock',
  },
  {
    id: 'vivo_y21_stuck',
    labelBn: 'Vivo Y21 রিস্টার্ট লুপ বা লোগোতে আটকে থাকা (Bootloop)',
    labelEn: 'Vivo Y21 Stuck on Logo / Bootloop',
    type: 'vivo_y21',
  },
  {
    id: 'network_sim_locked',
    labelBn: 'সিম কার্ড বা নেটওয়ার্ক পিন লক (SIM PUK / Carrier Lock)',
    labelEn: 'SIM Network PUK / Carrier Lock',
    type: 'network',
  },
];

// প্রাথমিক ডায়াগনস্টিক ও রিকভারি নির্দেশিকা ডাটাবেস
export const DIAGNOSTIC_GUIDES: Record<string, {
  titleBn: string;
  titleEn: string;
  requiresDataLossWarning: boolean;
  stepsBn: string[];
  stepsEn: string[];
  officialNoticeBn: string;
  officialNoticeEn: string;
}> = {
  vivo_y21: {
    titleBn: 'Vivo Y21 অফিসিয়াল রিকভারি ও ফাস্টবুট সমাধান গাইড',
    titleEn: 'Vivo Y21 Official Recovery & Fastboot Procedure',
    requiresDataLossWarning: true,
    stepsBn: [
      '১. ফোনটি সম্পূর্ণ বন্ধ (Power Off) করুন। অন্তত ৩০ সেকেন্ড অপেক্ষা করুন।',
      '২. একই সাথে ভলিউম আপ (Volume Up) এবং পাওয়ার বাটন (Power Button) চেপে ধরে রাখুন যতক্ষণ না "Fastboot Mode" স্ক্রিনে আসে।',
      '৩. ভলিউম ডাউন বাটন দিয়ে "Recovery Mode" সিলেক্ট করুন এবং পাওয়ার বাটন চেপে প্রবেশ করুন।',
      '৪. স্ক্রিনে Vivo Recovery মেনু আসলে প্রথমে "Clear Data" অপশনে যান এবং "Clear Cache" এ ট্যাপ করুন (এতে সাধারণত ডেটা নষ্ট হয় না)।',
      '৫. যদি সমস্যা সমাধান না হয়, তবে "Clear all data" দিন। ⚠️ সতর্কতা: এতে ফোনের সকল ছবি, কন্ট্যাক্ট ও ফাইল মুছে যাবে!',
      '৬. "Restart" এ ট্যাপ করে ফোন চালু হতে ৩-৫ মিনিট সময় দিন।',
    ],
    stepsEn: [
      '1. Turn off the Vivo Y21 completely. Wait at least 30 seconds.',
      '2. Press and hold Volume Up + Power button simultaneously until the Vivo Fastboot screen appears.',
      '3. Use Volume Down to highlight "Recovery Mode" and press Power button to select.',
      '4. On the Vivo Recovery screen, tap "Clear Data", then select "Clear Cache" first (this will not erase personal files).',
      '5. If the issue persists, select "Clear all data". ⚠️ CAUTION: This will permanently wipe all photos, contacts, and personal files!',
      '6. Tap "Restart" and wait 3-5 minutes for normal system boot.',
    ],
    officialNoticeBn: 'যদি ফাস্টবুটেও সমস্যা ঠিক না হয়, তবে মাদারবোর্ড বা eMMC চিপ ত্রুটির জন্য নিকটস্থ অনুমোদিত Vivo কাস্টমার কেয়ারে ক্যাশ মেমোসহ যোগাযোগ করুন।',
    officialNoticeEn: 'If fastboot recovery fails, visit an authorized Vivo Customer Service center with purchase invoice for official hardware inspection.',
  },
  screen_lock: {
    titleBn: 'স্ক্রিন লক (PIN / Pattern) বৈধ রিকভারি পদ্ধতি',
    titleEn: 'Legitimate Screen Lock (PIN / Pattern) Recovery',
    requiresDataLossWarning: true,
    stepsBn: [
      '১. অফিসিয়াল রিমোট পদ্ধতি (Google Find My Device): কম্পিউটার বা অন্য মোবাইল থেকে google.com/android/find এ গিয়ে আপনার ডিভাইসের জিমেইলে লগইন করুন।',
      '২. আপনার ফোনটি নির্বাচন করুন। যদি ব্যাকআপ থাকে, আপনি সেখান থেকে "Erase Device" দিয়ে রিমোটলি লক ক্লিয়ার করতে পারেন।',
      '৩. স্যামসাং ব্যবহারকারীদের জন্য: SmartThings Find (smartthingsfind.samsung.com) এ লগইন করে সরাসরি "Unlock" ফিচার ব্যবহার করা সম্ভব (যদি পূর্বে স্যামসাং অ্যাকাউন্ট কানেক্ট করা থাকে)।',
      '৪. হার্ড রিসেট পদ্ধতি: ব্র্যান্ড অনুযায়ী ভলিউম কী + পাওয়ার কী দিয়ে রিকভারি মোডে প্রবেশ করে "Wipe data / Factory reset" করুন।',
    ],
    stepsEn: [
      '1. Google Find My Device (Official Remote Method): Visit google.com/android/find and sign in with the Google Account synced on the phone.',
      '2. Select your device. If you have cloud backups, you can use "Erase Device" to reset the device lock remotely.',
      '3. For Samsung users: Visit smartthingsfind.samsung.com and use the official "Unlock" button if your Samsung account was previously configured.',
      '4. Recovery Hard Reset: Power off device, hold Volume Key + Power Key to enter official Recovery Mode, and choose "Wipe data / Factory reset".',
    ],
    officialNoticeBn: 'হার্ড রিসেট করলে ডিভাইসের ভেতরের সব তথ্য ডিলিট হয়ে যাবে। রিসেটের পর অবশ্যই ফোনের আগের জিমেইল অ্যাকাউন্ট মনে রাখতে হবে।',
    officialNoticeEn: 'A hard reset wipes all local files. You must know the previously synced Google account to set up the phone afterwards.',
  },
  google_frp: {
    titleBn: 'Google FRP লক (Factory Reset Protection) বৈধ ভেরিফিকেশন',
    titleEn: 'Google FRP (Factory Reset Protection) Official Verification',
    requiresDataLossWarning: false,
    stepsBn: [
      '১. FRP হলো চুরিরোধে গুগলের নিজস্ব নিরাপত্তা স্তর। এটি কোনো অননুমোদিত উপায়ে বাইপাস করা আইনি নীতিমালার পরিপন্থী।',
      '২. ফোনে রিসেটের পূর্বে যে জিমেইল ও পাসওয়ার্ড ছিল, ওয়াই-ফাই কানেক্ট করে হুবহু তা ইনপুট দিন।',
      '৩. পাসওয়ার্ড মনে না থাকলে "Forgot email?" অথবা "Forgot password?" দিয়ে রিকভারি ফোন নম্বর বা বিকল্প ইমেইলের মাধ্যমে পাসওয়ার্ড রিসেট করুন।',
      '৪. যদি ডিভাইসটির আসল ক্রেতা আপনি হন এবং পাসওয়ার্ড কোনোভাবেই রিকভার না হয়, তবে আসল ক্রয় রসিদ (Cash Memo / IMEI Invoice) নিয়ে ব্র্যান্ডের অফিশিয়াল সার্ভিস সেন্টারে যান। তারা বৈধ মালিকানা নিশ্চিত করে গুগল ডাটাবেসে রিকোয়েস্ট পাঠাবে।',
    ],
    stepsEn: [
      '1. FRP is an integrated anti-theft security layer designed by Google. Bypassing it without credentials violates security standards.',
      '2. Connect to Wi-Fi and enter the exact Google email and password previously synced on the phone before reset.',
      '3. If you forgot the password, tap "Forgot password?" and use your recovery phone number or secondary email to reset it via Google account recovery.',
      '4. If you are the legitimate owner but cannot recover the account, bring your original purchase invoice and phone box to an authorized brand service center for official identity verification.',
    ],
    officialNoticeBn: 'অননুমোদিত থার্ড-পার্টি FRP বাইপাস সফটওয়্যার ব্যবহারে ফোনের IMEI করাপ্ট হতে পারে এবং সিকিউরিটি প্যাচ নষ্ট হয়। সর্বদা অফিশিয়াল উপায় অবলম্বন করুন।',
    officialNoticeEn: 'Unauthorized third-party FRP bypass tools often corrupt IMEI and security patches. Always rely on official recovery channels.',
  },
  installment_lock: {
    titleBn: 'কিস্তি বা ফাইন্যান্স লক (EMI Lock) সমাধান ও অধিকার নির্দেশিকা',
    titleEn: 'Installment / Finance Lock (EMI Lock) Settlement Guide',
    requiresDataLossWarning: false,
    stepsBn: [
      '১. কিস্তি লক কোনো সফটওয়্যার ভাইরাস নয়; এটি ফাইন্যান্স প্রদানকারী কোম্পানি (যেমন: PayJoy, DMI Finance, Cloud Knox ইত্যাদি) কর্তৃক পরিচালিত সার্ভার লক।',
      '২. আপনার সমস্ত বকেয়া কিস্তির হিসাব যাচাই করুন। বিকাশ, নগদ বা ব্যাংক রশিদের ট্রানজেকশন আইডি নিশ্চিত করুন।',
      '৩. কিস্তি পরিশোধের পর ফোনটিকে সক্রিয় ওয়াই-ফাই বা মোবাইল নেটওয়ার্কে যুক্ত রাখুন, যাতে আনলক কমান্ড সার্ভার থেকে স্বয়ংক্রিয়ভাবে ডিভাইসে আসতে পারে।',
      '৪. যদি পেমেন্ট করার পরও ২৪ ঘণ্টার বেশি ফোন লক থাকে, তবে অ্যাপের "অভিযোগ সহায়তা" সেকশন থেকে আনুষ্ঠানিক অভিযোগপত্র তৈরি করে ডিলার ও কাস্টমার কেয়ারে জমা দিন।',
    ],
    stepsEn: [
      '1. EMI Lock is a legitimate device management security lock enforced by retailers/finance partners (e.g. PayJoy, DMI, Knox Guard) for overdue payments.',
      '2. Verify and gather all transaction records, receipt slips, and payment proof (bKash, Nagad, or Bank deposit slips).',
      '3. After full installment clearance, keep the device connected to an active Wi-Fi or cellular network so the unlock signal can sync from the remote server.',
      '4. If the device remains locked after 24 hours of clearance, use this app\'s "Complaint Assist" tool to draft a formal grievance for the merchant and consumer protection authority.',
    ],
    officialNoticeBn: 'কিস্তি লক কখনো থার্ড-পার্টি ফার্মওয়্যার দিয়ে ফ্ল্যাশ করে ভাঙার চেষ্টা করবেন না। এতে ডিভাইস ব্ল্যাকলিস্টেড হবে এবং ওয়ারেন্টি বাতিল হয়ে যাবে।',
    officialNoticeEn: 'Never attempt unauthorized firmware flashing for installment locks. This blacklists the device and permanently voids consumer warranty.',
  },
};

// নমুনা কিস্তি ও রসিদ ডেটা (Sample Demonstration Data)
export const INITIAL_INSTALLMENTS: InstallmentRecord[] = [
  {
    id: 'inst-01',
    receiptNo: 'REC-2026-1042',
    customerName: 'মো: রফিকুল ইসলাম',
    phone: '01712345678',
    deviceModel: 'Vivo Y21 (4GB/64GB)',
    deviceImeiOrSerial: '864219053124891',
    totalPrice: 15500,
    downPayment: 5000,
    totalInstallments: 6,
    paidInstallments: 4,
    installmentAmount: 1750,
    lastPaymentDate: '2026-10-05',
    nextDueDate: '2026-11-05',
    status: 'active',
    paymentHistory: [
      {
        paymentId: 'pay-01',
        date: '2026-07-05',
        amount: 5000,
        method: 'Cash',
        receivedBy: 'মাহফুজুর রহমান (ম্যানেজার)',
        receiptNote: 'ডাউন পেমেন্ট ও ডেলিভারি',
      },
      {
        paymentId: 'pay-02',
        date: '2026-08-05',
        amount: 1750,
        method: 'bKash',
        receivedBy: 'মোবাইল ক্যাশিয়ার',
        receiptNote: '১ম কিস্তি পরিশোধ (Trx: BK89X23)',
      },
      {
        paymentId: 'pay-03',
        date: '2026-09-05',
        amount: 1750,
        method: 'Nagad',
        receivedBy: 'মোবাইল ক্যাশিয়ার',
        receiptNote: '২য় কিস্তি পরিশোধ (Trx: NG55102)',
      },
      {
        paymentId: 'pay-04',
        date: '2026-10-05',
        amount: 1750,
        method: 'bKash',
        receivedBy: 'অফিস কাউন্টার',
        receiptNote: '৩য় কিস্তি পরিশোধ (Trx: BK99411)',
      },
    ],
  },
  {
    id: 'inst-02',
    receiptNo: 'REC-2026-1088',
    customerName: 'তানজিলা আক্তার',
    phone: '01898765432',
    deviceModel: 'Samsung Galaxy A14',
    deviceImeiOrSerial: '358921092837412',
    totalPrice: 17000,
    downPayment: 7000,
    totalInstallments: 4,
    paidInstallments: 4,
    installmentAmount: 2500,
    lastPaymentDate: '2026-09-20',
    nextDueDate: 'সম্পূর্ণ পরিশোধিত',
    status: 'completed',
    paymentHistory: [
      {
        paymentId: 'pay-11',
        date: '2026-06-20',
        amount: 7000,
        method: 'Cash',
        receivedBy: 'মাহফুজুর রহমান',
        receiptNote: 'ডাউন পেমেন্ট',
      },
      {
        paymentId: 'pay-12',
        date: '2026-09-20',
        amount: 10000,
        method: 'Bank',
        receivedBy: 'অ্যাকাউন্টস',
        receiptNote: 'সকল কিস্তি সম্পূর্ণ পরিশোধ ও ফাইনাল ছাড়পত্র',
      },
    ],
  },
];

// নমুনা অভিযোগ ডেটা (Sample Complaint Demonstrations)
export const INITIAL_COMPLAINTS: ComplaintTicket[] = [
  {
    id: 'comp-01',
    ticketNo: 'MDR-2026-0041',
    customerName: 'মো: নাজমুল হুদা',
    phone: '01911223344',
    deviceModel: 'Vivo Y21',
    issueType: 'emi_lock',
    description: 'গত ০৩ অক্টোবর ২০২৬ তারিখে সমস্ত কিস্তি (রশিদ নং REC-2026-098) পরিশোধ করার পরও ফোনে "Device Locked by Finance" নোটিফিকেশন আসছে এবং স্ক্রিন আনলক হচ্ছে না। ডিলারকে জানানো হলেও সার্ভার আপডেট হয়নি বলে জানানো হচ্ছে।',
    status: 'under_review',
    submittedDate: '2026-10-06',
    updatedDate: '2026-10-08',
    resolutionNote: 'ভেন্ডর ক্লাউড পোর্টাল এপিআইতে রসিদ ট্রানজেকশন যাচাইয়ের জন্য পাঠানো হয়েছে।',
    technicianAssigned: 'ইঞ্জিনিয়ার তানভীর',
  },
  {
    id: 'comp-02',
    ticketNo: 'MDR-2026-0019',
    customerName: 'শারমিন জাহান',
    phone: '01655443322',
    deviceModel: 'Samsung Galaxy A14',
    issueType: 'frp_lock',
    description: 'ফোন রিসেট করার পর নিজের পুরাতন জিমেইল দিয়ে লগইন করতে গেলে টু-ফ্যাক্টর এসএমএস আসছে না কারণ সিম কার্ড হারিয়ে গেছে। আসল ক্যাশ মেমো আছে।',
    status: 'in_progress',
    submittedDate: '2026-10-02',
    updatedDate: '2026-10-05',
    resolutionNote: 'গ্রাহককে টেলিকম কাস্টমার কেয়ারে গিয়ে সিম রি-ইস্যু করতে পরামর্শ দেওয়া হয়েছে।',
    technicianAssigned: 'সার্ভিস ডেস্ক',
  },
];
