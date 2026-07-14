import * as React from "react";
import { motion } from "framer-motion";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  delay = 0,
  hover = false,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay, ease: "easeOut" }}
    whileHover={hover ? { y: -2 } : undefined}
    className={`bg-surface rounded-xl border border-surface-border shadow-sm p-6
      ${hover ? "hover:shadow-md transition-shadow duration-300 cursor-pointer" : ""}
      ${className}`}
  >
    {children}
  </motion.div>
);

export const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`flex items-center justify-between mb-4 ${className}`}>
    {children}
  </div>
);

export const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <h3 className={`text-base font-semibold text-primary-700 ${className}`}>
    {children}
  </h3>
);
