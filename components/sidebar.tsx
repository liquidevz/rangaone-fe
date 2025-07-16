"use client";

import { cn } from "@/lib/utils";
import {
  BarChart2,
  ChevronDown,
  Home,
  LineChart,
  Play,
  Settings,
  Users,
  Video,
  Briefcase,
  X,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  {
    title: "Overview",
    icon: <BarChart2 className="h-4 w-4" />,
    items: [
      {
        label: "Dashboard",
        icon: <Home className="h-4 w-4" />,
        href: "/dashboard",
        badge: null,
      },
      {
        label: "RangaOne Wealth",
        icon: <Briefcase className="h-4 w-4" />,
        href: "/rangaone-wealth",
        badge: null,
      },
      {
        label: "Model Portfolios",
        icon: <LineChart className="h-4 w-4" />,
        href: "/model-portfolios",
        badge: null,
      },
    ],
  },
  {
    title: "Resources",
    icon: <Play className="h-4 w-4" />,
    items: [
      {
        label: "Videos For You",
        icon: <Video className="h-4 w-4" />,
        href: "/videos-for-you",
        badge: null,
      },
      {
        label: "Contact Support",
        icon: <Users className="h-4 w-4" />,
        href: "/contact-us",
        badge: null,
      },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    Overview: true,
    Resources: true,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleMobileNavClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose();
    }
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Mobile overlay with blur effect */}
      {isOpen && (
        <div
          data-sidebar-overlay="true"
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-br from-slate-50 via-white to-blue-50/30",
          "border-r border-gray-200/60 shadow-2xl backdrop-blur-xl",
          "transition-all duration-300 ease-out",
          "lg:shadow-lg lg:translate-x-0 lg:z-0 lg:relative lg:w-64",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="h-16 border-b border-gray-200/60 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 h-full">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">RangaOne</h2>
                <p className="text-xs text-gray-500">Investment Platform</p>
              </div>
            </div>
            
            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-4rem)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {navigationItems.map((section, sectionIndex) => (
            <div key={section.title} className="mb-6">
              <button
                onClick={() => toggleSection(section.title)}
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2.5 text-xs font-semibold",
                  "text-gray-600 uppercase tracking-wider rounded-lg",
                  "hover:bg-white/60 transition-all duration-200",
                  "border border-transparent hover:border-gray-200/50",
                  "group"
                )}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 group-hover:text-gray-600 transition-colors">
                    {section.icon}
                  </span>
                  <span>{section.title}</span>
                </div>
                <ChevronDown
                  className={cn(
                    "h-3 w-3 text-gray-400 transition-all duration-200",
                    "group-hover:text-gray-600",
                    expandedSections[section.title] && "rotate-180"
                  )}
                />
              </button>

              {expandedSections[section.title] && (
                <div className="mt-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                  {section.items.map((item, itemIndex) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleMobileNavClick}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 text-sm rounded-xl",
                        "transition-all duration-200 group relative overflow-hidden",
                        isActive(item.href)
                          ? [
                              "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium",
                              "shadow-lg shadow-blue-500/25",
                              "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:to-white/10"
                            ]
                          : [
                              "text-gray-700 hover:bg-white/80 hover:shadow-md",
                              "border border-transparent hover:border-gray-200/50",
                              "backdrop-blur-sm"
                            ]
                      )}
                    >
                      <div className="flex items-center space-x-3 relative z-10">
                        <span
                          className={cn(
                            "transition-all duration-200",
                            isActive(item.href) 
                              ? "text-white drop-shadow-sm" 
                              : "text-gray-500 group-hover:text-gray-700"
                          )}
                        >
                          {item.icon}
                        </span>
                        <span className="font-medium">{item.label}</span>
                      </div>
                      
                      {item.badge && (
                        <span className={cn(
                          "px-2 py-0.5 text-xs font-bold rounded-full",
                          "bg-gradient-to-r from-orange-400 to-red-500 text-white",
                          "shadow-sm animate-pulse"
                        )}>
                          {item.badge}
                        </span>
                      )}

                      {/* Active indicator */}
                      {isActive(item.href) && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full opacity-80" />
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Settings - Standalone */}
          <div className="mt-8 pt-4 border-t border-gray-200/60">
            <Link
              href="/settings"
              onClick={handleMobileNavClick}
              className={cn(
                "flex items-center justify-between px-4 py-3 text-sm rounded-xl",
                "transition-all duration-200 group relative overflow-hidden",
                isActive("/settings")
                  ? [
                      "bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium",
                      "shadow-lg shadow-gray-500/25",
                    ]
                  : [
                      "text-gray-700 hover:bg-white/80 hover:shadow-md",
                      "border border-transparent hover:border-gray-200/50",
                      "backdrop-blur-sm"
                    ]
              )}
            >
              <div className="flex items-center space-x-3">
                <span
                  className={cn(
                    "transition-colors duration-200",
                    isActive("/settings") ? "text-white" : "text-gray-500 group-hover:text-gray-700"
                  )}
                >
                  <Settings className="h-4 w-4" />
                </span>
                <span className="font-medium">Settings</span>
              </div>

              {/* Active indicator */}
              {isActive("/settings") && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full opacity-80" />
              )}
            </Link>
          </div>

          {/* Footer */}
          {/* <div className="mt-8 pt-4 border-t border-gray-200/60">
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100/60">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">Portfolio Growth</p>
                  <p className="text-xs text-gray-600">+15.2% This Month</p>
                </div>
              </div>
            </div>
          </div> */}
        </nav>
      </aside>
    </>
  );
}
