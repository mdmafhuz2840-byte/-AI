export type AgentIconName =
  | 'Sparkles'
  | 'Palette'
  | 'Video'
  | 'KeyRound'
  | 'Receipt'
  | 'MessageSquareWarning'
  | 'Headset'
  | 'Calculator'
  | 'Cpu'
  | 'TrendingUp'
  | 'Share2'
  | 'MessageCircle'
  | 'Code2'
  | 'PenTool'
  | 'GraduationCap'
  | 'Languages'
  | 'HeartHandshake';

export interface Agent {
  id: string;
  name: string;
  shortName: string;
  role: string;
  prefix: string;
  iconName: AgentIconName;
  description: string;
  badge: string;
  colorClass: {
    bg: string;
    border: string;
    text: string;
    activeBg: string;
    glow: string;
  };
  starterPrompts: string[];
}

export const AI_AGENTS: Agent[] = [
  // ১. General AI
  {
    id: 'general',
    name: 'General AI',
    shortName: 'জেনারেল এআই',
    role: 'General AI & Everyday Analysis',
    prefix: '🤖 [মাহফুজুর রহমান AI — জেনারেল এআই]',
    iconName: 'Sparkles',
    description: 'দৈনন্দিন যেকোনো সাধারণ জিজ্ঞাসা, বিশ্লেষণ, পরিকল্পনা ও বহুমুখী সহায়তা।',
    badge: 'জেনারেল এআই',
    colorClass: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      activeBg: 'bg-emerald-600',
      glow: 'shadow-emerald-500/25',
    },
    starterPrompts: [
      'স্মার্টফোনের ব্যাটারি দীর্ঘস্থায়ী রাখার সেরা ৫টি প্রযুক্তিগত টিপস কী কী?',
      'অ্যান্ড্রয়েড ফোনের স্টোরেজ ফুল হয়ে গেলে ক্যাশে ফাইল নিরাপদে কীভাবে মুছবেন?',
      'একটি আদর্শ মোবাইল সার্ভিসিং শপ ম্যানেজমেন্টের প্রধান নিয়মাবলী কী?',
      'ক্লাউড ব্যাকআপ ও লোকাল স্টোরেজ ব্যাকআপের মধ্যে মূল পার্থক্য কী?',
    ],
  },

  // ২. Image Generator & Designer
  {
    id: 'image-generator',
    name: 'Image Generator & Designer',
    shortName: 'ইমেজ ও ডিজাইন',
    role: 'Imagen / Midjourney Prompt Specialist',
    prefix: '🤖 [মাহফুজুর রহমান AI — ইমেজ ও ডিজাইন জেনারেটর]',
    iconName: 'Palette',
    description: 'উচ্চমানের Imagen 3 ও Midjourney প্রম্পট, UI/UX লেআউট ও বাস্তবসম্মত ফটো কনসেপ্ট।',
    badge: 'ইমেজ ও ডিজাইন',
    colorClass: {
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/30',
      text: 'text-pink-400',
      activeBg: 'bg-pink-600',
      glow: 'shadow-pink-500/25',
    },
    starterPrompts: [
      'মোবাইল রিকভারি ল্যাব ও নিয়ন সাইবারপাঙ্ক ওয়ার্কস্পেসের জন্য একটি ফটোরিয়ালিস্টিক Imagen 3 প্রম্পট তৈরি করুন।',
      'Vivo Y21 আনলক টুল অ্যাপ্লিকেশনের জন্য আধুনিক ডার্ক মোড মোবাইল UI লেআউট প্রম্পট দিন।',
      'একটি প্রফেশনাল মোবাইল টেকনিশিয়ানের মাদারবোর্ড মাইক্রোস্কোপ রিপেয়ারিংয়ের সিনেমাটিক Midjourney v6 প্রম্পট দিন।',
      'প্রোডাক্ট প্যাকেজিং ও ডিজিটাল ক্যাশ মেমোর জন্য ৩ডি মিনিমালিস্ট আইকন ডিজাইন আর্ট প্রম্পট।',
    ],
  },

  // ৩. Video Creator & Storyboarder
  {
    id: 'video-creator',
    name: 'Video Creator & Storyboarder',
    shortName: 'ভিডিও ও স্ক্রিপ্ট',
    role: 'Sora / Runway Video Scriptwriter',
    prefix: '🤖 [মাহফুজুর রহমান AI — ভিডিও ও স্টোরিবোর্ড ক্রিয়েটর]',
    iconName: 'Video',
    description: 'YouTube/Reels স্ক্রিপ্ট, Sora/Runway প্রম্পট, দৃশ্য বিভাজন ও ভয়েসওভার।',
    badge: 'ভিডিও ক্রিয়েটর',
    colorClass: {
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      text: 'text-orange-400',
      activeBg: 'bg-orange-600',
      glow: 'shadow-orange-500/25',
    },
    starterPrompts: [
      '"Vivo Y21 প্যাটার্ন ভুলে গেছেন? ৩০ সেকেন্ডে সমাধান!" — রিলসের জন্য ৩-সেকেন্ড হুকসহ সম্পূর্ণ স্ক্রিপ্ট।',
      'Runway Gen-3 ও Sora-র জন্য মোবাইল মাদারবোর্ড জুম-ইন সিনেমাটিক ট্রানজিশন ভিডিও প্রম্পট দিন।',
      'ইউটিউব শর্টসের জন্য একটি ৩-সেকেন্ড হুকসহ মোবাইল রিপেয়ারিং ভিডিও প্ল্যান ও ভয়েসওভার।',
      'কাস্টমার স্যাটিসফ্যাকশন ও ডিভাইস আনলক ডেলিভারির ১ মিনিটের আবেগঘন ভিডিও স্টোরিবোর্ড।',
    ],
  },

  // ৪. Lock Diagnostics & Mobile Repair
  {
    id: 'lock-diagnostics',
    name: 'Lock Diagnostics & Mobile Repair',
    shortName: 'লক ডায়াগনস্টিকস',
    role: 'FRP, PIN & Hardware Recovery Specialist',
    prefix: '🤖 [মাহফুজুর রহমান AI — লক ডায়াগনস্টিকস]',
    iconName: 'KeyRound',
    description: 'প্যাটার্ন লক, পাসকোড, পিন, FRP বাইপাস, ফাস্টবুট, ফ্ল্যাশিং ও রিকভারি মোড।',
    badge: 'লক ডায়াগনস্টিকস',
    colorClass: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      activeBg: 'bg-amber-600',
      glow: 'shadow-amber-500/25',
    },
    starterPrompts: [
      'Vivo Y21 প্যাটার্ন লক ভুলে গেলে কীভাবে ডেটা না হারিয়ে রিকভারি মোডে যাওয়া যায়?',
      'Android ফোনে Recovery Mode-এ Clear Cache এবং Wipe Data এর পার্থক্য কী?',
      'FRP বাইপাস করার বৈধ নিয়ম এবং গুগল অ্যাকাউন্ট ভেরিফিকেশনের সঠিক সমাধান কী?',
      'Samsung ও Xiaomi ফোনে ফাস্টবুট বা ইমার্জেন্সি ডাউনলোড মোডে ঢোকার শর্টকাট কী?',
    ],
  },

  // ৫. Installment Manager
  {
    id: 'installment-manager',
    name: 'Installment Manager',
    shortName: 'কিস্তি ম্যানেজার',
    role: 'EMI Calculator & Payment Tracking',
    prefix: '🤖 [মাহফুজুর রহমান AI — কিস্তি ম্যানেজার]',
    iconName: 'Receipt',
    description: 'ইএমআই হিসাব, ডাউন পেমেন্ট, বকেয়া কিস্তির নোটিশ ও ডিজিটাল রসিদ ব্যবস্থাপনা।',
    badge: 'কিস্তি ম্যানেজার',
    colorClass: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      text: 'text-cyan-400',
      activeBg: 'bg-cyan-600',
      glow: 'shadow-cyan-500/25',
    },
    starterPrompts: [
      '২০,০০০ টাকার ফোনে ৫,০০০ টাকা ডাউন পেমেন্ট দিলে ৩ কিস্তিতে প্রতি মাসে কত দিতে হবে?',
      'গ্রাহকের বকেয়া কিস্তির জন্য মার্জিত ও পেশাদার এসএমএস রিমাইন্ডার ড্রাফট দিন।',
      'ডিজিটাল কিস্তি ক্যাশ মেমোতে কোন কোন আইনি শর্তাবলী উল্লেখ থাকা জরুরি?',
      'দেরিতে কিস্তি পরিশোধে পেনাল্টি হিসাব এবং ছাড় দেওয়ার সঠিক নিয়ম কী?',
    ],
  },

  // ৬. Complaint Generator
  {
    id: 'complaint-generator',
    name: 'Complaint Generator',
    shortName: 'অভিযোগ জেনারেটর',
    role: 'Legal Claims & Official Dispute Drafter',
    prefix: '🤖 [মাহফুজুর রহমান AI — অভিযোগ জেনারেটর]',
    iconName: 'MessageSquareWarning',
    description: 'ভোক্তা অধিকার (DNCRP), থানা জিডি, ক্ষতিপূরণ দাবি ও অফিশিয়াল লিগ্যাল নোটিশ।',
    badge: 'অভিযোগ জেনারেটর',
    colorClass: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      text: 'text-rose-400',
      activeBg: 'bg-rose-600',
      glow: 'shadow-rose-500/25',
    },
    starterPrompts: [
      'কিস্তি পরিশোধের পরও ফোন রিমোটলি আনলক না করলে ভোক্তা অধিকারে অভিযোগের ড্রাফট দিন।',
      'হারানো বা চোরাই ফোন ট্র্যাক করার জন্য নিকটস্থ থানায় সাধারণ ডায়েরি (GD) তৈরি করুন।',
      'সার্ভিস সেন্টারে ডিভাইস নষ্ট করে ফেরত দিলে ক্ষতিপূরণ চেয়ে আইনি নোটিশ ড্রাফট।',
      'ওয়ারেন্টি দাবির ক্ষেত্রে বিক্রেতা সহায়তা না করলে করণীয় আইনি পদক্ষেপ।',
    ],
  },

  // ৭. Customer Support
  {
    id: 'customer-support',
    name: 'Customer Support',
    shortName: 'কাস্টমার সাপোর্ট',
    role: '24/7 Helpdesk & Client Care Specialist',
    prefix: '🤖 [মাহফুজুর রহমান AI — কাস্টমার সাপোর্ট]',
    iconName: 'Headset',
    description: 'গ্রাহক সেবা, অভিযোগ সমাধান, সার্ভিসিং স্ট্যাটাস ও মার্জিত যোগাযোগ।',
    badge: 'কাস্টমার সাপোর্ট',
    colorClass: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      activeBg: 'bg-blue-600',
      glow: 'shadow-blue-500/25',
    },
    starterPrompts: [
      'একজন অসন্তুষ্ট গ্রাহকের অভিযোগ শুনে কীভাবে ঠান্ডা মাথায় সমাধান দেওয়া যায়?',
      'সার্ভিসিং ডেলিভারিতে দেরি হলে গ্রাহককে বিনম্রভাবে জানানোর মেসেজ ও কল স্ক্রিপ্ট।',
      'গ্রাহককে ডিভাইসের রিকভারি স্ট্যাটাস জানাতে স্ট্যান্ডার্ড মেসেজ ড্রাফট।',
      'গ্রাহক সন্তুষ্টি বৃদ্ধির জন্য সার্ভিস সেন্টারের সেরা ৫টি যোগাযোগ কৌশল।',
    ],
  },

  // ৮. Repair Calculator
  {
    id: 'repair-calculator',
    name: 'Repair Calculator',
    shortName: 'রিপেয়ার ক্যালকুলেটর',
    role: 'Parts Cost & Labor Estimator',
    prefix: '🤖 [মাহফুজুর রহমান AI — রিপেয়ার ক্যালকুলেটর]',
    iconName: 'Calculator',
    description: 'ডিসপ্লে, ব্যাটারি, পোর্ট ও মাদারবোর্ড মেরামতের খরচ ও পার্টস প্রাক্কলন।',
    badge: 'রিপেয়ার ক্যালকুলেটর',
    colorClass: {
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/30',
      text: 'text-violet-400',
      activeBg: 'bg-violet-600',
      glow: 'shadow-violet-500/25',
    },
    starterPrompts: [
      'Vivo Y21 এর ডিসপ্লে পরিবর্তন করতে সাধারণ বাজার দর ও সার্ভিস চার্জ কত হতে পারে?',
      'মোবাইল চার্জিং পোর্ট ও ব্যাটারি পরিবর্তনের সম্ভাব্য খরচের প্রাক্কলন তালিকা দিন।',
      'পানিতে পড়া ফোনের ওয়াটার ড্যামেজ সার্ভিসিং খরচের সঠিক হিসাব কীভাবে করবেন?',
      'অরিজিনাল বনাম ওলেড কপি ডিসপ্লের দাম ও স্থায়িত্বের তুলনামূলক হিসাব বুঝিয়ে বলুন।',
    ],
  },

  // ৯. Hardware & Software Specialist
  {
    id: 'hardware-software-specialist',
    name: 'Hardware & Software Specialist',
    shortName: 'হার্ডওয়্যার ও সফটওয়্যার',
    role: 'Full-Stack Code, IC & Firmware Master',
    prefix: '🤖 [মাহফুজুর রহমান AI — হার্ডওয়্যার ও সফটওয়্যার স্পেশালিস্ট]',
    iconName: 'Cpu',
    description: 'ফুল-স্ট্যাক কোডিং, এপিআই, আইসি শর্ট, বুট লুপ, ফ্ল্যাশিং ও ট্রাবলশুটিং।',
    badge: 'হার্ডওয়্যার ও সফটওয়্যার',
    colorClass: {
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/30',
      text: 'text-indigo-400',
      activeBg: 'bg-indigo-600',
      glow: 'shadow-indigo-500/25',
    },
    starterPrompts: [
      'ফোন হঠাৎ ডেড হয়ে গেলে পাওয়ার আইসি নাকি ব্যাটারির সমস্যা তা মাল্টিমিটারে কীভাবে মাপবেন?',
      'MediaTek প্রসেসরের ফোনে বুটলুপ বা রিস্টার্ট লুপ ফিক্স করার ফার্মওয়্য্যার ফ্ল্যাশ নিয়ম।',
      'শর্ট সার্কিট হওয়া মাদারবোর্ডে থার্মাল ক্যামেরা বা রোসিন পেস্ট দিয়ে ফল্ট খোঁজার কৌশল।',
      'React ও Express দিয়ে রিয়েল-টাইম ফলব্যাক হ্যান্ডলিংয়ের পরিচ্ছন্ন কোড আর্কিটেকচার দেখান।',
    ],
  },

  // ১০. Marketing Manager
  {
    id: 'marketing-manager',
    name: 'Marketing Manager',
    shortName: 'মার্কেটিং ম্যানেজার',
    role: 'Viral Ads, FB Ads & Growth Strategist',
    prefix: '🤖 [মাহফুজুর রহমান AI — মার্কেটিং ম্যানেজার]',
    iconName: 'TrendingUp',
    description: 'ভাইরাল বিজ্ঞাপন, গুগল/ফেসবুক অ্যাড কপি, প্রমোশনাল স্ট্র্যাটেজি ও সেলস হুক।',
    badge: 'মার্কেটিং ম্যানেজার',
    colorClass: {
      bg: 'bg-fuchsia-500/10',
      border: 'border-fuchsia-500/30',
      text: 'text-fuchsia-400',
      activeBg: 'bg-fuchsia-600',
      glow: 'shadow-fuchsia-500/25',
    },
    starterPrompts: [
      'মোবাইল সার্ভিসিং শপের জন্য ঈদ বা বিশেষ উৎসবের আকর্ষণীয় ডিসকাউন্ট অফার প্ল্যান ও ফেসবুক অ্যাড কপি।',
      'লোকাল কাস্টমার আকর্ষণ করতে একটি সেরা লিড জেনারেশন প্রচারণার আইডিয়া ও সেলস হুক।',
      'পুরোনো ফোন এক্সচেঞ্জ ও কিস্তি সুবিধার জন্য হাই-কনভার্টিং সেলস পিচ তৈরি করুন।',
      'গুগল ম্যাপস ও লোকাল এসইও দিয়ে সার্ভিস সেন্টারের কাস্টমার বাড়ানোর সেরা ৫টি কৌশল।',
    ],
  },

  // ১১. Auto WhatsApp & Facebook Automation
  {
    id: 'social-automation',
    name: 'Auto WhatsApp & Facebook Automation',
    shortName: 'অটো সোশ্যাল মিডিয়া',
    role: 'WhatsApp & Social Media Bot Automator',
    prefix: '🤖 [মাহফুজুর রহমান AI — অটো সোশ্যাল মিডিয়া ম্যানেজার]',
    iconName: 'Share2',
    description: 'স্বয়ংক্রিয় রিপ্লাই ফ্লো, হোয়াটসঅ্যাপ বট স্ক্রিপ্ট ও সোশ্যাল মিডিয়া শিডিউলিং।',
    badge: 'অটো সোশ্যাল মিডিয়া',
    colorClass: {
      bg: 'bg-teal-500/10',
      border: 'border-teal-500/30',
      text: 'text-teal-400',
      activeBg: 'bg-teal-600',
      glow: 'shadow-teal-500/25',
    },
    starterPrompts: [
      'ফোন সার্ভিসিং সম্পন্ন হওয়ার পর গ্রাহককে স্বয়ংক্রিয়ভাবে পাঠানোর জন্য রেডি-টু-সেন্ড হোয়াটসঅ্যাপ বার্তা।',
      'কিস্তির নির্ধারিত তারিখ পার হয়ে যাওয়ার পর মার্জিত ভাষায় ফলো-আপ হোয়াটসঅ্যাপ রিমাইন্ডার ফ্লো।',
      'ফেসবুক পেজ ইনবক্সের জন্য স্বয়ংক্রিয় ওয়েলকাম মেসেজ ও তাৎক্ষণিক FAQ উত্তর স্ক্রিপ্ট।',
      'নতুন অফার ও আনলক সেবার জন্য গ্রাহকদের ব্রডকাস্ট হোয়াটসঅ্যাপ ক্যাম্পেইন টেমপ্লেট।',
    ],
  },

  // ১২. মানবসেবা ও সমাজকল্যাণ অ্যাসিস্ট্যান্ট (বাংলাদেশ সেবামূলক সংগঠন)
  {
    id: 'welfare-specialist',
    name: 'মানবসেবা ও সমাজকল্যাণ অ্যাসিস্ট্যান্ট',
    shortName: 'মানবসেবা ও কল্যাণ',
    role: 'Blood Donation & Social Welfare Assistant',
    prefix: '🤖 [মাহফুজুর রহমান AI — মানবসেবা ও সমাজকল্যাণ অ্যাসিস্ট্যান্ট]',
    iconName: 'HeartHandshake',
    description: 'রক্তদান, জরুরি সেবা, মানবিক সাহায্য ও বাংলাদেশ সেবামূলক সংগঠনের সার্বিক সহায়তা।',
    badge: 'বাংলাদেশ সেবামূলক সংগঠন',
    colorClass: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      text: 'text-rose-400',
      activeBg: 'bg-rose-600',
      glow: 'shadow-rose-500/25',
    },
    starterPrompts: [
      'জরুরি এ নেগেটিভ (A-) রক্তের প্রয়োজনে ফেসবুক ও হোয়াটসঅ্যাপে পোস্ট দেওয়ার জন্য একটি নিখুঁত আবেদনপত্র ড্রাফট করুন।',
      'বাংলাদেশ সেবামূলক সংগঠনের মাধ্যমে অসহায় ও দরিদ্র পরিবারের মাঝে সাহায্য বিতরণের কার্যক্রম পরিকল্পনা।',
      'জাতীয় জরুরি সেবা ৯৯৯ এবং স্বাস্থ্য বাতায়ন ১৬২৬৩ হটলাইন ব্যবহারের সঠিক নির্দেশনা।',
      'রক্তদানের পর দ্রুত শক্তি ফিরে পাওয়ার জন্য স্বাস্থ্যকর খাবার ও জরুরি সচেতনতামূলক টিপস।',
    ],
  },
];
