import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};

const config = {
  success: {
    icon: CheckCircle,
    bg: "bg-income-50",
    border: "border-income-200",
    text: "text-income-700",
    iconColor: "text-income-500",
  },
  error: {
    icon: XCircle,
    bg: "bg-expense-50",
    border: "border-expense-200",
    text: "text-expense-700",
    iconColor: "text-expense-500",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    iconColor: "text-amber-500",
  },
  info: {
    icon: Info,
    bg: "bg-accent-50",
    border: "border-accent-200",
    text: "text-accent-700",
    iconColor: "text-accent-500",
  },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed w-full max-w-sm space-y-2 pointer-events-none bottom-4 right-4 z-100">
        <AnimatePresence>
          {toasts.map(toast => {
            const c = config[toast.type];
            const Icon = c.icon;
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 24, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.95 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={`pointer-events-auto ${c.bg} ${c.border} border rounded-2xl shadow-lg p-4 flex items-start gap-3`}
              >
                <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${c.iconColor}`} />
                <p className={`text-sm font-medium flex-1 ${c.text}`}>{toast.message}</p>
                <button
                  onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                  className="shrink-0 p-0.5 rounded-lg hover:bg-black/5 transition-colors"
                >
                  <X className="w-4 h-4 text-primary-400" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};