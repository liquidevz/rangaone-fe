"use client";

import type React from "react";

import { cn } from "@/lib/utils";
import {
  Briefcase,
  ChevronDown,
  Home,
  LineChart,
  Lock,
  PhoneCall,
  Play,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Only handle outside clicks when sidebar is open on mobile
  useEffect(() => {
    if (!isMounted) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Only run this on mobile and only for clicks on the overlay
      if (
        window.innerWidth < 1024 &&
        isOpen &&
        target.hasAttribute("data-sidebar-overlay")
      ) {
        onClose();
      }
    };

    if (isOpen && window.innerWidth < 1024) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, isMounted]);

  const toggleExpand = (key: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleMobileNavClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  // Check if the current path is a recommendation page but not model portfolios
  const isRecommendationPage =
    pathname.startsWith("/rangaone-wealth") &&
    !pathname.startsWith("/rangaone-wealth/model-portfolios") &&
    pathname !== "/rangaone-wealth";

  return (
    <>
      {/* Mobile overlay - only show when sidebar is open on mobile */}
      {isOpen && (
        <div
          data-sidebar-overlay="true"
          className="fixed inset-0 bg-black/20 z-10 lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        data-sidebar="true"
        className={cn(
          "z-20 flex flex-col w-64 bg-white border-r border-gray-200 shadow-lg transition-transform duration-300 ease-in-out lg:shadow-none lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          // Mobile: fixed position, Desktop: sticky position
          "fixed inset-y-0 left-0 lg:sticky lg:top-0 lg:h-auto lg:max-h-screen"
        )}
      >
        <div className="flex flex-col h-full justify-between">
          {/* Top section with user profile */}
          <div>
            {/* Navigation items with reduced spacing */}
            <nav className="p-2 space-y-0.5 overflow-y-auto">
              <NavItem
                href="/dashboard"
                icon={<Home className="h-5 w-5" />}
                label="Dashboard"
                active={pathname === "/dashboard"}
                onClick={handleMobileNavClick}
              />

              {/* RangaOne Wealth with dropdown */}
              <div className="flex items-center">
                <Link
                  href="/rangaone-wealth"
                  className={cn(
                    "flex items-center flex-grow px-3 py-1.5 text-sm rounded-md transition-colors",
                    pathname === "/rangaone-wealth" || isRecommendationPage
                      ? "bg-gray-100 font-medium text-gray-900"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  onClick={handleMobileNavClick}
                >
                  <span
                    className={cn(
                      "mr-3",
                      pathname === "/rangaone-wealth" || isRecommendationPage
                        ? "text-gray-900"
                        : "text-gray-500"
                    )}
                  >
                    <Briefcase className="h-5 w-5" />
                  </span>
                  RangaOne Wealth
                </Link>
                <button
                  onClick={(e) => toggleExpand("rangaoneWealth", e)}
                  className="p-1.5 rounded-md hover:bg-gray-100"
                  aria-label="Toggle RangaOne Wealth dropdown"
                >
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      expandedItems.rangaoneWealth ? "transform rotate-180" : ""
                    )}
                  />
                </button>
              </div>

              {expandedItems.rangaoneWealth && (
                <div className="ml-2 pl-4 border-l border-gray-200 space-y-0.5">
                  <Link
                    href="/rangaone-wealth/open-recommendations"
                    className={cn(
                      "flex items-center px-3 py-1.5 text-sm rounded-md transition-colors",
                      pathname === "/rangaone-wealth/open-recommendations"
                        ? "bg-gray-100 font-medium text-gray-900"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}
                    onClick={handleMobileNavClick}
                  >
                    Open Recommendations
                  </Link>
                  <Link
                    href="/rangaone-wealth/closed-recommendations"
                    className={cn(
                      "flex items-center px-3 py-1.5 text-sm rounded-md transition-colors",
                      pathname === "/rangaone-wealth/closed-recommendations"
                        ? "bg-gray-100 font-medium text-gray-900"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}
                    onClick={handleMobileNavClick}
                  >
                    Closed Recommendations
                  </Link>
                  <Link
                    href="/rangaone-wealth/all-recommendations"
                    className={cn(
                      "flex items-center px-3 py-1.5 text-sm rounded-md transition-colors",
                      pathname === "/rangaone-wealth/all-recommendations"
                        ? "bg-gray-100 font-medium text-gray-900"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}
                    onClick={handleMobileNavClick}
                  >
                    All Recommendations
                  </Link>
                </div>
              )}

              <NavItem
                href="/rangaone-wealth/model-portfolios"
                icon={<LineChart className="h-5 w-5" />}
                label="Model Portfolios"
                active={pathname.startsWith(
                  "/rangaone-wealth/model-portfolios"
                )}
                onClick={handleMobileNavClick}
              />

              <NavItem
                href="/videos-for-you"
                icon={<Play className="h-5 w-5" />}
                label="Videos For You"
                active={pathname === "/videos-for-you"}
                onClick={handleMobileNavClick}
              />

              <NavItem
                href="/contact-us"
                icon={<PhoneCall className="h-5 w-5" />}
                label="Contact Us"
                active={pathname === "/contact-us"}
                onClick={handleMobileNavClick}
              />

              <NavItem
                href="/settings"
                icon={<Settings className="h-5 w-5" />}
                label="Settings"
                active={pathname === "/settings"}
                onClick={handleMobileNavClick}
              />
            </nav>
          </div>

          {/* Premium Features - Now positioned at the bottom with no extra space */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Premium Features</h3>
              <Lock className="h-5 w-5 text-gray-500" />
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Upgrade to access advanced trading tools and premium research.
            </p>
            <button className="w-full py-2 px-4 bg-navy-blue text-white font-medium rounded-md hover:bg-blue-800 transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function NavItem({
  href,
  icon,
  label,
  active = false,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center px-3 py-1.5 text-sm rounded-md transition-colors",
        active
          ? "bg-gray-100 font-medium text-gray-900"
          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
      )}
      onClick={onClick}
    >
      <span className={cn("mr-3", active ? "text-gray-900" : "text-gray-500")}>
        {icon}
      </span>
      {label}
    </Link>
  );
}
