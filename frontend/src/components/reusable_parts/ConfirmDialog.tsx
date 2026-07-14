import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "../ui/Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  loading?: boolean;
  variant?: "danger" | "warning";
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  loading = false,
  variant = "danger",
}) => {
  const isDanger = variant === "danger";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
            className="relative w-full max-w-sm overflow-hidden shadow-2xl bg-surface rounded-2xl ring-1 ring-black/5"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              disabled={loading}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-primary-50 text-primary-300 hover:text-primary-500 transition-colors"
            >
              <X size={16} />
            </button>

            {/* Content */}
            <div className="px-6 pt-6 pb-2 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                  isDanger ? "bg-expense-50" : "bg-amber-50"
                }`}
              >
                <AlertTriangle className={`h-7 w-7 ${isDanger ? "text-expense-500" : "text-amber-500"}`} />
              </motion.div>
              <h3 className="text-lg font-semibold text-primary-800 mb-1.5">{title}</h3>
              <p className="text-sm leading-relaxed text-primary-500">{message}</p>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 pt-5 flex gap-2.5">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1 h-11 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant={isDanger ? "expense" : "accent"}
                onClick={onConfirm}
                loading={loading}
                className="flex-1 h-11 rounded-xl"
              >
                {isDanger ? "Delete" : "Confirm"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};