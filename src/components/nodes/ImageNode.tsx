"use client";

import { memo, useRef, useState } from "react";
import { Position } from "reactflow";
import { ImageIcon, Upload } from "lucide-react";
import { BaseNode } from "./BaseNode";
import { cn } from "@/lib/utils";

export function ImageNode({ data, selected }: { data: { imageUrl?: string; }, selected?: boolean }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Local state for preview if not in data yet (or to show immediate feedback)
  const [preview, setPreview] = useState<string | undefined>(data.imageUrl);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      data.imageUrl = url; // Update node data
    }
  };

  return (
    <BaseNode
      title="Upload Image"
      icon={ImageIcon}
      selected={selected}
      handles={[
        { type: "source", position: Position.Right, id: "image" }
      ]}
    >
      <div className="flex flex-col gap-3">
        {/* Preview Area */}
        <div 
            className={cn(
                "w-full h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center overflow-hidden relative group cursor-pointer hover:bg-slate-100 transition-colors",
                preview ? "border-solid border-blue-200" : ""
            )}
            onClick={() => fileInputRef.current?.click()}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center text-slate-400 gap-2">
              <Upload size={24} />
              <span className="text-xs font-medium">Click to Upload</span>
            </div>
          )}
        </div>

        {/* Hidden Input */}
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden"
          accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
          onChange={handleFileChange}
        />
        
        <div className="text-[10px] text-slate-400 text-center">
            Supports JPG, PNG, WEBP, GIF
        </div>
      </div>
    </BaseNode>
  );
}

export default memo(ImageNode);
