import React, { useState, useRef, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Receipt, Tags, LogOut,
  Menu, X, ChevronLeft, User, Bell, ArrowRightLeft, Target,
  AlertTriangle, ChevronRight
} from "lucide-react";
import { Button } from "./ui/Button";
import { useIsMobile } from "../hooks/useMediaQuery";
import { useBudgetNotifications } from "../hooks/useBudgets";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { formatCurrency } from "../lib/utils";
import apiClient from "../lib/api";

// Safe user data extraction
const getUser = (): { fullName?: string; email?: string } => {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : {};
  } catch {
    localStorage.removeItem("user");
    return {};
  }
};

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [viewedNotifications, setViewedNotifications] = useLocalStorage<string[]>("viewedNotifications", []);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: notifications } = useBudgetNotifications();
  const user = getUser();

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile, location.pathname]);

  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient.logout();
    } catch {
      // Ignore - cookie will expire anyway
    }
    localStorage.removeItem("user");
    setProfileOpen(false);
    navigate("/auth");
  };

  const handleBellClick = () => {
    setNotificationsOpen(!notificationsOpen);
    if (!notificationsOpen && notifications && notifications.length > 0) {
      const currentIds = notifications.map(n => `${n.categoryName}-${n.percentageUsed}`);
      setViewedNotifications(currentIds);
    }
  };

  const newNotifications = notifications?.filter(n => {
    const id = `${n.categoryName}-${n.percentageUsed}`;
    return !viewedNotifications.includes(id);
  }) || [];

  const totalNew = newNotifications.length;
  const criticalCount = newNotifications.filter(n => n.status === "critical").length;

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/expenses", icon: Receipt, label: "Expenses" },
    { to: "/transactions", icon: ArrowRightLeft, label: "Transactions" },
    { to: "/categories", icon: Tags, label: "Categories" },
    { to: "/budgets", icon: Target, label: "Budgets" }
  ];

  const sidebarWidth = isMobile ? (sidebarOpen ? 280 : 0) : (sidebarExpanded ? 240 : 68);

  return (
    <div className="flex h-screen overflow-hidden bg-primary-50">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative z-50 flex flex-col h-full overflow-hidden text-white bg-primary-800 shrink-0"
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-primary-700 h-14">
          {sidebarExpanded || isMobile ? (
            <h1 className="text-lg font-bold whitespace-nowrap">ExpenseTracker</h1>
          ) : (
            <h1 className="mx-auto text-lg font-bold">💰</h1>
          )}
          {!isMobile && (
            <button
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="p-1.5 rounded-xl hover:bg-primary-700 text-primary-300 transition-colors"
              aria-label={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>
          )}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-xl hover:bg-primary-700 text-primary-300"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 mt-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => isMobile && setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 whitespace-nowrap
                ${isActive
                  ? "bg-accent-500 text-white shadow-sm"
                  : "text-primary-300 hover:bg-primary-700 hover:text-white"
                }`
              }
              title={!sidebarExpanded && !isMobile ? item.label : undefined}
              aria-label={item.label}
            >
              <item.icon className={`h-5 w-5 shrink-0 ${!sidebarExpanded && !isMobile ? 'mx-auto' : 'mr-3'}`} />
              {(sidebarExpanded || isMobile) && item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-3 border-t border-primary-700">
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className={`flex items-center gap-3 w-full p-2 rounded-xl
                       hover:bg-primary-700 transition-colors duration-200
                       ${!sidebarExpanded && !isMobile ? 'justify-center' : ''}`}
              aria-label="User menu"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent-500 shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              {(sidebarExpanded || isMobile) && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium truncate">{user.fullName || "User"}</p>
                  <p className="text-xs truncate text-primary-400">{user.email || ""}</p>
                </div>
              )}
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute bottom-full mb-2 bg-white rounded-xl shadow-lg border border-surface-border overflow-hidden z-50
                    ${sidebarExpanded || isMobile ? 'left-0 right-0' : 'left-0 w-48'}`}
                >
                  <div className="p-3 border-b border-surface-border">
                    <p className="text-sm font-medium text-primary-800">{user.fullName || "User"}</p>
                    <p className="text-xs text-primary-500">{user.email || ""}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-expense-600 hover:bg-expense-50 transition-colors"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-surface-border lg:px-6 h-14">
          <div className="flex items-center gap-3">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-xl hover:bg-primary-50"
                aria-label="Open sidebar"
              >
                <Menu size={20} className="text-primary-600" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <span className="hidden text-sm text-primary-500 sm:block">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </span>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={handleBellClick}
                className="relative p-2 transition-colors rounded-xl hover:bg-primary-50"
                aria-label={`Notifications${totalNew > 0 ? ` (${totalNew} new)` : ''}`}
              >
                <Bell className="w-5 h-5 text-primary-600" />
                {totalNew > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center">
                    {!notificationsOpen && (
                      <span className="absolute inline-flex w-full h-full rounded-full opacity-75 bg-accent-400 animate-ping"></span>
                    )}
                    <span className={`relative inline-flex rounded-full h-5 w-5 items-center justify-center text-xs font-bold text-white ${
                      criticalCount > 0 ? 'bg-expense-500' : 'bg-accent-500'
                    }`}>
                      {totalNew}
                    </span>
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 z-50 mt-2 overflow-hidden bg-white border shadow-lg w-80 rounded-xl border-surface-border"
                  >
                    <div className="flex items-center justify-between p-3 border-b border-surface-border">
                      <h3 className="text-sm font-semibold text-primary-800">Budget Alerts</h3>
                      {totalNew > 0 && <span className="text-xs text-primary-400">{totalNew} new</span>}
                    </div>
                    <div className="overflow-y-auto max-h-96">
                      {notifications && notifications.length > 0 ? (
                        notifications.map((n, i) => {
                          const notifId = `${n.categoryName}-${n.percentageUsed}`;
                          const isNew = !viewedNotifications.includes(notifId);
                          return (
                            <div
                              key={i}
                              className={`p-3 border-b border-primary-50 last:border-0 hover:bg-primary-50 transition-colors ${
                                isNew ? 'bg-accent-50/30' : ''
                              } ${
                                n.status === 'critical' ? 'border-l-2 border-l-expense-500' : 
                                n.status === 'warning' ? 'border-l-2 border-l-amber-500' : ''
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${
                                  n.status === 'critical' ? 'text-expense-500' : 'text-amber-500'
                                }`} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-primary-800">{n.categoryName}</p>
                                    {isNew && <span className="w-2 h-2 rounded-full bg-accent-500 shrink-0"></span>}
                                  </div>
                                  <p className="text-xs text-primary-500 mt-0.5">{n.message}</p>
                                  <div className="mt-2">
                                    <div className="flex justify-between mb-1 text-xs text-primary-400">
                                      <span>{n.percentageUsed.toFixed(0)}% used</span>
                                      <span>{n.remaining >= 0 ? formatCurrency(n.remaining) + ' left' : 'Over budget!'}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-primary-100 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all ${
                                          n.status === 'critical' ? 'bg-expense-500' : 'bg-amber-500'
                                        }`}
                                        style={{ width: `${Math.min(n.percentageUsed, 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-6 text-center text-primary-400">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No budget alerts</p>
                        </div>
                      )}
                    </div>
                    {notifications && notifications.length > 0 && (
                      <div className="p-2 border-t border-surface-border">
                        <button
                          onClick={() => { setNotificationsOpen(false); navigate("/budgets"); }}
                          className="w-full py-1 text-sm text-center transition-colors text-accent-500 hover:text-accent-600"
                        >
                          View All Budgets
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 overflow-auto lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Layout;