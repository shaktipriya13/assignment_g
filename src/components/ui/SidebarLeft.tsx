"use client";

import { useState } from "react";
import { 
  Type, 
  ImageIcon, 
  Video, 
  BrainCircuit, 
  Crop, 
  Film, 
  ChevronLeft, 
  ChevronRight,
  Search,
  GripVertical
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

const NODE_TYPES = [
  { type: "textNode", label: "Text Node", icon: Type },
  { type: "imageNode", label: "Upload Image", icon: ImageIcon },
  { type: "videoNode", label: "Upload Video", icon: Video },
  { type: "llmNode", label: "Run Any LLM", icon: BrainCircuit },
  { type: "cropNode", label: "Crop Image", icon: Crop },
  { type: "extractNode", label: "Extract Frame", icon: Film },
];

export function SidebarLeft() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "bg-white border-r border-slate-200 h-full transition-all duration-300 flex flex-col relative z-20",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header / Collapse Toggle */}
      <div className="h-14 border-b border-slate-200 flex items-center justify-between px-3">
        {!collapsed && <span className="font-semibold text-slate-800">Nodes</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Search (Hidden when collapsed) */}
      {!collapsed && (
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search nodes..." 
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      )}

      {/* Node List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {!collapsed && <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2 mt-2">Quick Access</h3>}
        
        {NODE_TYPES.map((node) => (
          <div
            key={node.type}
            className={cn(
              "flex items-center gap-3 p-2 rounded-lg cursor-grab hover:bg-slate-50 hover:border-blue-200 border border-transparent transition-all group",
              collapsed ? "justify-center" : "px-3"
            )}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData("application/reactflow", node.type);
              event.dataTransfer.effectAllowed = "move";
            }}
          >
            <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-blue-100 group-hover:border-blue-200 transition-colors">
              <node.icon size={18} />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">{node.label}</span>
              </div>
            )}
            {!collapsed && <GripVertical className="ml-auto text-slate-300 opacity-0 group-hover:opacity-100" size={14} />}
          </div>
        ))}
      </div>

      {/* Footer / User Profile */}
      <div className={cn(
        "border-t border-slate-200 flex items-center gap-3",
        collapsed ? "p-2 justify-center" : "p-4"
      )}>
         <SignedIn>
            <UserButton showName={!collapsed} />
         </SignedIn>
         <SignedOut>
             <SignInButton mode="modal">
                <button className={cn(
                    "flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors",
                     collapsed && "justify-center"
                )}>
                    {collapsed ? <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold">L</div> : "Log In"}
                </button>
             </SignInButton>
         </SignedOut>
      </div>
    </aside>
  );
}
