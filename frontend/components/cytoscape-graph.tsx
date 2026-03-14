"use client";

import { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
import { Maximize2, Minimize2 } from "lucide-react";
import { useTheme } from "next-themes";

import type { GraphResponse } from "@/lib/types";

type CytoscapeGraphProps = {
  graph: GraphResponse;
};

export function CytoscapeGraph({ graph }: CytoscapeGraphProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const placeholderRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cytoscapeRef = useRef<any>(null);
  const { resolvedTheme } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties | null>(null);
  const [placeholderHeight, setPlaceholderHeight] = useState<number | null>(null);

  const TRANSITION_MS = 320;

  const handleRefocus = () => {
    if (cytoscapeRef.current) {
      cytoscapeRef.current.fit(undefined, 50);
    }
  };

  const fitGraphSoon = () => {
    window.setTimeout(() => {
      if (cytoscapeRef.current) {
        cytoscapeRef.current.resize();
        cytoscapeRef.current.fit(undefined, isFullscreen ? 90 : 50);
      }
    }, TRANSITION_MS + 20);
  };

  const enterFullscreen = () => {
    if (!wrapperRef.current || isTransitioning || isFullscreen) {
      return;
    }

    const rect = wrapperRef.current.getBoundingClientRect();
    setPlaceholderHeight(rect.height);
    setIsTransitioning(true);
    setIsFullscreen(true);
    setOverlayStyle({
      position: "fixed",
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      zIndex: 60,
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setOverlayStyle({
          position: "fixed",
          top: 16,
          left: 16,
          width: window.innerWidth - 32,
          height: window.innerHeight - 32,
          zIndex: 60,
        });
      });
    });

    fitGraphSoon();
    window.setTimeout(() => {
      setIsTransitioning(false);
    }, TRANSITION_MS);
  };

  const exitFullscreen = () => {
    if (!isFullscreen || isTransitioning) {
      return;
    }

    const targetRect = placeholderRef.current?.getBoundingClientRect();
    if (!targetRect) {
      setIsFullscreen(false);
      setOverlayStyle(null);
      setPlaceholderHeight(null);
      return;
    }

    setIsTransitioning(true);
    setOverlayStyle({
      position: "fixed",
      top: targetRect.top,
      left: targetRect.left,
      width: targetRect.width,
      height: targetRect.height,
      zIndex: 60,
    });

    window.setTimeout(() => {
      setIsFullscreen(false);
      setIsTransitioning(false);
      setOverlayStyle(null);
      setPlaceholderHeight(null);
      if (cytoscapeRef.current) {
        cytoscapeRef.current.resize();
        cytoscapeRef.current.fit(undefined, 50);
      }
    }, TRANSITION_MS);
  };

  const getLightStyles = () => [
    {
      selector: "node",
      style: {
        label: "data(label)",
        "text-wrap": "wrap",
        "text-max-width": "110px",
        "font-size": "12px",
        "font-family": "Avenir Next, Segoe UI, sans-serif",
        color: "#1e293b",
        "text-valign": "top",
        "text-halign": "center",
        "text-margin-y": -10,
        "text-background-color": "#ffffff",
        "text-background-opacity": 0.95,
        "text-background-padding": "4px",
        "background-color": "#f8fafc",
        "border-width": "2px",
        "border-color": "#cbd5e1",
        width: 56,
        height: 56,
        "text-outline-color": "#ffffff",
        "text-outline-width": 2,
      },
    },
    {
      selector: "edge",
      style: {
        label: "data(label)",
        "font-size": "10px",
        "font-family": "Avenir Next, Segoe UI, sans-serif",
        color: "#475569",
        "text-background-color": "#ffffff",
        "text-background-opacity": 0.9,
        "text-background-padding": "2px",
        "text-rotation": "autorotate",
        width: "3px",
        "line-color": "#94a3b8",
        "target-arrow-color": "#94a3b8",
        "target-arrow-shape": "triangle",
        "curve-style": "bezier",
        "arrow-scale": 0.9,
        opacity: 0.9,
        "text-outline-color": "#ffffff",
        "text-outline-width": 2,
      },
    },
    {
      selector: ".source",
      style: {
        "background-color": "#1e293b",
        color: "#ffffff",
        "border-color": "#334155",
        "text-outline-color": "#1e293b",
        "text-outline-width": 2,
      },
    },
    {
      selector: ".recipient",
      style: {
        "background-color": "#f59e0b",
        "border-color": "#d97706",
        color: "#ffffff",
        "text-outline-color": "#f59e0b",
        "text-outline-width": 2,
      },
    },
    {
      selector: ".safe",
      style: {
        "background-color": "#10b981",
        "border-color": "#059669",
        color: "#ffffff",
        "text-outline-color": "#10b981",
        "text-outline-width": 2,
      },
    },
    {
      selector: ".suspicious",
      style: {
        "background-color": "#ef4444",
        "border-color": "#dc2626",
        color: "#ffffff",
        "text-outline-color": "#ef4444",
        "text-outline-width": 2,
      },
    },
    {
      selector: ".cashout",
      style: {
        shape: "diamond",
        "background-color": "#7c3aed",
        "border-color": "#6d28d9",
        color: "#ffffff",
        "text-outline-color": "#7c3aed",
        "text-outline-width": 2,
      },
    },
    {
      selector: "node.highlighted",
      style: {
        "border-width": "4px",
        "border-color": "#ef4444",
        "overlay-opacity": 0,
        "box-shadow": "0 0 12px rgba(239, 68, 68, 0.4)",
      },
    },
    {
      selector: "edge.highlighted",
      style: {
        width: "5px",
        "line-color": "#ef4444",
        "target-arrow-color": "#ef4444",
      },
    },
    {
      selector: "edge.branch",
      style: {
        width: "4px",
        "line-color": "#f59e0b",
        "target-arrow-color": "#f59e0b",
      },
    },
    {
      selector: "edge:not(.highlighted):not(.branch)",
      style: {
        opacity: 0.6,
        width: "2px",
      },
    },
  ];

  const getDarkStyles = () => [
    {
      selector: "node",
      style: {
        label: "data(label)",
        "text-wrap": "wrap",
        "text-max-width": "110px",
        "font-size": "13px",
        "font-weight": 700,
        "font-family": "Avenir Next, Segoe UI, sans-serif",
        color: "#ffffff",
        "text-valign": "top",
        "text-halign": "center",
        "text-margin-y": -12,
        "text-background-color": "#0f172a",
        "text-background-opacity": 0.96,
        "text-background-padding": "6px",
        "background-color": "#334155",
        "border-width": "2px",
        "border-color": "#475569",
        width: 56,
        height: 56,
        "text-border-color": "#0f172a",
        "text-border-opacity": 1,
        "text-border-width": 1,
        "text-outline-color": "#0f172a",
        "text-outline-width": 3,
      },
    },
    {
      selector: "edge",
      style: {
        label: "data(label)",
        "font-size": "12px",
        "font-weight": 700,
        "font-family": "Avenir Next, Segoe UI, sans-serif",
        color: "#f8fafc",
        "text-background-color": "#0f172a",
        "text-background-opacity": 0.94,
        "text-background-padding": "4px",
        "text-rotation": "autorotate",
        width: "3px",
        "line-color": "#475569",
        "target-arrow-color": "#475569",
        "target-arrow-shape": "triangle",
        "curve-style": "bezier",
        "arrow-scale": 0.9,
        opacity: 0.9,
        "text-outline-color": "#0f172a",
        "text-outline-width": 2,
      },
    },
    {
      selector: ".source",
      style: {
        "background-color": "#0f172a",
        color: "#f8fafc",
        "border-color": "#1e293b",
        "text-outline-color": "#0f172a",
        "text-outline-width": 2,
      },
    },
    {
      selector: ".recipient",
      style: {
        "background-color": "#f59e0b",
        "border-color": "#d97706",
        color: "#f8fafc",
        "text-outline-color": "#f59e0b",
        "text-outline-width": 2,
      },
    },
    {
      selector: ".safe",
      style: {
        "background-color": "#10b981",
        "border-color": "#059669",
        color: "#f8fafc",
        "text-outline-color": "#10b981",
        "text-outline-width": 2,
      },
    },
    {
      selector: ".suspicious",
      style: {
        "background-color": "#ef4444",
        "border-color": "#dc2626",
        color: "#f8fafc",
        "text-outline-color": "#ef4444",
        "text-outline-width": 2,
      },
    },
    {
      selector: ".cashout",
      style: {
        shape: "diamond",
        "background-color": "#7c3aed",
        "border-color": "#6d28d9",
        color: "#f8fafc",
        "text-outline-color": "#7c3aed",
        "text-outline-width": 2,
      },
    },
    {
      selector: "node.highlighted",
      style: {
        "border-width": "4px",
        "border-color": "#ef4444",
        "overlay-opacity": 0,
        "box-shadow": "0 0 12px rgba(239, 68, 68, 0.6)",
      },
    },
    {
      selector: "edge.highlighted",
      style: {
        width: "5px",
        "line-color": "#ef4444",
        "target-arrow-color": "#ef4444",
      },
    },
    {
      selector: "edge.branch",
      style: {
        width: "4px",
        "line-color": "#f59e0b",
        "target-arrow-color": "#f59e0b",
      },
    },
    {
      selector: "edge:not(.highlighted):not(.branch)",
      style: {
        opacity: 0.45,
        width: "2px",
      },
    },
  ];

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const styles = resolvedTheme === "dark" ? getDarkStyles() : getLightStyles();

    const instance = cytoscape({
      container: containerRef.current,
      elements: [...graph.nodes, ...graph.edges],
      minZoom: 0.45,
      maxZoom: 2.2,
      layout: {
        name: "cose",
        padding: 36,
        animate: false,
        fit: true,
        nodeRepulsion: 160000,
        idealEdgeLength: 140,
        edgeElasticity: 90,
        nestingFactor: 0.7,
        gravity: 0.45,
      },
      style: styles as any,
    });

    cytoscapeRef.current = instance;

    return () => {
      instance.destroy();
    };
  }, [graph, resolvedTheme]);

  useEffect(() => {
    if (!isFullscreen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        exitFullscreen();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isFullscreen, isTransitioning]);

  return (
    <>
      {isFullscreen && placeholderHeight ? (
        <div ref={placeholderRef} style={{ height: placeholderHeight }} />
      ) : null}

      {isFullscreen ? (
        <div
          className={`fixed inset-0 z-50 bg-[rgba(6,16,31,0.58)] backdrop-blur-[4px] transition-opacity duration-300 ${
            isFullscreen ? "opacity-100" : "opacity-0"
          }`}
          onClick={exitFullscreen}
        />
      ) : null}

      <div
        ref={wrapperRef}
        style={isFullscreen ? overlayStyle ?? undefined : undefined}
        className={`relative overflow-hidden rounded-[24px] border border-line/70 bg-[#fffdf9] shadow-frame transition-[top,left,width,height,border-radius,box-shadow] duration-300 ease-out dark:bg-[#1b2638] ${
          isFullscreen ? "z-[60] rounded-[28px] shadow-[0_28px_90px_rgba(0,0,0,0.42)]" : ""
        }`}
      >
        <div
          ref={containerRef}
          className={`w-full ${isFullscreen ? "h-full min-h-[calc(100vh-2rem)]" : "h-[520px]"}`}
        />
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {isFullscreen ? (
            <button
              onClick={exitFullscreen}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-canvas/82 px-4 text-sm text-ink transition-colors hover:bg-paper dark:bg-surface/82 dark:hover:bg-surface"
              aria-label="Exit full screen"
              title="Exit full screen"
            >
              <Minimize2 className="h-4 w-4" />
              Exit full screen
              <span className="rounded-full border border-line/70 px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] text-muted">
                Esc
              </span>
            </button>
          ) : null}
          <button
            onClick={isFullscreen ? exitFullscreen : enterFullscreen}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-canvas/70 text-ink transition-colors hover:bg-paper dark:bg-surface/70 dark:text-ink dark:hover:bg-surface"
            aria-label={isFullscreen ? "Exit full screen" : "Open full screen"}
            title={isFullscreen ? "Exit full screen" : "Open full screen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </>
  );
}
