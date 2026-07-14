import * as React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, label, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-primary-700 mb-1.5">
            {label}
          </label>
        )}
        <input
          id={inputId}
          className={`w-full h-11 px-4 rounded-xl border-2 bg-surface text-sm
            placeholder:text-primary-400 transition-all duration-200
            focus:outline-none focus:border-accent-400 focus:ring-4 focus:ring-accent-50
            disabled:opacity-50 disabled:bg-primary-50
            ${error ? 'border-expense-500 focus:border-expense-500 focus:ring-expense-50' : 'border-surface-border'}
            ${className}`}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-expense-600">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };