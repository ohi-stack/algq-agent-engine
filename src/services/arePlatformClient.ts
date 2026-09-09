/**
 * Algonquian Real Estate Platform Client
 *
 * Browser-safe integration layer used by the Agent Engine app, website mount,
 * and WordPress admin/plugin mount. The Agent Engine never becomes the
 * authoritative owner of Deals, underwriting, offers, documents, funding,
 * buyers, or transaction state; it calls the ARE platform/service boundary.
 */

import type { AutomationTrigger, FundingSource, RealEstateDeal } from "../types";

export type ARERuntimeSurface = "agent_app" | "website" | "wordpress_admin";
export type ARESyncMode = "dual" | "api" | "wordpress" | "offline";

export interface AREInjectedRuntimeConfig {
  apiUrl?: string;
  wordpressRestUrl?: string;
  wordpressNonce?: string;
  surface?: ARERuntimeSurface;
  syncMode?: ARESyncMode;
  clientId?: string;
  appVersion?: string;
  currentUserId?: string | number;
  currentUserName?: string;
  capabilities?: string[];
}

export interface AREPlatformSnapshot {
  revision?: string;
  generatedAt?: string;
  deals: RealEstateDeal[];
  funds: FundingSource[];
  triggers: AutomationTrigger[];
  automationLogs?: string[];
  approvals?: unknown[];
  agentRuns?: unknown[];
  health?: Record<string, unknown>;
  source?: "api" | "wordpress" | "offline";
}

export interface AREServiceCallRequest {
  service: string;
  action: string;
  dealId?: string;
  payload?: Record<string, unknown>;
  correlationId?: string;
  idempotencyKey?: string;
}

export interface AREServiceCallResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  correlationId: string;
  source: "api" | "wordpress";
  status: number;
}

export interface AREPlatformHealth {
  ok: boolean;
  source: "api" | "wordpress" | "offline";
  apiReachable: boolean;
  wordpressReachable: boolean;
  checkedAt: string;
  details?: Record<string, unknown>;
}

interface EndpointCandidate {
  source: "api" | "wordpress";
  baseUrl: string;
}

declare global {
  interface Window {
    ARE_AGENT_ENGINE_CONFIG?: AREInjectedRuntimeConfig;
  }
}

const env = import.meta.env as Record<string, string | undefined>;

function trimSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function detectRuntimeSurface(): ARERuntimeSurface {
  if (typeof window === "undefined") return "agent_app";
  const injected = window.ARE_AGENT_ENGINE_CONFIG?.surface;
  if (injected) return injected;

  const path = window.location.pathname.toLowerCase();
  const host = window.location.hostname.toLowerCase();
  if (path.includes("/wp-admin") || document.body?.classList.contains("wp-admin")) {
    return "wordpress_admin";
  }
  if (host === "algonquianrealestate.com" || host.endsWith(".algonquianrealestate.com")) {
    return "website";
  }
  return "agent_app";
}

export function getAREPlatformRuntimeConfig() {
  const injected = typeof window !== "undefined" ? window.ARE_AGENT_ENGINE_CONFIG || {} : {};
  const surface = injected.surface || detectRuntimeSurface();
  const syncMode = (injected.syncMode || env.VITE_ARE_SYNC_MODE || "dual") as ARESyncMode;

  return {
    apiUrl: trimSlash(injected.apiUrl || env.VITE_ARE_API_URL || "https://api.algonquianrealestate.com/v1"),
    wordpressRestUrl: trimSlash(
      injected.wordpressRestUrl ||
        env.VITE_ARE_WORDPRESS_REST_URL ||
        "https://algonquianrealestate.com/wp-json/algq/v1",
    ),
    wordpressNonce: injected.wordpressNonce || "",
    surface,
    syncMode,
    clientId: injected.clientId || env.VITE_ARE_CLIENT_ID || "algq-agent-engine",
    appVersion: injected.appVersion || env.VITE_ARE_APP_VERSION || "0.2.0",
    currentUserId: injected.currentUserId,
    currentUserName: injected.currentUserName,
    capabilities: injected.capabilities || [],
  };
}

export function createCorrelationId(prefix = "are"): string {
  const cryptoObj = globalThis.crypto;
  if (cryptoObj && "randomUUID" in cryptoObj) {
    return `${prefix}-${cryptoObj.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createIdempotencyKey(scope: string, dealId?: string): string {
  return [scope, dealId || "global", Date.now(), Math.random().toString(36).slice(2, 10)].join(":");
}

export const CANONICAL_DEAL_STATE_MAP: Record<string, string> = {
  "New Intake": "LEAD_NEW",
  "Due Diligence": "DUE_DILIGENCE",
  Underwriting: "UNDERWRITING",
  "Offer Submitted": "OFFER_SENT",
  "Seller Negotiation": "NEGOTIATION",
  "Under Contract": "UNDER_CONTRACT",
  "Funded & Closed": "CLOSED",
  Archived: "ARCHIVED",
};

export function toCanonicalDealState(displayState: string): string {
  return CANONICAL_DEAL_STATE_MAP[displayState] || displayState;
}

function endpointCandidates(): EndpointCandidate[] {
  const config = getAREPlatformRuntimeConfig();
  if (config.syncMode === "offline") return [];
  if (config.syncMode === "api") return [{ source: "api", baseUrl: config.apiUrl }];
  if (config.syncMode === "wordpress") return [{ source: "wordpress", baseUrl: config.wordpressRestUrl }];
  return [
    { source: "api", baseUrl: config.apiUrl },
    { source: "wordpress", baseUrl: config.wordpressRestUrl },
  ];
}

async function requestCandidate<T>(
  candidate: EndpointCandidate,
  path: string,
  init: RequestInit,
  correlationId: string,
): Promise<AREServiceCallResponse<T>> {
  const config = getAREPlatformRuntimeConfig();
  const headers = new Headers(init.headers || {});
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  headers.set("X-ARE-Correlation-ID", correlationId);
  headers.set("X-ARE-Client", config.clientId);
  headers.set("X-ARE-Client-Version", config.appVersion);
  headers.set("X-ARE-Source-Surface", config.surface);
  if (candidate.source === "wordpress" && config.wordpressNonce) {
    headers.set("X-WP-Nonce", config.wordpressNonce);
  }

  try {
    const response = await fetch(`${candidate.baseUrl}${path}`, {
      ...init,
      headers,
      credentials: "include",
    });
    let payload: unknown = undefined;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      payload = await response.json();
    } else if (response.status !== 204) {
      payload = await response.text();
    }

    if (!response.ok) {
      const error =
        typeof payload === "object" && payload && "message" in payload
          ? String((payload as { message?: unknown }).message || `HTTP ${response.status}`)
          : `HTTP ${response.status}`;
      return { ok: false, error, correlationId, source: candidate.source, status: response.status };
    }
    return {
      ok: true,
      data: payload as T,
      correlationId,
      source: candidate.source,
      status: response.status,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Network request failed",
      correlationId,
      source: candidate.source,
      status: 0,
    };
  }
}

async function requestWithFailover<T>(path: string, init: RequestInit = {}): Promise<AREServiceCallResponse<T>> {
  const correlationId = createCorrelationId("corr");
  const candidates = endpointCandidates();
  if (candidates.length === 0) {
    return { ok: false, error: "ARE sync is configured offline", correlationId, source: "api", status: 0 };
  }

  let last: AREServiceCallResponse<T> | undefined;
  for (const candidate of candidates) {
    const result = await requestCandidate<T>(candidate, path, init, correlationId);
    if (result.ok) return result;
    last = result;
  }
  return last || { ok: false, error: "No ARE platform endpoint available", correlationId, source: "api", status: 0 };
}

function normalizeSnapshot(input: unknown, source: "api" | "wordpress"): AREPlatformSnapshot | null {
  if (!input || typeof input !== "object") return null;
  const root = input as Record<string, unknown>;
  const data = root.data && typeof root.data === "object" ? (root.data as Record<string, unknown>) : root;

  return {
    revision: typeof data.revision === "string" ? data.revision : undefined,
    generatedAt: typeof data.generatedAt === "string" ? data.generatedAt : new Date().toISOString(),
    deals: Array.isArray(data.deals) ? (data.deals as RealEstateDeal[]) : [],
    funds: Array.isArray(data.funds) ? (data.funds as FundingSource[]) : [],
    triggers: Array.isArray(data.triggers) ? (data.triggers as AutomationTrigger[]) : [],
    automationLogs: Array.isArray(data.automationLogs) ? (data.automationLogs as string[]) : [],
    approvals: Array.isArray(data.approvals) ? data.approvals : [],
    agentRuns: Array.isArray(data.agentRuns) ? data.agentRuns : [],
    health: data.health && typeof data.health === "object" ? (data.health as Record<string, unknown>) : {},
    source,
  };
}

export async function fetchAREPlatformSnapshot(): Promise<AREPlatformSnapshot | null> {
  const result = await requestWithFailover<unknown>("/agent-engine/snapshot", { method: "GET" });
  if (!result.ok) return null;
  return normalizeSnapshot(result.data, result.source);
}

export async function callAREPlatformService<T = unknown>(request: AREServiceCallRequest): Promise<AREServiceCallResponse<T>> {
  const correlationId = request.correlationId || createCorrelationId("svc");
  const idempotencyKey = request.idempotencyKey || createIdempotencyKey(`${request.service}.${request.action}`, request.dealId);
  const candidates = endpointCandidates();
  if (candidates.length === 0) {
    return { ok: false, error: "ARE sync is configured offline", correlationId, source: "api", status: 0 };
  }

  const body = JSON.stringify({
    service: request.service,
    action: request.action,
    deal_id: request.dealId,
    payload: request.payload || {},
    correlation_id: correlationId,
    idempotency_key: idempotencyKey,
    source_surface: getAREPlatformRuntimeConfig().surface,
  });

  let last: AREServiceCallResponse<T> | undefined;
  for (const candidate of candidates) {
    const result = await requestCandidate<T>(candidate, "/services/call", {
      method: "POST",
      body,
      headers: { "X-ARE-Idempotency-Key": idempotencyKey },
    }, correlationId);
    if (result.ok) return result;
    last = result;
  }
  return last || { ok: false, error: "No ARE service endpoint available", correlationId, source: "api", status: 0 };
}

export async function publishAREEvent(eventName: string, payload: Record<string, unknown> = {}, dealId?: string) {
  const correlationId = createCorrelationId("evt");
  return requestWithFailover("/events", {
    method: "POST",
    body: JSON.stringify({
      event: eventName,
      deal_id: dealId,
      payload,
      correlation_id: correlationId,
      source_surface: getAREPlatformRuntimeConfig().surface,
      occurred_at: new Date().toISOString(),
    }),
    headers: { "X-ARE-Correlation-ID": correlationId },
  });
}

export async function executeAREAgentRun(input: {
  dealId: string;
  agentId: string;
  skillId: string;
  inputs: Record<string, unknown>;
  operator?: string;
}) {
  const idempotencyKey = createIdempotencyKey(`${input.agentId}.${input.skillId}`, input.dealId);
  return requestWithFailover("/agents/runs", {
    method: "POST",
    body: JSON.stringify({
      deal_id: input.dealId,
      agent_id: input.agentId,
      skill_id: input.skillId,
      inputs: input.inputs,
      operator: input.operator,
      idempotency_key: idempotencyKey,
      source_surface: getAREPlatformRuntimeConfig().surface,
    }),
    headers: { "X-ARE-Idempotency-Key": idempotencyKey },
  });
}

export async function resolveAREApproval(ticketId: string, decision: "approved" | "rejected", notes?: string) {
  const idempotencyKey = createIdempotencyKey(`approval.${decision}`, ticketId);
  return requestWithFailover(`/approvals/${encodeURIComponent(ticketId)}/resolve`, {
    method: "POST",
    body: JSON.stringify({ decision, notes, idempotency_key: idempotencyKey }),
    headers: { "X-ARE-Idempotency-Key": idempotencyKey },
  });
}

export async function fetchAREPlatformHealth(): Promise<AREPlatformHealth> {
  const config = getAREPlatformRuntimeConfig();
  if (config.syncMode === "offline") {
    return {
      ok: true,
      source: "offline",
      apiReachable: false,
      wordpressReachable: false,
      checkedAt: new Date().toISOString(),
      details: { mode: "offline" },
    };
  }

  const apiCandidate: EndpointCandidate = { source: "api", baseUrl: config.apiUrl };
  const wpCandidate: EndpointCandidate = { source: "wordpress", baseUrl: config.wordpressRestUrl };
  const correlationId = createCorrelationId("health");
  const [api, wordpress] = await Promise.all([
    requestCandidate<Record<string, unknown>>(apiCandidate, "/health", { method: "GET" }, correlationId),
    requestCandidate<Record<string, unknown>>(wpCandidate, "/health", { method: "GET" }, correlationId),
  ]);
  const preferred = api.ok ? api : wordpress;
  return {
    ok: api.ok || wordpress.ok,
    source: api.ok ? "api" : wordpress.ok ? "wordpress" : "offline",
    apiReachable: api.ok,
    wordpressReachable: wordpress.ok,
    checkedAt: new Date().toISOString(),
    details: preferred.data || { apiError: api.error, wordpressError: wordpress.error },
  };
}
