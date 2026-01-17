"use client";

import { useEffect, useState } from "react";
import { Clock, RefreshCw, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowRun {
  id: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  startedAt: string;
  completedAt?: string;
}

export function SidebarRight() {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/runs");
      if (res.ok) {
        const data = await res.json();
        setRuns(data);
      }
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  // Format date helper
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Calculate duration
  const getDuration = (start: string, end?: string) => {
    if (!end) return "-";
    const ms = new Date(end).getTime() - new Date(start).getTime();
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <aside className="w-80 bg-white border-l border-slate-200 h-full flex flex-col relative z-20">
      <div className="h-14 border-b border-slate-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
           <Clock size={16} className="text-slate-500" />
           <span className="font-semibold text-slate-800">Workflow History</span>
        </div>
        <button 
            onClick={fetchRuns}
            className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition-colors"
            title="Refresh History"
        >
            <RefreshCw size={14} className={cn(loading && "animate-spin")} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
         {runs.length === 0 && !loading && (
             <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-sm">
                 <Clock size={32} className="mb-2 opacity-20" />
                 No run history yet
             </div>
         )}
         
         {runs.map((run) => (
             <div key={run.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-sm transition-all group">
                 <div className="flex items-center justify-between mb-2">
                     <span className={cn(
                         "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1",
                         run.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                         run.status === "FAILED" ? "bg-red-100 text-red-700" :
                         "bg-blue-100 text-blue-700"
                     )}>
                         {run.status === "COMPLETED" ? <CheckCircle2 size={10} /> : 
                          run.status === "FAILED" ? <XCircle size={10} /> :
                          <Loader2 size={10} className="animate-spin" />}
                         {run.status}
                     </span>
                     <span className="text-[10px] text-slate-400">{formatDate(run.startedAt)}</span>
                 </div>
                 
                 <div className="flex items-center justify-between text-xs text-slate-500">
                     <span>Duration:</span>
                     <span className="font-mono font-medium">{getDuration(run.startedAt, run.completedAt)}</span>
                 </div>
                 
                 <div className="text-[10px] text-slate-400 mt-2 font-mono truncate">
                     ID: {run.id.slice(0, 8)}...
                 </div>
             </div>
         ))}
      </div>
    </aside>
  );
}
