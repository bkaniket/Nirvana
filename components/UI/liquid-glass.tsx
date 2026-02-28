"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LiquidGlassCardProps {
    children: React.ReactNode;
    className?: string;
    glowIntensity?: "sm" | "md" | "lg";
    shadowIntensity?: "sm" | "md" | "lg";
    blurIntensity?: "sm" | "md" | "lg";
    borderRadius?: string;
}

export function LiquidGlassCard({
    children,
    className,
    glowIntensity = "md",
    shadowIntensity = "md",
    blurIntensity = "md",
    borderRadius = "20px",
}: LiquidGlassCardProps) {
    const blurMap = {
        sm: "backdrop-blur-md",
        md: "backdrop-blur-xl",
        lg: "backdrop-blur-2xl",
    };

    const shadowMap = {
        sm: "shadow-lg",
        md: "shadow-2xl",
        lg: "shadow-[0_20px_60px_rgba(0,0,0,0.4)]",
    };

    return (
        <div
            style={{ borderRadius }}
            className={cn(
                "relative bg-white/15 border border-white/30",
                blurMap[blurIntensity],
                shadowMap[shadowIntensity],
                "transition-all duration-500",
                className
            )}
        >
            <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-br from-white/20 via-transparent to-white/10 pointer-events-none" />
            <div className="relative z-10">{children}</div>
        </div>
    );
}