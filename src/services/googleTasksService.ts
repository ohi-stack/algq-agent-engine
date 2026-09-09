/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";
import {
  GoogleTask,
  GoogleTaskList,
  CreateTaskPayload,
  DealStatus,
  RealEstateDeal,
  StageMappingConfig,
  StageTaskItemTemplate,
} from "../types";

// Scopes for Google Tasks API
export const SCOPES = [
  "https://www.googleapis.com/auth/tasks",
  "https://www.googleapis.com/auth/tasks.readonly",
];

// Initialize Firebase App singleton safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));
provider.setCustomParameters({ prompt: "select_account" });

// In-memory token & session storage (never store access tokens in localStorage/sessionStorage)
let isSigningIn = false;
let cachedAccessToken: string | null = null;
let cachedUser: User | null = null;

/**
 * Initialize auth state listener. Cleans up cached tokens on logout.
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      cachedUser = user;
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // If user is logged in via Firebase session but access token is not cached in memory,
        // we can prompt for sign in when accessing protected APIs
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedUser = null;
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Trigger official Google Sign-in popup with Google Tasks scopes
 */
export const googleSignIn = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Failed to get Google Tasks OAuth access token from Firebase Auth.");
    }

    cachedAccessToken = credential.accessToken;
    cachedUser = result.user;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error("Google Tasks Sign-in error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Get cached in-memory access token
 */
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

/**
 * Get current cached user
 */
export const getCurrentUser = (): User | null => {
  return cachedUser || auth.currentUser;
};

/**
 * Log out and clear memory cache
 */
export const logout = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
  cachedUser = null;
};

// ==========================================
// Google Tasks REST API Client (Browser-side)
// ==========================================

const BASE_URL = "https://tasks.googleapis.com/tasks/v1";

const getHeaders = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`,
  "Content-Type": "application/json",
});

/**
 * Fetch all task lists for the authenticated user
 */
export const fetchTaskLists = async (accessToken: string): Promise<GoogleTaskList[]> => {
  const res = await fetch(`${BASE_URL}/users/@me/lists?maxResults=100`, {
    headers: getHeaders(accessToken),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody.error?.message || `Failed to fetch task lists (${res.status} ${res.statusText})`
    );
  }

  const data = await res.json();
  return data.items || [];
};

/**
 * Create a new task list
 */
export const createTaskList = async (
  accessToken: string,
  title: string
): Promise<GoogleTaskList> => {
  const res = await fetch(`${BASE_URL}/users/@me/lists`, {
    method: "POST",
    headers: getHeaders(accessToken),
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody.error?.message || `Failed to create task list (${res.status})`
    );
  }

  return await res.json();
};

/**
 * Delete a task list (Destructive - requires prior user confirmation)
 */
export const deleteTaskList = async (
  accessToken: string,
  tasklistId: string
): Promise<void> => {
  const res = await fetch(`${BASE_URL}/users/@me/lists/${tasklistId}`, {
    method: "DELETE",
    headers: getHeaders(accessToken),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody.error?.message || `Failed to delete task list (${res.status})`
    );
  }
};

/**
 * Fetch tasks in a task list
 */
export const fetchTasks = async (
  accessToken: string,
  tasklistId: string,
  options?: {
    showCompleted?: boolean;
    showHidden?: boolean;
    dueMin?: string;
    dueMax?: string;
  }
): Promise<GoogleTask[]> => {
  const showCompleted = options?.showCompleted !== false;
  const showHidden = options?.showHidden !== false;
  let url = `${BASE_URL}/lists/${tasklistId}/tasks?showCompleted=${showCompleted}&showHidden=${showHidden}&maxResults=100`;

  if (options?.dueMin) url += `&dueMin=${encodeURIComponent(options.dueMin)}`;
  if (options?.dueMax) url += `&dueMax=${encodeURIComponent(options.dueMax)}`;

  const res = await fetch(url, {
    headers: getHeaders(accessToken),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody.error?.message || `Failed to fetch tasks for list ${tasklistId} (${res.status})`
    );
  }

  const data = await res.json();
  return data.items || [];
};

/**
 * Create a new task in a list
 */
export const createTask = async (
  accessToken: string,
  tasklistId: string,
  payload: CreateTaskPayload
): Promise<GoogleTask> => {
  const body: any = {
    title: payload.title,
    status: payload.status || "needsAction",
  };

  if (payload.notes) body.notes = payload.notes;
  if (payload.due) body.due = payload.due;

  const res = await fetch(`${BASE_URL}/lists/${tasklistId}/tasks`, {
    method: "POST",
    headers: getHeaders(accessToken),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody.error?.message || `Failed to create task (${res.status})`
    );
  }

  return await res.json();
};

/**
 * Update an existing task
 */
export const updateTask = async (
  accessToken: string,
  tasklistId: string,
  taskId: string,
  payload: Partial<CreateTaskPayload>
): Promise<GoogleTask> => {
  const res = await fetch(`${BASE_URL}/lists/${tasklistId}/tasks/${taskId}`, {
    method: "PATCH",
    headers: getHeaders(accessToken),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody.error?.message || `Failed to update task ${taskId} (${res.status})`
    );
  }

  return await res.json();
};

/**
 * Toggle task completion status
 */
export const toggleTaskCompletion = async (
  accessToken: string,
  tasklistId: string,
  taskId: string,
  currentStatus: "needsAction" | "completed"
): Promise<GoogleTask> => {
  const newStatus = currentStatus === "completed" ? "needsAction" : "completed";
  const payload: any = { status: newStatus };
  if (newStatus === "needsAction") {
    // Re-opening completed task clears completed timestamp
    payload.completed = null;
  }

  return await updateTask(accessToken, tasklistId, taskId, payload);
};

/**
 * Delete a task (Destructive - requires prior user confirmation)
 */
export const deleteTask = async (
  accessToken: string,
  tasklistId: string,
  taskId: string
): Promise<void> => {
  const res = await fetch(`${BASE_URL}/lists/${tasklistId}/tasks/${taskId}`, {
    method: "DELETE",
    headers: getHeaders(accessToken),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody.error?.message || `Failed to delete task ${taskId} (${res.status})`
    );
  }
};

/**
 * Clear all completed tasks in a task list
 */
export const clearCompletedTasks = async (
  accessToken: string,
  tasklistId: string
): Promise<void> => {
  const res = await fetch(`${BASE_URL}/lists/${tasklistId}/clear`, {
    method: "POST",
    headers: getHeaders(accessToken),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody.error?.message || `Failed to clear completed tasks (${res.status})`
    );
  }
};

/**
 * Preset deal milestone tasks generator for Algonquian acquisitions
 */
export interface DealMilestoneTemplate {
  title: string;
  category: string;
  daysFromNow: number;
  notesTemplate: (address: string, city: string, owner: string) => string;
}

export const DEAL_MILESTONE_TEMPLATES: DealMilestoneTemplate[] = [
  {
    title: "Title Search & Municipal Tax Search",
    category: "Due Diligence",
    daysFromNow: 3,
    notesTemplate: (addr, city, owner) =>
      `[Algonquian Title Audit]\nProperty: ${addr}, ${city}, CT\nOwner: ${owner}\nAction: Conduct title search for senior liens, Waterbury/Hartford municipal tax assessments, and water/sewer balances with closing attorney.`,
  },
  {
    title: "Contractor On-Site Scope & Rehab Estimate",
    category: "Underwriting",
    daysFromNow: 5,
    notesTemplate: (addr, city) =>
      `[ARE Tech Scope Validation]\nProperty: ${addr}, ${city}, CT\nAction: Physical walkthrough with licensed GC to verify mechanicals (HVAC, roof, plumbing, electric) and firm up rehab line items before closing.`,
  },
  {
    title: "Deliver Escrow EMD Deposit to Title / Attorney",
    category: "Escrow",
    daysFromNow: 7,
    notesTemplate: (addr, city) =>
      `[Capital Stack Wire]\nProperty: ${addr}, ${city}, CT\nAction: Authorize earnest money deposit ($2,500 - $5,000) wire to closing attorney escrow trust account.`,
  },
  {
    title: "Execute Buyer Assignment / Joint Venture Agreement",
    category: "Closing",
    daysFromNow: 14,
    notesTemplate: (addr, city) =>
      `[Algonquian Contract Execution]\nProperty: ${addr}, ${city}, CT\nAction: Send formal assignment contract or JV capital stack agreement for digital signature. Ensure $10k+ wholesale/management spread locked.`,
  },
  {
    title: "Final Settlement Statement (HUD-1 / ALTA) Review & Funding",
    category: "Funding",
    daysFromNow: 21,
    notesTemplate: (addr, city, owner) =>
      `[Closing Authorization]\nProperty: ${addr}, ${city}, CT\nSeller: ${owner}\nAction: Review net sheet with Gregory Jones (Managing Member), verify clear title deed recording, and authorize wire balance.`,
  },
];

/**
 * Default Stage Mappings: Define automated Google Task Lists for each Deal Stage
 */
export const DEFAULT_STAGE_MAPPINGS: StageMappingConfig[] = [
  {
    id: "stage-map-due-diligence",
    stage: DealStatus.DueDiligence,
    enabled: true,
    listNamePattern: "Due Diligence: {address}",
    scope: "per_deal",
    tasks: [
      {
        id: "dd-task-1",
        title: "Order 40-Year Title Search & Municipal Lien Audit",
        notesTemplate: "Property: {address}, {city}, CT\nOwner: {owner}\nVerify absence of municipal tax liens, water/sewer department assessments, and junior mechanics liens.",
        daysFromNow: 3,
      },
      {
        id: "dd-task-2",
        title: "Verify Municipal Tax Assessor Card & Zoning Classification",
        notesTemplate: "Check with municipal building department for outstanding code violations, open building permits, and Certificate of Occupancy status.",
        daysFromNow: 4,
      },
      {
        id: "dd-task-3",
        title: "Schedule Environmental & Radon/Lead Inspection",
        notesTemplate: "Inspect basements, check for underground storage tanks (UST), verify lead paint disclosures for pre-1978 assets.",
        daysFromNow: 6,
      },
      {
        id: "dd-task-4",
        title: "Audit Existing Tenant Leases & Security Deposits",
        notesTemplate: "Collect tenant rent roll, verify payment history via bank statements, and obtain tenant estoppel certificates.",
        daysFromNow: 8,
      },
    ],
  },
  {
    id: "stage-map-underwriting",
    stage: DealStatus.Underwriting,
    enabled: true,
    listNamePattern: "Underwriting: {address}",
    scope: "per_deal",
    tasks: [
      {
        id: "uw-task-1",
        title: "Validate MLS Comps & Calculate Algonquian MAO Ceiling",
        notesTemplate: "Pull 3 settled comps within 0.5 miles over the last 6 months. Apply strict 70% rule minus estimated repairs minus wholesale spread.",
        daysFromNow: 2,
      },
      {
        id: "uw-task-2",
        title: "Perform On-Site General Contractor Walkthrough",
        notesTemplate: "Itemize scope of work across roof, HVAC, plumbing stacks, electrical service (min 100A/unit), and cosmetic turns.",
        daysFromNow: 4,
      },
      {
        id: "uw-task-3",
        title: "Structure GP-LP Capital Stack & Debt Sourcing",
        notesTemplate: "Calculate annualized cash-on-cash yield for sponsor equity and private money partners.",
        daysFromNow: 5,
      },
    ],
  },
  {
    id: "stage-map-offer-submitted",
    stage: DealStatus.OfferSubmitted,
    enabled: true,
    listNamePattern: "Offers: {address}",
    scope: "per_deal",
    tasks: [
      {
        id: "os-task-1",
        title: "Generate & Transmit Signed LOI / Purchase Agreement",
        notesTemplate: "Deliver Algonquian standard purchase agreement with 14-day inspection clause and clear assignment provisions.",
        daysFromNow: 1,
      },
      {
        id: "os-task-2",
        title: "Deliver Sponsor Proof of Funds (POF) Letter",
        notesTemplate: "Attach verified liquid capital proof from Algonquian capital partners to reinforce offer credibility.",
        daysFromNow: 1,
      },
      {
        id: "os-task-3",
        title: "Execute 48-Hour Seller Follow-Up Call",
        notesTemplate: "Contact {owner} to address contingencies, clarify seller financing options if applicable, and answer contract terms.",
        daysFromNow: 2,
      },
    ],
  },
  {
    id: "stage-map-under-contract",
    stage: DealStatus.UnderContract,
    enabled: true,
    listNamePattern: "Under Contract: {address}",
    scope: "per_deal",
    tasks: [
      {
        id: "uc-task-1",
        title: "Deposit Escrow EMD Wire to Closing Attorney",
        notesTemplate: "Wire earnest money deposit ($2,500 - $5,000) to title company escrow trust account within 72 hours of contract execution.",
        daysFromNow: 3,
      },
      {
        id: "uc-task-2",
        title: "Bind Property Hazard & Liability Insurance Policy",
        notesTemplate: "Obtain builder's risk / vacant dwelling policy or standard commercial multi-family policy naming Algonquian as insured.",
        daysFromNow: 7,
      },
      {
        id: "uc-task-3",
        title: "Execute Assignment / Joint Venture Capital Stack Agreement",
        notesTemplate: "Lock in end buyer assignment fee ($10,000+) or finalize GP/LP operating agreement with equity partners.",
        daysFromNow: 10,
      },
      {
        id: "uc-task-4",
        title: "Schedule Final Pre-Closing Walkthrough",
        notesTemplate: "Verify vacant unit delivery or broom-clean condition prior to signing final settlement statement.",
        daysFromNow: 14,
      },
    ],
  },
  {
    id: "stage-map-funded",
    stage: DealStatus.Funded,
    enabled: true,
    listNamePattern: "Closing & Asset Mgmt: {address}",
    scope: "per_deal",
    tasks: [
      {
        id: "fn-task-1",
        title: "Record Municipal Title Deed & Confirm Wire Disbursement",
        notesTemplate: "Obtain recorded deed number from municipal land records office and confirm final net proceeds disbursement.",
        daysFromNow: 1,
      },
      {
        id: "fn-task-2",
        title: "Transfer Municipal Utilities & Onboard Property Management",
        notesTemplate: "Notify Eversource / water authority for meter readings and transfer keys to on-site property manager.",
        daysFromNow: 3,
      },
      {
        id: "fn-task-3",
        title: "Distribute Capital Yield & Register Asset in Algonquian Portfolio",
        notesTemplate: "Reconcile closing statement, record net profit/spread, and disburse initial distributions to capital stack participants.",
        daysFromNow: 5,
      },
    ],
  },
];

/**
 * Format string template with Deal attributes
 */
export const formatTemplateString = (
  template: string,
  deal: RealEstateDeal,
  stageName: string
): string => {
  return template
    .replace(/{address}/g, deal.address || "Property")
    .replace(/{city}/g, deal.city || "CT")
    .replace(/{state}/g, deal.state || "CT")
    .replace(/{zip}/g, deal.zipCode || "")
    .replace(/{owner}/g, deal.ownerName || "Owner")
    .replace(/{stage}/g, stageName)
    .replace(/{arv}/g, deal.arv ? `$${deal.arv.toLocaleString()}` : "$0")
    .replace(/{price}/g, deal.askingPrice ? `$${deal.askingPrice.toLocaleString()}` : "$0")
    .replace(/{mao}/g, deal.mao ? `$${deal.mao.toLocaleString()}` : "$0");
};

/**
 * Automatically create a Google Task List and populated checklist tasks for a specific Deal stage
 */
export const createStageTaskListForDeal = async (
  accessToken: string,
  config: StageMappingConfig,
  deal: RealEstateDeal
): Promise<{
  taskList: GoogleTaskList;
  tasks: GoogleTask[];
}> => {
  const stageTitle = config.stage.toString();
  const listTitle = formatTemplateString(config.listNamePattern, deal, stageTitle);

  // 1. Create the dedicated Google Task List
  const newTaskList = await createTaskList(accessToken, listTitle);

  // 2. Provision each mapped task under the new list
  const createdTasks: GoogleTask[] = [];

  for (const taskTemplate of config.tasks) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + taskTemplate.daysFromNow);

    const formattedTitle = `[${deal.city || "CT"}] ${taskTemplate.title}`;
    const formattedNotes = taskTemplate.notesTemplate
      ? formatTemplateString(taskTemplate.notesTemplate, deal, stageTitle)
      : `Automated stage task for ${deal.address}, ${deal.city}, CT (${stageTitle})`;

    try {
      const createdTask = await createTask(accessToken, newTaskList.id, {
        title: formattedTitle,
        notes: formattedNotes,
        due: dueDate.toISOString(),
      });
      createdTasks.push(createdTask);
    } catch (taskErr) {
      console.warn(`Failed to create task "${taskTemplate.title}":`, taskErr);
    }
  }

  return {
    taskList: newTaskList,
    tasks: createdTasks,
  };
};
