"use client";

import { cn } from "@/lib/utils";
import {
  BarChart2,
  ChevronDown,
  ChevronLeft,
  Home,
  LineChart,
  Play,
  Settings,
  Users,
  Video,
  Briefcase,
  X,
  TrendingUp,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
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

export default function Sidebar({ isOpen, onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    Overview: true,
    Resources: true,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSection = (section: string) => {
    if (isCollapsed) return; // Don't allow section toggling when collapsed
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleNavClick = (href: string) => {
    // Close sidebar on mobile always, and on desktop when collapsed
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 1024) {
        onClose();
      } else if (isCollapsed) {
        onClose(); // This will actually just indicate navigation happened
      }
    }
    router.push(href);
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
      {/* Mobile overlay with enhanced blur effect */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-md z-40 lg:hidden transition-all duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          // Base styles
          "bg-gradient-to-br from-slate-50 via-white to-blue-50/40",
          "border-r border-gray-200/80 shadow-2xl backdrop-blur-xl",
          "transition-all duration-300 ease-out flex flex-col",
          // Mobile styles
          "fixed inset-y-0 left-0 z-50 lg:relative lg:z-10",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          // Desktop styles - always visible and properly sized
          "lg:translate-x-0 lg:h-screen lg:block",
          // Width based on collapse state
          isCollapsed ? "lg:w-20" : "w-80 lg:w-72"
        )}
      >
        {/* Header */}
        <div className="h-16 border-b border-gray-200/60 bg-white/90 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center justify-between px-4 h-full">
            <div className={cn(
              "flex items-center transition-all duration-300",
              isCollapsed ? "lg:justify-center lg:w-full" : "space-x-3"
            )}>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-blue-100">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              {!isCollapsed && (
                <div className="lg:block">
                  <h2 className="text-sm font-bold text-gray-900 tracking-tight">RangaOne</h2>
                  <p className="text-xs text-gray-500">Investment Platform</p>
                </div>
              )}
            </div>
            
            {/* Desktop collapse toggle */}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className={cn(
                  "hidden lg:flex p-2 rounded-xl hover:bg-gray-100/80 transition-colors",
                  "ring-1 ring-gray-200/50 hover:ring-gray-300/50 backdrop-blur-sm",
                  isCollapsed && "rotate-180"
                )}
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <ChevronLeft className="h-4 w-4 text-gray-500" />
              </button>
            )}

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100/80 transition-colors ring-1 ring-gray-200/50"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className={cn(
          "flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent",
          "p-4 space-y-6"
        )}>
          {navigationItems.map((section, sectionIndex) => (
            <div key={section.title} className="space-y-2">
              <button
                onClick={() => toggleSection(section.title)}
                className={cn(
                  "flex items-center justify-between w-full text-xs font-semibold",
                  "text-gray-600 uppercase tracking-wider transition-all duration-200",
                  "hover:text-gray-800",
                  isCollapsed ? "lg:justify-center lg:px-2 lg:py-3" : "px-3 py-2.5 rounded-xl hover:bg-white/60",
                  !isCollapsed && "border border-transparent hover:border-gray-200/60",
                  "group"
                )}
                disabled={isCollapsed}
              >
                <div className={cn(
                  "flex items-center transition-all duration-200",
                  isCollapsed ? "lg:justify-center" : "space-x-2"
                )}>
                  <span className="text-gray-400 group-hover:text-gray-600 transition-colors">
                    {section.icon}
                  </span>
                  {!isCollapsed && <span>{section.title}</span>}
                </div>
                {!isCollapsed && (
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 text-gray-400 transition-all duration-200",
                      "group-hover:text-gray-600",
                      expandedSections[section.title] && "rotate-180"
                    )}
                  />
                )}
              </button>

              {(expandedSections[section.title] || isCollapsed) && (
                <div className={cn(
                  "space-y-1 transition-all duration-200",
                  isCollapsed ? "lg:hidden" : "animate-in slide-in-from-top-2"
                )}>
                  {section.items.map((item, itemIndex) => (
                    <button
                      key={item.href}
                      onClick={() => handleNavClick(item.href)}
                      className={cn(
                        "flex items-center justify-between w-full text-sm rounded-xl",
                        "transition-all duration-200 group relative overflow-hidden",
                        isActive(item.href)
                          ? [
                              "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium",
                              "shadow-lg shadow-blue-500/30 transform translate-y-0",
                              "ring-2 ring-blue-200/50",
                              "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:to-white/10"
                            ]
                          : [
                              "text-gray-700 hover:bg-white/90 hover:shadow-md hover:transform hover:translate-y-[-1px]",
                              "border border-transparent hover:border-gray-200/60",
                              "backdrop-blur-sm"
                            ],
                        isCollapsed ? "lg:w-12 lg:h-12 lg:p-0 lg:justify-center" : "px-4 py-3"
                      )}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <div className={cn(
                        "flex items-center relative z-10 transition-all duration-200",
                        isCollapsed ? "lg:justify-center" : "space-x-3"
                      )}>
                        <span
                          className={cn(
                            "transition-all duration-200",
                            isActive(item.href) 
                              ? "text-white drop-shadow-sm" 
                              : "text-gray-500 group-hover:text-gray-700",
                            isCollapsed && "lg:text-lg"
                          )}
                        >
                          {item.icon}
                        </span>
                        {!isCollapsed && <span className="font-medium">{item.label}</span>}
                      </div>

                      {/* Badge */}
                      {item.badge && !isCollapsed && (
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
                        <div className={cn(
                          "absolute top-1/2 -translate-y-1/2 bg-white rounded-l-full opacity-90",
                          isCollapsed ? "right-0 w-1 h-8" : "right-0 w-1 h-10"
                        )} />
                      )}

                      {/* Hover glow effect */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-indigo-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Settings - Standalone */}
          <div className="pt-4 border-t border-gray-200/60">
            <button
              onClick={() => handleNavClick("/settings")}
              className={cn(
                "flex items-center justify-between w-full text-sm rounded-xl",
                "transition-all duration-200 group relative overflow-hidden",
                isActive("/settings")
                  ? [
                      "bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium",
                      "shadow-lg shadow-gray-500/30 ring-2 ring-gray-200/50",
                    ]
                  : [
                      "text-gray-700 hover:bg-white/90 hover:shadow-md hover:transform hover:translate-y-[-1px]",
                      "border border-transparent hover:border-gray-200/60",
                      "backdrop-blur-sm"
                    ],
                isCollapsed ? "lg:w-12 lg:h-12 lg:p-0 lg:justify-center" : "px-4 py-3"
              )}
              title={isCollapsed ? "Settings" : undefined}
            >
              <div className={cn(
                "flex items-center transition-all duration-200",
                isCollapsed ? "lg:justify-center" : "space-x-3"
              )}>
                <span
                  className={cn(
                    "transition-colors duration-200",
                    isActive("/settings") ? "text-white" : "text-gray-500 group-hover:text-gray-700",
                    isCollapsed && "lg:text-lg"
                  )}
                >
                  <Settings className="h-4 w-4" />
                </span>
                {!isCollapsed && <span className="font-medium">Settings</span>}
              </div>

              {/* Active indicator */}
              {isActive("/settings") && (
                <div className={cn(
                  "absolute top-1/2 -translate-y-1/2 bg-white rounded-l-full opacity-90",
                  isCollapsed ? "right-0 w-1 h-8" : "right-0 w-1 h-10"
                )} />
              )}
            </button>
          </div>
        </nav>

        {/* Footer */}
        {/* {!isCollapsed && (
          <div className="p-4 border-t border-gray-200/60 bg-gradient-to-r from-white/50 to-blue-50/50 backdrop-blur-sm flex-shrink-0">
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100/80 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">Portfolio Growth</p>
                  <p className="text-xs text-gray-600">+15.2% This Month</p>
                </div>
              </div>
            </div>
          </div>
        )} */}
      </aside>
    </>
  );
}
