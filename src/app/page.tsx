"use client";
export const dynamic = "force-dynamic";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
  Download,
  Filter,
  Plus,
  Settings2,
  AlertTriangle,
  Copy,
  Eye,
  GitCompare,
  ChevronRight,
} from "lucide-react";

type Trial = {
  id: number;
  model: string;
  kind: "Copy" | "Design" | "Code";
  risk?: "Tone" | "Facts";
  aipi: number;          // msaiq impact index (fake)
  cost: number;          // $
  latency: number;       // ms
  prompt: string;
  artifacts: { label: string; content: string }[];
  metrics: { label: string; value: number }[]; // auto-metrics
};

const TRIALS: Trial[] = [
  {
    id: 1,
    model: "Claude 3.7",
    kind: "Copy",
    aipi: 95,
    cost: 2.02,
    latency: 2100,
    prompt: "Write 3 hero options with CTA variants for Fall promo…",
    artifacts: [
      { label: "Option A", content: "Fall starts here. New textures. Warmer layers. Shop now →" },
      { label: "Option B", content: "Layer up for the season. Cozy meets clean design. Explore →" },
      { label: "Option C", content: "Turn down the heat, turn up the style. See the edit →" },
    ],
    metrics: [
      { label: "Readability", value: 63 },
      { label: "Brand KW", value: 78 },
      { label: "Inclusion", value: 80 },
    ],
  },
  {
    id: 2,
    model: "GPT-4.1",
    kind: "Copy",
    risk: "Tone",
    aipi: 81,
    cost: 2.31,
    latency: 1830,
    prompt: "Write 3 hero options with CTA variants for Fall promo…",
    artifacts: [
      { label: "Option A", content: "Fall starts here. New textures. Warmer layers. Shop now →" },
      { label: "Option B", content: "Hello, sweater weather. Explore cozy fits →" },
      { label: "Option C", content: "Turn down the heat, turn up the style. See the edit →" },
    ],
    metrics: [
      { label: "Readability", value: 61 },
      { label: "Brand KW", value: 74 },
      { label: "Inclusion", value: 78 },
    ],
  },
  {
    id: 3,
    model: "Gemini 2.0",
    kind: "Copy",
    risk: "Facts",
    aipi: 70,
    cost: 1.74,
    latency: 1570,
    prompt: "Write 3 hero options with CTA variants for Fall promo…",
    artifacts: [
      { label: "Option A", content: "Bring on the breeze. Lighter knits that move →" },
      { label: "Option B", content: "Color that carries. Rich hues, easy layers →" },
      { label: "Option C", content: "Made to repeat. Washable, wearable, wonderful →" },
    ],
    metrics: [
      { label: "Readability", value: 58 },
      { label: "Brand KW", value: 69 },
      { label: "Inclusion", value: 74 },
    ],
  },
];

const HUMAN_METRICS = [
  "Fit-to-Brief",
  "Clarity & Structure",
  "Originality",
  "Brand Voice",
];

function MetricPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 rounded-md border px-2 py-1 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function RiskBadge({ risk }: { risk?: "Tone" | "Facts" }) {
  if (!risk) return null;
  return (
    <Badge variant="secondary" className="gap-1">
      <AlertTriangle className="h-3.5 w-3.5 text-yellow-600" />
      {risk}
    </Badge>
  );
}

export default function ConsolePage() {
  const [selectedId, setSelectedId] = useState<number>(2);
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");

  const selected = useMemo(
    () => TRIALS.find((t) => t.id === selectedId) ?? TRIALS[0],
    [selectedId]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return TRIALS;
    return TRIALS.filter((t) => t.model.toLowerCase().includes(q));
  }, [search]);

  function toggleCompare(id: number) {
    setCompareIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 3
        ? [...prev, id]
        : prev
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-md bg-black text-white grid place-items-center font-semibold">
              m
            </div>
            <div className="text-sm text-muted-foreground">msaiq • Console (POC)</div>
            <div className="hidden md:block">
              <Select defaultValue="run1">
                <SelectTrigger className="h-8 w-[320px]">
                  <SelectValue placeholder="Select run…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="run1">Run: Email Hero Concepts — Fall Promo</SelectItem>
                  <SelectItem value="run2">Run: Product Card Variants — New In</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Settings2 className="h-4 w-4" />
              Weights
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Download className="h-4 w-4" />
              Export Pack
            </Button>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              New Run
            </Button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[420px_1fr]">
        {/* Left: Run Overview */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <span className="rounded-full border p-1">⟳</span> Run Overview
            </CardTitle>
            <CardDescription>
              Generate 3 hero concepts for the Fall campaign with strong brand tone and accessible CTAs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Select defaultValue="aipi-desc">
                <SelectTrigger className="h-8 w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aipi-desc">AIPI (desc)</SelectItem>
                  <SelectItem value="lat-asc">Latency (asc)</SelectItem>
                  <SelectItem value="cost-asc">Cost (asc)</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              <div className="ml-auto w-40">
                <Input
                  className="h-8"
                  placeholder="Search models…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="h-[420px] rounded-md border">
              <div className="divide-y">
                {filtered.map((t, idx) => (
                  <div
                    key={t.id}
                    className={`grid grid-cols-[40px_1fr_auto] items-center gap-2 px-3 py-3 ${
                      t.id === selectedId ? "bg-muted/60" : "bg-transparent"
                    }`}
                  >
                    <div className="text-sm text-muted-foreground">#{idx + 1}</div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{t.model}</div>
                        <Badge variant="secondary">{t.kind}</Badge>
                        <RiskBadge risk={t.risk} />
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <div>Cost <span className="font-medium">${t.cost.toFixed(2)}</span></div>
                        <div>Latency <span className="font-medium">{t.latency}ms</span></div>
                        <div>AIPI <span className="font-medium">{t.aipi}</span></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => setSelectedId(t.id)}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                      <Button
                        variant={compareIds.includes(t.id) ? "default" : "outline"}
                        size="sm"
                        className="gap-1"
                        onClick={() => toggleCompare(t.id)}
                      >
                        <GitCompare className="h-4 w-4" />
                        Compare
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="rounded-md border p-3">
              <div className="mb-2 text-sm font-medium">Compare</div>
              {compareIds.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Select up to 3 trials to compare side-by-side.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {compareIds.map((id) => {
                    const t = TRIALS.find((x) => x.id === id)!;
                    return <Badge key={id} variant="outline">{t.model}</Badge>;
                  })}
                  <Button size="sm" className="ml-auto gap-1">
                    <GitCompare className="h-4 w-4" />
                    Open Compare
                  </Button>
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground">Budget: $500</div>
          </CardContent>
        </Card>

        {/* Right: Trial Detail + Scoring */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span>Trial Detail</span>
                <div className="text-sm text-muted-foreground">{selected.model} • {selected.kind}</div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-[1fr_280px]">
                <div>
                  <Label className="text-xs text-muted-foreground">Prompt</Label>
                  <div className="mt-1 rounded-md border bg-muted/30 p-3 text-sm">
                    {selected.prompt}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs">
                    <span className="font-medium">+ tightened CTA, added accessibility note</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Auto-metrics</Label>
                  <div className="flex flex-wrap gap-2">
                    {selected.metrics.map((m) => (
                      <MetricPill key={m.label} label={m.label} value={m.value} />
                    ))}
                  </div>
                  <Label className="mt-3 text-xs text-muted-foreground">Risks</Label>
                  <div>{selected.risk ? <RiskBadge risk={selected.risk} /> : <span className="text-sm text-muted-foreground">None</span>}</div>
                </div>
              </div>

              <Separator />

              {/* Artifacts */}
              <div className="grid gap-4 md:grid-cols-3">
                {selected.artifacts.map((a, i) => (
                  <Card key={i} className="border bg-card/60">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{a.label}</CardTitle>
                      <CardDescription className="uppercase text-[10px]">COPY</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border bg-muted/30 p-3 text-sm leading-relaxed">
                        {a.content}
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => navigator.clipboard?.writeText(a.content)}
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1">
                        <ChevronRight className="h-4 w-4" />
                        Refine
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Scorecard & Decision */}
          <div className="grid gap-6 md:grid-cols-[1fr_320px]">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Scorecard (Human)</CardTitle>
                <CardDescription>1–5 per metric</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {HUMAN_METRICS.map((label) => (
                  <ScoreRow key={label} label={label} />
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Decision & Rationale</CardTitle>
                <CardDescription>Record the outcome of this trial.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="mb-2 font-medium text-green-600">Strengths</div>
                  <ul className="list-disc pl-4 text-muted-foreground">
                    <li>Brand voice strong; inclusive language.</li>
                    <li>Clear calls-to-action with variants.</li>
                  </ul>
                </div>
                <div className="text-sm">
                  <div className="mb-2 font-medium text-rose-600">Weaknesses</div>
                  <ul className="list-disc pl-4 text-muted-foreground">
                    <li>Originality moderate; consider exploratory prompt v2.</li>
                  </ul>
                </div>
                <Separator />
                <Tabs defaultValue="approve">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="approve">Approve</TabsTrigger>
                    <TabsTrigger value="revise">Request Revisions</TabsTrigger>
                  </TabsList>
                  <TabsContent value="approve" className="mt-3">
                    <Button className="w-full">Approve & Export</Button>
                  </TabsContent>
                  <TabsContent value="revise" className="mt-3 space-y-2">
                    <Label className="text-xs">Revision notes</Label>
                    <Input placeholder="Tell the model what to improve…" />
                    <Button variant="outline" className="w-full">Create Follow-up Run</Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="pb-8 text-center text-xs text-muted-foreground">
            msaiq POC • Run → Trial → Artifact → Scorecard • v0.2
          </div>
        </div>
      </div>
    </div>
  );
}

/** Small component for 1–5 scoring row */
function ScoreRow({ label }: { label: string }) {
  const [value, setValue] = useState<number>(4);
  return (
    <div className="grid grid-cols-[180px_1fr] items-center gap-3">
      <div className="text-sm">{label}</div>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <Button
            key={n}
            variant={value === n ? "default" : "outline"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setValue(n)}
          >
            {n}
          </Button>
        ))}
        <div className="ml-3 w-32">
          <Slider
            value={[value]}
            min={1}
            max={5}
            step={1}
            onValueChange={(v) => setValue(v[0])}
          />
        </div>
      </div>
    </div>
  );
}