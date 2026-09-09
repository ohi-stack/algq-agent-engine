/**
 * ARE cross-surface synchronization coordinator.
 *
 * Existing UI components still use local React/localStorage state. This
 * coordinator turns that local state into a synchronized client cache:
 * - canonical snapshot is pulled before React mounts;
 * - user changes are diffed and routed to authoritative ARE services;
 * - remote revisions refresh the cache and notify mounted surfaces;
 * - website/wp-admin mounts can reload safely when canonical state changes.
 *
 * No outbound domain mutation is attempted until a live platform snapshot has
 * been resolved. This prevents demo/seed records from being written to live ARE.
 */

import type { AutomationTrigger, FundingSource, RealEstateDeal } from "../types";
import {
  callAREPlatformService,
  fetchAREPlatformSnapshot,
  getAREPlatformRuntimeConfig,
  publishAREEvent,
  toCanonicalDealState,
  type AREPlatformSnapshot,
} from "./arePlatformClient";

const STORAGE_KEYS = {
  deals: "algonquian_deals",
  funds: "algonquian_funds",
  triggers: "algonquian_triggers",
  logs: "algonquian_logs",
  syncMeta: "algonquian_are_sync_meta",
} as const;

interface SyncMeta {
  connected: boolean;
  source: string;
  revision?: string;
  lastPullAt?: string;
  lastPushAt?: string;
  lastError?: string;
}

interface CacheState {
  deals: RealEstateDeal[];
  funds: FundingSource[];
  triggers: AutomationTrigger[];
  logs: string[];
}

let liveSnapshotResolved = false;
let applyingRemoteSnapshot = false;
let lastRemoteHash = "";
let lastObservedCache: CacheState | null = null;
let mutationTimer: number | undefined;
let pullTimer: number | undefined;
let mutationQueue: Promise<unknown> = Promise.resolve();

function parseJSON<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function stableStringify(value: unknown): string {
  const seen = new WeakSet<object>();
  const normalize = (input: unknown): unknown => {
    if (Array.isArray(input)) return input.map(normalize);
    if (input && typeof input === "object") {
      if (seen.has(input as object)) return "[Circular]";
      seen.add(input as object);
      return Object.keys(input as Record<string, unknown>)
        .sort()
        .reduce<Record<string, unknown>>((result, key) => {
          result[key] = normalize((input as Record<string, unknown>)[key]);
          return result;
        }, {});
    }
    return input;
  };
  return JSON.stringify(normalize(value));
}

function readCache(): CacheState {
  return {
    deals: parseJSON<RealEstateDeal[]>(localStorage.getItem(STORAGE_KEYS.deals), []),
    funds: parseJSON<FundingSource[]>(localStorage.getItem(STORAGE_KEYS.funds), []),
    triggers: parseJSON<AutomationTrigger[]>(localStorage.getItem(STORAGE_KEYS.triggers), []),
    logs: parseJSON<string[]>(localStorage.getItem(STORAGE_KEYS.logs), []),
  };
}

function writeSyncMeta(patch: Partial<SyncMeta>) {
  const current = parseJSON<SyncMeta>(localStorage.getItem(STORAGE_KEYS.syncMeta), {
    connected: false,
    source: "offline",
  });
  localStorage.setItem(STORAGE_KEYS.syncMeta, JSON.stringify({ ...current, ...patch }));
}

function snapshotHash(snapshot: AREPlatformSnapshot): string {
  return stableStringify({
    deals: snapshot.deals,
    funds: snapshot.funds,
    triggers: snapshot.triggers,
    automationLogs: snapshot.automationLogs || [],
  });
}

function cacheHash(cache: CacheState): string {
  return stableStringify(cache);
}

function applySnapshotToCache(snapshot: AREPlatformSnapshot) {
  applyingRemoteSnapshot = true;
  try {
    localStorage.setItem(STORAGE_KEYS.deals, JSON.stringify(snapshot.deals));
    localStorage.setItem(STORAGE_KEYS.funds, JSON.stringify(snapshot.funds));
    localStorage.setItem(STORAGE_KEYS.triggers, JSON.stringify(snapshot.triggers));
    if (snapshot.automationLogs) {
      localStorage.setItem(STORAGE_KEYS.logs, JSON.stringify(snapshot.automationLogs));
    }
    lastObservedCache = readCache();
    lastRemoteHash = snapshotHash(snapshot);
    writeSyncMeta({
      connected: true,
      source: snapshot.source || "platform",
      revision: snapshot.revision,
      lastPullAt: new Date().toISOString(),
      lastError: undefined,
    });
  } finally {
    applyingRemoteSnapshot = false;
  }
}

function recordsById<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map(item => [item.id, item]));
}

function withoutVolatileDealFields(deal: RealEstateDeal): Record<string, unknown> {
  const { updatedAt: _updatedAt, createdAt: _createdAt, ...rest } = deal;
  return rest as unknown as Record<string, unknown>;
}

function dealPatch(previous: RealEstateDeal, current: RealEstateDeal): Record<string, unknown> {
  const before = withoutVolatileDealFields(previous);
  const after = withoutVolatileDealFields(current);
  const patch: Record<string, unknown> = {};
  for (const key of Object.keys(after)) {
    if (key === "status") continue;
    if (stableStringify(before[key]) !== stableStringify(after[key])) patch[key] = after[key];
  }
  return patch;
}

async function syncDeals(previous: RealEstateDeal[], current: RealEstateDeal[]) {
  const before = recordsById(previous);
  const after = recordsById(current);

  for (const deal of current) {
    const old = before.get(deal.id);
    if (!old) {
      await callAREPlatformService({
        service: "deal_intake",
        action: "submit_from_agent_engine",
        dealId: deal.id,
        payload: { deal },
      });
      continue;
    }

    if (old.status !== deal.status) {
      await callAREPlatformService({
        service: "pipeline.deals",
        action: "update_stage",
        dealId: deal.id,
        payload: {
          previous_state: toCanonicalDealState(String(old.status)),
          new_state: toCanonicalDealState(String(deal.status)),
        },
      });
    }

    const patch = dealPatch(old, deal);
    if (Object.keys(patch).length > 0) {
      await callAREPlatformService({
        service: "pipeline.deals",
        action: "update",
        dealId: deal.id,
        payload: { patch },
      });
    }
  }

  for (const deal of previous) {
    if (!after.has(deal.id)) {
      await callAREPlatformService({
        service: "pipeline.deals",
        action: "archive",
        dealId: deal.id,
        payload: { reason: "Archived from Agent Engine client surface" },
      });
    }
  }
}

async function syncFunds(previous: FundingSource[], current: FundingSource[]) {
  const before = recordsById(previous);
  const after = recordsById(current);
  for (const fund of current) {
    const old = before.get(fund.id);
    if (!old || stableStringify(old) !== stableStringify(fund)) {
      await callAREPlatformService({
        service: "funding.sources",
        action: "upsert",
        payload: { source: fund },
      });
    }
  }
  for (const fund of previous) {
    if (!after.has(fund.id)) {
      await callAREPlatformService({
        service: "funding.sources",
        action: "deactivate",
        payload: { source_id: fund.id },
      });
    }
  }
}

async function syncTriggers(previous: AutomationTrigger[], current: AutomationTrigger[]) {
  const before = recordsById(previous);
  const after = recordsById(current);
  for (const trigger of current) {
    const old = before.get(trigger.id);
    if (!old || stableStringify(old) !== stableStringify(trigger)) {
      await callAREPlatformService({
        service: "automation.rules",
        action: "upsert",
        payload: { rule: trigger },
      });
    }
  }
  for (const trigger of previous) {
    if (!after.has(trigger.id)) {
      await callAREPlatformService({
        service: "automation.rules",
        action: "disable",
        payload: { rule_id: trigger.id },
      });
    }
  }
}

async function syncLogs(previous: string[], current: string[]) {
  if (current.length === 0 || stableStringify(previous) === stableStringify(current)) return;
  const previousSet = new Set(previous);
  const additions = current.filter(line => !previousSet.has(line)).slice(0, 10);
  for (const line of additions) {
    await publishAREEvent("agent_engine.client_activity", { message: line });
  }
}

async function pushCacheDiff(previous: CacheState, current: CacheState) {
  if (!liveSnapshotResolved || applyingRemoteSnapshot) return;
  await syncDeals(previous.deals, current.deals);
  await syncFunds(previous.funds, current.funds);
  await syncTriggers(previous.triggers, current.triggers);
  await syncLogs(previous.logs, current.logs);
  writeSyncMeta({ lastPushAt: new Date().toISOString(), lastError: undefined });
}

function queueCacheDiff(previous: CacheState, current: CacheState) {
  mutationQueue = mutationQueue
    .then(() => pushCacheDiff(previous, current))
    .catch(error => {
      writeSyncMeta({ lastError: error instanceof Error ? error.message : String(error) });
      console.warn("[ARE Sync] Failed to push client mutation", error);
    });
}

function hasActiveEditor(): boolean {
  const element = document.activeElement;
  if (!element) return false;
  const tag = element.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || (element as HTMLElement).isContentEditable;
}

async function pullRemoteSnapshot({ allowReload = true } = {}) {
  const snapshot = await fetchAREPlatformSnapshot();
  if (!snapshot) {
    writeSyncMeta({ connected: false, lastPullAt: new Date().toISOString(), lastError: "No ARE platform snapshot endpoint available" });
    return;
  }

  const incomingHash = snapshotHash(snapshot);
  const changed = Boolean(lastRemoteHash && incomingHash !== lastRemoteHash);
  applySnapshotToCache(snapshot);
  liveSnapshotResolved = true;

  window.dispatchEvent(new CustomEvent("are:sync:snapshot", { detail: snapshot }));

  const config = getAREPlatformRuntimeConfig();
  const shouldReload = (import.meta.env.VITE_ARE_RELOAD_ON_REMOTE_CHANGE || "true") !== "false";
  if (changed && allowReload && shouldReload && !hasActiveEditor()) {
    // Existing App sections own local React state. A controlled refresh makes the
    // new canonical snapshot visible on all three surfaces without maintaining a
    // second competing client data store.
    window.setTimeout(() => window.location.reload(), 250);
  }

  if (config.surface !== "agent_app" && window.parent && window.parent !== window) {
    window.parent.postMessage(
      {
        type: "ARE_AGENT_ENGINE_SYNCED",
        revision: snapshot.revision,
        source: snapshot.source,
      },
      window.location.origin,
    );
  }
}

function startMutationScanner() {
  const interval = Number(import.meta.env.VITE_ARE_MUTATION_SCAN_MS || 1000);
  if (mutationTimer) window.clearInterval(mutationTimer);
  lastObservedCache = readCache();
  mutationTimer = window.setInterval(() => {
    if (!liveSnapshotResolved || applyingRemoteSnapshot || !lastObservedCache) return;
    const current = readCache();
    if (cacheHash(current) === cacheHash(lastObservedCache)) return;
    const previous = lastObservedCache;
    lastObservedCache = current;
    queueCacheDiff(previous, current);
  }, Math.max(500, interval));
}

function startRemotePoller() {
  const interval = Number(import.meta.env.VITE_ARE_SYNC_INTERVAL_MS || 15000);
  if (pullTimer) window.clearInterval(pullTimer);
  pullTimer = window.setInterval(() => void pullRemoteSnapshot({ allowReload: true }), Math.max(5000, interval));
}

function installPluginMessageBridge() {
  window.addEventListener("message", event => {
    // Only accept same-origin messages. Cross-origin WordPress/app communication
    // should use the canonical API gateway instead of trusting arbitrary frames.
    if (event.origin !== window.location.origin || !event.data || typeof event.data !== "object") return;
    const message = event.data as Record<string, unknown>;
    if (message.type === "ARE_AGENT_ENGINE_INVALIDATE") {
      void pullRemoteSnapshot({ allowReload: true });
    }
    if (message.type === "ARE_AGENT_ENGINE_CONFIG" && message.config && typeof message.config === "object") {
      window.ARE_AGENT_ENGINE_CONFIG = {
        ...(window.ARE_AGENT_ENGINE_CONFIG || {}),
        ...(message.config as Record<string, unknown>),
      };
      void pullRemoteSnapshot({ allowReload: false });
    }
  });
}

export async function bootstrapAREPlatformSync(): Promise<{ connected: boolean; source: string }> {
  if (typeof window === "undefined") return { connected: false, source: "server" };
  installPluginMessageBridge();

  const config = getAREPlatformRuntimeConfig();
  if (config.syncMode === "offline") {
    writeSyncMeta({ connected: false, source: "offline", lastPullAt: new Date().toISOString() });
    return { connected: false, source: "offline" };
  }

  const snapshot = await fetchAREPlatformSnapshot();
  if (!snapshot) {
    writeSyncMeta({
      connected: false,
      source: "offline-fallback",
      lastPullAt: new Date().toISOString(),
      lastError: "ARE API and WordPress bridge unavailable; retaining local/demo cache",
    });
    return { connected: false, source: "offline-fallback" };
  }

  applySnapshotToCache(snapshot);
  liveSnapshotResolved = true;
  startMutationScanner();
  startRemotePoller();

  return { connected: true, source: snapshot.source || "platform" };
}

export function stopAREPlatformSync() {
  if (mutationTimer) window.clearInterval(mutationTimer);
  if (pullTimer) window.clearInterval(pullTimer);
  mutationTimer = undefined;
  pullTimer = undefined;
}
