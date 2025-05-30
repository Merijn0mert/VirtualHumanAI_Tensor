"use client";

import { useState } from "react";

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    // Here you would integrate with a text-to-speech service
  };

  return (
    <div className="inline-flex items-center bg-[#F9FAFB] border border-[#E5E7EB] rounded">
      <button className="p-1.5 border-r border-[#E5E7EB] hover:bg-[#F3F4F6]">
        <svg
          className="w-4 h-4 text-[#666666]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <button
        onClick={togglePlay}
        className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#F3F4F6]"
      >
        <svg
          className="w-4 h-4 text-[#666666]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.5 8.788v6.424a.5.5 0 00.757.429l5.5-3.212a.5.5 0 000-.858l-5.5-3.212a.5.5 0 00-.757.429z"
          />
        </svg>
        <span className="text-sm font-medium text-[#333333]">Read Forward</span>
      </button>
      <button className="p-1.5 border-l border-[#E5E7EB] hover:bg-[#F3F4F6]">
        <svg
          className="w-4 h-4 text-[#666666]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}
