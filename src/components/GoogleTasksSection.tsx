/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckSquare,
  ListTodo,
  Plus,
  RefreshCw,
  Trash2,
  Calendar,
  Clock,
  Building2,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  AlertCircle,
  FolderPlus,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Layers,
  FileCheck2,
  Edit3,
  X,
  Lock,
  Workflow,
  Sliders,
  ToggleLeft,
  ToggleRight,
  ArrowUpRight,
  Check,
  Info,
  Settings,
  FileText,
  HelpCircle,
  FolderCheck,
} from "lucide-react";
import { User } from "firebase/auth";
import {
  RealEstateDeal,
  GoogleTask,
  GoogleTaskList,
  DealStatus,
  StageMappingConfig,
  StageTaskItemTemplate,
} from "../types";
import {
  initAuth,
  googleSignIn,
  getAccessToken,
  getCurrentUser,
  logout,
  fetchTaskLists,
  createTaskList,
  deleteTaskList,
  fetchTasks,
  createTask,
  updateTask,
  toggleTaskCompletion,
  deleteTask,
  clearCompletedTasks,
  DEAL_MILESTONE_TEMPLATES,
  DEFAULT_STAGE_MAPPINGS,
  formatTemplateString,
  createStageTaskListForDeal,
} from "../services/googleTasksService";

const STORAGE_KEY_STAGE_MAPPINGS = "are_google_tasks_stage_mappings_v1";
const STORAGE_KEY_AUTO_SYNC = "are_google_tasks_auto_sync_on_stage_change";

interface GoogleTasksSectionProps {
  deals: RealEstateDeal[];
  triggerSystemEvent?: (eventName: string, details: any) => void;
}

export const GoogleTasksSection: React.FC<GoogleTasksSectionProps> = ({
  deals,
  triggerSystemEvent,
}) => {
  // Navigation View Tab: "workstation" (Live Tasks) vs "stage-mappings" (Stage-to-Task-List Automation)
  const [activeTab, setActiveTab] = useState<"workstation" | "stage-mappings">("workstation");

  // Authentication & Session State
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser());
  const [token, setToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Google Tasks Data State
  const [taskLists, setTaskLists] = useState<GoogleTaskList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [tasks, setTasks] = useState<GoogleTask[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // UI Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all");
  const [selectedDealForSync, setSelectedDealForSync] = useState<string>(deals[0]?.id || "");
  const [selectedMilestones, setSelectedMilestones] = useState<number[]>([0, 1, 2, 3, 4]);

  // Stage Mapping Automation State
  const [stageMappings, setStageMappings] = useState<StageMappingConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STAGE_MAPPINGS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not parse saved stage mappings, using defaults:", e);
    }
    return DEFAULT_STAGE_MAPPINGS;
  });

  const [autoSyncOnStageChange, setAutoSyncOnStageChange] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTO_SYNC);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [selectedStageForManualCreate, setSelectedStageForManualCreate] = useState<DealStatus>(
    DealStatus.DueDiligence
  );
  const [selectedDealForStageList, setSelectedDealForStageList] = useState<string>(
    deals[0]?.id || ""
  );
  const [isProvisioningStageList, setIsProvisioningStageList] = useState<boolean>(false);

  // Stage Config Edit Modal / State
  const [editingStageConfig, setEditingStageConfig] = useState<StageMappingConfig | null>(null);
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);
  const [stageTaskForm, setStageTaskForm] = useState<StageTaskItemTemplate>({
    id: "",
    title: "",
    notesTemplate: "",
    daysFromNow: 3,
  });
  const [showAddTaskModal, setShowAddTaskModal] = useState<boolean>(false);

  // Modal / Form States
  const [showNewTaskModal, setShowNewTaskModal] = useState<boolean>(false);
  const [showNewListModal, setShowNewListModal] = useState<boolean>(false);
  const [showSyncDealModal, setShowSyncDealModal] = useState<boolean>(false);
  const [showManualStageModal, setShowManualStageModal] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<GoogleTask | null>(null);

  // Destructive Confirmation Dialog State (MANDATORY REQUIREMENT)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "Delete",
    onConfirm: () => {},
  });

  // New Task Form
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");
  const [newTaskNotes, setNewTaskNotes] = useState<string>("");
  const [newTaskDueDate, setNewTaskDueDate] = useState<string>("");
  const [isSubmittingTask, setIsSubmittingTask] = useState<boolean>(false);

  // New List Form
  const [newListTitle, setNewListTitle] = useState<string>("");
  const [isSubmittingList, setIsSubmittingList] = useState<boolean>(false);

  // Save stage mappings changes to LocalStorage
  const updateStageMappings = (newMappings: StageMappingConfig[]) => {
    setStageMappings(newMappings);
    try {
      localStorage.setItem(STORAGE_KEY_STAGE_MAPPINGS, JSON.stringify(newMappings));
    } catch (err) {
      console.error("Failed to save stage mappings to storage:", err);
    }
  };

  const toggleAutoSync = (val: boolean) => {
    setAutoSyncOnStageChange(val);
    try {
      localStorage.setItem(STORAGE_KEY_AUTO_SYNC, JSON.stringify(val));
    } catch (err) {
      console.error("Failed to save auto sync toggle:", err);
    }
  };

  const resetStageMappingsToDefault = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Reset Stage Mappings to Default?",
      description:
        "This will restore the standard Algonquian Real Estate stage-to-task-list mapping templates (Due Diligence, Underwriting, Offer Submitted, Under Contract, Funded & Closed).",
      confirmText: "Reset to Defaults",
      onConfirm: () => {
        updateStageMappings(DEFAULT_STAGE_MAPPINGS);
        setSuccessMessage("Stage mappings reset to Algonquian defaults.");
        setTimeout(() => setSuccessMessage(null), 3000);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Initialize Auth listener on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, accessToken) => {
        setCurrentUser(user);
        setToken(accessToken);
        setIsAuthLoading(false);
      },
      () => {
        setCurrentUser(getCurrentUser());
        setIsAuthLoading(false);
      }
    );

    // Initial token check
    getAccessToken().then((cached) => {
      if (cached) setToken(cached);
      setIsAuthLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // When token is available, load task lists
  useEffect(() => {
    if (token) {
      loadTaskLists(token);
    }
  }, [token]);

  // When selected task list changes, load its tasks
  useEffect(() => {
    if (token && selectedListId) {
      loadTasksForList(token, selectedListId);
    }
  }, [token, selectedListId]);

  // Load Task Lists from Google
  const loadTaskLists = async (accessToken: string) => {
    setIsLoadingTasks(true);
    setApiError(null);
    try {
      const lists = await fetchTaskLists(accessToken);
      setTaskLists(lists);
      if (lists.length > 0 && !selectedListId) {
        setSelectedListId(lists[0].id);
      }
    } catch (err: any) {
      console.error("Error loading task lists:", err);
      setApiError(err.message || "Failed to load Google Task lists. Please re-authenticate.");
    } finally {
      setIsLoadingTasks(false);
    }
  };

  // Load Tasks for currently selected list
  const loadTasksForList = async (accessToken: string, listId: string) => {
    setIsLoadingTasks(true);
    setApiError(null);
    try {
      const items = await fetchTasks(accessToken, listId, { showCompleted: true });
      setTasks(items);
    } catch (err: any) {
      console.error("Error loading tasks:", err);
      setApiError(err.message || "Failed to fetch tasks from Google Tasks.");
    } finally {
      setIsLoadingTasks(false);
      setIsRefreshing(false);
    }
  };

  // Sign In Handler
  const handleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const authResult = await googleSignIn();
      if (authResult) {
        setCurrentUser(authResult.user);
        setToken(authResult.accessToken);
        setSuccessMessage(`Connected as ${authResult.user.email}`);
        setTimeout(() => setSuccessMessage(null), 4000);
        if (triggerSystemEvent) {
          triggerSystemEvent("ON_GOOGLE_AUTH", { email: authResult.user.email });
        }
      }
    } catch (err: any) {
      console.error("Sign-in failed:", err);
      setAuthError(err.message || "Failed to sign in with Google. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  // Sign Out Handler
  const handleSignOut = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setToken(null);
      setTaskLists([]);
      setTasks([]);
      setSelectedListId("");
      setSuccessMessage("Signed out of Google Tasks session.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Sign out error:", err);
    }
  };

  // Manual Refresh
  const handleRefresh = async () => {
    if (!token) {
      handleSignIn();
      return;
    }
    setIsRefreshing(true);
    if (selectedListId) {
      await loadTasksForList(token, selectedListId);
    } else {
      await loadTaskLists(token);
    }
  };

  // Toggle Task Completion
  const handleToggleTask = async (task: GoogleTask) => {
    if (!token || !selectedListId) return;

    // Optimistic UI update
    const nextStatus = task.status === "completed" ? "needsAction" : "completed";
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );

    try {
      const updated = await toggleTaskCompletion(
        token,
        selectedListId,
        task.id,
        task.status
      );
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
      if (triggerSystemEvent) {
        triggerSystemEvent("ON_TASK_STATUS_UPDATED", {
          title: task.title,
          status: nextStatus,
        });
      }
    } catch (err: any) {
      console.error("Failed to toggle task:", err);
      // Revert optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      );
      setApiError(`Could not update task status: ${err.message}`);
    }
  };

  // Create New Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedListId || !newTaskTitle.trim()) return;

    setIsSubmittingTask(true);
    setApiError(null);

    try {
      const dueTimestamp = newTaskDueDate
        ? new Date(newTaskDueDate).toISOString()
        : undefined;

      const created = await createTask(token, selectedListId, {
        title: newTaskTitle.trim(),
        notes: newTaskNotes.trim() || undefined,
        due: dueTimestamp,
      });

      setTasks((prev) => [created, ...prev]);
      setNewTaskTitle("");
      setNewTaskNotes("");
      setNewTaskDueDate("");
      setShowNewTaskModal(false);
      setSuccessMessage("Task synced to Google Tasks successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);

      if (triggerSystemEvent) {
        triggerSystemEvent("ON_TASK_CREATED", { title: created.title });
      }
    } catch (err: any) {
      console.error("Failed to create task:", err);
      setApiError(err.message || "Failed to create task in Google Tasks.");
    } finally {
      setIsSubmittingTask(false);
    }
  };

  // Update Task
  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedListId || !editingTask) return;

    setIsSubmittingTask(true);
    try {
      const updated = await updateTask(token, selectedListId, editingTask.id, {
        title: editingTask.title,
        notes: editingTask.notes,
        due: editingTask.due,
      });

      setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updated : t)));
      setEditingTask(null);
      setSuccessMessage("Task updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error("Failed to update task:", err);
      setApiError(err.message || "Failed to update task.");
    } finally {
      setIsSubmittingTask(false);
    }
  };

  // Delete Task with MANDATORY user confirmation dialog
  const promptDeleteTask = (task: GoogleTask) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Google Task",
      description: `Are you sure you want to permanently delete the task "${task.title}" from your Google Tasks list? This action cannot be undone.`,
      confirmText: "Delete Task",
      onConfirm: async () => {
        if (!token || !selectedListId) return;
        try {
          await deleteTask(token, selectedListId, task.id);
          setTasks((prev) => prev.filter((t) => t.id !== task.id));
          setSuccessMessage(`Deleted task "${task.title}"`);
          setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
          setApiError(err.message || "Failed to delete task.");
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Clear Completed Tasks with MANDATORY user confirmation dialog
  const promptClearCompleted = () => {
    const completedCount = tasks.filter((t) => t.status === "completed").length;
    if (completedCount === 0) return;

    setConfirmDialog({
      isOpen: true,
      title: "Clear Completed Tasks",
      description: `Are you sure you want to clear ${completedCount} completed task(s) from this Google Tasks list?`,
      confirmText: "Clear Completed",
      onConfirm: async () => {
        if (!token || !selectedListId) return;
        try {
          await clearCompletedTasks(token, selectedListId);
          setTasks((prev) => prev.filter((t) => t.status !== "completed"));
          setSuccessMessage(`Cleared ${completedCount} completed task(s).`);
          setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
          setApiError(err.message || "Failed to clear completed tasks.");
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Create New Task List
  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newListTitle.trim()) return;

    setIsSubmittingList(true);
    try {
      const newList = await createTaskList(token, newListTitle.trim());
      setTaskLists((prev) => [...prev, newList]);
      setSelectedListId(newList.id);
      setNewListTitle("");
      setShowNewListModal(false);
      setSuccessMessage(`Created task list "${newList.title}"`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setApiError(err.message || "Failed to create task list.");
    } finally {
      setIsSubmittingList(false);
    }
  };

  // Delete Task List with MANDATORY confirmation
  const promptDeleteList = (list: GoogleTaskList) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Google Task List",
      description: `Are you sure you want to delete the task list "${list.title}" and all tasks contained within it from Google Tasks?`,
      confirmText: "Delete List",
      onConfirm: async () => {
        if (!token) return;
        try {
          await deleteTaskList(token, list.id);
          const remaining = taskLists.filter((l) => l.id !== list.id);
          setTaskLists(remaining);
          if (remaining.length > 0) {
            setSelectedListId(remaining[0].id);
          } else {
            setSelectedListId("");
            setTasks([]);
          }
          setSuccessMessage(`Deleted list "${list.title}"`);
          setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
          setApiError(err.message || "Failed to delete task list.");
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // 1-Click Provision Stage Task List for Deal
  const handleProvisionStageListForDeal = async (
    stageConfig: StageMappingConfig,
    dealIdToUse?: string
  ) => {
    if (!token) {
      setApiError("Please connect your Google Account first.");
      return;
    }

    const targetDealId = dealIdToUse || selectedDealForStageList || deals[0]?.id;
    const targetDeal = deals.find((d) => d.id === targetDealId);
    if (!targetDeal) {
      setApiError("Please select a valid deal from the pipeline.");
      return;
    }

    setIsProvisioningStageList(true);
    setApiError(null);

    try {
      const result = await createStageTaskListForDeal(token, stageConfig, targetDeal);
      
      // Update local task lists state
      setTaskLists((prev) => [result.taskList, ...prev]);
      setSelectedListId(result.taskList.id);
      setTasks(result.tasks);

      setSuccessMessage(
        `Successfully created Google Task List "${result.taskList.title}" with ${result.tasks.length} task(s) for "${targetDeal.address}"!`
      );
      setTimeout(() => setSuccessMessage(null), 5000);

      setShowManualStageModal(false);

      if (triggerSystemEvent) {
        triggerSystemEvent("ON_STAGE_TASK_LIST_CREATED", {
          dealId: targetDeal.id,
          stage: stageConfig.stage,
          dealAddress: targetDeal.address,
          listTitle: result.taskList.title,
          tasksCount: result.tasks.length,
        });
      }
    } catch (err: any) {
      console.error("Failed to provision stage task list:", err);
      setApiError(err.message || "Failed to create stage task list in Google Tasks.");
    } finally {
      setIsProvisioningStageList(false);
    }
  };

  // Toggle stage mapping active state
  const handleToggleStageEnabled = (stageId: string) => {
    const updated = stageMappings.map((m) =>
      m.id === stageId ? { ...m, enabled: !m.enabled } : m
    );
    updateStageMappings(updated);
  };

  // Update stage mapping pattern
  const handleUpdateStagePattern = (stageId: string, pattern: string) => {
    const updated = stageMappings.map((m) =>
      m.id === stageId ? { ...m, listNamePattern: pattern } : m
    );
    updateStageMappings(updated);
  };

  // Remove a task from a stage mapping
  const handleRemoveTaskFromStage = (stageId: string, taskId: string) => {
    const updated = stageMappings.map((m) => {
      if (m.id === stageId) {
        return {
          ...m,
          tasks: m.tasks.filter((t) => t.id !== taskId),
        };
      }
      return m;
    });
    updateStageMappings(updated);
  };

  // Save / Add Task in Stage mapping
  const handleSaveStageTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStageConfig || !stageTaskForm.title.trim()) return;

    const newTaskItem: StageTaskItemTemplate = {
      id: stageTaskForm.id || `task-${Date.now()}`,
      title: stageTaskForm.title.trim(),
      notesTemplate: stageTaskForm.notesTemplate?.trim() || undefined,
      daysFromNow: Number(stageTaskForm.daysFromNow) || 1,
    };

    const updated = stageMappings.map((m) => {
      if (m.id === editingStageConfig.id) {
        if (editingTaskIndex !== null && editingTaskIndex >= 0) {
          // Editing existing task
          const newTasks = [...m.tasks];
          newTasks[editingTaskIndex] = newTaskItem;
          return { ...m, tasks: newTasks };
        } else {
          // Adding new task
          return { ...m, tasks: [...m.tasks, newTaskItem] };
        }
      }
      return m;
    });

    updateStageMappings(updated);
    setShowAddTaskModal(false);
    setEditingStageConfig(null);
    setEditingTaskIndex(null);
    setStageTaskForm({ id: "", title: "", notesTemplate: "", daysFromNow: 3 });
    setSuccessMessage("Stage checklist task updated.");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Batch Sync Deal Milestones into Google Tasks (legacy modal action)
  const handleBatchSyncDealMilestones = async () => {
    const deal = deals.find((d) => d.id === selectedDealForSync);
    if (!deal || !token || !selectedListId) return;

    setIsSubmittingTask(true);
    setApiError(null);

    try {
      const templatesToPush = DEAL_MILESTONE_TEMPLATES.filter((_, idx) =>
        selectedMilestones.includes(idx)
      );

      let createdCount = 0;
      for (const tpl of templatesToPush) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + tpl.daysFromNow);

        const taskData = {
          title: `[${deal.city}] ${tpl.title} - ${deal.address}`,
          notes: tpl.notesTemplate(deal.address, deal.city, deal.ownerName),
          due: dueDate.toISOString(),
        };

        const created = await createTask(token, selectedListId, taskData);
        setTasks((prev) => [created, ...prev]);
        createdCount++;
      }

      setShowSyncDealModal(false);
      setSuccessMessage(
        `Successfully synced ${createdCount} milestone task(s) for "${deal.address}" to Google Tasks!`
      );
      setTimeout(() => setSuccessMessage(null), 4000);

      if (triggerSystemEvent) {
        triggerSystemEvent("ON_DEAL_TASKS_SYNCED", {
          dealId: deal.id,
          address: deal.address,
          count: createdCount,
        });
      }
    } catch (err: any) {
      console.error("Deal milestone batch sync error:", err);
      setApiError(err.message || "Failed to batch sync tasks.");
    } finally {
      setIsSubmittingTask(false);
    }
  };

  // Filtered Tasks list
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Status filter
      if (statusFilter === "pending" && task.status !== "needsAction") return false;
      if (statusFilter === "completed" && task.status !== "completed") return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = task.title?.toLowerCase().includes(q);
        const notesMatch = task.notes?.toLowerCase().includes(q);
        return titleMatch || notesMatch;
      }

      return true;
    });
  }, [tasks, statusFilter, searchQuery]);

  const activeList = taskLists.find((l) => l.id === selectedListId);
  const pendingCount = tasks.filter((t) => t.status === "needsAction").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const activeMappedStagesCount = stageMappings.filter((m) => m.enabled).length;

  return (
    <div className="space-y-6" id="google-tasks-container">
      {/* 1. Header & Quick Actions Bar */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-lg bg-emerald-800 text-amber-400 flex items-center justify-center shadow-sm">
              <CheckSquare className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Google Tasks Workstation
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
              Live Google Sync
            </span>
          </div>
          <p className="text-xs text-slate-600 max-w-2xl">
            Bidirectional Google Tasks integration with automated pipeline stage mapping.
            Map specific deal stages (e.g. <strong className="text-emerald-950 font-semibold">Due Diligence</strong>, <strong className="text-emerald-950 font-semibold">Underwriting</strong>, <strong className="text-emerald-950 font-semibold">Under Contract</strong>) to automatically generate dedicated Google Task Lists with custom checklists.
          </p>
        </div>

        {/* Auth / Account State Pill */}
        <div className="flex items-center gap-2 shrink-0">
          {token && currentUser ? (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 px-3 shadow-inner">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || "Google User"}
                  className="h-8 w-8 rounded-full border border-emerald-600"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-emerald-900 text-white flex items-center justify-center font-bold text-xs">
                  {currentUser.email?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <div className="text-left">
                <span className="text-xs font-bold text-slate-900 block leading-tight truncate max-w-[150px]">
                  {currentUser.displayName || currentUser.email}
                </span>
                <span className="text-[10px] text-emerald-700 font-mono block">
                  Google Tasks Connected
                </span>
              </div>
              <button
                onClick={handleSignOut}
                title="Disconnect Google Account"
                className="ml-2 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="gsi-material-button px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium text-xs flex items-center gap-2.5 shadow-sm hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50"
            >
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="h-4 w-4 shrink-0"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                ></path>
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                ></path>
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                ></path>
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                ></path>
              </svg>
              <span>{isSigningIn ? "Connecting to Google..." : "Sign in with Google"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Mode Switcher Navigation Tabs */}
      <div className="bg-white rounded-xl p-2 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("workstation")}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "workstation"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <ListTodo className="h-4 w-4 text-emerald-400" />
            <span>Google Tasks Manager</span>
            {taskLists.length > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                {taskLists.length} Lists
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("stage-mappings")}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "stage-mappings"
                ? "bg-emerald-800 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Workflow className="h-4 w-4 text-amber-300" />
            <span>Deal Stage Mapping & Automation</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-900 text-amber-300 text-[10px] font-mono font-bold">
              {activeMappedStagesCount} Active
            </span>
          </button>
        </div>

        {/* Quick Action Pill on right side */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setShowManualStageModal(true)}
            className="px-3 py-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>1-Click Provision Stage List</span>
          </button>
        </div>
      </div>

      {/* Notifications / Feedback */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold cursor-pointer"
          >
            &times;
          </button>
        </motion.div>
      )}

      {apiError && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{apiError}</span>
          </div>
          <button
            onClick={() => setApiError(null)}
            className="text-rose-700 hover:text-rose-900 text-xs font-bold cursor-pointer"
          >
            &times;
          </button>
        </motion.div>
      )}

      {/* TAB 1: DEAL STAGE MAPPING & AUTOMATION ENGINE */}
      {activeTab === "stage-mappings" && (
        <div className="space-y-6">
          {/* Stage Engine Banner & Controls */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white rounded-xl p-6 border border-emerald-900/60 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2 text-amber-400">
                  <Workflow className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase font-mono tracking-wider">
                    Pipeline Stage Automation Engine
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Auto-Create Google Task Lists for Deal Stages
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Configure real estate deal stages (e.g. Due Diligence, Underwriting, Offer Submitted, Under Contract) to automatically generate structured task lists in Google Tasks with property-specific checklists, notes, and calculated closing deadlines.
                </p>
              </div>

              {/* Master Auto Sync Switch */}
              <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-xs font-bold text-white block">Auto-Sync on CRM Move</span>
                  <span className="text-[10px] text-slate-300 block">
                    {autoSyncOnStageChange ? "Enabled (Live Trigger)" : "Paused"}
                  </span>
                </div>
                <button
                  onClick={() => toggleAutoSync(!autoSyncOnStageChange)}
                  className={`p-1 rounded-lg transition-colors cursor-pointer ${
                    autoSyncOnStageChange ? "text-emerald-400" : "text-slate-500"
                  }`}
                  title="Toggle CRM Stage Auto-Sync"
                >
                  {autoSyncOnStageChange ? (
                    <ToggleRight className="h-7 w-7" />
                  ) : (
                    <ToggleLeft className="h-7 w-7" />
                  )}
                </button>
              </div>
            </div>

            {/* Smart Template Variables Bar */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 font-mono">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-300 font-semibold uppercase text-[10px]">Available Tokens:</span>
                {["{address}", "{city}", "{state}", "{owner}", "{stage}", "{arv}", "{mao}", "{price}"].map((token) => (
                  <span
                    key={token}
                    className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 text-[10px]"
                  >
                    {token}
                  </span>
                ))}
              </div>
              <button
                onClick={resetStageMappingsToDefault}
                className="text-slate-400 hover:text-amber-300 text-[11px] underline cursor-pointer transition-colors"
              >
                Reset Mappings to Defaults
              </button>
            </div>
          </div>

          {/* Grid of Stage Mapping Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stageMappings.map((config) => {
              const isDueDiligence = config.stage === DealStatus.DueDiligence;
              return (
                <div
                  key={config.id}
                  className={`bg-white rounded-xl border transition-all shadow-sm flex flex-col justify-between ${
                    config.enabled
                      ? "border-emerald-200 ring-1 ring-emerald-100"
                      : "border-slate-200 opacity-80"
                  }`}
                >
                  {/* Card Top */}
                  <div className="p-5 space-y-4">
                    {/* Header: Stage Badge + Toggle Switch */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase font-mono tracking-wide ${
                            isDueDiligence
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : config.stage === DealStatus.UnderContract
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : config.stage === DealStatus.Underwriting
                              ? "bg-blue-100 text-blue-900 border border-blue-300"
                              : "bg-slate-100 text-slate-800 border border-slate-300"
                          }`}
                        >
                          {config.stage}
                        </span>
                        {isDueDiligence && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[9px] font-bold">
                            PRIMARY
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleToggleStageEnabled(config.id)}
                        className={`text-xs font-semibold flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                          config.enabled
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        <span>{config.enabled ? "Active" : "Disabled"}</span>
                        {config.enabled ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Circle className="h-3.5 w-3.5 text-slate-400" />
                        )}
                      </button>
                    </div>

                    {/* Google Task List Naming Template */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">
                        Target Google Task List Name Pattern
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={config.listNamePattern}
                          onChange={(e) => handleUpdateStagePattern(config.id, e.target.value)}
                          placeholder="e.g. Due Diligence: {address}"
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 block font-sans">
                        Preview: <strong className="text-slate-700 font-mono font-medium">{formatTemplateString(config.listNamePattern, deals[0] || { address: "142 Highland Ave", city: "Waterbury", state: "CT", zipCode: "06708", ownerName: "John Doe", askingPrice: 150000, arv: 260000, mao: 145000 } as any, config.stage)}</strong>
                      </span>
                    </div>

                    {/* Task Checklist Items */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 uppercase font-mono">
                          Checklist Tasks ({config.tasks.length})
                        </span>
                        <button
                          onClick={() => {
                            setEditingStageConfig(config);
                            setEditingTaskIndex(null);
                            setStageTaskForm({
                              id: "",
                              title: "",
                              notesTemplate: "",
                              daysFromNow: 3,
                            });
                            setShowAddTaskModal(true);
                          }}
                          className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add Task</span>
                        </button>
                      </div>

                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {config.tasks.map((tItem, idx) => (
                          <div
                            key={tItem.id || idx}
                            className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs group flex items-start justify-between gap-2 hover:bg-slate-100/70 transition-colors"
                          >
                            <div className="flex items-start gap-1.5 min-w-0 flex-1">
                              <CheckSquare className="h-3.5 w-3.5 text-emerald-700 shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-800 text-[11px] truncate leading-tight">
                                  {tItem.title}
                                </p>
                                <span className="text-[10px] text-slate-500 font-mono block">
                                  Due in +{tItem.daysFromNow} days
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button
                                onClick={() => {
                                  setEditingStageConfig(config);
                                  setEditingTaskIndex(idx);
                                  setStageTaskForm(tItem);
                                  setShowAddTaskModal(true);
                                }}
                                className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                                title="Edit Task Template"
                              >
                                <Edit3 className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleRemoveTaskFromStage(config.id, tItem.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                                title="Remove Task Template"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: 1-Click Provision Button */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-xl space-y-2">
                    <button
                      onClick={() => handleProvisionStageListForDeal(config)}
                      disabled={isProvisioningStageList || !token}
                      className="w-full py-2 px-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      <span>
                        {isProvisioningStageList
                          ? "Provisioning Google Task List..."
                          : `Create Task List for "${deals[0]?.address?.slice(0, 18) || "Selected Deal"}..."`}
                      </span>
                    </button>

                    {!token && (
                      <span className="text-[10px] text-amber-700 font-mono block text-center">
                        Connect Google Account to sync
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE GOOGLE TASKS WORKSTATION */}
      {activeTab === "workstation" && (
        <>
          {/* Main Interface when connected vs Unconnected State */}
          {!token ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm space-y-5">
              <div className="h-16 w-16 bg-emerald-50 border border-emerald-200 rounded-2xl mx-auto flex items-center justify-center text-emerald-800 shadow-sm">
                <ListTodo className="h-8 w-8 text-emerald-700" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Connect Google Tasks to Enable Live Synchronization
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Authenticate with your Google Account to view, create, and manage your real
                  estate acquisition tasks, closing timelines, and underwriting to-dos directly
                  synced with Google Tasks.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-md hover:shadow cursor-pointer disabled:opacity-50"
                >
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="h-4 w-4"
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    ></path>
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    ></path>
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    ></path>
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    ></path>
                  </svg>
                  <span>{isSigningIn ? "Authenticating..." : "Sign in with Google Account"}</span>
                </button>
              </div>

              <div className="pt-6 border-t border-slate-100 max-w-lg mx-auto grid grid-cols-3 gap-3 text-left">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-mono text-emerald-800 font-bold block uppercase">
                    Stage Mapping
                  </span>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Auto-create task lists per deal stage.
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-mono text-emerald-800 font-bold block uppercase">
                    Bidirectional
                  </span>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Complete tasks on phone or web.
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-mono text-emerald-800 font-bold block uppercase">
                    Secured OAuth
                  </span>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Zero permanent access token storage.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Column: Task Lists & Deal Sync Short-cuts */}
              <div className="space-y-6 lg:col-span-1">
                {/* Task Lists Manager */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                      Task Lists ({taskLists.length})
                    </span>
                    <button
                      onClick={() => setShowNewListModal(true)}
                      className="p-1 rounded-md text-emerald-800 hover:bg-emerald-50 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>New List</span>
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                    {taskLists.map((list) => {
                      const isSelected = list.id === selectedListId;
                      return (
                        <div
                          key={list.id}
                          className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? "bg-emerald-900 text-white font-semibold shadow-sm"
                              : "text-slate-700 hover:bg-slate-100"
                          }`}
                          onClick={() => setSelectedListId(list.id)}
                        >
                          <span className="truncate flex items-center gap-2">
                            <ListTodo
                              className={`h-3.5 w-3.5 shrink-0 ${
                                isSelected ? "text-amber-400" : "text-slate-400"
                              }`}
                            />
                            <span className="truncate">{list.title}</span>
                          </span>

                          {taskLists.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                promptDeleteList(list);
                              }}
                              className={`opacity-0 group-hover:opacity-100 p-1 rounded hover:text-rose-400 transition-opacity ${
                                isSelected ? "text-slate-300" : "text-slate-400"
                              }`}
                              title="Delete Task List"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Deal Stage Quick Launcher Widget */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-xl p-4 border border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-bold font-mono tracking-wide uppercase text-amber-400">
                      Stage Task List Creator
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Instantly provision a dedicated stage list (e.g. Due Diligence checklist) for any property.
                  </p>
                  <button
                    onClick={() => setShowManualStageModal(true)}
                    className="w-full py-2 px-3 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <FolderPlus className="h-3.5 w-3.5 text-amber-400" />
                    <span>Auto-Provision Stage List</span>
                  </button>
                </div>

                {/* Quick Stats Widget */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-2">
                  <span className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider block">
                    Current List Summary
                  </span>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-100">
                      <span className="text-[10px] text-amber-800 uppercase font-mono font-bold block">
                        Pending
                      </span>
                      <span className="text-lg font-bold text-amber-950 font-mono">
                        {pendingCount}
                      </span>
                    </div>
                    <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                      <span className="text-[10px] text-emerald-800 uppercase font-mono font-bold block">
                        Completed
                      </span>
                      <span className="text-lg font-bold text-emerald-950 font-mono">
                        {completedCount}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <a
                      href="https://tasks.google.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>Open in Google Suite</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Column: Tasks Workstation */}
              <div className="space-y-4 lg:col-span-3">
                {/* Action Bar & Filters */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tasks by title or notes..."
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                        >
                          &times;
                        </button>
                      )}
                    </div>

                    {/* Status Filter Tabs */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                      <button
                        onClick={() => setStatusFilter("all")}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                          statusFilter === "all"
                            ? "bg-white text-slate-900 shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        All ({tasks.length})
                      </button>
                      <button
                        onClick={() => setStatusFilter("pending")}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                          statusFilter === "pending"
                            ? "bg-white text-slate-900 shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Pending ({pendingCount})
                      </button>
                      <button
                        onClick={() => setStatusFilter("completed")}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                          statusFilter === "completed"
                            ? "bg-white text-slate-900 shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Completed ({completedCount})
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleRefresh}
                      disabled={isRefreshing || isLoadingTasks}
                      className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      title="Refresh tasks from Google"
                    >
                      <RefreshCw
                        className={`h-3.5 w-3.5 ${isRefreshing || isLoadingTasks ? "animate-spin" : ""}`}
                      />
                      <span className="hidden sm:inline">Refresh</span>
                    </button>

                    {completedCount > 0 && (
                      <button
                        onClick={promptClearCompleted}
                        className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Clear Completed
                      </button>
                    )}

                    <button
                      onClick={() => setShowNewTaskModal(true)}
                      className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Task</span>
                    </button>
                  </div>
                </div>

                {/* Task Item List */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100 min-h-[350px]">
                  {isLoadingTasks ? (
                    <div className="p-12 text-center text-slate-400 space-y-3">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-800" />
                      <p className="text-xs font-medium">Fetching tasks from Google API...</p>
                    </div>
                  ) : filteredTasks.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 space-y-2">
                      <CheckSquare className="h-8 w-8 mx-auto text-slate-300" />
                      <p className="text-xs font-semibold text-slate-700">No tasks in this list</p>
                      <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                        {searchQuery
                          ? "No tasks match your search filter."
                          : "Create a task or use 'Deal Stage Mapping' to automatically populate structured milestones."}
                      </p>
                      <div className="pt-2 flex items-center justify-center gap-2">
                        <button
                          onClick={() => setShowNewTaskModal(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Create Task</span>
                        </button>
                        <button
                          onClick={() => setShowManualStageModal(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                          <span>Provision Stage Checklist</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    filteredTasks.map((task) => {
                      const isCompleted = task.status === "completed";
                      const dueDateObj = task.due ? new Date(task.due) : null;
                      const isOverdue =
                        dueDateObj && !isCompleted && dueDateObj.getTime() < Date.now();

                      return (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`p-4 flex items-start justify-between gap-3 group transition-colors ${
                            isCompleted ? "bg-slate-50/70" : "hover:bg-slate-50/50"
                          }`}
                        >
                          {/* Checkbox & Task info */}
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <button
                              onClick={() => handleToggleTask(task)}
                              className="mt-0.5 text-slate-400 hover:text-emerald-700 transition-colors cursor-pointer shrink-0"
                              title={isCompleted ? "Mark incomplete" : "Mark completed"}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                              ) : (
                                <Circle className="h-5 w-5 text-slate-400 hover:text-emerald-700" />
                              )}
                            </button>

                            <div className="space-y-1 flex-1 min-w-0">
                              <p
                                className={`text-xs font-semibold leading-snug break-words ${
                                  isCompleted
                                    ? "line-through text-slate-400"
                                    : "text-slate-900"
                                }`}
                              >
                                {task.title}
                              </p>

                              {task.notes && (
                                <p className="text-[11px] text-slate-600 whitespace-pre-line leading-relaxed font-sans">
                                  {task.notes}
                                </p>
                              )}

                              {/* Metadata Tags */}
                              <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-mono">
                                {dueDateObj && (
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${
                                      isOverdue
                                        ? "bg-rose-50 text-rose-800 border border-rose-200 font-bold"
                                        : "bg-slate-100 text-slate-700"
                                    }`}
                                  >
                                    <Calendar className="h-3 w-3" />
                                    <span>Due: {dueDateObj.toLocaleDateString()}</span>
                                  </span>
                                )}

                                {isCompleted && task.completed && (
                                  <span className="inline-flex items-center gap-1 text-emerald-800">
                                    <CheckCircle2 className="h-3 w-3" />
                                    <span>
                                      Done {new Date(task.completed).toLocaleDateString()}
                                    </span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Menu buttons */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              onClick={() => setEditingTask(task)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                              title="Edit Task"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => promptDeleteTask(task)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                              title="Delete Task"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL 1: Add New Task Modal */}
      <AnimatePresence>
        {showNewTaskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 text-emerald-900 rounded-lg">
                    <Plus className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Create New Task in Google Tasks
                  </h3>
                </div>
                <button
                  onClick={() => setShowNewTaskModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase font-mono block mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g. Schedule Waterbury building inspector for 142 Highland"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase font-mono block mb-1">
                    Description & Notes
                  </label>
                  <textarea
                    rows={3}
                    value={newTaskNotes}
                    onChange={(e) => setNewTaskNotes(e.target.value)}
                    placeholder="Provide relevant phone numbers, attorney details, or underwriting metrics..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 font-sans"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase font-mono block mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowNewTaskModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingTask || !newTaskTitle.trim()}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingTask ? "Syncing..." : "Add to Google Tasks"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Edit Task Modal */}
      <AnimatePresence>
        {editingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 text-emerald-900 rounded-lg">
                    <Edit3 className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Edit Google Task</h3>
                </div>
                <button
                  onClick={() => setEditingTask(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateTask} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase font-mono block mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingTask.title}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, title: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase font-mono block mb-1">
                    Notes & Details
                  </label>
                  <textarea
                    rows={3}
                    value={editingTask.notes || ""}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, notes: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 font-sans"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingTask(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingTask || !editingTask.title.trim()}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingTask ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: Create Task List Modal */}
      <AnimatePresence>
        {showNewListModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 text-emerald-900 rounded-lg">
                    <ListTodo className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Create New Task List
                  </h3>
                </div>
                <button
                  onClick={() => setShowNewListModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateList} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase font-mono block mb-1">
                    List Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    placeholder="e.g. Waterbury Acquisitions, Title Closings"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowNewListModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingList || !newListTitle.trim()}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingList ? "Creating..." : "Create List"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: 1-Click Provision Stage Task List for Deal Modal */}
      <AnimatePresence>
        {showManualStageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 text-emerald-900 rounded-lg">
                    <Workflow className="h-4 w-4 text-emerald-800" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Provision Dedicated Stage Task List
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Instantiate a mapped checklist in Google Tasks for a deal stage
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowManualStageModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* 1. Target Deal Selector */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase font-mono block mb-1">
                    1. Select Target Property Deal
                  </label>
                  <select
                    value={selectedDealForStageList}
                    onChange={(e) => setSelectedDealForStageList(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    {deals.map((deal) => (
                      <option key={deal.id} value={deal.id}>
                        {deal.address} ({deal.city}, CT) - Current: {deal.status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Target Stage Mapping Selector */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase font-mono block mb-1">
                    2. Select Stage Template to Provision
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {stageMappings.map((sm) => {
                      const isSelected = selectedStageForManualCreate === sm.stage;
                      return (
                        <div
                          key={sm.id}
                          onClick={() => setSelectedStageForManualCreate(sm.stage)}
                          className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? "bg-emerald-50 border-emerald-400 text-emerald-950 ring-1 ring-emerald-300"
                              : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold">{sm.stage}</span>
                            <span className="text-[10px] font-mono bg-emerald-800 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                              {sm.tasks.length} Tasks
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono mt-1 truncate">
                            Pattern: {sm.listNamePattern}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Preview Tasks that will be created */}
                {(() => {
                  const targetConfig = stageMappings.find(
                    (m) => m.stage === selectedStageForManualCreate
                  );
                  const activeDeal = deals.find((d) => d.id === selectedDealForStageList) || deals[0];
                  if (!targetConfig || !activeDeal) return null;

                  return (
                    <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">
                          List to Create: <span className="text-emerald-800 font-mono">{formatTemplateString(targetConfig.listNamePattern, activeDeal, targetConfig.stage)}</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {targetConfig.tasks.length} items
                        </span>
                      </div>
                      <div className="space-y-1">
                        {targetConfig.tasks.map((t, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-700">
                            <CheckSquare className="h-3 w-3 text-emerald-700 shrink-0" />
                            <span className="truncate flex-1 font-medium">{t.title}</span>
                            <span className="text-[10px] font-mono text-slate-500">+{t.daysFromNow}d</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowManualStageModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const cfg = stageMappings.find(
                        (m) => m.stage === selectedStageForManualCreate
                      );
                      if (cfg) {
                        handleProvisionStageListForDeal(cfg, selectedDealForStageList);
                      }
                    }}
                    disabled={isProvisioningStageList || !token}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isProvisioningStageList ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Provisioning to Google Tasks...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                        <span>Create & Populate Google Task List</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 5: Add / Edit Stage Task Item Modal */}
      <AnimatePresence>
        {showAddTaskModal && editingStageConfig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 text-emerald-900 rounded-lg">
                    <Edit3 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {editingTaskIndex !== null ? "Edit Task Template" : "Add Task to Stage Mapping"}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Stage: {editingStageConfig.stage}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddTaskModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveStageTask} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase font-mono block mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={stageTaskForm.title}
                    onChange={(e) =>
                      setStageTaskForm({ ...stageTaskForm, title: e.target.value })
                    }
                    placeholder="e.g. Schedule Phase 1 Environmental Inspection"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase font-mono block mb-1">
                    Target Due Date Offset (Days from Trigger) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="180"
                    required
                    value={stageTaskForm.daysFromNow}
                    onChange={(e) =>
                      setStageTaskForm({
                        ...stageTaskForm,
                        daysFromNow: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    e.g. 3 = due 3 calendar days after deal enters this stage
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase font-mono block mb-1">
                    Notes & Action Instructions Template
                  </label>
                  <textarea
                    rows={3}
                    value={stageTaskForm.notesTemplate || ""}
                    onChange={(e) =>
                      setStageTaskForm({
                        ...stageTaskForm,
                        notesTemplate: e.target.value,
                      })
                    }
                    placeholder="Provide specific notes. You can use {address}, {city}, {owner}, {mao}, etc."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 font-sans"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddTaskModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                  >
                    Save Task Template
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MANDATORY DESTRUCTIVE ACTION CONFIRMATION DIALOG */}
      <AnimatePresence>
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl border border-rose-200 max-w-md w-full p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 shrink-0">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {confirmDialog.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Workspace User Confirmation Required
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {confirmDialog.description}
              </p>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() =>
                    setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
                  }
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDialog.onConfirm}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs"
                >
                  {confirmDialog.confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
