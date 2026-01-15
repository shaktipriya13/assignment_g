"use client";

import { memo, useRef, useState } from "react";
import { Position } from "reactflow";
import { Video, Upload } from "lucide-react";
import { BaseNode } from "./BaseNode";
import { cn } from "@/lib/utils";

export function VideoNode({ data, selected }: { data: { videoUrl?: string; }, selected?: boolean }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(data.videoUrl);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      data.videoUrl = url;
    }
  };

  return (
    <BaseNode
      title="Upload Video"
      icon={Video}
      selected={selected}
      handles={[
        { type: "source", position: Position.Right, id: "video" }
      ]}
    >
      <div className="flex flex-col gap-3">
        <div 
            className={cn(
                "w-full h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center overflow-hidden relative group cursor-pointer hover:bg-slate-100 transition-colors",
                preview ? "border-solid border-blue-200" : ""
            )}
            onClick={() => !preview && fileInputRef.current?.click()}
        >
          {preview ? (
            <div className="relative w-full h-full group/video">
                <video src={preview} className="w-full h-full object-cover" controls />
                <button 
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/video:opacity-100 transition-opacity"
                >
                    Change
                </button>
            </div>
          ) : (
            <div className="flex flex-col items-center text-slate-400 gap-2">
              <Upload size={24} />
              <span className="text-xs font-medium">Click to Upload</span>
            </div>
          )}
        </div>

        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden"
          accept="video/mp4, video/quicktime, video/webm, video/x-m4v"
          onChange={handleFileChange}
        />
         <div className="text-[10px] text-slate-400 text-center">
            Supports MP4, MOV, WEBM
        </div>
      </div>
    </BaseNode>
  );
}

export default memo(VideoNode);
