"use client";

import { memo } from "react";
import { Position, useEdges, NodeProps } from "reactflow";
import { Film } from "lucide-react";
import { BaseNode } from "./BaseNode";
import { cn } from "@/lib/utils";

export function ExtractNode({ id, data, selected }: NodeProps) {
  const edges = useEdges();

  const isHandleConnected = (handleId: string) => {
    return edges.some((edge) => edge.target === id && edge.targetHandle === handleId);
  };

  const isVideoConnected = isHandleConnected("video_url");
  const isTimeConnected = isHandleConnected("timestamp");

  return (
    <BaseNode
      title="Extract Frame"
      icon={Film}
      selected={selected}
      handles={[
        { type: "target", position: Position.Left, id: "video_url", style: { top: 60 } },
        { type: "target", position: Position.Left, id: "timestamp", style: { top: 125 } },
        { type: "source", position: Position.Right, id: "output" }
      ]}
    >
      <div className="flex flex-col gap-3 w-64">
        {/* Video Input Status */}
        <div className="flex flex-col gap-1.5">
           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
             Input Video
             {isVideoConnected && <span className="text-blue-500 text-[9px] lowercase font-normal">(connected)</span>}
           </label>
           <div className={cn(
               "w-full p-2 border border-slate-200 rounded-md flex items-center justify-center text-xs text-slate-400",
               isVideoConnected ? "bg-slate-100" : "bg-slate-50 border-dashed"
           )}>
               {isVideoConnected ? "Video provided via connection" : "Connect a Video Node"}
           </div>
        </div>

        {/* Timestamp Input */}
        <div className="flex flex-col gap-1.5 relative">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
            Timestamp
            {isTimeConnected && <span className="text-blue-500 text-[9px] lowercase font-normal">(connected)</span>}
          </label>
          <input
            type="text"
            className={cn(
                "w-full p-2 text-xs border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors",
                isTimeConnected ? "bg-slate-100 text-slate-500 cursor-not-allowed" : "bg-white focus:border-blue-500"
            )}
            placeholder="e.g. 50% or 10.5"
            disabled={isTimeConnected}
            defaultValue={data.timestamp}
            onChange={(e) => data.timestamp = e.target.value}
          />
          <span className="text-[9px] text-slate-400">Seconds (e.g. 10.5) or Percentage (e.g. 50%)</span>
        </div>
      </div>
    </BaseNode>
  );
}

export default memo(ExtractNode);
