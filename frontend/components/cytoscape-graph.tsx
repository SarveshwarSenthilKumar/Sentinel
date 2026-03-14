"use client";

import { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
import { Maximize2, ZoomIn, ZoomOut, Move } from "lucide-react";
import { useTheme } from "next-themes";

import type { GraphResponse } from "@/lib/types";

type CytoscapeGraphProps = {
  graph: GraphResponse;
};

export function CytoscapeGraph({ graph }: CytoscapeGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cytoscapeRef = useRef<any>(null);
  const { resolvedTheme } = useTheme();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPanning, setIsPanning] = useState(false);

  const handleRefocus = () => {
    if (cytoscapeRef.current) {
      cytoscapeRef.current.fit(undefined, 50);
      setZoomLevel(cytoscapeRef.current.zoom());
    }
  };

  const handleZoomIn = () => {
    if (cytoscapeRef.current) {
      cytoscapeRef.current.zoom(cytoscapeRef.current.zoom() * 1.2);
      setZoomLevel(cytoscapeRef.current.zoom());
    }
  };

  const handleZoomOut = () => {
    if (cytoscapeRef.current) {
      cytoscapeRef.current.zoom(cytoscapeRef.current.zoom() * 0.8);
      setZoomLevel(cytoscapeRef.current.zoom());
    }
  };

  const togglePanning = () => {
    setIsPanning(!isPanning);
    if (cytoscapeRef.current) {
      cytoscapeRef.current.userPanningEnabled(!isPanning);
    }
  };

  const getLightStyles = () => [
    {
      selector: "node",
      style: {
        label: "data(label)",
        "text-wrap": "wrap",
        "text-max-width": "120px",
        "font-size": "13px",
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
        width: 64,
        height: 64,
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
        "background-color": "#64748b",
        "border-color": "#475569",
        color: "#ffffff",
        "text-outline-color": "#64748b",
        "text-outline-width": 2,
      },
    },
    {
      selector: ".safe",
      style: {
        "background-color": "#64748b",
        "border-color": "#475569",
        color: "#ffffff",
        "text-outline-color": "#64748b",
        "text-outline-width": 2,
      },
    },
    {
      selector: ".suspicious",
      style: {
        "background-color": "#475569",
        "border-color": "#334155",
        color: "#ffffff",
        "text-outline-color": "#475569",
        "text-outline-width": 2,
      },
    },
    {
      selector: ".cashout",
      style: {
        shape: "diamond",
        "background-color": "#334155",
        "border-color": "#1e293b",
        color: "#ffffff",
        "text-outline-color": "#334155",
        "text-outline-width": 2,
      },
    },
    {
      selector: "node.highlighted",
      style: {
        "border-width": "4px",
        "border-color": "#475569",
        "overlay-opacity": 0,
        "box-shadow": "0 0 12px rgba(71, 85, 105, 0.4)",
      },
    },
    {
      selector: "edge.highlighted",
      style: {
        width: "5px",
        "line-color": "#475569",
        "target-arrow-color": "#475569",
      },
    },
    {
      selector: "edge.branch",
      style: {
        width: "4px",
        "line-color": "#64748b",
        "target-arrow-color": "#64748b",
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
        "text-max-width": "120px",
        "font-size": "13px",
        "font-family": "Avenir Next, Segoe UI, sans-serif",
        color: "#f8fafc",
        "text-valign": "top",
        "text-halign": "center",
        "text-margin-y": -10,
        "text-background-color": "#1e293b",
        "text-background-opacity": 0.92,
        "text-background-padding": "4px",
        "background-color": "#334155",
        "border-width": "2px",
        "border-color": "#475569",
        width: 64,
        height: 64,
      },
    },
    {
      selector: "edge",
      style: {
        label: "data(label)",
        "font-size": "10px",
        "font-family": "Avenir Next, Segoe UI, sans-serif",
        color: "#94a3b8",
        "text-background-color": "#1e293b",
        "text-background-opacity": 0.9,
        "text-background-padding": "2px",
        "text-rotation": "autorotate",
        width: "3px",
        "line-color": "#475569",
        "target-arrow-color": "#475569",
        "target-arrow-shape": "triangle",
        "curve-style": "bezier",
        "arrow-scale": 0.9,
        opacity: 0.9,
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
        "background-color": "#94a3b8",
        "border-color": "#64748b",
        color: "#f8fafc",
        "text-outline-color": "#94a3b8",
        "text-outline-width": 2,
      },
    },
    {
      selector: ".safe",
      style: {
        "background-color": "#94a3b8",
        "border-color": "#64748b",
        color: "#f8fafc",
        "text-outline-color": "#94a3b8",
        "text-outline-width": 2,
      },
    },
    {
      selector: ".suspicious",
      style: {
        "background-color": "#64748b",
        "border-color": "#475569",
        color: "#f8fafc",
        "text-outline-color": "#64748b",
        "text-outline-width": 2,
      },
    },
    {
      selector: ".cashout",
      style: {
        shape: "diamond",
        "background-color": "#475569",
        "border-color": "#334155",
        color: "#f8fafc",
        "text-outline-color": "#475569",
        "text-outline-width": 2,
      },
    },
    {
      selector: "node.highlighted",
      style: {
        "border-width": "4px",
        "border-color": "#64748b",
        "overlay-opacity": 0,
        "box-shadow": "0 0 12px rgba(100, 163, 184, 0.6)",
      },
    },
    {
      selector: "edge.highlighted",
      style: {
        width: "5px",
        "line-color": "#64748b",
        "target-arrow-color": "#64748b",
      },
    },
    {
      selector: "edge.branch",
      style: {
        width: "4px",
        "line-color": "#94a3b8",
        "target-arrow-color": "#94a3b8",
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
      layout: {
        name: "cose",
        padding: 50,
        animate: true,
        animationDuration: 1000,
        fit: true,
        nodeRepulsion: 200000,
        idealEdgeLength: 160,
        edgeElasticity: 100,
        nestingFactor: 0.8,
        gravity: 0.5,
        randomize: false,
      },
      style: styles as any,
    });

    cytoscapeRef.current = instance;

    // Enable user interactions
    instance.userPanningEnabled(true);
    instance.userZoomingEnabled(true);
    instance.boxSelectionEnabled(true);
    
    // Update zoom level on zoom events
    instance.on('zoom', () => {
      setZoomLevel(instance.zoom());
    });

    return () => {
      instance.destroy();
    };
  }, [graph, resolvedTheme]);

  return (
    <div className="relative">
      <div ref={containerRef} className="h-[520px] w-full rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
      
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
          aria-label="Zoom in"
          title="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
          aria-label="Zoom out"
          title="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={togglePanning}
          className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
            isPanning 
              ? 'bg-blue-500 border-blue-500 text-white' 
              : 'border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
          aria-label="Toggle panning"
          title={isPanning ? 'Panning enabled' : 'Enable panning'}
        >
          <Move className="h-4 w-4" />
        </button>
        <button
          onClick={handleRefocus}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
          aria-label="Refocus graph"
          title="Refocus graph"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
      
      {/* Zoom Level Indicator */}
      <div className="absolute bottom-4 left-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 px-3 py-2 text-xs text-slate-600 dark:text-slate-400">
        Zoom: {Math.round(zoomLevel * 100)}%
      </div>
    </div>
  );
}
