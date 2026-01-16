"use client"
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  BackgroundVariant,
  ReactFlowInstance,
  Node,
  Panel,
} from 'reactflow';
import { Play, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { runWorkflowMock, RunStatus } from '@/lib/execution';

import 'reactflow/dist/style.css';
import TextNode from './nodes/TextNode';
import ImageNode from './nodes/ImageNode';
import VideoNode from './nodes/VideoNode';
import LlmNode from './nodes/LlmNode';
import CropNode from './nodes/CropNode';
import ExtractNode from './nodes/ExtractNode';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

let id = 0;
const getId = () => `dndnode_${id++}`;

export default function WorkflowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Execution State
  const [isRunning, setIsRunning] = useState(false);
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, RunStatus>>({});

  // Load workflow on mount
  useEffect(() => {
    const loadWorkflow = async () => {
        try {
            const res = await fetch('/api/workflows');
            if (!res.ok) {
                console.error("Failed to fetch workflow:", res.statusText);
                setIsLoading(false);
                return;
            }
            
            const data = await res.json();
            
            if (data && data.nodes && data.edges) {
                // If saved as stringified JSON in Prisma, parse it. 
                // If saved as raw JSON, it might already be an object.
                const parsedNodes = typeof data.nodes === 'string' ? JSON.parse(data.nodes) : data.nodes;
                const parsedEdges = typeof data.edges === 'string' ? JSON.parse(data.edges) : data.edges;
                
                setNodes(parsedNodes || []);
                setEdges(parsedEdges || []);
            } else {
                // If no workflow found or empty, set initial defaults
                 setNodes([
                    { id: '1', type: 'textNode', position: { x: 100, y: 100 }, data: { text: 'Hello Weavy!' } },
                 ]);
            }
        } catch (error) {
            console.error("Failed to load workflow", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    loadWorkflow();
  }, [setNodes, setEdges]);
  
  // Update nodes with execution status
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          status: nodeStatuses[node.id], // Pass status to node data
        },
      }))
    );
  }, [nodeStatuses, setNodes]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) return;

      const position = reactFlowInstance?.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: getId(),
        type,
        position: position || { x: 0, y: 0 },
        data: { text: classNameByNode(type) }, 
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );
  
  // Helper to init default data based on type
  const classNameByNode = (type: string) => {
      if (type === 'textNode') return 'New Text';
      return `${type}`;
  };

  const onSave = async () => {
    if (!reactFlowInstance) return;
    const flow = reactFlowInstance.toObject();
    try {
        await fetch('/api/workflows', {
            method: 'POST',
            body: JSON.stringify(flow),
        });
        alert("Workflow Saved!");
    } catch (error) {
        console.error("Failed to save", error);
        alert("Failed to save workflow");
    }
  };
  
  const onRun = async () => {
      if (isRunning) return;
      setIsRunning(true);
      setNodeStatuses({}); // Reset statuses
      
      try {
          await runWorkflowMock({
              nodes,
              edges,
              onStatusUpdate: (nodeId, status) => {
                  setNodeStatuses((prev) => ({ ...prev, [nodeId]: status }));
              }
          });
      } catch (err) {
          console.error("Execution failed", err);
      } finally {
          setIsRunning(false);
      }
  };

  const nodeTypes = useMemo(() => ({
    textNode: TextNode,
    imageNode: ImageNode,
    videoNode: VideoNode,
    llmNode: LlmNode,
    cropNode: CropNode,
    extractNode: ExtractNode,
  }), []);
  
  if (isLoading) {
      return <div className="w-full h-full flex items-center justify-center text-slate-400">Loading Workflow...</div>;
  }

  return (
    <div className="w-full h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <MiniMap zoomable pannable className="bg-slate-50 border border-slate-200" />
        <Panel position="top-right" className="flex gap-2">
             <button 
                onClick={onRun}
                disabled={isRunning}
                 className="bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white px-4 py-2 rounded-md shadow flex items-center gap-2 text-sm font-medium transition-colors"
             >
                {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
                {isRunning ? "Running..." : "Run Workflow"}
             </button>
             <button 
                onClick={onSave}
                disabled={isRunning}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white px-4 py-2 rounded-md shadow flex items-center gap-2 text-sm font-medium transition-colors"
             >
                <Save size={16} />
                Save
             </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
