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
import { Save } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

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

  // Load workflow on mount
  useEffect(() => {
    const loadWorkflow = async () => {
        try {
            const res = await fetch('/api/workflows');
            const data = await res.json();
            
            if (data) {
                const parsedNodes = JSON.parse(data.nodes as string);
                const parsedEdges = JSON.parse(data.edges as string);
                // Restore logic: ensure nodes/edges are set
                if (parsedNodes) setNodes(parsedNodes);
                if (parsedEdges) setEdges(parsedEdges);
            } else {
                // If no workflow, set initial defaults
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
        <Panel position="top-right">
             <button 
                onClick={onSave}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow flex items-center gap-2 text-sm font-medium transition-colors"
             >
                <Save size={16} />
                Save Workflow
             </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
