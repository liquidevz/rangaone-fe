"use client";

import type React from "react";

import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserProfile, userService } from "@/services/user.service";
import { Menu, PhoneCall, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId?: string;
}) {
  // Initialize sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Set isMounted to true after component mounts
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Initialize sidebar state based on screen size, but only after component mounts
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

  // Add a useEffect to handle window resize
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

  // Add effect to control body overflow when sidebar is open on mobile
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
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center">
            <button
              data-sidebar-trigger="true"
              onClick={toggleSidebar}
              className="p-2 mr-2 text-gray-600 rounded-md lg:hidden hover:bg-gray-100"
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {sidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            <Link href="/dashboard" className="flex items-center">
              <div className="relative h-12 w-12 mr-2">
                <div className="absolute inset-0 bg-navy-blue rounded-full flex items-center justify-center text-white font-bold text-xl">
                  R
                </div>
              </div>
              <div className="text-navy-blue font-bold leading-tight hidden sm:block">
                <div>RANGAONE</div>
                <div>FINWALA</div>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="w-full pl-10 bg-gray-50 border-gray-200"
                placeholder="Search Stocks, Portfolios & Research Reports"
              />
            </div>
          </div>

          <div className="flex items-center">
            {/* <Button variant="ghost" className="font-semibold text-navy-blue hidden sm:flex">
              Contact Us
            </Button>
            <div className="h-10 w-10 rounded-full bg-yellow-400 flex items-center justify-center ml-2">
              <User className="h-6 w-6 text-gray-700" />
            </div> */}

            {/* User profile at the top of the sidebar */}
            <div className="p-2">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-gray-200 mr-3 overflow-hidden relative">
                  {!currentUser ? (
                    <div className="animate-pulse bg-gray-300 h-full w-full" />
                  ) : currentUser?.avatar ? (
                    <Image
                      src={currentUser.avatar || "/placeholder.svg"}
                      alt={currentUser?.username || "User"}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full bg-navy-blue text-white font-bold text-xl">
                      {currentUser?.username?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <div>
                  {!currentUser ? (
                    <>
                      <div className="h-4 bg-gray-300 rounded w-24 mb-2 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </>
                  ) : (
                    <>
                      <div className="font-semibold">
                        {currentUser?.username || "User"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {currentUser?.company || "No Company"}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content */}
        <main className="flex-1 p-4 overflow-x-hidden">{children}</main>
      </div>

      {/* Floating Contact Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          className="bg-green-600 hover:bg-green-700 h-14 w-14 rounded-full shadow-lg flex items-center justify-center"
          onClick={() => (window.location.href = "/contact-us")}
        >
          <PhoneCall className="h-6 w-6" />
          <span className="sr-only">Contact Us</span>
        </Button>
      </div>
    </div>
  );
}
