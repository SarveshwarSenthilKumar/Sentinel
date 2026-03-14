"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Sphere, Line, Box } from "@react-three/drei";
import * as THREE from "three";
import type { GraphResponse, LiveMonitorGraph } from "@/lib/types";

interface ThreeNetworkGraphProps {
  graph: GraphResponse | LiveMonitorGraph;
  isLiveMonitor?: boolean;
  autoRotate?: boolean;
  animationSpeed?: number;
}

interface NodeData {
  id: string;
  label: string;
  x: number;
  y: number;
  z: number;
  color: string;
  size: number;
  risk: number;
  type: "source" | "cashout" | "suspicious" | "normal" | "account" | "mule" | "device" | "ip" | "beneficiary";
  connections: number;
}

interface EdgeData {
  id: string;
  source: string;
  target: string;
  color: string;
  width: number;
  amount?: number;
  risk: number;
}

// Node component for 3D visualization
function Node({ 
  node, 
  isSelected, 
  isHovered, 
  onClick, 
  onHover 
}: { 
  node: NodeData; 
  isSelected: boolean; 
  isHovered: boolean; 
  onClick: () => void; 
  onHover: (hovered: boolean) => void; 
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [scale, setScale] = useState(1);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = node.y + Math.sin(state.clock.elapsedTime + node.x) * 0.1;
      
      // Hover effect
      const targetScale = isHovered ? 1.3 : isSelected ? 1.15 : 1;
      setScale(THREE.MathUtils.lerp(scale, targetScale, 0.1));
      
      meshRef.current.scale.setScalar(scale);
    }
  });

  const getNodeColor = () => {
    if (node.risk > 0.7) return "#ef4444"; // Red for high risk
    if (node.risk > 0.4) return "#f59e0b"; // Orange for medium risk
    if (node.type === "source") return "#3b82f6"; // Blue for source
    if (node.type === "cashout") return "#8b5cf6"; // Purple for cashout
    return "#10b981"; // Green for normal
  };

  return (
    <group position={[node.x, node.y, node.z]}>
      <Sphere
        ref={meshRef}
        args={[node.size, 32, 32]}
        onClick={onClick}
        onPointerOver={() => onHover(true)}
        onPointerOut={() => onHover(false)}
      >
        <meshStandardMaterial
          color={getNodeColor()}
          emissive={isSelected ? getNodeColor() : "#000000"}
          emissiveIntensity={isSelected ? 0.3 : 0}
          roughness={0.3}
          metalness={0.7}
        />
      </Sphere>
      
      {/* Risk indicator for high-risk nodes */}
      {node.risk > 0.7 && (
        <Sphere
          args={[node.size * 1.3, 16, 16]}
          position={[0, 0, 0]}
        >
          <meshBasicMaterial color="#ef4444" transparent opacity={0.2} />
        </Sphere>
      )}
      
      {/* Node label */}
      <Text
        position={[0, node.size + 1, 0]}
        fontSize={0.8}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={4}
      >
        {node.label}
      </Text>
    </group>
  );
}

// Edge component for 3D visualization
function Edge({ edge, nodes }: { edge: EdgeData; nodes: NodeData[] }) {
  const sourceNode = nodes.find(n => n.id === edge.source);
  const targetNode = nodes.find(n => n.id === edge.target);
  
  const sourcePos = useMemo(() => 
    sourceNode ? new THREE.Vector3(sourceNode.x, sourceNode.y, sourceNode.z) : new THREE.Vector3(0, 0, 0),
    [sourceNode]
  );
  
  const targetPos = useMemo(() => 
    targetNode ? new THREE.Vector3(targetNode.x, targetNode.y, targetNode.z) : new THREE.Vector3(0, 0, 0),
    [targetNode]
  );

  const getEdgeColor = () => {
    if (edge.risk > 0.7) return "#ef4444"; // Red for high risk
    if (edge.risk > 0.4) return "#f59e0b"; // Orange for medium risk
    return "#64748b"; // Gray for normal
  };

  const points = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      sourcePos,
      new THREE.Vector3(
        (sourcePos.x + targetPos.x) / 2,
        (sourcePos.y + targetPos.y) / 2 + 2,
        (sourcePos.z + targetPos.z) / 2
      ),
      targetPos
    ]);
    return curve.getPoints(50);
  }, [sourcePos, targetPos]);

  return (
    <Line
      points={points}
      color={getEdgeColor()}
      lineWidth={edge.width}
      transparent
      opacity={0.8}
    />
  );
}

// Main 3D scene component
function NetworkScene({ 
  nodes, 
  edges, 
  selectedNode, 
  hoveredNode, 
  onNodeClick, 
  onNodeHover,
  autoRotate,
  animationSpeed
}: {
  nodes: NodeData[];
  edges: EdgeData[];
  selectedNode: string | null;
  hoveredNode: string | null;
  onNodeClick: (nodeId: string) => void;
  onNodeHover: (nodeId: string | null) => void;
  autoRotate?: boolean;
  animationSpeed?: number;
}) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#3b82f6" />
      
      {nodes.map((node) => (
        <Node
          key={node.id}
          node={node}
          isSelected={selectedNode === node.id}
          isHovered={hoveredNode === node.id}
          onClick={() => onNodeClick(node.id)}
          onHover={(hovered) => onNodeHover(hovered ? node.id : null)}
        />
      ))}
      
      {edges.map((edge) => (
        <Edge key={edge.id} edge={edge} nodes={nodes} />
      ))}
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={!autoRotate}
        autoRotate={autoRotate}
        autoRotateSpeed={0.5 * (animationSpeed || 1)}
        minDistance={5}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
}

export function ThreeNetworkGraph({ graph, isLiveMonitor = false, autoRotate = false, animationSpeed = 1 }: ThreeNetworkGraphProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Process graph data for 3D visualization
  const { nodes, edges } = useMemo(() => {
    const processedNodes: NodeData[] = [];
    const processedEdges: EdgeData[] = [];
    const nodeMap = new Map<string, NodeData>();

    if (isLiveMonitor) {
      const liveGraph = graph as LiveMonitorGraph;
      
      // Process live monitor nodes with better 3D positioning
      liveGraph.nodes.forEach((node, index) => {
        const angle = (index / liveGraph.nodes.length) * Math.PI * 2;
        const radius = 8;
        const layer = node.kind === "account" ? 0 : node.kind === "mule" ? 2 : 1;
        
        const nodeData: NodeData = {
          id: node.id,
          label: node.label,
          x: Math.cos(angle) * radius,
          y: layer * 2 - 2, // Different layers for different node types
          z: Math.sin(angle) * radius,
          color: node.risk > 0.7 ? "#ef4444" : "#10b981",
          size: 0.5 + node.risk * 0.5,
          risk: node.risk,
          type: node.kind as NodeData["type"],
          connections: 0
        };
        
        processedNodes.push(nodeData);
        nodeMap.set(node.id, nodeData);
      });

      // Process live monitor edges
      liveGraph.edges.forEach((edge, index) => {
        processedEdges.push({
          id: `edge-${index}`,
          source: edge.source,
          target: edge.target,
          color: edge.risk > 0.7 ? "#ef4444" : "#64748b",
          width: edge.amount ? Math.min(Math.max(edge.amount / 10000, 0.5), 3) : 1,
          amount: edge.amount,
          risk: edge.risk
        });
      });
    } else {
      const graphResponse = graph as GraphResponse;
      
      // Process transaction graph nodes with better positioning
      graphResponse.nodes.forEach((node, index) => {
        const angle = (index / graphResponse.nodes.length) * Math.PI * 2;
        const radius = 8;
        const classes = (node.classes || []) as string[];
        
        // Determine layer based on node type
        let layer = 0;
        let nodeType: NodeData["type"] = "normal";
        if (classes.includes("source")) { layer = -2; nodeType = "source"; }
        else if (classes.includes("cashout")) { layer = 2; nodeType = "cashout"; }
        else if (classes.includes("suspicious")) { layer = 1; nodeType = "suspicious"; }
        else { layer = 0; nodeType = "normal"; }
        
        const nodeData: NodeData = {
          id: node.data.id,
          label: node.data.label || node.data.id,
          x: Math.cos(angle) * radius,
          y: layer * 2,
          z: Math.sin(angle) * radius,
          color: classes.includes("suspicious") ? "#ef4444" : "#10b981",
          size: 0.5 + (classes.includes("source") ? 0.3 : classes.includes("cashout") ? 0.4 : 0.2),
          risk: classes.includes("suspicious") ? 0.8 : classes.includes("cashout") ? 0.6 : 0.2,
          type: nodeType,
          connections: 0
        };
        
        processedNodes.push(nodeData);
        nodeMap.set(node.data.id, nodeData);
      });

      // Process transaction graph edges
      graphResponse.edges.forEach((edge, index) => {
        const amount = edge.data.amount ? Number(edge.data.amount) : undefined;
        processedEdges.push({
          id: edge.data.id || `edge-${index}`,
          source: edge.data.source,
          target: edge.data.target,
          color: edge.classes?.includes("highlighted") ? "#ef4444" : "#64748b",
          width: amount ? Math.min(Math.max(amount / 10000, 0.5), 3) : 1,
          amount: amount,
          risk: edge.classes?.includes("highlighted") ? 0.8 : 0.2
        });
      });
    }

    // Count connections for each node
    processedEdges.forEach(edge => {
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);
      if (sourceNode) sourceNode.connections++;
      if (targetNode) targetNode.connections++;
    });

    return { nodes: processedNodes, edges: processedEdges };
  }, [graph, isLiveMonitor]);

  return (
    <div className="w-full h-[600px] bg-gradient-to-br from-slate-900 to-slate-950 rounded-lg border border-slate-700">
      <Canvas
        camera={{ position: [15, 10, 15], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <NetworkScene
          nodes={nodes}
          edges={edges}
          selectedNode={selectedNode}
          hoveredNode={hoveredNode}
          onNodeClick={setSelectedNode}
          onNodeHover={setHoveredNode}
          autoRotate={autoRotate}
          animationSpeed={animationSpeed}
        />
      </Canvas>
      
      {/* Info overlay */}
      <div className="absolute top-4 left-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 text-white max-w-xs">
        <h3 className="font-semibold mb-2">Network Statistics</h3>
        <div className="text-sm space-y-1">
          <p>Nodes: {nodes.length}</p>
          <p>Edges: {edges.length}</p>
          <p>High Risk: {nodes.filter(n => n.risk > 0.7).length}</p>
          {selectedNode && (
            <p className="text-blue-400 mt-2">Selected: {selectedNode}</p>
          )}
        </div>
      </div>
    </div>
  );
}
