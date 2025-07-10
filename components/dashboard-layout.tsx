// components/dashboard-layout.tsx
"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, ChevronDown, Menu, Search, X } from "lucide-react";

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
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (isMounted && typeof window !== "undefined") {
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showUserMenu && !target.closest(".user-menu-container")) {
        setShowUserMenu(false);
      }
      if (showNotifications && !target.closest(".notifications-container")) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu, showNotifications]);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleUserMenu = () => {
    setShowUserMenu((prev) => !prev);
  };

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="flex h-16 items-center gap-4 px-4">
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

                  {/* Logo */}
        <div className="h-14 flex items-center gap-2 px-4 border-b border-gray-100">
          <div className="h-8 w-8 rounded-full bg-[#1e1b4b] flex items-center justify-center">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <div className="font-semibold text-[#1e1b4b] px-2 ">
            <div>RANGAONE</div>
            <div>FINWALA</div>
          </div>
        </div>

          {/* Search */}
          <div className="flex flex-1 items-center gap-4">
            <form className="hidden flex-1 md:block">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search stocks, portfolios & research reports..."
                  className="w-full bg-gray-50 pl-9 focus-visible:ring-[#1e1b4b]"
                />
              </div>
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="notifications-container relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={toggleNotifications}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
              </Button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-medium">Notifications</h3>
                    <Button variant="ghost" size="sm">
                      Mark all as read
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex gap-4 rounded-lg p-2 hover:bg-gray-50">
                      <div className="h-8 w-8 flex-none rounded-full bg-blue-100 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm">New portfolio recommendation</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex gap-4 rounded-lg p-2 hover:bg-gray-50">
                      <div className="h-8 w-8 flex-none rounded-full bg-green-100 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm">Market update available</p>
                        <p className="text-xs text-gray-500">5 hours ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative user-menu-container">
              <Button
                variant="ghost"
                className="flex items-center gap-2"
                onClick={toggleUserMenu}
              >
                <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200">
                  {currentUser?.avatar ? (
                    <Image
                      src={currentUser.avatar}
                      alt={currentUser.username}
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#1e1b4b] text-sm font-medium text-white">
                      {currentUser?.username?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <span className="hidden text-sm font-medium md:block">
                  {currentUser?.username || "User"}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  <div className="border-b border-gray-100 px-4 py-2">
                    <div className="font-medium">{currentUser?.username}</div>
                    <div className="text-sm text-gray-500">{currentUser?.email}</div>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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

      <div className="flex">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden px-3 py-4 sm:px-4 sm:py-6">{children}</main>
      </div>
    </div>
  );
}