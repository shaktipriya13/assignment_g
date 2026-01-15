"use client";

import { SidebarLeft } from "./SidebarLeft";
import { SidebarRight } from "./SidebarRight";

interface WorkflowLayoutProps {
  children: React.ReactNode;
}

export function WorkflowLayout({ children }: WorkflowLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      <SidebarLeft />
      
      <main className="flex-1 h-full relative z-10">
        {children}
      </main>

      <SidebarRight />
    </div>
  );
}
