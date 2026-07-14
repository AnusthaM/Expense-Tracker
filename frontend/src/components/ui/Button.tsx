import * as React from "react";
import { Loader2 } from "lucide-react";

const variants: Record<string, string> = {
  primary: "bg-primary-800 text-white hover:bg-primary-700",
  accent: "bg-accent-500 text-white hover:bg-accent-600",
  income: "bg-income-500 text-white hover:bg-income-600",
  expense: "bg-expense-500 text-white hover:bg-expense-600",
  outline: "border-2 border-surface-border bg-surface text-primary-700 hover:bg-primary-50",
  ghost: "text-primary-600 hover:bg-primary-50",
  danger: "bg-expense-500 text-white hover:bg-expense-600",
};

const sizes: Record<string, string> = {
  sm: "h-9 px-3 text-xs rounded-lg",
  md: "h-10 px-4 py-2 text-sm rounded-xl",
  lg: "h-11 px-6 text-base rounded-xl",
  icon: "h-10 w-10 rounded-xl",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "accent", size = "md", loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2
        disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]
        ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  )
);
Button.displayName = "Button";

export { Button };