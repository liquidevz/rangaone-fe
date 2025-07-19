// components/dashboard-layout.tsx
"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, ChevronDown, Menu, Search, X, PanelLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/sidebar";
import { UserProfile, userService } from "@/services/user.service";

export default function DashboardLayout({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId?: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    setIsMounted(true);
    
    // Load sidebar state from localStorage
    const savedCollapsedState = localStorage.getItem('sidebar-collapsed');
    if (savedCollapsedState !== null) {
      setSidebarCollapsed(JSON.parse(savedCollapsedState));
    }
    
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (isMounted && typeof window !== "undefined") {
      // On desktop, sidebar should be open by default
      // On mobile, it should be closed by default
      setSidebarOpen(window.innerWidth >= 1024);
    }
  }, [isMounted]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await userService.getProfile();
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;

    if (typeof document !== "undefined") {
      if (sidebarOpen && window.innerWidth < 1024) {
        document.body.classList.add("sidebar-open");
      } else {
        document.body.classList.remove("sidebar-open");
      }
    }

    return () => {
      if (typeof document !== "undefined") {
        document.body.classList.remove("sidebar-open");
      }
    };
  }, [sidebarOpen, isMounted]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    const newCollapsedState = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsedState);
    
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(newCollapsedState));
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Desktop Layout */}
      <div className="flex h-screen">
        {/* Sidebar - Full Height on Desktop */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Header - Positioned to the right of sidebar on desktop */}
          <header className="sticky top-0 z-20 w-full border-b border-gray-200/80 bg-white/90 backdrop-blur-xl shadow-sm">
            <div className="flex h-16 items-center gap-4 px-4">
              {/* Mobile menu button */}
              <button
                onClick={toggleSidebar}
                className="rounded-xl p-2 text-gray-500 hover:bg-gray-100/80 hover:text-gray-700 transition-all duration-200 lg:hidden ring-1 ring-gray-200/50 hover:ring-gray-300/50"
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>

              {/* Desktop sidebar toggle */}
              <button
                onClick={toggleSidebarCollapse}
                className="hidden lg:flex rounded-xl p-2 text-gray-500 hover:bg-gray-100/80 hover:text-gray-700 transition-all duration-200 ring-1 ring-gray-200/50 hover:ring-gray-300/50"
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <PanelLeft className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  sidebarCollapsed && "rotate-180"
                )} />
              </button>

              {/* Logo for when sidebar is collapsed or on mobile */}
              <div className={cn(
                "flex items-center gap-2 transition-all duration-300",
                "lg:opacity-0 lg:pointer-events-none",
                (sidebarCollapsed || !sidebarOpen) && "lg:opacity-100 lg:pointer-events-auto"
              )}>
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <div className="font-bold text-[#1e1b4b] text-sm">
                  <div>RANGAONE</div>
                </div>
              </div>

              {/* Search */}
              <div className="flex flex-1 items-center gap-4">
                <form className="hidden flex-1 md:block">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search stocks, portfolios & reports..."
                      className="w-full bg-gray-50/80 border-gray-200/60 pl-10 pr-4 py-2 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-300 transition-all duration-200"
                    />
                  </div>
                </form>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative rounded-xl p-2 text-gray-500 hover:bg-gray-100/80 hover:text-gray-700 transition-all duration-200 ring-1 ring-gray-200/50 hover:ring-gray-300/50"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full border-2 border-white shadow-sm"></span>
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 rounded-xl border border-gray-200/80 bg-white/95 backdrop-blur-xl py-2 shadow-xl">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                      </div>
                      <div className="px-4 py-6 text-center text-gray-500">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No new notifications</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 rounded-xl p-2 text-gray-700 hover:bg-gray-100/80 transition-all duration-200 ring-1 ring-gray-200/50 hover:ring-gray-300/50"
                  >
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                      <span className="text-white font-semibold text-sm">
                        {currentUser?.username?.[0]?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      showUserMenu && "rotate-180"
                    )} />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200/80 bg-white/95 backdrop-blur-xl py-1 shadow-xl">
                      <div className="border-b border-gray-100 px-4 py-3">
                        <div className="font-medium text-gray-900">{currentUser?.username}</div>
                        <div className="text-sm text-gray-500">{currentUser?.email}</div>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50/80 transition-colors duration-200"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50/80 transition-colors duration-200"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}