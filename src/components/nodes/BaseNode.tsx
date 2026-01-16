"use client";

import { Handle, Position, HandleProps } from "reactflow";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BaseNodeProps {
  title: string;
  icon: LucideIcon;
  children?: React.ReactNode;
  selected?: boolean;
  data?: any; // To access status
  handles?: {
    type: "source" | "target";
    position: Position;
    id?: string;
    style?: React.CSSProperties;
    className?: string;
  }[];
}

export function BaseNode({ 
  title, 
  icon: Icon, 
  children, 
  selected, 
  data,
  handles = [] 
}: BaseNodeProps) {
  
  const status = data?.status || "PENDING";
  const isRunning = status === "RUNNING";
  const isCompleted = status === "COMPLETED";
  const isFailed = status === "FAILED";

  return (
    <div 
      className={cn(
        "bg-white rounded-lg border-2 shadow-sm min-w-[300px] transition-all duration-300",
        selected ? "border-blue-500 shadow-md ring-2 ring-blue-500/20" : "border-slate-200",
        isRunning && "border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] ring-2 ring-blue-400/20",
        isCompleted && "border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]",
        isFailed && "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center gap-2 p-3 border-b transition-colors rounded-t-lg",
        isRunning ? "bg-blue-50 border-blue-100" : 
        isCompleted ? "bg-green-50 border-green-100" :
        "bg-slate-50/50 border-slate-100"
      )}>
        <div className={cn(
          "w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center shadow-sm shrink-0",
          isRunning ? "text-blue-600 border-blue-200 animate-pulse" : 
          isCompleted ? "text-green-600 border-green-200" :
          "text-slate-500"
        )}>
          <Icon size={16} />
        </div>
        <span className="font-semibold text-slate-700 text-sm">{title}</span>
        
         {/* Status Badge */}
         {status !== "PENDING" && (
            <span className={cn(
                "ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                isRunning ? "bg-blue-100 text-blue-700" :
                isCompleted ? "bg-green-100 text-green-700" :
                "bg-red-100 text-red-700"
            )}>
                {status}
            </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {children}
      </div>

      {/* Handles */}
      {handles.map((handle, index) => (
        <Handle
          key={`${handle.id || index}`}
          type={handle.type}
          position={handle.position}
          id={handle.id}
          className={cn(
            "w-3 h-3 bg-slate-400 border-2 border-white hover:bg-blue-500 transition-colors",
            handle.className
          )}
          style={handle.style}
        />
      ))}
    </div>
  );
}
