/**
 * মাহফুজুর রহমান AI — Master Upgrade & Agent Types
 */

export type ToolStatus = 'Ready' | 'Needs API Key' | 'Incomplete' | 'Tested';

export interface RegisteredTool {
  id: string;
  nameBn: string;
  nameEn: string;
  category: 'ai' | 'search' | 'hardware' | 'finance' | 'system' | 'creative';
  purpose: string;
  status: ToolStatus;
  requiredPermissions: string[];
  availableFunctions: string[];
  lastTestedAt?: string;
  testResult?: {
    success: boolean;
    message: string;
    latencyMs?: number;
  };
  endpoint?: string;
}

export interface AgentHealthStatus {
  id: string;
  name: string;
  role: string;
  prefixTag: string;
  status: 'healthy' | 'warning' | 'error';
  onlineSearchCapable: boolean;
  visionCapable: boolean;
  codeGenCapable: boolean;
  promptWordCount: number;
  lastTestLatencyMs?: number;
  lastTestPassed?: boolean;
}

export interface MasterAuditReport {
  timestamp: string;
  systemHealth: 'OPTIMAL' | 'DEGRADED' | 'OFFLINE';
  version: string;
  agentsTotal: number;
  agentsHealthy: number;
  onlineSearchActive: boolean;
  activeProviders: string[];
  securityAudits: Array<{
    check: string;
    passed: boolean;
    detail: string;
  }>;
  identifiedIssues: Array<{
    id: string;
    severity: 'critical' | 'warning' | 'info';
    title: string;
    description: string;
    repairable: boolean;
    fixed?: boolean;
  }>;
  endpointsStatus: Record<string, 'ok' | 'error' | 'pending'>;
  searchTest?: {
    tested: boolean;
    query: string;
    sourcesCount: number;
    sources: Array<{ title: string; uri: string }>;
    latencyMs: number;
  };
}

export interface PlannerTask {
  id: string;
  title: string;
  category: 'maintenance' | 'feature' | 'diagnostic' | 'security' | 'customer';
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in_progress' | 'completed';
  assignedAgent: string;
  createdAt: string;
  completedAt?: string;
  steps: string[];
}

export interface AgentUpgradeProposal {
  id: string;
  agentId: string;
  agentName: string;
  currentVersion: string;
  targetVersion: string;
  title: string;
  summary: string;
  changes: string[];
  proposedPromptSnippet: string;
  expectedBenefits: string[];
  status: 'pending_review' | 'approved' | 'rejected' | 'applied' | 'rolled_back';
  createdAt: string;
  reviewedAt?: string;
  reviewNote?: string;
  testPassed?: boolean;
}

export interface SystemSnapshot {
  id: string;
  version: string;
  title: string;
  timestamp: string;
  description: string;
  agentsState: Record<string, {
    version: string;
    promptPreview: string;
    prefixTag: string;
  }>;
  isCurrent: boolean;
}

