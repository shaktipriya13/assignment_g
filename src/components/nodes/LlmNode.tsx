"use client";

import { memo } from "react";
import { Position, useEdges, NodeProps } from "reactflow";
import { BrainCircuit, Play } from "lucide-react";
import { BaseNode } from "./BaseNode";
import { cn } from "@/lib/utils";

const MODELS = [
  { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
  { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
  { value: "gemini-pro-vision", label: "Gemini Pro Vision" },
];

export function LlmNode({ id, data, selected }: NodeProps) {
  const edges = useEdges();

  // Helper to check if a handle is connected
  const isHandleConnected = (handleId: string) => {
    return edges.some((edge) => edge.target === id && edge.targetHandle === handleId);
  };

  const isSystemConnected = isHandleConnected("system_prompt");
  const isUserConnected = isHandleConnected("user_message");
  const isImagesConnected = isHandleConnected("images");

  return (
    <BaseNode
      title="Run Any LLM"
      icon={BrainCircuit}
      selected={selected}
      handles={[
        { type: "target", position: Position.Left, id: "system_prompt", style: { top: 160 } },
        { type: "target", position: Position.Left, id: "user_message", style: { top: 265 } },
        { type: "target", position: Position.Left, id: "images", style: { top: 360 } },
        { type: "source", position: Position.Right, id: "output" }
      ]}
    >
      <div className="flex flex-col gap-4 w-72">
        {/* Model Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Model</label>
          <select 
            className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 text-slate-900"
            defaultValue={data.model || "gemini-1.5-pro"}
            onChange={(e) => data.model = e.target.value}
          >
            {MODELS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* System Prompt */}
        <div className="flex flex-col gap-1.5 relative">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
            System Prompt
            {isSystemConnected && <span className="text-blue-500 text-[9px] lowercase font-normal">(connected)</span>}
          </label>
          <textarea 
            className={cn(
                "w-full h-16 p-2 text-xs border border-slate-200 rounded-md resize-none font-mono transition-colors text-slate-900 placeholder:text-slate-400",
                isSystemConnected ? "bg-slate-100 text-slate-500 cursor-not-allowed" : "bg-white focus:border-blue-500"
            )}
            placeholder="You are a helpful assistant..."
            disabled={isSystemConnected}
            defaultValue={data.system_prompt}
            onChange={(e) => data.system_prompt = e.target.value}
          />
        </div>

        {/* User Message */}
        <div className="flex flex-col gap-1.5 relative">
           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
            User Message
            {isUserConnected && <span className="text-blue-500 text-[9px] lowercase font-normal">(connected)</span>}
          </label>
          <textarea 
            className={cn(
                "w-full h-20 p-2 text-xs border border-slate-200 rounded-md resize-none font-mono transition-colors text-slate-900 placeholder:text-slate-400",
                isUserConnected ? "bg-slate-100 text-slate-500 cursor-not-allowed" : "bg-white focus:border-blue-500"
            )}
            placeholder="Enter your prompt..."
            disabled={isUserConnected}
            defaultValue={data.user_message}
            onChange={(e) => data.user_message = e.target.value}
          />
        </div>

        {/* Images Input */}
        <div className="flex flex-col gap-1.5 relative">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
                Images
                {isImagesConnected && <span className="text-blue-500 text-[9px] lowercase font-normal">(connected)</span>}
            </label>
            <div className={cn(
                "w-full p-2 border border-slate-200 rounded-md flex items-center justify-center text-xs text-slate-400",
                isImagesConnected ? "bg-slate-100" : "bg-slate-50"
            )}>
                {isImagesConnected ? "Images provided via connection" : "No images selected"}
            </div>
        </div>

        {/* Run Button (Mock) */}
        <button className="w-full py-2 bg-slate-900 text-white rounded-md flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Play size={14} fill="currentColor" />
            <span className="text-xs font-semibold">Run Trigger Task</span>
        </button>

        {/* Output Area */}
        {data.output && (
             <div className="mt-2 pt-2 border-t border-slate-100">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Response</label>
                <div className="p-2 bg-blue-50/50 border border-blue-100 rounded text-xs text-slate-700 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {data.output}
                </div>
             </div>
        )}
      </div>
    </BaseNode>
  );
}

export default memo(LlmNode);
