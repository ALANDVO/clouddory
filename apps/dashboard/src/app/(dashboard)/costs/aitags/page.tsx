"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tags,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Copy,
  Pencil,
  Sparkles,
  GripVertical,
  Filter,
  Layers,
  Play,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ModuleGate from "@/components/shared/ModuleGate";
import PageHelp from "@/components/shared/PageHelp";
import { useAppStore } from "@/stores/app-store";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type TagType = "custom" | "ai";

type Dimension =
  | "provider"
  | "service"
  | "region"
  | "account"
  | "tag_key"
  | "tag_value"
  | "resource_name"
  | "resource_type";

type Operator = "equals" | "not_equals" | "contains" | "starts_with" | "regex";

type Logic = "AND" | "OR";

interface Condition {
  id: string;
  dimension: Dimension | "";
  operator: Operator | "";
  value: string;
  logic: Logic;
}

interface Rule {
  id: string;
  valueName: string;
  conditions: Condition[];
}

interface ApiCondition {
  id: string;
  dimension: string;
  operator: string;
  value: string;
  logicOp: string;
}

interface ApiRule {
  id: string;
  valueName: string;
  priority: number;
  conditions: ApiCondition[];
}

interface ApiAiTag {
  id: string;
  orgId: string;
  name: string;
  description: string | null;
  tagType: string;
  defaultValue: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
  rules: ApiRule[];
}

interface EvalResult {
  valueName: string;
  recordCount: number;
  totalCost: number;
  percentage: number;
}

interface EvalResponse {
  aiTagId: string;
  aiTagName: string;
  totalRecords: number;
  totalCost: number;
  results: EvalResult[];
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DIMENSION_OPTIONS: { value: Dimension; label: string }[] = [
  { value: "provider", label: "Provider" },
  { value: "service", label: "Service" },
  { value: "region", label: "Region" },
  { value: "account", label: "Account" },
  { value: "tag_key", label: "Tag Key" },
  { value: "tag_value", label: "Tag Value" },
  { value: "resource_name", label: "Resource Name" },
  { value: "resource_type", label: "Resource Type" },
];

const OPERATOR_OPTIONS: { value: Operator; label: string }[] = [
  { value: "equals", label: "equals" },
  { value: "not_equals", label: "not equals" },
  { value: "contains", label: "contains" },
  { value: "starts_with", label: "starts with" },
  { value: "regex", label: "regex" },
];

/* Seed tags to create on first load if none exist */
const SEED_TAGS = [
  {
    name: "Team",
    description: "Assign cloud costs to engineering teams based on resource tags, accounts, and naming conventions.",
    tagType: "custom",
    defaultValue: "Unallocated",
    rules: [
      {
        valueName: "Platform Engineering",
        priority: 3,
        conditions: [
          { dimension: "tag_value", operator: "contains", value: "platform", logicOp: "AND" },
          { dimension: "service", operator: "contains", value: "ec2", logicOp: "OR" },
          { dimension: "tag_key", operator: "contains", value: "team", logicOp: "AND" },
        ],
      },
      {
        valueName: "Product",
        priority: 2,
        conditions: [
          { dimension: "tag_value", operator: "contains", value: "product", logicOp: "AND" },
          { dimension: "account", operator: "equals", value: "dev-account", logicOp: "OR" },
        ],
      },
      {
        valueName: "Data Science",
        priority: 1,
        conditions: [
          { dimension: "tag_value", operator: "contains", value: "data", logicOp: "AND" },
          { dimension: "service", operator: "contains", value: "bigquery", logicOp: "OR" },
          { dimension: "resource_name", operator: "contains", value: "ml-", logicOp: "OR" },
          { dimension: "tag_value", operator: "contains", value: "data-science", logicOp: "OR" },
        ],
      },
    ],
  },
  {
    name: "Environment",
    description: "Categorize resources by deployment environment using tag values and account mappings.",
    tagType: "custom",
    defaultValue: "Unknown",
    rules: [
      {
        valueName: "Production",
        priority: 4,
        conditions: [
          { dimension: "tag_value", operator: "contains", value: "production", logicOp: "AND" },
          { dimension: "account", operator: "starts_with", value: "prod", logicOp: "OR" },
        ],
      },
      {
        valueName: "Staging",
        priority: 3,
        conditions: [
          { dimension: "tag_value", operator: "equals", value: "staging", logicOp: "AND" },
          { dimension: "resource_name", operator: "contains", value: "staging", logicOp: "OR" },
        ],
      },
      {
        valueName: "Development",
        priority: 2,
        conditions: [
          { dimension: "tag_value", operator: "contains", value: "development", logicOp: "AND" },
          { dimension: "account", operator: "contains", value: "dev", logicOp: "OR" },
          { dimension: "resource_name", operator: "starts_with", value: "dev-", logicOp: "OR" },
        ],
      },
      {
        valueName: "Sandbox",
        priority: 1,
        conditions: [
          { dimension: "tag_value", operator: "equals", value: "sandbox", logicOp: "AND" },
        ],
      },
    ],
  },
  {
    name: "Application",
    description: "Map cloud resources to business applications across all providers and accounts.",
    tagType: "custom",
    defaultValue: "Unallocated",
    rules: [
      {
        valueName: "API Gateway",
        priority: 3,
        conditions: [
          { dimension: "tag_value", operator: "contains", value: "api-gateway", logicOp: "AND" },
          { dimension: "resource_name", operator: "contains", value: "api-", logicOp: "OR" },
          { dimension: "service", operator: "contains", value: "cloudfront", logicOp: "OR" },
        ],
      },
      {
        valueName: "User Service",
        priority: 2,
        conditions: [
          { dimension: "tag_value", operator: "contains", value: "user-service", logicOp: "AND" },
          { dimension: "resource_name", operator: "contains", value: "session", logicOp: "OR" },
        ],
      },
      {
        valueName: "Analytics Pipeline",
        priority: 1,
        conditions: [
          { dimension: "tag_value", operator: "contains", value: "analytics", logicOp: "AND" },
          { dimension: "service", operator: "contains", value: "bigquery", logicOp: "OR" },
          { dimension: "resource_name", operator: "contains", value: "data-lake", logicOp: "OR" },
          { dimension: "resource_name", operator: "contains", value: "ml-", logicOp: "OR" },
          { dimension: "resource_name", operator: "contains", value: "analytics", logicOp: "OR" },
        ],
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function makeCondition(): Condition {
  return {
    id: generateId(),
    dimension: "",
    operator: "",
    value: "",
    logic: "AND",
  };
}

function makeRule(): Rule {
  return {
    id: generateId(),
    valueName: "",
    conditions: [makeCondition()],
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

const EVAL_COLORS = [
  "#06b6d4", "#a855f7", "#f59e0b", "#10b981", "#f43f5e",
  "#3b82f6", "#f97316", "#ec4899", "#6366f1", "#94a3b8",
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AiTagsPage() {
  const { currentOrgId } = useAppStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [expandedTag, setExpandedTag] = useState<string | null>(null);

  // Form state -- step 1
  const [tagName, setTagName] = useState("");
  const [tagDescription, setTagDescription] = useState("");
  const [tagType, setTagType] = useState<TagType>("custom");

  // Form state -- step 2
  const [rules, setRules] = useState<Rule[]>([makeRule()]);
  const [defaultValue, setDefaultValue] = useState("Unallocated");

  // Data state
  const [tags, setTags] = useState<ApiAiTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [evalResults, setEvalResults] = useState<Record<string, EvalResponse>>({});
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);

  /* ---------- API helpers ---------- */
  const apiBase = currentOrgId ? `/api/orgs/${currentOrgId}/aitags` : null;

  const fetchTags = useCallback(async () => {
    if (!apiBase) return;
    setLoading(true);
    try {
      const res = await fetch(apiBase);
      if (res.ok) {
        const data = await res.json();
        setTags(data);
      }
    } catch (err) {
      console.error("Failed to fetch AiTags:", err);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  const seedDefaultTags = useCallback(async () => {
    if (!apiBase) return;
    for (const seed of SEED_TAGS) {
      try {
        await fetch(apiBase, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(seed),
        });
      } catch {
        // Ignore errors (e.g., duplicates)
      }
    }
    await fetchTags();
  }, [apiBase, fetchTags]);

  useEffect(() => {
    if (!apiBase) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(apiBase);
        if (res.ok) {
          const data = await res.json();
          if (data.length === 0) {
            // Seed default tags on first load
            await seedDefaultTags();
          } else {
            setTags(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch AiTags:", err);
      } finally {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase]);

  /* ---------- Reset ---------- */
  const resetForm = useCallback(() => {
    setStep(1);
    setDirection(1);
    setTagName("");
    setTagDescription("");
    setTagType("custom");
    setRules([makeRule()]);
    setDefaultValue("Unallocated");
    setEditingTagId(null);
  }, []);

  const openDialog = (tag?: ApiAiTag) => {
    resetForm();
    if (tag) {
      setEditingTagId(tag.id);
      setTagName(tag.name);
      setTagDescription(tag.description || "");
      setTagType(tag.tagType === "ai_powered" ? "ai" : "custom");
      setDefaultValue(tag.defaultValue);
      setRules(
        tag.rules.length > 0
          ? tag.rules.map((r) => ({
              id: r.id,
              valueName: r.valueName,
              conditions:
                r.conditions.length > 0
                  ? r.conditions.map((c) => ({
                      id: c.id,
                      dimension: c.dimension as Dimension,
                      operator: c.operator as Operator,
                      value: c.value,
                      logic: c.logicOp as Logic,
                    }))
                  : [makeCondition()],
            }))
          : [makeRule()]
      );
    }
    setDialogOpen(true);
  };

  const goNext = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, 3));
  };
  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  /* ---------- Rule management ---------- */
  const addRule = () => setRules((prev) => [...prev, makeRule()]);
  const removeRule = (ruleId: string) =>
    setRules((prev) => prev.filter((r) => r.id !== ruleId));

  const updateRuleValue = (ruleId: string, valueName: string) =>
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, valueName } : r))
    );

  const addCondition = (ruleId: string) =>
    setRules((prev) =>
      prev.map((r) =>
        r.id === ruleId
          ? { ...r, conditions: [...r.conditions, makeCondition()] }
          : r
      )
    );

  const removeCondition = (ruleId: string, condId: string) =>
    setRules((prev) =>
      prev.map((r) =>
        r.id === ruleId
          ? { ...r, conditions: r.conditions.filter((c) => c.id !== condId) }
          : r
      )
    );

  const updateCondition = (
    ruleId: string,
    condId: string,
    field: keyof Condition,
    value: string
  ) =>
    setRules((prev) =>
      prev.map((r) =>
        r.id === ruleId
          ? {
              ...r,
              conditions: r.conditions.map((c) =>
                c.id === condId ? { ...c, [field]: value } : c
              ),
            }
          : r
      )
    );

  /* ---------- Save ---------- */
  const handleSave = async () => {
    if (!apiBase) return;
    setSaving(true);

    const payload = {
      name: tagName,
      description: tagDescription || null,
      tagType: tagType === "ai" ? "ai_powered" : "custom",
      defaultValue,
      rules: rules
        .filter((r) => r.valueName.trim())
        .map((r, idx) => ({
          valueName: r.valueName.trim(),
          priority: rules.length - idx,
          conditions: r.conditions
            .filter((c) => c.dimension && c.operator && c.value)
            .map((c) => ({
              dimension: c.dimension,
              operator: c.operator,
              value: c.value,
              logicOp: c.logic,
            })),
        })),
    };

    try {
      let res: Response;
      if (editingTagId) {
        res = await fetch(`${apiBase}/${editingTagId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(apiBase, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setDialogOpen(false);
        resetForm();
        await fetchTags();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save AiTag");
      }
    } catch (err) {
      console.error("Failed to save AiTag:", err);
      alert("Failed to save AiTag");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Delete ---------- */
  const deleteTag = async (id: string) => {
    if (!apiBase) return;
    try {
      const res = await fetch(`${apiBase}/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTags((prev) => prev.filter((t) => t.id !== id));
        setEvalResults((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    } catch (err) {
      console.error("Failed to delete AiTag:", err);
    }
  };

  /* ---------- Duplicate ---------- */
  const duplicateTag = async (tag: ApiAiTag) => {
    if (!apiBase) return;
    const payload = {
      name: `${tag.name} (Copy)`,
      description: tag.description,
      tagType: tag.tagType,
      defaultValue: tag.defaultValue,
      rules: tag.rules.map((r) => ({
        valueName: r.valueName,
        priority: r.priority,
        conditions: r.conditions.map((c) => ({
          dimension: c.dimension,
          operator: c.operator,
          value: c.value,
          logicOp: c.logicOp,
        })),
      })),
    };

    try {
      const res = await fetch(apiBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await fetchTags();
      }
    } catch (err) {
      console.error("Failed to duplicate AiTag:", err);
    }
  };

  /* ---------- Evaluate ---------- */
  const evaluateTag = async (tagId: string) => {
    if (!apiBase) return;
    setEvaluatingId(tagId);
    try {
      const res = await fetch(`${apiBase}/${tagId}/evaluate`, {
        method: "POST",
      });
      if (res.ok) {
        const data: EvalResponse = await res.json();
        setEvalResults((prev) => ({ ...prev, [tagId]: data }));
        // Expand to show results
        setExpandedTag(tagId);
      }
    } catch (err) {
      console.error("Failed to evaluate AiTag:", err);
    } finally {
      setEvaluatingId(null);
    }
  };

  /* ---------- Validation ---------- */
  const canProceedStep1 = tagName.trim() !== "" && tagType === "custom";
  const canProceedStep2 =
    rules.length > 0 &&
    rules.some((r) => r.valueName.trim() !== "") &&
    defaultValue.trim() !== "";

  const totalValues = rules.filter((r) => r.valueName.trim()).length + 1; // +1 for default

  return (
    <ModuleGate module="finops">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-display font-bold text-white">
                AiTags
              </h1>
              <p className="text-slate-500 mt-1">
                Create custom cost dimensions to unify tagging across clouds
              </p>
            </div>
            <PageHelp
              title="About AiTags"
              description="AiTags let you create virtual cost dimensions that unify tagging across AWS, GCP, and Azure without modifying actual cloud resources. Define rules to automatically categorize costs by team, environment, or application."
              steps={[
                "Create a new AiTag with a name and description.",
                "Add rules with conditions that match cost records (e.g., service contains 'EC2').",
                "Each rule assigns a value when its conditions match.",
                "Use the 'Evaluate' button to preview how the tag applies to your data.",
                "AiTags appear as dimensions in cost reports and dashboards.",
              ]}
            />
          </div>
          <Button onClick={() => openDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Create AiTag
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-4" />
            <p className="text-sm text-slate-400">Loading AiTags...</p>
          </div>
        ) : tags.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-white/5 flex items-center justify-center mb-6">
              <Tags className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="font-display font-semibold text-lg text-white mb-2">
              No AiTags configured yet
            </h3>
            <p className="text-sm text-slate-400 max-w-md mb-6">
              Create your first AiTag to start organizing costs by custom
              dimensions like team, environment, or application.
            </p>
            <Button variant="outline" onClick={() => openDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Create AiTag
            </Button>
          </div>
        ) : (
          /* Tag cards list */
          <div className="space-y-4">
            {tags.map((tag) => {
              const isExpanded = expandedTag === tag.id;
              const evalData = evalResults[tag.id];
              return (
                <Card
                  key={tag.id}
                  className="border-white/5 bg-navy-900/40 overflow-hidden"
                >
                  <CardContent className="p-0">
                    {/* Summary row */}
                    <div className="flex items-center gap-4 p-5">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
                        <Tags className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display font-semibold text-white text-base truncate">
                            {tag.name}
                          </h3>
                          <Badge
                            variant="outline"
                            className="text-[10px] shrink-0"
                          >
                            {tag.tagType === "custom" ? "Custom" : "AI-Powered"}
                          </Badge>
                          {!tag.isActive && (
                            <Badge
                              variant="outline"
                              className="text-[10px] shrink-0 text-amber-400 border-amber-500/20"
                            >
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate">
                          {tag.description}
                        </p>
                      </div>
                      <div className="hidden sm:flex items-center gap-6 shrink-0 text-center">
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {tag.rules.length}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Rules
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {tag.rules.length + 1}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Values
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {formatDate(tag.updatedAt)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-emerald-400"
                          title="Evaluate"
                          disabled={evaluatingId === tag.id}
                          onClick={() => evaluateTag(tag.id)}
                        >
                          {evaluatingId === tag.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Play className="w-3.5 h-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-cyan-400"
                          title="Edit"
                          onClick={() => openDialog(tag)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-cyan-400"
                          title="Duplicate"
                          onClick={() => duplicateTag(tag)}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-rose-400"
                          title="Delete"
                          onClick={() => deleteTag(tag.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400"
                          onClick={() =>
                            setExpandedTag(isExpanded ? null : tag.id)
                          }
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Expanded detail */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <Separator />
                          <div className="p-5 space-y-4">
                            {/* Evaluation results */}
                            {evalData && (
                              <div className="space-y-3">
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                                  Evaluation Results ({evalData.totalRecords} records, {formatCurrency(evalData.totalCost)} total)
                                </p>
                                <div className="space-y-2">
                                  {evalData.results.map((result, idx) => (
                                    <div
                                      key={result.valueName}
                                      className="space-y-1"
                                    >
                                      <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                          <div
                                            className="w-2.5 h-2.5 rounded-full"
                                            style={{ backgroundColor: EVAL_COLORS[idx % EVAL_COLORS.length] }}
                                          />
                                          <span className="text-white font-medium">
                                            {result.valueName}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <span className="text-slate-400">
                                            {result.recordCount} resources
                                          </span>
                                          <span className="text-cyan-400 font-medium">
                                            {formatCurrency(result.totalCost)}
                                          </span>
                                          <span className="text-slate-500 w-12 text-right">
                                            {result.percentage}%
                                          </span>
                                        </div>
                                      </div>
                                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                          className="h-full rounded-full transition-all duration-500"
                                          style={{
                                            width: `${Math.max(result.percentage, 1)}%`,
                                            backgroundColor: EVAL_COLORS[idx % EVAL_COLORS.length],
                                          }}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <Separator />
                              </div>
                            )}

                            {/* Rule values */}
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                              Rule Values (priority order)
                            </p>
                            <div className="space-y-2">
                              {tag.rules.map((rule, idx) => (
                                <div
                                  key={rule.id}
                                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5"
                                >
                                  <span className="text-[10px] font-bold text-slate-500 w-5 text-center">
                                    {idx + 1}
                                  </span>
                                  <GripVertical className="w-3.5 h-3.5 text-slate-600" />
                                  <span className="text-sm text-white font-medium flex-1">
                                    {rule.valueName}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className="text-[10px]"
                                  >
                                    {rule.conditions.length} condition
                                    {rule.conditions.length !== 1 ? "s" : ""}
                                  </Badge>
                                </div>
                              ))}
                              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02] border border-dashed border-white/10">
                                <span className="text-[10px] font-bold text-slate-600 w-5 text-center">
                                  *
                                </span>
                                <Filter className="w-3.5 h-3.5 text-slate-600" />
                                <span className="text-sm text-slate-400 italic flex-1">
                                  {tag.defaultValue}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-[10px] text-slate-500"
                                >
                                  default
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/*  Create / Edit AiTag Dialog                                      */}
        {/* ---------------------------------------------------------------- */}
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTagId ? "Edit AiTag" : "Create AiTag"}
              </DialogTitle>
              <DialogDescription>
                Define a rule-based tag that unifies cost dimensions across all
                cloud providers.
              </DialogDescription>
            </DialogHeader>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-2">
              {[
                { n: 1, label: "Define Tag" },
                { n: 2, label: "Rules" },
                { n: 3, label: "Preview" },
              ].map(({ n, label }) => (
                <div key={n} className="flex items-center gap-2">
                  <div
                    className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-colors ${
                      step === n
                        ? "bg-cyan-500 text-navy-950"
                        : step > n
                          ? "bg-cyan-500/20 text-cyan-400"
                          : "bg-white/5 text-slate-500"
                    }`}
                  >
                    {step > n ? <CheckCircle2 className="w-4 h-4" /> : n}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      step === n ? "text-white" : "text-slate-500"
                    }`}
                  >
                    {label}
                  </span>
                  {n < 3 && (
                    <div
                      className={`w-8 h-px ${
                        step > n ? "bg-cyan-500/40" : "bg-white/5"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <Separator />

            {/* Step content */}
            <div className="relative min-h-[360px]">
              <AnimatePresence mode="wait" custom={direction}>
                {/* ---- Step 1: Define Tag ---- */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="space-y-5"
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-1">
                        Define Your AiTag
                      </h3>
                      <p className="text-xs text-slate-500">
                        Choose a name and type for your custom cost dimension.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="tag-name">Tag Name</Label>
                        <Input
                          id="tag-name"
                          placeholder='e.g., "Team", "Environment", "Application", "Cost Center"'
                          value={tagName}
                          onChange={(e) => setTagName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tag-desc">Description</Label>
                        <Input
                          id="tag-desc"
                          placeholder="Describe what this AiTag represents"
                          value={tagDescription}
                          onChange={(e) => setTagDescription(e.target.value)}
                        />
                      </div>

                      <Separator />

                      <div>
                        <Label className="mb-3 block">Tag Type</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setTagType("custom")}
                            className={`text-left p-4 rounded-xl border transition-all ${
                              tagType === "custom"
                                ? "border-cyan-500/40 bg-cyan-500/5"
                                : "border-white/5 bg-navy-900/50 hover:border-white/10"
                            }`}
                          >
                            <Layers
                              className={`w-5 h-5 mb-2 ${
                                tagType === "custom"
                                  ? "text-cyan-400"
                                  : "text-slate-500"
                              }`}
                            />
                            <p className="text-sm font-semibold text-white">
                              Custom Rules
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              Define conditions to match and categorize resources
                            </p>
                          </button>
                          <button
                            onClick={() => {}}
                            className="text-left p-4 rounded-xl border border-white/5 bg-navy-900/50 opacity-60 cursor-not-allowed relative"
                          >
                            <Sparkles className="w-5 h-5 mb-2 text-slate-500" />
                            <p className="text-sm font-semibold text-white">
                              AI-Powered
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              AI analyzes patterns to auto-categorize resources
                            </p>
                            <Badge className="absolute top-3 right-3 text-[9px] bg-amber-500/10 text-amber-400 border-amber-500/20">
                              Coming Soon
                            </Badge>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ---- Step 2: Define Rules ---- */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="space-y-5"
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-1">
                        Define Rules
                      </h3>
                      <p className="text-xs text-slate-500">
                        Rules work like a funnel -- each rule filters resources
                        and assigns them a value. Higher rules take priority.
                      </p>
                    </div>

                    {/* Rules list */}
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                      {rules.map((rule, ruleIdx) => (
                        <div
                          key={rule.id}
                          className="rounded-xl border border-white/5 bg-navy-900/30 p-4 space-y-3"
                        >
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-bold shrink-0">
                              {ruleIdx + 1}
                            </span>
                            <Input
                              placeholder='Value name (e.g., "Platform Engineering")'
                              value={rule.valueName}
                              onChange={(e) =>
                                updateRuleValue(rule.id, e.target.value)
                              }
                              className="flex-1 h-9 text-sm font-medium"
                            />
                            {rules.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:text-rose-400 shrink-0"
                                onClick={() => removeRule(rule.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>

                          {/* Conditions */}
                          <div className="space-y-2 ml-8">
                            {rule.conditions.map((cond, condIdx) => (
                              <div
                                key={cond.id}
                                className="flex items-center gap-2 flex-wrap"
                              >
                                {condIdx > 0 && (
                                  <Select
                                    value={cond.logic}
                                    onValueChange={(v) =>
                                      updateCondition(
                                        rule.id,
                                        cond.id,
                                        "logic",
                                        v
                                      )
                                    }
                                  >
                                    <SelectTrigger className="w-[70px] h-8 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="AND">AND</SelectItem>
                                      <SelectItem value="OR">OR</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                                <Select
                                  value={cond.dimension}
                                  onValueChange={(v) =>
                                    updateCondition(
                                      rule.id,
                                      cond.id,
                                      "dimension",
                                      v
                                    )
                                  }
                                >
                                  <SelectTrigger className="w-[130px] h-8 text-xs">
                                    <SelectValue placeholder="Dimension" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {DIMENSION_OPTIONS.map((d) => (
                                      <SelectItem key={d.value} value={d.value}>
                                        {d.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Select
                                  value={cond.operator}
                                  onValueChange={(v) =>
                                    updateCondition(
                                      rule.id,
                                      cond.id,
                                      "operator",
                                      v
                                    )
                                  }
                                >
                                  <SelectTrigger className="w-[120px] h-8 text-xs">
                                    <SelectValue placeholder="Operator" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {OPERATOR_OPTIONS.map((o) => (
                                      <SelectItem key={o.value} value={o.value}>
                                        {o.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Input
                                  placeholder="Value"
                                  value={cond.value}
                                  onChange={(e) =>
                                    updateCondition(
                                      rule.id,
                                      cond.id,
                                      "value",
                                      e.target.value
                                    )
                                  }
                                  className="flex-1 min-w-[120px] h-8 text-xs"
                                />
                                {rule.conditions.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-500 hover:text-rose-400 shrink-0"
                                    onClick={() =>
                                      removeCondition(rule.id, cond.id)
                                    }
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-cyan-400 hover:text-cyan-300 h-7 px-2"
                              onClick={() => addCondition(rule.id)}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Condition
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addRule}
                      className="text-xs"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      Add Rule
                    </Button>

                    <Separator />

                    {/* Default value */}
                    <div className="space-y-2">
                      <Label className="text-xs">
                        Default Value{" "}
                        <span className="text-slate-500">
                          (unmatched resources)
                        </span>
                      </Label>
                      <Input
                        placeholder='e.g., "Unallocated"'
                        value={defaultValue}
                        onChange={(e) => setDefaultValue(e.target.value)}
                        className="max-w-xs h-9 text-sm"
                      />
                    </div>
                  </motion.div>
                )}

                {/* ---- Step 3: Preview & Save ---- */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="space-y-5"
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-1">
                        Preview &amp; Save
                      </h3>
                      <p className="text-xs text-slate-500">
                        Review your AiTag configuration before saving.
                      </p>
                    </div>

                    {/* Tag summary */}
                    <Card>
                      <CardContent className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">
                            Tag Name
                          </span>
                          <span className="text-sm font-medium text-white">
                            {tagName}
                          </span>
                        </div>
                        {tagDescription && (
                          <>
                            <Separator />
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500">
                                Description
                              </span>
                              <span className="text-sm text-slate-300 max-w-[60%] text-right">
                                {tagDescription}
                              </span>
                            </div>
                          </>
                        )}
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">Type</span>
                          <Badge variant="secondary">Custom Rules</Badge>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">
                            Total Values
                          </span>
                          <span className="text-sm font-medium text-white">
                            {totalValues}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">
                            Default Value
                          </span>
                          <span className="text-sm text-slate-400 italic">
                            {defaultValue}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Rules summary */}
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-3">
                        Rules
                      </p>
                      <div className="space-y-2">
                        {rules
                          .filter((r) => r.valueName.trim())
                          .map((rule, idx) => {
                            const validConditions = rule.conditions.filter(
                              (c) => c.dimension && c.operator && c.value
                            );
                            return (
                              <div
                                key={rule.id}
                                className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-white/[0.02] border border-white/5"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-slate-500">
                                    {idx + 1}
                                  </span>
                                  <span className="text-sm text-white font-medium">
                                    {rule.valueName}
                                  </span>
                                </div>
                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  {validConditions.length} condition
                                  {validConditions.length !== 1 ? "s" : ""}
                                </Badge>
                              </div>
                            );
                          })}
                        <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-white/[0.02] border border-dashed border-white/10">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-600">
                              *
                            </span>
                            <span className="text-sm text-slate-400 italic">
                              {defaultValue}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-[10px] text-slate-500"
                          >
                            default
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Separator />

            {/* Footer navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={goBack}
                disabled={step === 1}
                className="text-slate-400"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back
              </Button>
              {step < 3 ? (
                <Button
                  size="sm"
                  onClick={goNext}
                  disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              ) : (
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  )}
                  {editingTagId ? "Update AiTag" : "Save AiTag"}
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ModuleGate>
  );
}
