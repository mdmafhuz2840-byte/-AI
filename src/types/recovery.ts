/**
 * Mafhuz Device Recovery & Service Hub - Data Models and Interfaces
 */

// ১. ডিভাইস ও ব্যাটারি তথ্য
export interface DeviceInfo {
  browser: string;
  os: string;
  platform: string;
  screenResolution: string;
  language: string;
  onlineStatus: boolean;
  cores?: number;
  memoryGb?: number;
  connectionType?: string;
  isNativeAndroid: boolean;
}

export interface BatteryState {
  supported: boolean;
  level: number; // 0 to 100%
  charging: boolean;
  chargingTime?: number;
  dischargingTime?: number;
}

// ২. জিপিএস লোকেশন পয়েন্ট
export interface LocationPoint {
  id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  accuracy: number; // meters
  speed?: number | null;
  heading?: number | null;
  note?: string;
}

// ৩. কিস্তি ও পেমেন্ট রশিদ (Installment & Receipt)
export interface InstallmentRecord {
  id: string;
  receiptNo: string;
  customerName: string;
  phone: string;
  deviceModel: string;
  deviceImeiOrSerial: string;
  totalPrice: number;
  downPayment: number;
  totalInstallments: number;
  paidInstallments: number;
  installmentAmount: number;
  lastPaymentDate: string;
  nextDueDate: string;
  status: 'active' | 'completed' | 'overdue';
  paymentHistory: Array<{
    paymentId: string;
    date: string;
    amount: number;
    method: 'Cash' | 'bKash' | 'Nagad' | 'Bank';
    receivedBy: string;
    receiptNote?: string;
  }>;
}

// ৪. অভিযোগ ট্র্যাকিং (Complaints / Grievances)
export interface ComplaintTicket {
  id: string;
  ticketNo: string;
  customerName: string;
  phone: string;
  deviceModel: string;
  issueType: 'screen_lock' | 'frp_lock' | 'emi_lock' | 'hardware' | 'network' | 'other';
  description: string;
  status: 'submitted' | 'under_review' | 'in_progress' | 'resolved' | 'cancelled';
  submittedDate: string;
  updatedDate: string;
  resolutionNote?: string;
  technicianAssigned?: string;
}

// ৫. ট্রাবলশুটিং ও ডায়াগনস্টিকস
export interface DiagnosticItem {
  id: string;
  title: string;
  category: 'screen_lock' | 'google_frp' | 'installment_lock' | 'battery_power' | 'network' | 'vivo_y21';
  severity: 'info' | 'warning' | 'critical';
  description: string;
  officialSolutionSteps: string[];
  ethicalWarning?: string;
  applicableModels?: string[];
}

// ৬. আইএমইআই ও চোরাই ফোন স্ট্যাটাস
export interface ImeiCheckResult {
  imei: string;
  isValidLuhn: boolean;
  tac: string;
  brand: string;
  model: string;
  blacklistStatus: 'clean' | 'blacklisted' | 'reported_lost' | 'blocked_btrc' | 'unregistered';
  btrcCompliant: boolean;
  btrcCheckSms: string; // "KYD <IMEI>" to 16002
  checkedAt: string;
  notes: string;
}

// ৭. রিপেয়ার ও সার্ভিস চার্জ এস্টিমেট
export interface RepairEstimate {
  id: string;
  estimateNo: string;
  customerName: string;
  customerPhone: string;
  deviceBrand: string;
  deviceModel: string;
  repairCategory: 'screen' | 'battery' | 'charging_port' | 'motherboard' | 'authorized_flashing' | 'back_glass';
  partQuality: 'original' | 'oled' | 'grade_a' | 'compatible';
  partsCost: number;
  laborCost: number;
  discount: number;
  totalCost: number;
  warrantyPeriod: string;
  estimatedTime: string;
  createdAt: string;
}

// ৮. টেকনিশিয়ান অ্যাক্টিভিটি ও আনলক লগ
export interface TechnicianLog {
  id: string;
  logNo: string;
  technicianName: string;
  deviceModel: string;
  imeiOrSerial: string;
  customerName: string;
  customerPhone: string;
  issueDescription: string;
  toolsUsed: string[];
  actionTaken: string;
  unlockNotes: string;
  status: 'completed' | 'in_progress' | 'pending_parts' | 'cancelled';
  serviceFee: number;
  timestamp: string;
}

// ৯. মেসেজ টেমপ্লেট
export interface MessageTemplateData {
  id: string;
  type: 'installment_reminder' | 'payment_received' | 'repair_received' | 'repair_ready' | 'unlock_ready' | 'security_warning';
  titleBn: string;
  titleEn: string;
  templateBn: string;
  templateEn: string;
}

// ১০. অ্যাপ সেটিংস ও ব্যাকআপ
export interface AppSettings {
  autoLocationTracking: boolean;
  locationUpdateIntervalSeconds: number;
  soundAlerts: boolean;
  theme: 'dark' | 'light';
  privacyPolicyAccepted: boolean;
}

export interface AppBackupData {
  version: string;
  exportDate: string;
  installments: InstallmentRecord[];
  complaints: ComplaintTicket[];
  locationHistory: LocationPoint[];
  technicianLogs?: TechnicianLog[];
  repairEstimates?: RepairEstimate[];
  chatHistory?: ChatSession[];
  userPreferences?: UserPreferences;
  changeLog?: ProjectChangeEvent[];
  settings: AppSettings;
}

// ৮. এআই চ্যাট হিস্ট্রি ও মেমোরি টাইপস
export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ChatAttachment {
  name: string;
  mimeType: string;
  data: string; // base64 string
  url?: string;
  previewUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  agentId?: string;
  model?: string;
  fallbackUsed?: boolean;
  provider?: string;
  attachment?: ChatAttachment;
  sources?: GroundingSource[];
}

export interface ChatSession {
  id: string;
  title: string;
  agentId: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

// ১১. ব্যবহারকারীর পছন্দ ও এআই মেমোরি সেটিংস
export interface UserPreferences {
  technicianName: string;
  shopName: string;
  preferredModel: string;
  memoryDepth: number; // যেমন ৫, ১০, ২০
  autoEnrichAiContext: boolean;
  theme: 'dark' | 'light';
  language: 'bn' | 'en';
  quickNotes: string;
  whatsappNumber?: string;
  adminPin?: string;
  isPinLocked?: boolean;
  lastUpdated: string;
}

// ১২. স্বয়ংক্রিয় প্রজেক্ট চেঞ্জ ট্র্যাকার ও অডিট ইভেন্ট
export interface ProjectChangeEvent {
  id: string;
  timestamp: string;
  category: 'ai_memory' | 'installment' | 'complaint' | 'diagnostic' | 'imei' | 'estimate' | 'tech_log' | 'preference' | 'system';
  action: string;
  summary: string;
  details?: Record<string, any>;
}

// ১৩. মডিউল স্বাস্থ্য ও ইন্টিগ্রিটি স্ট্যাটাস
export interface ModuleHealth {
  id: string;
  nameBn: string;
  nameEn: string;
  status: 'healthy' | 'warning' | 'migrated';
  version: string;
  recordsCount: number;
  lastUpdated: string;
  description: string;
}

// ১৪. পূর্ণাঙ্গ প্রজেক্ট স্টেট স্ন্যাপশট
export interface ProjectStateSnapshot {
  schemaVersion: string;
  appName: string;
  lastSyncTimestamp: string;
  modules: ModuleHealth[];
  userPreferences: UserPreferences;
  changeLog: ProjectChangeEvent[];
}
