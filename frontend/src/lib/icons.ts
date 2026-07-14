import {
  Briefcase, Laptop, TrendingUp, Gift, UtensilsCrossed,
  Car, ShoppingBag, Film, Zap, Heart, BookOpen, Home,
  CreditCard, Coffee, Music, Smartphone, Globe, PiggyBank,
  GraduationCap, Stethoscope, Wrench, Shirt, Dumbbell,
  PawPrint, Plane, Gamepad2, Wifi, Droplets, Phone,
  type LucideIcon
} from "lucide-react";
import React from "react";

/**
 * Complete icon mapping for all categories.
 * Key = Icon name stored in database
 * Value = Lucide icon component
 */
export const iconMap: Record<string, LucideIcon> = {
  // Income icons
  "Briefcase": Briefcase,
  "Laptop": Laptop,
  "TrendingUp": TrendingUp,
  "Gift": Gift,
  "PiggyBank": PiggyBank,
  "Globe": Globe,
  
  // Expense icons
  "UtensilsCrossed": UtensilsCrossed,
  "Car": Car,
  "ShoppingBag": ShoppingBag,
  "Film": Film,
  "Zap": Zap,
  "Heart": Heart,
  "BookOpen": BookOpen,
  "Home": Home,
  "CreditCard": CreditCard,
  "Coffee": Coffee,
  "Music": Music,
  "Smartphone": Smartphone,
  "GraduationCap": GraduationCap,
  "Stethoscope": Stethoscope,
  "Wrench": Wrench,
  "Shirt": Shirt,
  "Dumbbell": Dumbbell,
  "PawPrint": PawPrint,
  "Plane": Plane,
  "Gamepad2": Gamepad2,
  "Wifi": Wifi,
  "Droplets": Droplets,
  "Phone": Phone,
};

/**
 * Get icon component by icon name.
 */
export function getIcon(iconName?: string | null, defaultIcon?: LucideIcon): LucideIcon {
  if (!iconName) return defaultIcon || ShoppingBag;
  return iconMap[iconName] || defaultIcon || ShoppingBag;
}

/**
 * Get icon element with proper styling.
 */
export function getIconElement(iconName?: string | null, className?: string, defaultIcon?: LucideIcon): React.ReactNode {
  const Icon = getIcon(iconName, defaultIcon);
  return React.createElement(Icon, { className: className || "h-5 w-5" });
}

/**
 * Get category color based on type and icon name.
 */
// In src/lib/icons.ts, update getCategoryColor:

export function getCategoryColor(type: string, iconName?: string): string {
  if (type === "income") return "bg-income-100 text-income-600";
  
  const colorMap: Record<string, string> = {
    "UtensilsCrossed": "bg-orange-100 text-orange-600",
    "Car": "bg-sky-100 text-sky-600",
    "ShoppingBag": "bg-pink-100 text-pink-600",
    "Film": "bg-purple-100 text-purple-600",
    "Zap": "bg-yellow-100 text-yellow-600",
    "Heart": "bg-rose-100 text-rose-600",
    "BookOpen": "bg-indigo-100 text-indigo-600",
    "Home": "bg-amber-100 text-amber-700",
    "CreditCard": "bg-slate-100 text-slate-600",
    "Coffee": "bg-amber-100 text-amber-700",
    "Wifi": "bg-cyan-100 text-cyan-600",
    "Plane": "bg-sky-100 text-sky-600",
    "Gamepad2": "bg-violet-100 text-violet-600",
    "PawPrint": "bg-rose-100 text-rose-600",
    "Dumbbell": "bg-emerald-100 text-emerald-600",
  };
  
  return colorMap[iconName || ""] || "bg-expense-100 text-expense-600";
}

/**
 * List of available icons for category creation form.
 */
export const availableIcons = [
  { name: "Briefcase", label: "Salary", type: "income" },
  { name: "Laptop", label: "Freelance", type: "income" },
  { name: "TrendingUp", label: "Investments", type: "income" },
  { name: "Gift", label: "Gifts", type: "income" },
  { name: "PiggyBank", label: "Savings", type: "income" },
  { name: "Globe", label: "Online", type: "income" },
  { name: "UtensilsCrossed", label: "Food", type: "expense" },
  { name: "Car", label: "Transport", type: "expense" },
  { name: "ShoppingBag", label: "Shopping", type: "expense" },
  { name: "Film", label: "Entertainment", type: "expense" },
  { name: "Zap", label: "Utilities", type: "expense" },
  { name: "Heart", label: "Healthcare", type: "expense" },
  { name: "BookOpen", label: "Education", type: "expense" },
  { name: "Home", label: "Housing", type: "expense" },
  { name: "CreditCard", label: "Subscriptions", type: "expense" },
  { name: "Coffee", label: "Coffee", type: "expense" },
  { name: "Wifi", label: "Internet", type: "expense" },
  { name: "Plane", label: "Travel", type: "expense" },
  { name: "Gamepad2", label: "Gaming", type: "expense" },
  { name: "PawPrint", label: "Pets", type: "expense" },
  { name: "Dumbbell", label: "Fitness", type: "expense" },
  { name: "Shirt", label: "Clothing", type: "expense" },
  { name: "Phone", label: "Phone Bill", type: "expense" },
  { name: "Droplets", label: "Water", type: "expense" },
  { name: "Wrench", label: "Repairs", type: "expense" },
];