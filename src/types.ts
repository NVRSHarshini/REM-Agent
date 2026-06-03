export interface Customer {
  id: string;
  name: string;
  type: 'premium' | 'standard' | 'enterprise';
  issuePattern: string;
  riskNote: string;
}

export interface BillingRecord {
  id: string;
  customerId: string;
  amount: number;
  date: string;
  status: 'successful' | 'failed';
  details: string;
}

export interface Policy {
  topic: string;
  rule: string;
}

export interface ApprovalRecord {
  id: string;
  customerId: string;
  status: 'verified' | 'missing' | 'expired' | 'requires_manager';
  details: string;
  date: string;
}

export interface Span {
  id: string;
  name: string;
  parentId?: string;
  startTime: number; // millisecond timestamp
  endTime: number;
  attributes: {
    user_request?: string;
    agent_response?: string;
    model_name?: string;
    tool_name?: string;
    tool_input?: string;
    tool_output?: string;
    risk_level?: 'low' | 'medium' | 'high';
    decision?: string;
    trace_status?: 'success' | 'risky' | 'failed';
    missing_required_tools?: string;
    detected_issue?: string;
    dream_source_trace_id?: string;
    dream_prompt?: string;
    dream_result?: string;
    guardrail_generated?: string;
    safety_score_before?: string;
    safety_score_after?: string;
    [key: string]: any;
  };
}

export interface Trace {
  id: string;
  timestamp: string;
  request: string;
  response: string;
  spans: Span[];
  riskLevel: 'low' | 'medium' | 'high';
  status: 'success' | 'risky' | 'failed';
  detectedIssue?: string;
  missingTools: string[];
  toolsCalled: string[];
  decision: string;
  exportStatus?: 'local' | 'attempted' | 'sent' | 'failed';
  complianceScore?: number;
  verdict?: 'compliant' | 'risky' | 'non_compliant';
  complianceReason?: string;
  requiredToolsMissing?: string[];
  unsafeActionDetected?: boolean;
  escalationRequired?: boolean;
}

export interface DreamScenario {
  id: string;
  sourceTraceId: string;
  originalFailurePattern: string;
  generatedDreamPrompt: string;
}

export interface DreamReplay {
  id: string;
  sourceTraceId: string;
  originalFailurePattern: string;
  dreamPrompt: string;
  agentResponse: string;
  pass: boolean;
  reason: string;
  toolsUsed: string[];
  missingTools: string[];
  suggestedFix: string;
  complianceScore?: number;
  verdict?: 'compliant' | 'risky' | 'non_compliant';
  complianceReason?: string;
  requiredToolsMissing?: string[];
  unsafeActionDetected?: boolean;
  escalationRequired?: boolean;
}

export interface RegressionTest {
  name: string;
  description: string;
  expectedBehaviour: string;
}

export interface MorningReport {
  id: string;
  date: string;
  tracesAnalyzedCount: number;
  dreamsGeneratedCount: number;
  dreamsPassedCount: number;
  dreamsFailedCount: number;
  beforeSafetyScore: number;
  afterSafetyScore: number;
  repeatedWeaknesses: string[];
  guardrails: {
    guardrail_name: string;
    required_tools: string[];
    block_if: string[];
    human_review_if: string[];
  }[];
  regenSummary: string;
  regressionTests: RegressionTest[];
  applied: boolean;
  failurePatterns?: {
    patternName: string;
    description: string;
    evidenceTraceId: string;
    generatedRule: string;
    detected: boolean;
  }[];
}

export interface IntegrationStatus {
  connected: boolean;
  endpoint: string;
  space: string;
  project: string;
  exportMode: 'Local-Only' | 'Export Enabled' | 'Export Failed';
  lastTraceId: string;
  lastExportStatus: string;
  lastExportError?: string;
  localCount: number;
  successfulExports: number;
}
