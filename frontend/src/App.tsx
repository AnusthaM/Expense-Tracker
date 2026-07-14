import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "./components/reusable_parts/Toast";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy load pages and components
const Auth = lazy(() => import("./pages/Auth"));
const Layout = lazy(() => import("./components/Layout"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Expenses = lazy(() => import("./pages/Expenses"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Categories = lazy(() => import("./pages/Categories"));
const Budgets = lazy(() => import("./pages/Budgets"));

// Loading spinner
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-primary-50">
    <div className="w-10 h-10 border-2 rounded-full animate-spin border-accent-500 border-t-transparent"></div>
  </div>
);

// React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 10,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected route - checks for cached user data (JWT is in httpOnly cookie)
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  try {
    const user = localStorage.getItem("user");
    if (!user) return <Navigate to="/auth" replace />;
    return <>{children}</>;
  } catch {
    return <Navigate to="/auth" replace />;
  }
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public route */}
                <Route path="/auth" element={<Auth />} />
                
                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="expenses" element={<Expenses />} />
                  <Route path="transactions" element={<Transactions />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="budgets" element={<Budgets />} />
                </Route>
                
                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;