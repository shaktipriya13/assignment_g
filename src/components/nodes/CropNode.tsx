"use client";

import { memo } from "react";
import { Position, useEdges, NodeProps } from "reactflow";
import { Crop } from "lucide-react";
import { BaseNode } from "./BaseNode";
import { cn } from "@/lib/utils";

export function CropNode({ id, data, selected }: NodeProps) {
  const edges = useEdges();

  const isHandleConnected = (handleId: string) => {
    return edges.some((edge) => edge.target === id && edge.targetHandle === handleId);
  };

  const isXConnected = isHandleConnected("x_percent");
  const isYConnected = isHandleConnected("y_percent");
  const isWConnected = isHandleConnected("width_percent");
  const isHConnected = isHandleConnected("height_percent");
  const isImageConnected = isHandleConnected("image_url");

  const renderInput = (
    label: string, 
    handleId: string, 
    field: string, 
    isConnected: boolean, 
    placeholder: string,
    defaultValue: string | number
  ) => (
    <div className="flex flex-col gap-1 relative">
      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
        {label}
        {isConnected && <span className="text-blue-500 text-[8px] lowercase font-normal">(connected)</span>}
      </label>
      <input 
        type="text"
        className={cn(
            "w-full p-1.5 text-xs border border-slate-200 rounded text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors",
            isConnected ? "bg-slate-100 text-slate-500 cursor-not-allowed" : "bg-white focus:border-blue-500"
        )}
        placeholder={placeholder}
        disabled={isConnected}
        defaultValue={defaultValue}
        onChange={(e) => data[field] = e.target.value}
      />
    </div>
  );

  return (
    <BaseNode
      title="Crop Image"
      icon={Crop}
      selected={selected}
      handles={[
        { type: "target", position: Position.Left, id: "image_url", style: { top: 90 } },
        { type: "target", position: Position.Left, id: "x_percent", style: { top: 165 } },
        { type: "target", position: Position.Left, id: "y_percent", style: { top: 225 } },
        { type: "target", position: Position.Left, id: "width_percent", style: { top: 285 } },
        { type: "target", position: Position.Left, id: "height_percent", style: { top: 345 } },
        { type: "source", position: Position.Right, id: "output" }
      ]}
    >
      <div className="flex flex-col gap-3 w-64">
        {/* Image Input Status */}
        <div className="flex flex-col gap-1.5">
           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
             Input Image
             {isImageConnected && <span className="text-blue-500 text-[9px] lowercase font-normal">(connected)</span>}
           </label>
           <div className={cn(
               "w-full p-2 border border-slate-200 rounded-md flex items-center justify-center text-xs text-slate-400",
               isImageConnected ? "bg-slate-100" : "bg-slate-50 border-dashed"
           )}>
               {isImageConnected ? "Image provided via connection" : "Connect an Image Node"}
           </div>
        </div>

        {/* Params */}
        {renderInput("X %", "x_percent", "x", isXConnected, "0", data.x || 0)}
        {renderInput("Y %", "y_percent", "y", isYConnected, "0", data.y || 0)}
        {renderInput("Width %", "width_percent", "width", isWConnected, "100", data.width || 100)}
        {renderInput("Height %", "height_percent", "height", isHConnected, "100", data.height || 100)}
      </div>
    </BaseNode>
  );
}

export default memo(CropNode);
