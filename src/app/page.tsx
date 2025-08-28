"use client";
export const dynamic = "force-dynamic";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import {
  Download, Settings2, SquareGanttChart, Workflow, Gauge, Copy,
  ListFilter, GitCompare, Eye, ShieldCheck, AlertTriangle,
  Wand2, CheckCircle2, XCircle, Rocket,
} from "lucide-react";

/* -------------------- FULL DATA & TYPES -------------------- */
const DEFAULT_WEIGHTS = {
  fit: 0.15,
  clarity: 0.10,
  originality: 0.15,
  feasibility: 0.10,
  safety: 0.10,
  factuality: 0.10,
  ux: 0.10,
  brand: 0.10,
  inclusion: 0.10,
};
type MetricKey = keyof typeof DEFAULT_WEIGHTS;

const RUBRIC_LABEL: Record<MetricKey, string> = {
  fit: "Fit-to-Brief",
  clarity: "Clarity & Structure",
  originality: "Originality",
  feasibility: "Feasibility",
  safety: "Safety & Policy",
  factuality: "Factuality",
  ux: "UX Heuristics",
  brand: "Brand Tone Match",
  inclusion: "Inclusion & Accessibility",
};

type Trial = {
  id: string;
  model: string;
  agent: string;
  cost: number;
  latencyMs: number;
  risks: string[];
  auto: { readability: number; brandKeywords: number; inclusion: number };
  human: Record<MetricKey, number>;
  prompt: string;
  baselineDiff: string;
  artifacts: { type: "copy" | "image"; label: string; content: string }[];
};

const SAMPLE_RUN = {
  id: "run_001",
  title: "Email Hero Concepts — Fall Promo",
  intent:
    "Generate 3 hero concepts for the Fall campaign with strong brand tone and accessible CTAs.",
  budgetUSD: 500,
  trials: [
    {
      id: "t1",
      model: "GPT-4.1",
      agent: "Copy",
      cost: 2.31,
      latencyMs: 1830,
      risks: ["minor_tone_off"],
      auto: { readability: 63, brandKeywords: 0.78, inclusion: 0.8 },
      human: {
        fit: 4, clarity: 4, originality: 3, feasibility: 5, safety: 5,
        factuality: 4, ux: 4, brand: 4, inclusion: 4,
      },
      prompt: "Write 3 hero options with CTA variants for Fall promo…",
      baselineDiff: "+ tightened CTA, added accessibility note",
      artifacts: [
        { type: "copy", label: "Option A", content: "Fall starts here. New textures. Warmer layers. Shop now →" },
        { type: "copy", label: "Option B", content: "Hello, sweater weather. Cozy meets clean design. Explore →" },
        { type: "copy", label: "Option C", content: "Turn down the heat, turn up the style. See the edit →" },
      ],
    },
    {
      id: "t2",
      model: "Claude 3.7",
      agent: "Copy",
      cost: 2.02,
      latencyMs: 2100,
      risks: [],
      auto: { readability: 71, brandKeywords: 0.81, inclusion: 0.86 },
      human: {
        fit: 5, clarity: 5, originality: 4, feasibility: 5, safety: 5,
        factuality: 5, ux: 4, brand: 5, inclusion: 5,
      },
      prompt:
        "Emphasize sustainable materials & inclusive tone; 3 hero options with variant CTAs…",
      baselineDiff: "+ added inclusive language, restrained adjectives",
      artifacts: [
        { type: "copy", label: "Option A", content: "Made for many. Softer knits, lighter impact. Shop the Fall drop →" },
        { type: "copy", label: "Option B", content: "Layers for real life. Easy care, easy wear. Discover now →" },
        { type: "copy", label: "Option C", content: "Style that shows up—for everyone. Browse the collection →" },
      ],
    },
    {
      id: "t3",
      model: "Gemini 2.0",
      agent: "Copy",
      cost: 1.74,
      latencyMs: 1570,
      risks: ["hallucination_low"],
      auto: { readability: 58, brandKeywords: 0.69, inclusion: 0.72 },
      human: {
        fit: 3, clarity: 3, originality: 5, feasibility: 4, safety: 4,
        factuality: 3, ux: 3, brand: 3, inclusion: 3,
      },
      prompt:
        "Punchy, high-contrast, minimal words, bold CTA. No sustainability claims.",
      baselineDiff: "– removed sustainability claim (no source)",
      artifacts: [
        { type: "copy", label: "Option A", content: "Fall. Done. Shop →" },
        { type: "copy", label: "Option B", content: "Layer up. Check out →" },
        { type: "copy", label: "Option C", content: "Warm looks. Cold days. Go →" },
      ],
    },
  ] as Trial[],
};

/* -------------------- HELPERS -------------------- */
function computeAIPI(
  weights: Record<MetricKey, number>,
  human: Record<MetricKey, number>
) {
  let total = 0;
  (Object.keys(weights) as MetricKey[]).forEach((k) => {
    total += weights[k] * ((human[k] ?? 0) / 5);
  });
  return +(total * 100).toFixed(1);
}

function riskBadge(key: string) {
  if (key === "minor_tone_off")
    return (
      <Badge
        key={key}
        variant="secondary"
        className="bg-amber-100 text-amber-900 border border-amber-200"
      >
        <AlertTriangle className="mr-1 h-3 w-3" /> Tone
      </Badge>
    );
  if (key === "hallucination_low")
    return (
      <Badge
        key={key}
        variant="secondary"
        className="bg-rose-100 text-rose-900 border border-rose-200"
      >
        <AlertTriangle className="mr-1 h-3 w-3" /> Facts
      </Badge>
    );
  return <Badge key={key}>Risk</Badge>;
}

/* -------------------- SORT TYPES -------------------- */
const SORT_OPTIONS = ["aipi", "cost", "latency"] as const;
type SortKey = (typeof SORT_OPTIONS)[number];
function isSortKey(v: string): v is SortKey {
  return (SORT_OPTIONS as readonly string[]).includes(v);
}

/* -------------------- PAGE -------------------- */
export default function App() {
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [sortKey, setSortKey] = useState<SortKey>("aipi");
  const [selectedTrialId, setSelectedTrialId] = useState<string | null>(
    SAMPLE_RUN.trials[0].id
  );
  const [compare, setCompare] = useState<string[]>([]);

  const trials = useMemo(() => {
    return SAMPLE_RUN.trials
      .map((t) => ({ ...t, aipi: computeAIPI(weights, t.human) }))
      .sort((a, b) =>
        sortKey === "aipi"
          ? b.aipi - a.aipi
          : sortKey === "cost"
          ? a.cost - b.cost
          : a.latencyMs - b.latencyMs
      );
  }, [weights, sortKey]);

  const selectedTrial = trials.find((t) => t.id === selectedTrialId) || trials[0];

  function toggleCompare(id: string) {
    setCompare((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id].slice(-3)
    );
  }
function handlePrintReport() {
  const safeTitle = SAMPLE_RUN.title.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const oldTitle = document.title;
  const newTitle = `msaiq-report_${safeTitle}_${new Date()
    .toISOString()
    .slice(0, 10)}`;

  const restore = () => {
    document.title = oldTitle;
    window.removeEventListener("afterprint", restore);
  };

  document.title = newTitle;   // browsers use this for PDF filename
  window.addEventListener("afterprint", restore);
  window.print();
}
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Bar */}
     <div className="sticky top-0 z-40 bg-white border-b print-hidden">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <SquareGanttChart className="h-5 w-5" />
          <div className="font-semibold tracking-tight">msaiq • Console (POC)</div>
          <Badge variant="outline" className="ml-2">Run: {SAMPLE_RUN.title}</Badge>
          <div className="ml-auto flex items-center gap-2">
            <WeightsDialog weights={weights} setWeights={setWeights} />
            <Button variant="outline" size="sm" onClick={handlePrintReport}>
              <Download className="h-4 w-4 mr-1" /> Print Report
            </Button>
            <Button size="sm" className="bg-black text-white">
              <Rocket className="h-4 w-4 mr-1" /> New Run
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
        {/* LEFT: Run Overview */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" /> Run Overview
              </CardTitle>
              <CardDescription>{SAMPLE_RUN.intent}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-3">
                <Select
                  value={sortKey}
                  onValueChange={(v) => {
                    if (isSortKey(v)) setSortKey(v);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aipi">AIPI (desc)</SelectItem>
                    <SelectItem value="cost">Cost (asc)</SelectItem>
                    <SelectItem value="latency">Latency (asc)</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <ListFilter className="h-4 w-4 mr-1" /> Filters
                </Button>
              </div>

              <div className="space-y-2">
                {trials.map((t, idx) => (
                  <div
                    key={t.id}
                    className={`grid grid-cols-12 items-center gap-2 p-2 rounded-xl border ${
                      selectedTrial?.id === t.id ? "bg-neutral-100" : "bg-white"
                    }`}
                  >
                    <div className="col-span-1 text-sm text-neutral-500">
                      #{idx + 1}
                    </div>
                    <div className="col-span-5">
                      <div className="font-medium">
                        {t.model}{" "}
                        <Badge variant="outline" className="ml-2">
                          {t.agent}
                        </Badge>
                      </div>
                      <div className="flex gap-1 mt-1">
                        {t.risks.map((r) => (
                          <span key={r}>{riskBadge(r)}</span>
                        ))}
                      </div>
                    </div>
                    <div className="col-span-2 text-right">
                      <div className="text-xs text-neutral-500">Cost</div>
                      <div className="font-mono">${t.cost.toFixed(2)}</div>
                    </div>
                    <div className="col-span-2 text-right">
                      <div className="text-xs text-neutral-500">Latency</div>
                      <div className="font-mono">{t.latencyMs}ms</div>
                    </div>
                    <div className="col-span-2 text-right">
                      <div className="text-xs text-neutral-500">AIPI</div>
                      <div className="font-semibold">{t.aipi}</div>
                    </div>
                    <div className="col-span-12 flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTrialId(t.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      <Button
                        variant={compare.includes(t.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleCompare(t.id)}
                      >
                        <GitCompare className="h-4 w-4 mr-1" />{" "}
                        {compare.includes(t.id) ? "Selected" : "Compare"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="text-xs text-neutral-500">
              Budget: ${SAMPLE_RUN.budgetUSD}
            </CardFooter>
          </Card>

          {/* Compare Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitCompare className="h-5 w-5" /> Compare
              </CardTitle>
              <CardDescription>
                Select up to 3 trials to compare side-by-side.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {compare.length === 0 && (
                <div className="text-sm text-neutral-500">No trials selected.</div>
              )}
              {compare.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {compare.map((id) => {
                    const t = trials.find((x) => x.id === id)!;
                    return (
                      <Card key={id} className="border-neutral-200">
                        <CardHeader>
                          <CardTitle className="text-base">
                            {t.model}{" "}
                            <Badge variant="outline" className="ml-2">
                              {t.agent}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            AIPI {t.aipi} • ${t.cost.toFixed(2)} • {t.latencyMs}
                            ms
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-xs text-neutral-500 mb-2">
                            Top artifact
                          </div>
                          <div className="p-3 rounded-lg bg-neutral-100 text-sm">
                            {t.artifacts[0].content}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Trial Detail */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" /> Trial Detail
              </CardTitle>
              <CardDescription>
                {selectedTrial.model} • {selectedTrial.agent}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 lg:col-span-6">
                  <div className="text-xs text-neutral-500">Prompt</div>
                  <div className="p-3 rounded-lg bg-neutral-100 text-sm mb-2">
                    {selectedTrial.prompt}
                  </div>
                  <div className="text-xs text-neutral-500">Prompt diff vs baseline</div>
                  <div className="p-3 rounded-lg bg-amber-50 text-sm border border-amber-200">
                    {selectedTrial.baselineDiff}
                  </div>
                </div>
                <div className="col-span-12 lg:col-span-6">
                  <div className="text-xs text-neutral-500 mb-1">Auto-metrics</div>
                  <div className="grid grid-cols-3 gap-2">
                    <MetricChip label="Readability" value={`${selectedTrial.auto.readability}`} />
                    <MetricChip label="Brand KW" value={`${Math.round(selectedTrial.auto.brandKeywords * 100)}%`} />
                    <MetricChip label="Inclusion" value={`${Math.round(selectedTrial.auto.inclusion * 100)}%`} />
                  </div>
                  <div className="mt-3 text-xs text-neutral-500 mb-1">Risks</div>
                  <div className="flex gap-2 flex-wrap">
                    {selectedTrial.risks.length ? (
                      selectedTrial.risks.map((r) => <span key={r}>{riskBadge(r)}</span>)
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-emerald-100 text-emerald-900 border border-emerald-200"
                      >
                        <ShieldCheck className="h-3 w-3 mr-1" /> None
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Artifacts */}
              <div>
                <div className="text-xs text-neutral-500 mb-2">Artifacts</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {selectedTrial.artifacts.map((a, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <CardTitle className="text-sm">{a.label}</CardTitle>
                        <CardDescription>{a.type.toUpperCase()}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="p-3 rounded-lg bg-neutral-100 text-sm leading-relaxed">
                          {a.content}
                        </div>
                      </CardContent>
                      <CardFooter className="justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigator.clipboard.writeText(a.content)}
                        >
                          <Copy className="h-4 w-4 mr-1" /> Copy
                        </Button>
                        <Button size="sm" variant="outline">
                          <Wand2 className="h-4 w-4 mr-1" /> Refine
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator className="my-4" />

              {/* Scorecard + Decision */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 lg:col-span-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Scorecard (Human)</CardTitle>
                      <CardDescription>1–5 per metric</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {(Object.keys(DEFAULT_WEIGHTS) as MetricKey[]).map((k) => (
                        <div
                          key={k}
                          className="flex items-center justify-between gap-3"
                        >
                          <div className="text-sm w-40">{RUBRIC_LABEL[k]}</div>
                          <div className="font-mono">{selectedTrial.human[k]}</div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <Button
                                key={n}
                                size="icon"
                                variant={
                                  selectedTrial.human[k] === n ? "default" : "outline"
                                }
                                className="h-7 w-7"
                              >
                                {n}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                    <CardFooter className="justify-between">
                      <div className="text-sm">Composite AIPI</div>
                      <div className="font-semibold">
                        {computeAIPI(weights, selectedTrial.human)}
                      </div>
                    </CardFooter>
                  </Card>
                </div>
                <div className="col-span-12 lg:col-span-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Decision & Rationale</CardTitle>
                      <CardDescription>Record the outcome of this trial.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Strengths:
                          brand voice, inclusive language, clear CTA.
                        </div>
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-rose-600" /> Weaknesses:
                          originality moderate; try exploratory prompt v2.
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="justify-end gap-2">
                      <Button variant="outline">Save Notes</Button>
                      <Button>Mark as Winner</Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="py-8 text-center text-xs text-neutral-500 print-hidden">
        msaiq POC • Run → Trial → Artifact → Scorecard • v0.2
      </div>
    </div>
  );
}

/* -------------------- SMALL UI HELPERS -------------------- */
function WeightsDialog({
  weights,
  setWeights,
}: {
  weights: Record<MetricKey, number>;
  setWeights: React.Dispatch<React.SetStateAction<Record<MetricKey, number>>>;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="h-4 w-4 mr-1" /> Weights
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Adjust AIPI Weights</DialogTitle>
          <DialogDescription>
            Tune the composite to fit project priorities.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          {(Object.keys(weights) as MetricKey[]).map((k) => (
            <div key={k} className="grid grid-cols-5 items-center gap-3">
              <Label className="col-span-2">{RUBRIC_LABEL[k]}</Label>
              <div className="col-span-3">
                <Slider
                  value={[Math.round(weights[k] * 100)]}
                  onValueChange={(v) =>
                    setWeights((w) => ({ ...w, [k]: v[0] / 100 }))
                  }
                />
              </div>
            </div>
          ))}
          <div className="text-xs text-neutral-500">
            Tip: keep sum ≈ 1.0 (current{" "}
            {Object.values(weights)
              .reduce((a, b) => a + b, 0)
              .toFixed(2)}
            )
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2 rounded-lg bg-neutral-100 border text-xs flex items-center justify-between">
      <span className="text-neutral-600">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}