"use client";

import { Handle, Position, HandleProps } from "reactflow";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BaseNodeProps {
  title: string;
  icon: LucideIcon;
  children?: React.ReactNode;
  selected?: boolean;
  isRunning?: boolean; // For future execution glow
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
  isRunning,
  handles = [] 
}: BaseNodeProps) {
  return (
    <div 
      className={cn(
        "bg-white rounded-lg border-2 shadow-sm min-w-[300px] transition-all duration-200",
        selected ? "border-blue-500 shadow-md ring-2 ring-blue-500/20" : "border-slate-200",
        isRunning && "ring-4 ring-amber-400/50 border-amber-400 animate-pulse"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-slate-100 bg-slate-50/50 rounded-t-lg">
        <div className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm shrink-0">
          <Icon size={16} />
        </div>
        <span className="font-semibold text-slate-700 text-sm">{title}</span>
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
