"use client";

import Link from "next/link";
import { startTransition, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { getIncidentPanel, refreshIncidentQueue } from "@/lib/api";
import type {
  IncidentPanelResponse,
  IncidentQueueResponse,
  LiveAction,
} from "@/lib/types";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const decisionStyles: Record<LiveAction, string> = {
  allow: "bg-safe/10 text-safe",
  review: "bg-review/15 text-review",
  hold: "bg-block/10 text-block",
  block: "bg-block/15 text-block",
};

const decisionLabels: Record<LiveAction, string> = {
  allow: "Allow",
  review: "Review",
  hold: "Hold",
  block: "Block",
};

type FilterValue = "all" | "block" | "hold" | "review";
type SortValue = "risk" | "newest";

export function IncidentQueueWorkspace({
  initialQueue,
}: {
  initialQueue: IncidentQueueResponse;
}) {
  const [queue, setQueue] = useState(initialQueue);
  const [pendingQueue, setPendingQueue] = useState<IncidentQueueResponse | null>(null);
  const [pendingThreatCount, setPendingThreatCount] = useState(0);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [sortBy, setSortBy] = useState<SortValue>("risk");
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [panel, setPanel] = useState<IncidentPanelResponse | null>(null);
  const [isPanelLoading, setIsPanelLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const panelRef = useRef<HTMLElement | null>(null);

  function applyPendingQueue() {
    if (!pendingQueue) {
      return;
    }

    setQueue(pendingQueue);
    setPendingQueue(null);
    setPendingThreatCount(0);
  }

  function closePanel() {
    setSelectedIncidentId(null);
    setPanel(null);
    setIsPanelLoading(false);
    applyPendingQueue();
  }

  async function fetchQueue(batch: number) {
    setIsRefreshing(true);

    try {
      const next = await refreshIncidentQueue(batch);
      if (selectedIncidentId) {
        const currentIds = new Set(queue.incidents.map((item) => item.incident_id));
        const freshCount = next.incidents.filter((item) => !currentIds.has(item.incident_id)).length;

        setPendingQueue(next);
        setPendingThreatCount((current) => current + freshCount);
        return;
      }

      setQueue(next);
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    if (!selectedIncidentId) {
      return;
    }

    let ignore = false;
    setIsPanelLoading(true);
    setPanel(null);

    void getIncidentPanel(selectedIncidentId)
      .then((response) => {
        if (!ignore) {
          setPanel(response);
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsPanelLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [selectedIncidentId]);

  useEffect(() => {
    if (!isLive) {
      return;
    }

    const handle = window.setInterval(() => {
      startTransition(() => {
        void fetchQueue(4);
      });
    }, 7000);

    return () => {
      window.clearInterval(handle);
    };
  }, [fetchQueue, isLive]);

  useEffect(() => {
    if (!selectedIncidentId) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (panelRef.current?.contains(target)) {
        return;
      }

      closePanel();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closePanel();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closePanel, selectedIncidentId]);

  const incidents = queue.incidents
    .filter((incident) => (filter === "all" ? true : incident.decision === filter))
    .sort((left, right) => {
      if (sortBy === "newest") {
        return right.generated_at.localeCompare(left.generated_at);
      }

      return right.overall_risk - left.overall_risk;
    });

  const panelOpen = Boolean(selectedIncidentId);

  return (
    <div className="relative space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[28px] border border-line/55 bg-surface/92 px-5 py-5 shadow-frame backdrop-blur xl:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.26em] text-muted">
                Analyst workspace
              </p>
              <h1 className="mt-3 font-serif text-[2.35rem] leading-[1.02] text-ink sm:text-[2.85rem]">
                Live incident stream for score-first review.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
                Sentinel keeps the queue continuously reviewable, prioritizes the
                riskiest payment anomalies, and opens a focused triage dock only
                when you choose an incident to inspect.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
              <StatusPill>
                {queue.generated_at
                  ? `Updated ${new Date(queue.generated_at).toLocaleTimeString()}`
                  : "Queue warming up"}
              </StatusPill>
              <StatusPill>
                {isRefreshing
                  ? "Refreshing stream..."
                  : pendingQueue
                    ? `${pendingThreatCount || "New"} threats waiting`
                    : "Repeatable stream"}
              </StatusPill>
              <button
                type="button"
                onClick={() => setIsLive((current) => !current)}
                className={`rounded-full border px-4 py-2 transition ${
                  isLive
                    ? "border-ink bg-ink text-canvas"
                    : "border-line bg-canvas text-ink hover:bg-paper"
                }`}
              >
                {isLive ? "Pause stream" : "Resume stream"}
              </button>
              {pendingQueue ? (
                <button
                  type="button"
                  onClick={applyPendingQueue}
                  className="rounded-full border border-accent/60 bg-accent px-4 py-2 text-ink transition hover:opacity-90"
                >
                  Review new threats
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <aside className="rounded-[28px] border border-line/55 bg-surface/92 p-4 shadow-frame backdrop-blur">
          <p className="text-xs uppercase tracking-[0.24em] text-muted">
            Operational summary
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <SummaryMetric
              label="Monitored"
              value={queue.stats.monitored_transactions.toString()}
              tone="safe"
            />
            <SummaryMetric
              label="Blocked"
              value={queue.stats.blocked_count.toString()}
              tone="block"
            />
            <SummaryMetric
              label="Review + hold"
              value={`${queue.stats.review_count + queue.stats.hold_count}`}
              tone="review"
            />
            <SummaryMetric
              label="Latency"
              value={`${queue.stats.average_latency_ms} ms`}
              tone="safe"
            />
          </div>
          <div className="mt-3 rounded-[22px] border border-line/60 bg-canvas/80 px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
              Suspicious volume
            </p>
            <p className="mt-2 font-serif text-4xl text-block">
              {currency.format(queue.stats.suspicious_volume)}
            </p>
          </div>
        </aside>
      </section>

      <section className="relative">
        <div className="min-w-0 rounded-[30px] border border-line/55 bg-surface/94 p-4 shadow-frame backdrop-blur sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line/45 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted">
                  Prioritized by risk
                </p>
                <h2 className="mt-2 font-serif text-3xl text-ink">Incident queue</h2>
              </div>
              <div className="text-right text-sm text-muted">
                <p>{incidents.length} visible incidents</p>
                <p className="mt-1">Click any row to open triage</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2 text-sm">
                {[
                  ["all", "All"],
                  ["block", "Block"],
                  ["hold", "Hold"],
                  ["review", "Review"],
                ].map(([value, label]) => (
                  <ToggleChip
                    key={value}
                    active={filter === value}
                    onClick={() => setFilter(value as FilterValue)}
                  >
                    {label}
                  </ToggleChip>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                {[
                  ["risk", "Highest risk"],
                  ["newest", "Newest first"],
                ].map(([value, label]) => (
                  <ToggleChip
                    key={value}
                    active={sortBy === value}
                    onClick={() => setSortBy(value as SortValue)}
                  >
                    {label}
                  </ToggleChip>
                ))}
              </div>
            </div>

            {pendingQueue ? (
              <div className="mt-4 rounded-[22px] border border-accent/45 bg-accent/10 px-4 py-3 text-sm text-ink">
                {pendingThreatCount || "New"} threats arrived while you were reviewing.
                Apply them when you are ready so the current triage is not interrupted.
              </div>
            ) : null}

            <div className="mt-4 space-y-3">
              {incidents.map((incident) => {
                const selected = incident.incident_id === selectedIncidentId;

                return (
                  <button
                    key={incident.incident_id}
                    type="button"
                    onClick={() => setSelectedIncidentId(incident.incident_id)}
                    className={`group w-full rounded-[24px] border px-4 py-4 text-left transition-all duration-200 ${
                      selected
                        ? "border-accent/60 bg-accent/8 shadow-[0_10px_30px_rgba(42,86,114,0.12)]"
                        : "border-line/55 bg-canvas/78 hover:border-line hover:bg-canvas"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-base font-semibold text-ink">
                            {incident.title}
                          </p>
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] ${decisionStyles[incident.decision]}`}
                          >
                            {decisionLabels[incident.decision]}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-muted">
                          {formatRelativeIncidentTime(incident.generated_at)} ·{" "}
                          {incident.timeline_label}
                        </p>
                        <p className="mt-2 truncate text-sm text-muted">
                          {incident.counterpart_label}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-serif text-[2.2rem] leading-none text-ink">
                          {Math.round(incident.overall_risk * 100)}%
                        </p>
                        <p className="mt-2 text-sm font-medium text-muted">
                          {currency.format(incident.amount)}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-muted">{incident.summary}</p>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        {incident.top_reasons.slice(0, 2).map((reason) => (
                          <span
                            key={reason}
                            className="rounded-full border border-line/45 bg-surface/88 px-3 py-1.5 text-xs text-muted"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs uppercase tracking-[0.18em] text-muted transition group-hover:text-ink">
                        {selected ? "Triage open" : "Open triage"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
        </div>

        <div
          aria-hidden={!panelOpen}
          className={`pointer-events-none fixed inset-0 z-30 bg-[radial-gradient(circle_at_right,rgba(14,36,51,0.08),transparent_28%),linear-gradient(90deg,rgba(247,240,230,0.2),rgba(14,36,51,0.18))] backdrop-blur-[2px] transition-opacity duration-300 ${
            panelOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <aside
          ref={panelRef}
          aria-hidden={!panelOpen}
          className={`fixed inset-y-4 right-4 z-40 w-[min(94vw,42rem)] overflow-hidden rounded-[34px] border border-line/60 bg-elevated/97 shadow-[0_30px_90px_rgba(14,36,51,0.2)] backdrop-blur-xl transition-all duration-300 ease-out ${
            panelOpen ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-10 opacity-0"
          }`}
        >
          <div className="flex h-full max-h-[calc(100vh-2rem)] flex-col">
            <div className="border-b border-line/45 bg-surface/82 px-5 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted">
                    Score-first review
                  </p>
                  <h3 className="mt-2 font-serif text-[2.6rem] leading-none text-ink">
                    Triage dock
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-6 text-muted">
                    Review the current incident without sacrificing the main queue.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closePanel}
                  className="rounded-full border border-line bg-canvas/85 px-4 py-2 text-sm text-ink transition hover:bg-paper"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              {isPanelLoading || !panel ? (
                <PanelSkeleton />
              ) : (
                <div className="space-y-4">
                  {pendingQueue ? (
                    <div className="rounded-[22px] border border-accent/45 bg-accent/10 px-4 py-3 text-sm text-ink">
                      {pendingThreatCount || "New"} threats are queued in the background. Your
                      current review is pinned until you close this dock or apply the update.
                    </div>
                  ) : null}

                  <div className="rounded-[26px] border border-line/55 bg-canvas/82 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-xl font-semibold leading-tight text-ink">
                          {panel.title}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-muted">
                          {panel.timeline_label} · {panel.counterpart_label}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <StatusPill>{currency.format(panel.amount)}</StatusPill>
                          <StatusPill>
                            {panel.ai_mode === "gemini" ? "Live Gemini" : "Fallback reasoning"}
                          </StatusPill>
                        </div>
                      </div>
                      <div className="min-w-[8rem] text-right">
                        <p className="font-serif text-[4.2rem] leading-none text-ink">
                          {Math.round(panel.overall_risk * 100)}%
                        </p>
                        <div className="mt-4 flex justify-end">
                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] ${decisionStyles[panel.decision]}`}
                          >
                            {decisionLabels[panel.decision]}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5">
                      <RiskBar value={panel.overall_risk} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <ScoreMetric label="Txn" value={panel.transaction_risk} />
                    <ScoreMetric label="Behavior" value={panel.behavior_risk} />
                    <ScoreMetric label="Network" value={panel.network_risk} />
                  </div>

                  <PanelBlock title="Top signals">
                    <div className="flex flex-wrap gap-2">
                      {panel.top_reasons.map((reason) => (
                        <span
                          key={reason}
                          className="rounded-full border border-line/45 bg-surface/88 px-3 py-1.5 text-xs text-muted"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </PanelBlock>

                  <PanelBlock title="Recommended action">
                    <p className="font-serif text-[2rem] leading-tight text-ink">
                      {panel.recommended_action}
                    </p>
                  </PanelBlock>

                  <PanelBlock title="Why Sentinel escalated this">
                    <p className="text-sm leading-7 text-muted">{panel.explanation}</p>
                    {panel.summary_bullets.length ? (
                      <ul className="mt-3 space-y-2 text-sm leading-7 text-muted">
                        {panel.summary_bullets.map((bullet) => (
                          <li key={bullet}>- {bullet}</li>
                        ))}
                      </ul>
                    ) : null}
                  </PanelBlock>

                  <div className="flex flex-wrap gap-3 pt-1">
                    <Link
                      href={`/incidents/${panel.incident_id}`}
                      className="rounded-full bg-ink px-5 py-3 text-sm text-canvas transition hover:opacity-90"
                    >
                      Open full investigation
                    </Link>
                    <Link
                      href={`/incidents/${panel.incident_id}/graph`}
                      className="rounded-full border border-line bg-canvas/85 px-5 py-3 text-sm text-ink transition hover:bg-paper"
                    >
                      View network exposure
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function ToggleChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 transition ${
        active
          ? "border-ink bg-ink text-canvas"
          : "border-line bg-canvas/85 text-ink hover:bg-paper"
      }`}
    >
      {children}
    </button>
  );
}

function StatusPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-line/40 bg-canvas/78 px-4 py-2 text-sm text-muted">
      {children}
    </span>
  );
}

function SummaryMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "safe" | "review" | "block";
}) {
  const toneMap = {
    safe: "text-safe",
    review: "text-review",
    block: "text-block",
  };

  return (
    <div className="rounded-[22px] border border-line/60 bg-canvas/80 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted">{label}</p>
      <p className={`mt-3 font-serif text-[2.1rem] leading-none ${toneMap[tone]}`}>
        {value}
      </p>
    </div>
  );
}

function ScoreMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[20px] border border-line/55 bg-canvas/78 px-3 py-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-3 font-serif text-[2rem] leading-none text-ink">
        {Math.round(value * 100)}%
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-line/45">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${Math.max(Math.round(value * 100), 6)}%` }}
        />
      </div>
    </div>
  );
}

function RiskBar({ value }: { value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm text-muted">
        <span>Overall fraud risk</span>
        <span>{Math.round(value * 100)}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-line/45">
        <div
          className="h-full rounded-full bg-block"
          style={{ width: `${Math.max(Math.round(value * 100), 6)}%` }}
        />
      </div>
    </div>
  );
}

function PanelBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-line/55 bg-canvas/82 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div className="mt-4 space-y-4 animate-pulse">
      <div className="h-28 rounded-[24px] bg-canvas/75" />
      <div className="grid grid-cols-3 gap-3">
        <div className="h-24 rounded-[20px] bg-canvas/75" />
        <div className="h-24 rounded-[20px] bg-canvas/75" />
        <div className="h-24 rounded-[20px] bg-canvas/75" />
      </div>
      <div className="h-36 rounded-[24px] bg-canvas/75" />
      <div className="h-28 rounded-[24px] bg-canvas/75" />
      <div className="h-36 rounded-[24px] bg-canvas/75" />
    </div>
  );
}

function formatRelativeIncidentTime(timestamp: string) {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.max(0, Math.round(diffMs / 60000));

  if (minutes < 1) {
    return "just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.round(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  return new Date(timestamp).toLocaleDateString();
}
