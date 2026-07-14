import React from "react";
import type { LucideIcon } from "lucide-react";
import { BarChart3 } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: Icon = BarChart3, 
  title, 
  description, 
  action 
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <Icon className="w-10 h-10 mb-3 text-primary-300" />
    <p className="font-medium text-primary-500">{title}</p>
    {description && <p className="mt-1 text-sm text-primary-400">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);