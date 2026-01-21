'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { getVibrationAdapter, VibrationPatterns } from '@/lib/vibration';

type MagicButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'shimmer' | 'border-beam';
  disabled?: boolean;
};

export const MagicButton = ({ children, onClick, className = '', variant = 'shimmer', disabled = false }: MagicButtonProps) => {
  const handleAction = () => {
    if (!disabled) {
      const vibration = getVibrationAdapter();
      vibration.vibrate(VibrationPatterns.tap);
      onClick?.();
    }
  };

  if (variant === 'border-beam') {
    return (
      <button
        onClick={handleAction}
        disabled={disabled}
        className={`relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 opacity-90 hover:opacity-100 transition-opacity ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-white backdrop-blur-3xl">
          {children}
        </span>
      </button>
    );
  }

  // Default: Shimmer
  return (
    <button
      onClick={handleAction}
      disabled={disabled}
      className={`inline-flex h-12 w-full animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
      <style jsx>{`
            @keyframes shimmer {
              from {
                background-position: 0 0;
              }
              to {
                background-position: -200% 0;
              }
            }
            .animate-shimmer {
              animation: shimmer 2.5s linear infinite;
            }
          `}</style>
    </button>
  );
};
