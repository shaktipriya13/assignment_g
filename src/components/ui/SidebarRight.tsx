"use client";

import { History, Clock } from "lucide-react";

export function SidebarRight() {
  return (
    <aside className="w-80 bg-white border-l border-slate-200 h-full flex flex-col z-20">
      <div className="h-14 border-b border-slate-200 flex items-center px-4 gap-2 bg-slate-50/50">
        <History size={18} className="text-slate-500" />
        <span className="font-semibold text-slate-800">Workflow History</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center text-slate-400 text-sm border-b border-slate-100">
          <div className="p-4 bg-slate-50 rounded-full mb-3">
             <Clock size={24} className="text-slate-300" />
          </div>
          <p>No run history yet</p>
      </div>
    </aside>
  );
}
