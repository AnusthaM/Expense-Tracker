import React from "react";
import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

const sizes = { sm: "h-8 w-8", md: "h-12 w-12", lg: "h-16 w-16" };
const dots = { sm: "h-1.5 w-1.5", md: "h-2 w-2", lg: "h-2.5 w-2.5" };

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = "md", text }) => (
  <div className="flex flex-col items-center justify-center gap-4">
    <div className="relative">
      {/* Outer ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className={`${sizes[size]} rounded-full border-2 border-accent-100 border-t-accent-500`}
      />
      {/* Inner ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={`absolute inset-1.5 ${sizes[size].replace('h-', 'h-').replace('w-', 'w-')} rounded-full border-2 border-transparent border-t-income-400`}
      />
    </div>
    {text && (
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-sm font-medium text-primary-400"
      >
        {text}
      </motion.p>
    )}
  </div>
);

// Page-level loading
export const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-surface-secondary">
    <div className="text-center">
      <div className="relative mb-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="border-2 rounded-full h-14 w-14 border-accent-100"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="absolute w-10 h-10 border-2 border-transparent rounded-full top-2 left-2 border-t-accent-500"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
        >
          <span className="text-xl">💰</span>
        </motion.div>
      </div>
      <motion.p
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-sm font-medium text-primary-400"
      >
        Loading your finances...
      </motion.p>
    </div>
  </div>
);