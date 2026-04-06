"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  BarChart3,
  Percent,
  Activity,
  Tag,
  Globe,
  Server,
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

type AllocationMethod = "telemetry" | "custom";
type MetricSource = "datadog" | "prometheus" | "cloudwatch" | "custom";

interface TeamSplit {
  id: string;
  team: string;
  percentage: number;
}

const CLOUD_SERVICES = [
  "EC2",
  "RDS",
  "EKS",
  "S3",
  "Lambda",
  "CloudFront",
  "ElastiCache",
  "Redshift",
  "DynamoDB",
  "ECS",
];

const METRIC_OPTIONS = [
  { value: "bytes_transferred", label: "Bytes Transferred" },
  { value: "cpu_usage", label: "CPU Usage" },
  { value: "request_count", label: "Request Count" },
  { value: "memory_usage", label: "Memory Usage" },
  { value: "custom", label: "Custom Metric" },
];

const TEAMS = [
  "Engineering",
  "Data Science",
  "Platform",
  "DevOps",
  "Marketing",
  "Sales",
  "Finance",
  "Product",
  "QA",
  "Security",
];

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

export default function AllocationPage() {
  const [activeTab, setActiveTab] = useState<"rules" | "results">("rules");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  // Form state
  const [ruleName, setRuleName] = useState("");
  const [costSource, setCostSource] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [filterAccount, setFilterAccount] = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [allocationMethod, setAllocationMethod] =
    useState<AllocationMethod>("telemetry");
  const [metricSource, setMetricSource] = useState<MetricSource | "">("");
  const [metric, setMetric] = useState("");
  const [teamSplits, setTeamSplits] = useState<TeamSplit[]>([
    { id: generateId(), team: "", percentage: 0 },
    { id: generateId(), team: "", percentage: 0 },
  ]);

  const totalPercentage = teamSplits.reduce((s, t) => s + t.percentage, 0);

  const resetForm = useCallback(() => {
    setStep(1);
    setDirection(1);
    setRuleName("");
    setCostSource("");
    setFilterTag("");
    setFilterAccount("");
    setFilterRegion("");
    setAllocationMethod("telemetry");
    setMetricSource("");
    setMetric("");
    setTeamSplits([
      { id: generateId(), team: "", percentage: 0 },
      { id: generateId(), team: "", percentage: 0 },
    ]);
  }, []);

  const openDialog = () => {
    resetForm();
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

  const addTeamRow = () => {
    setTeamSplits((prev) => [
      ...prev,
      { id: generateId(), team: "", percentage: 0 },
    ]);
  };

  const removeTeamRow = (id: string) => {
    setTeamSplits((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTeamRow = (
    id: string,
    field: "team" | "percentage",
    value: string | number
  ) => {
    setTeamSplits((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const splitEvenly = () => {
    const count = teamSplits.length;
    if (count === 0) return;
    const base = Math.floor(100 / count);
    const remainder = 100 - base * count;
    setTeamSplits((prev) =>
      prev.map((t, i) => ({
        ...t,
        percentage: base + (i < remainder ? 1 : 0),
      }))
    );
  };

  const canProceedStep1 = ruleName.trim() !== "" && costSource !== "";
  const canProceedStep2 =
    allocationMethod === "telemetry"
      ? metricSource !== "" && metric !== ""
      : totalPercentage === 100 &&
        teamSplits.every((t) => t.team !== "" && t.percentage > 0);

  return (
    <ModuleGate module="finops">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">
              Shared Cost Allocation
            </h1>
            <p className="text-slate-500 mt-1">
              Allocate shared cloud costs across teams, projects, and departments
            </p>
          </div>
          <PageHelp
            title="About Cost Allocation"
            description="Shared Cost Allocation lets you split shared cloud costs (like Kubernetes clusters, databases, networking) across teams using telemetry data or custom percentage rules."
            steps={[
              "Create an allocation rule by selecting a shared cloud service.",
              "Choose telemetry-based or custom percentage allocation method.",
              "For telemetry, pick a metric source and metric to split proportionally.",
              "For custom, assign a percentage to each team (must total 100%).",
              "Review and save the rule to start allocating costs.",
            ]}
          />
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 p-1 bg-navy-900/50 border border-white/5 rounded-lg w-fit">
          {(["rules", "results"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab
                  ? "text-white"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="allocation-tab"
                  className="absolute inset-0 bg-cyan-500/10 border border-cyan-500/20 rounded-md"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">
                {tab === "rules" ? "Allocation Rules" : "Allocation Results"}
              </span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "rules" && (
          <div className="space-y-4">
            {/* Action bar */}
            <div className="flex items-center justify-end">
              <Button onClick={openDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Create Allocation Rule
              </Button>
            </div>

            {/* Empty state */}
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-white/5 flex items-center justify-center mb-6">
                <PieChart className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="font-display font-semibold text-lg text-white mb-2">
                No allocation rules configured yet
              </h3>
              <p className="text-sm text-slate-400 max-w-md mb-6">
                Create your first rule to start splitting shared costs across
                your organization.
              </p>
              <Button variant="outline" onClick={openDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Create Allocation Rule
              </Button>
            </div>
          </div>
        )}

        {activeTab === "results" && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-white/5 flex items-center justify-center mb-6">
              <BarChart3 className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="font-display font-semibold text-lg text-white mb-2">
              No allocation results yet
            </h3>
            <p className="text-sm text-slate-400 max-w-md">
              Configure allocation rules to see cost distribution results.
            </p>
          </div>
        )}

        {/* Create Rule Dialog */}
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Allocation Rule</DialogTitle>
              <DialogDescription>
                Define how shared cloud costs should be split across your
                organization.
              </DialogDescription>
            </DialogHeader>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-colors ${
                      step === s
                        ? "bg-cyan-500 text-navy-950"
                        : step > s
                          ? "bg-cyan-500/20 text-cyan-400"
                          : "bg-white/5 text-slate-500"
                    }`}
                  >
                    {step > s ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      s
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      step === s ? "text-white" : "text-slate-500"
                    }`}
                  >
                    {s === 1
                      ? "Cost Source"
                      : s === 2
                        ? "Method"
                        : "Review"}
                  </span>
                  {s < 3 && (
                    <div
                      className={`w-8 h-px ${
                        step > s ? "bg-cyan-500/40" : "bg-white/5"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <Separator />

            {/* Step content with animation */}
            <div className="relative min-h-[320px]">
              <AnimatePresence mode="wait" custom={direction}>
                {/* Step 1 */}
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
                        Select Shared Cost Source
                      </h3>
                      <p className="text-xs text-slate-500">
                        Identify the cloud resource whose costs you want to
                        allocate.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="rule-name">Rule Name</Label>
                        <Input
                          id="rule-name"
                          placeholder="e.g., Kubernetes Cluster - Shared"
                          value={ruleName}
                          onChange={(e) => setRuleName(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Cloud Service</Label>
                        <Select
                          value={costSource}
                          onValueChange={setCostSource}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a cloud service" />
                          </SelectTrigger>
                          <SelectContent>
                            {CLOUD_SERVICES.map((svc) => (
                              <SelectItem key={svc} value={svc}>
                                {svc}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator />

                      <div>
                        <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5" />
                          Optional Filters
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs">Tags</Label>
                            <Input
                              placeholder="e.g., env:prod"
                              value={filterTag}
                              onChange={(e) => setFilterTag(e.target.value)}
                              className="h-9 text-xs"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs flex items-center gap-1">
                              <Globe className="w-3 h-3" /> Region
                            </Label>
                            <Input
                              placeholder="e.g., us-east-1"
                              value={filterRegion}
                              onChange={(e) => setFilterRegion(e.target.value)}
                              className="h-9 text-xs"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs flex items-center gap-1">
                              <Server className="w-3 h-3" /> Account
                            </Label>
                            <Input
                              placeholder="e.g., 123456789"
                              value={filterAccount}
                              onChange={(e) => setFilterAccount(e.target.value)}
                              className="h-9 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2 */}
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
                        Choose Allocation Method
                      </h3>
                      <p className="text-xs text-slate-500">
                        Decide how costs should be distributed.
                      </p>
                    </div>

                    {/* Method selection cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setAllocationMethod("telemetry")}
                        className={`text-left p-4 rounded-xl border transition-all ${
                          allocationMethod === "telemetry"
                            ? "border-cyan-500/40 bg-cyan-500/5"
                            : "border-white/5 bg-navy-900/50 hover:border-white/10"
                        }`}
                      >
                        <Activity
                          className={`w-5 h-5 mb-2 ${
                            allocationMethod === "telemetry"
                              ? "text-cyan-400"
                              : "text-slate-500"
                          }`}
                        />
                        <p className="text-sm font-semibold text-white">
                          Telemetry-Based
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Split costs based on actual usage metrics
                        </p>
                      </button>
                      <button
                        onClick={() => setAllocationMethod("custom")}
                        className={`text-left p-4 rounded-xl border transition-all ${
                          allocationMethod === "custom"
                            ? "border-cyan-500/40 bg-cyan-500/5"
                            : "border-white/5 bg-navy-900/50 hover:border-white/10"
                        }`}
                      >
                        <Percent
                          className={`w-5 h-5 mb-2 ${
                            allocationMethod === "custom"
                              ? "text-cyan-400"
                              : "text-slate-500"
                          }`}
                        />
                        <p className="text-sm font-semibold text-white">
                          Custom Percentage
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Manually assign percentages to each team
                        </p>
                      </button>
                    </div>

                    <Separator />

                    {/* Telemetry config */}
                    {allocationMethod === "telemetry" && (
                      <div className="space-y-4">
                        <p className="text-xs text-slate-400">
                          Costs are distributed proportionally based on each
                          team&apos;s share of the selected metric.
                        </p>
                        <div className="space-y-2">
                          <Label>Metric Source</Label>
                          <Select
                            value={metricSource}
                            onValueChange={(v) =>
                              setMetricSource(v as MetricSource)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a metric source" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="datadog">Datadog</SelectItem>
                              <SelectItem value="prometheus">
                                Prometheus
                              </SelectItem>
                              <SelectItem value="cloudwatch">
                                CloudWatch
                              </SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Metric</Label>
                          <Select value={metric} onValueChange={setMetric}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a metric" />
                            </SelectTrigger>
                            <SelectContent>
                              {METRIC_OPTIONS.map((m) => (
                                <SelectItem key={m.value} value={m.value}>
                                  {m.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* Custom percentage config */}
                    {allocationMethod === "custom" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-slate-400">
                            Assign a percentage to each team. Total must equal
                            100%.
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={splitEvenly}
                            className="text-xs text-cyan-400 hover:text-cyan-300"
                          >
                            Split evenly
                          </Button>
                        </div>

                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                          {teamSplits.map((row) => (
                            <div
                              key={row.id}
                              className="flex items-center gap-2"
                            >
                              <Select
                                value={row.team}
                                onValueChange={(v) =>
                                  updateTeamRow(row.id, "team", v)
                                }
                              >
                                <SelectTrigger className="flex-1 h-9 text-xs">
                                  <SelectValue placeholder="Select team" />
                                </SelectTrigger>
                                <SelectContent>
                                  {TEAMS.map((t) => (
                                    <SelectItem key={t} value={t}>
                                      {t}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="relative w-24">
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={row.percentage || ""}
                                  onChange={(e) =>
                                    updateTeamRow(
                                      row.id,
                                      "percentage",
                                      Math.min(
                                        100,
                                        Math.max(
                                          0,
                                          Number(e.target.value) || 0
                                        )
                                      )
                                    )
                                  }
                                  className="h-9 text-xs pr-7"
                                  placeholder="0"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                                  %
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 shrink-0 text-slate-500 hover:text-rose-400"
                                onClick={() => removeTeamRow(row.id)}
                                disabled={teamSplits.length <= 1}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addTeamRow}
                          className="text-xs"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1.5" />
                          Add team
                        </Button>

                        {/* Running total */}
                        <div
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${
                            totalPercentage === 100
                              ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                              : totalPercentage > 100
                                ? "border-rose-500/20 bg-rose-500/5 text-rose-400"
                                : "border-white/5 bg-navy-900/50 text-slate-400"
                          }`}
                        >
                          {totalPercentage === 100 && (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          <span>Total: {totalPercentage}%</span>
                          {totalPercentage !== 100 && (
                            <span className="text-xs ml-auto text-slate-500">
                              {totalPercentage < 100
                                ? `${100 - totalPercentage}% remaining`
                                : `${totalPercentage - 100}% over`}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 3 — Review */}
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
                        Review &amp; Save
                      </h3>
                      <p className="text-xs text-slate-500">
                        Confirm the allocation rule details before saving.
                      </p>
                    </div>

                    <Card>
                      <CardContent className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">
                            Rule Name
                          </span>
                          <span className="text-sm font-medium text-white">
                            {ruleName}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">
                            Cloud Service
                          </span>
                          <Badge>{costSource}</Badge>
                        </div>
                        {(filterTag || filterRegion || filterAccount) && (
                          <>
                            <Separator />
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500">
                                Filters
                              </span>
                              <div className="flex gap-1.5 flex-wrap justify-end">
                                {filterTag && (
                                  <Badge variant="outline">{filterTag}</Badge>
                                )}
                                {filterRegion && (
                                  <Badge variant="outline">
                                    {filterRegion}
                                  </Badge>
                                )}
                                {filterAccount && (
                                  <Badge variant="outline">
                                    {filterAccount}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">
                            Allocation Method
                          </span>
                          <Badge variant="secondary">
                            {allocationMethod === "telemetry"
                              ? "Telemetry-Based"
                              : "Custom Percentage"}
                          </Badge>
                        </div>

                        {allocationMethod === "telemetry" && (
                          <>
                            <Separator />
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500">
                                Metric Source
                              </span>
                              <span className="text-sm text-white capitalize">
                                {metricSource}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-500">
                                Metric
                              </span>
                              <span className="text-sm text-white">
                                {METRIC_OPTIONS.find(
                                  (m) => m.value === metric
                                )?.label ?? metric}
                              </span>
                            </div>
                          </>
                        )}

                        {allocationMethod === "custom" && (
                          <>
                            <Separator />
                            <div className="space-y-2">
                              <span className="text-xs text-slate-500">
                                Team Splits
                              </span>
                              {teamSplits.map((row) => (
                                <div
                                  key={row.id}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <span className="text-slate-300">
                                    {row.team}
                                  </span>
                                  <span className="font-medium text-white">
                                    {row.percentage}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
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
                <Button
                  size="sm"
                  onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}
                >
                  Save Rule
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ModuleGate>
  );
}
