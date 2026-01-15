"use client";

import { memo } from "react";
import { Position } from "reactflow";
import { Type } from "lucide-react";
import { BaseNode } from "./BaseNode";

export function TextNode({ data, selected }: { data: { text?: string; }, selected?: boolean }) {
  return (
    <BaseNode
      title="Text Node"
      icon={Type}
      selected={selected}
      handles={[
        { type: "source", position: Position.Right, id: "output" }
      ]}
    >
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-slate-500 uppercase">Text Content</label>
        <textarea 
          className="w-full h-24 p-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none font-mono text-slate-700 placeholder:text-slate-300"
          placeholder="Enter text here..."
          defaultValue={data.text}
          onKeyDown={(e) => {
            // Stop propagation to prevent deleting node when typing backspace
            e.stopPropagation();
          }}
          onChange={(e) => {
             // For now we mutate data directly or we could use useReactFlow to update
             data.text = e.target.value;
          }}
        />
      </div>
    </BaseNode>
  );
}

export default memo(TextNode);
