import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Lock, User, Eye, EyeOff,
  AlertCircle, CheckCircle2, TrendingUp, PiggyBank, BarChart3,
  ArrowLeft
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { useToast } from "../components/reusable_parts/Toast";
import apiClient from "../lib/api";
import { useNavigate } from "react-router-dom";

// ============================================
// SHARED FORM COMPONENT
// ============================================

interface AuthFormProps {
  mode: "login" | "register";
  onSwitch: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onSwitch }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "", email: "", password: "", confirmPassword: ""
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isLogin = mode === "login";

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.email) errors.email = "Email is required";
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email))
      errors.email = "Invalid email address";
    if (!formData.password) errors.password = "Password is required";
    else if (!isLogin && formData.password.length < 8)
      errors.password = "At least 8 characters";
    if (!isLogin && !formData.fullName) errors.fullName = "Full name is required";
    if (!isLogin && formData.password !== formData.confirmPassword)
      errors.confirmPassword = "Passwords do not match";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setLoading(true);

    try {
      if (isLogin) {
        const userData = await apiClient.login(formData.email, formData.password);
        localStorage.setItem("user", JSON.stringify(userData));
        showToast("success", `Welcome back, ${userData.fullName}!`);
        navigate("/");
      } else {
        const userData = await apiClient.register({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password
        });
        localStorage.setItem("user", JSON.stringify(userData));
        showToast("success", `Welcome, ${userData.fullName}!`);
        navigate("/");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const password = formData.password;
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password)
  };
  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;

  return (
    <div className="w-full max-w-sm mx-auto">
      {!isLogin && (
        <button onClick={onSwitch} className="flex items-center gap-4 mb-4 transition-colors text-primary-500 hover:text-primary-700">
          <ArrowLeft className="w-4 h-4" />
        </button>
      )}

      <div className="mb-4">
        <h1 className="text-3xl font-bold text-primary-800">{isLogin ? "Welcome Back" : "Create Account"}</h1>
        <p className="mt-2 text-primary-500">{isLogin ? "Sign in to your account" : "Start tracking your expenses"}</p>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-2 p-3 mb-2 border rounded-xl bg-expense-50 border-expense-200">
            <AlertCircle className="h-5 w-5 text-expense-500 shrink-0 mt-0.5" />
            <p className="text-sm text-expense-600">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-2">
        {!isLogin && (
          <div>
            <label className="text-sm font-medium text-primary-700 mb-1.5 block">Full Name</label>
            <div className="relative">
              <User className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-primary-400" />
              <input type="text" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} placeholder="John Doe"
                className="w-full pl-10 pr-3 text-sm transition-all border-2 h-11 rounded-xl border-surface-border bg-surface focus:outline-none focus:border-accent-400 focus:ring-4 focus:ring-accent-50" />
            </div>
            {fieldErrors.fullName && <p className="mt-1 text-xs text-expense-500">{fieldErrors.fullName}</p>}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-primary-700 mb-1.5 block">Email</label>
          <div className="relative">
            <Mail className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-primary-400" />
            <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="you@example.com"
              className="w-full pl-10 pr-3 text-sm transition-all border-2 h-11 rounded-xl border-surface-border bg-surface focus:outline-none focus:border-accent-400 focus:ring-4 focus:ring-accent-50" />
          </div>
          {fieldErrors.email && <p className="mt-1 text-xs text-expense-500">{fieldErrors.email}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-primary-700 mb-1.5 block">Password</label>
          <div className="relative">
            <Lock className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-primary-400" />
            <input type={showPassword ? "text" : "password"} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
              placeholder={isLogin ? "Enter your password" : "Create a strong password"}
              className="w-full pl-10 pr-10 text-sm transition-all border-2 h-11 rounded-xl border-surface-border bg-surface focus:outline-none focus:border-accent-400 focus:ring-4 focus:ring-accent-50" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute -translate-y-1/2 right-3 top-1/2 text-primary-400 hover:text-primary-600" tabIndex={-1} aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {fieldErrors.password && <p className="mt-1 text-xs text-expense-500">{fieldErrors.password}</p>}
        </div>

        {!isLogin && password && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-3 space-y-2 rounded-xl bg-primary-50">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(level => (
                <div key={level} className={`h-1 flex-1 rounded-full transition-colors ${level <= passwordStrength ? (passwordStrength <= 2 ? "bg-expense-500" : passwordStrength <= 4 ? "bg-amber-500" : "bg-income-500") : "bg-primary-200"}`} />
              ))}
            </div>
            <div className="space-y-1 text-xs">
              {[{ check: passwordChecks.length, label: "At least 8 characters" }, { check: passwordChecks.uppercase, label: "One uppercase letter" }, { check: passwordChecks.lowercase, label: "One lowercase letter" }, { check: passwordChecks.number, label: "One number" }, { check: passwordChecks.special, label: "One special character" }].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  {item.check ? <CheckCircle2 className="w-3 h-3 text-income-500" /> : <div className="w-3 h-3 border rounded-full border-primary-300" />}
                  <span className={item.check ? "text-income-700" : "text-primary-400"}>{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {!isLogin && (
          <div>
            <label className="text-sm font-medium text-primary-700 mb-1.5 block">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-primary-400" />
              <input type="password" value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} placeholder="Confirm your password"
                className="w-full pl-10 pr-3 text-sm transition-all border-2 h-11 rounded-xl border-surface-border bg-surface focus:outline-none focus:border-accent-400 focus:ring-4 focus:ring-accent-50" />
            </div>
            {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-expense-500">{fieldErrors.confirmPassword}</p>}
          </div>
        )}

        <Button type="submit" className="w-full h-11" variant="accent" loading={loading} disabled={loading}>
          {isLogin ? "Sign In" : "Create Account"}
        </Button>

        <p className="text-sm text-center text-primary-500">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button type="button" onClick={onSwitch} className="font-medium text-accent-500 hover:underline">
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </form>
    </div>
  );
};

// ============================================
// ILLUSTRATION PANEL
// ============================================

const IllustrationPanel: React.FC<{ variant: "login" | "register" }> = ({ variant }) => {
  const isLogin = variant === "login";
  return (
    <motion.div key={variant} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center h-full p-8 md:p-12">
      <div className={`absolute inset-0 ${isLogin ? "bg-linear-to-br from-accent-500 to-accent-700" : "bg-linear-to-br from-income-500 to-income-700"}`} />
      <div className="relative z-10 max-w-sm text-center text-white">
        <motion.div animate={{ y: [0, -12, 0], rotate: [0, 2, 0, -2, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="mb-8">
          <div className="relative inline-block">
            <div className="flex items-center justify-center rounded-full w-28 h-28 md:w-32 md:h-32 bg-white/20">
              {isLogin ? <TrendingUp className="text-white h-14 w-14 md:h-16 md:w-16" /> : <PiggyBank className="text-white h-14 w-14 md:h-16 md:w-16" />}
            </div>
            <div className="absolute flex items-center justify-center w-12 h-12 rounded-full -top-3 -right-3 md:w-14 md:h-14 bg-white/10">
              {isLogin ? <BarChart3 className="w-6 h-6 text-white md:h-7 md:w-7" /> : <TrendingUp className="w-6 h-6 text-white md:h-7 md:w-7" />}
            </div>
            <div className="absolute flex items-center justify-center w-10 h-10 rounded-full -bottom-3 -left-3 md:w-11 md:h-11 bg-white/10">
              {isLogin ? <PiggyBank className="w-5 h-5 text-white" /> : <BarChart3 className="w-5 h-5 text-white" />}
            </div>
          </div>
        </motion.div>
        <h2 className="mb-3 text-2xl font-bold md:text-3xl">{isLogin ? "Welcome Back!" : "Join Us Today!"}</h2>
        <p className="text-sm text-white/80 md:text-base">{isLogin ? "Track your expenses, manage your budget, and achieve your financial goals." : "Take control of your finances with smart expense tracking and insightful reports."}</p>
        <div className="mt-8 space-y-3 text-left">
          {["Track income and expenses", "Visualize spending patterns", "Set budget goals", "Export detailed reports"].map((feature, index) => (
            <motion.div key={index} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + index * 0.1 }} className="flex items-center gap-3 text-sm text-white/90">
              <CheckCircle2 className="w-4 h-4 text-white shrink-0" /><span>{feature}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// MAIN AUTH PAGE
// ============================================

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  return (
    <div className="flex min-h-screen">
      <div className="relative flex items-center justify-center flex-1 p-8 overflow-hidden">
        <AnimatePresence mode="wait">
          {isLogin ? (
            <motion.div key="login" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35, ease: "easeOut" }}>
              <AuthForm mode="login" onSwitch={() => setIsLogin(false)} />
            </motion.div>
          ) : (
            <motion.div key="register" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.35, ease: "easeOut" }}>
              <AuthForm mode="register" onSwitch={() => setIsLogin(true)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="relative flex-1 hidden overflow-hidden lg:flex">
        <AnimatePresence mode="wait">
          <IllustrationPanel key={isLogin ? "login" : "register"} variant={isLogin ? "login" : "register"} />
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Auth;