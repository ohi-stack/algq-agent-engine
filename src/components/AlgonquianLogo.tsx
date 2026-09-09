/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface AlgonquianLogoProps {
  variant?: "full" | "emblem" | "compact" | "horizontal";
  theme?: "dark" | "light";
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function AlgonquianEmblem({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 160 80" 
      className={className} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Algonquian Real Estate Stepped Geometric Emblem"
    >
      <defs>
        <linearGradient id="algGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5D77F" />
          <stop offset="50%" stopColor="#D1A54A" />
          <stop offset="100%" stopColor="#A87B28" />
        </linearGradient>
        <linearGradient id="algBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2E86DE" />
          <stop offset="50%" stopColor="#1B4F8B" />
          <stop offset="100%" stopColor="#0B2B4C" />
        </linearGradient>
        <linearGradient id="algCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#48DBFB" />
          <stop offset="100%" stopColor="#0ABDE3" />
        </linearGradient>
        <filter id="goldGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#D1A54A" floodOpacity="0.4"/>
        </filter>
      </defs>

      {/* Symmetrical Stepped Wings - Tier 1 (Outermost Top Wings) */}
      <polygon points="12,46 30,46 30,52 12,52" fill="url(#algGoldGrad)" />
      <polygon points="130,46 148,46 148,52 130,52" fill="url(#algGoldGrad)" />

      {/* Tier 2 - Stepped Blue & Gold Brackets */}
      <polygon points="24,38 46,38 46,44 24,44" fill="url(#algBlueGrad)" />
      <polygon points="114,38 136,38 136,44 114,44" fill="url(#algBlueGrad)" />
      <polygon points="34,32 58,32 58,38 34,38" fill="url(#algGoldGrad)" />
      <polygon points="102,32 126,32 126,38 102,38" fill="url(#algGoldGrad)" />

      {/* Tier 3 - Inward Stepped Columns */}
      <polygon points="46,24 68,24 68,30 46,30" fill="url(#algBlueGrad)" />
      <polygon points="92,24 114,24 114,30 92,30" fill="url(#algBlueGrad)" />
      <polygon points="56,18 76,18 76,24 56,24" fill="url(#algGoldGrad)" />
      <polygon points="84,18 104,18 104,24 84,24" fill="url(#algGoldGrad)" />

      {/* Central Base Foundation Bar */}
      <polygon points="32,56 128,56 128,62 32,62" fill="url(#algBlueGrad)" stroke="url(#algGoldGrad)" strokeWidth="1" />

      {/* Central Diamond (The Iconic Apex Crown) */}
      <g filter="url(#goldGlow)">
        {/* Outer Gold Diamond */}
        <polygon 
          points="80,4 104,28 80,52 56,28" 
          fill="url(#algGoldGrad)" 
          stroke="#5B4010" 
          strokeWidth="1.2"
        />
        {/* Inner Midnight Blue Diamond */}
        <polygon 
          points="80,10 98,28 80,46 62,28" 
          fill="url(#algBlueGrad)" 
        />
        {/* Cyan Accents Inside Diamond */}
        <polygon 
          points="80,15 93,28 80,41 67,28" 
          fill="#0B2038"
          stroke="url(#algGoldGrad)"
          strokeWidth="1.2"
        />
        {/* Diamond Center Star / Gem */}
        <polygon 
          points="80,21 87,28 80,35 73,28" 
          fill="url(#algGoldGrad)" 
        />
      </g>

      {/* Horizontal Anchor Accent Lines */}
      <line x1="10" y1="67" x2="150" y2="67" stroke="url(#algGoldGrad)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function AlgonquianLogo({
  variant = "full",
  theme = "dark",
  className = "",
  size = "md"
}: AlgonquianLogoProps) {
  const isDark = theme === "dark";

  const sizeClasses = {
    sm: "h-9",
    md: "h-14",
    lg: "h-20",
    xl: "h-28"
  };

  if (variant === "emblem") {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <AlgonquianEmblem className={sizeClasses[size] || "h-10"} />
      </div>
    );
  }

  if (variant === "horizontal") {
    return (
      <div className={`inline-flex items-center gap-3.5 ${className}`}>
        <AlgonquianEmblem className="h-10 w-auto shrink-0" />
        <div className="flex flex-col">
          <span 
            className={`font-serif text-lg font-bold tracking-[0.16em] leading-none ${
              isDark ? "text-white" : "text-[#0B2B4C]"
            }`}
          >
            ALGONQUIAN
          </span>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-px w-3 bg-[#D1A54A]" />
            <span className="text-[9px] font-sans font-bold tracking-[0.24em] text-[#D1A54A] uppercase whitespace-nowrap">
              REAL ESTATE, LLC
            </span>
            <div className="h-px w-3 bg-[#D1A54A]" />
          </div>
        </div>
      </div>
    );
  }

  // Default "full" stacked official logo lockup as seen on official merchandise & website
  return (
    <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
      {/* Stepped Pyramid & Diamond Emblem */}
      <AlgonquianEmblem className={`${sizeClasses[size]} w-auto drop-shadow-md mb-1.5`} />

      {/* Brand Title: Serif Roman Capitals */}
      <h1 
        className={`font-serif font-black tracking-[0.18em] leading-none text-center ${
          size === "sm" ? "text-sm" : size === "md" ? "text-xl" : size === "lg" ? "text-2xl" : "text-3xl"
        } ${isDark ? "text-white drop-shadow-sm" : "text-[#0B2B4C]"}`}
      >
        ALGONQUIAN
      </h1>

      {/* Subtitle with Flanking Gold Rules */}
      <div className="flex items-center justify-center gap-2.5 w-full mt-1.5">
        <div className={`h-[1px] flex-1 max-w-[28px] ${isDark ? "bg-[#D1A54A]/80" : "bg-[#B8860B]"}`} />
        <span 
          className={`font-sans font-bold tracking-[0.22em] uppercase text-center ${
            size === "sm" ? "text-[8px]" : size === "md" ? "text-[10px]" : "text-xs"
          } text-[#D1A54A] whitespace-nowrap`}
        >
          REAL ESTATE, LLC
        </span>
        <div className={`h-[1px] flex-1 max-w-[28px] ${isDark ? "bg-[#D1A54A]/80" : "bg-[#B8860B]"}`} />
      </div>

      {/* Slogan Pill (Optional Subtle Badge) */}
      {size === "lg" || size === "xl" ? (
        <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-2 font-mono">
          Properties • People • Solutions • Stronger Communities
        </span>
      ) : null}
    </div>
  );
}
