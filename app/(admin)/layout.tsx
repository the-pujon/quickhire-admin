"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { useAppSelector } from "@/redux/hooks";
import {
  selectIsAuthenticated,
  selectCurrentUser,
} from "@/redux/slices/authSlice";
import { useRefreshTokenMutation } from "@/redux/api/authApi";
import { tokenStorage } from "@/lib/axiosBaseQuery";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // true while we're attempting to restore a session via refresh token
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);
  const router = useRouter();
  const [refreshToken] = useRefreshTokenMutation();
  const attempted = useRef(false);

  const isAdminRole =
    currentUser?.role === "admin" || currentUser?.role === "superAdmin";

  useEffect(() => {
    // Only run once on mount
    if (attempted.current) return;
    attempted.current = true;

    const restore = async () => {
      // Already authenticated — no need to restore
      if (isAuthenticated) {
        setIsRestoringSession(false);
        return;
      }
      // No refresh token either — go straight to login
      if (!tokenStorage.getRefresh()) {
        setIsRestoringSession(false);
        return;
      }
      // Access token is missing but refresh token exists — try to silently restore
      try {
        await refreshToken().unwrap();
        // authSlice.matchFulfilled will update accessToken + isAuthenticated in Redux
      } catch {
        // Refresh failed — clear stale tokens and let the next effect redirect
        tokenStorage.clear();
      } finally {
        setIsRestoringSession(false);
      }
    };

    restore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isRestoringSession) return; // wait until restore attempt finishes

    if (!isAuthenticated) {
      router.replace("/login");
    } else if (currentUser && !isAdminRole) {
      // Logged in but not an admin/superAdmin — block access
      router.replace("/login");
    }
  }, [isRestoringSession, isAuthenticated, currentUser, isAdminRole, router]);

  // Show spinner while restoring session or when not yet authenticated
  if (isRestoringSession || !isAuthenticated || (currentUser && !isAdminRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="size-8 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
