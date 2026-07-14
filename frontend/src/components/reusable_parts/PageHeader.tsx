import React from "react";
import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  children,
}) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
  >
    <div>
      <h2 className="text-2xl font-bold text-primary-800">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-primary-500">{subtitle}</p>}
    </div>
    {children && <div className="flex gap-2">{children}</div>}
  </motion.div>
);
