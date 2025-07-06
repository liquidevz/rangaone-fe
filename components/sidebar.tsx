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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        icon: <Home className="h-4 w-4" />,
        href: "/dashboard",
      },
      {
        label: "RangaOne Wealth",
        icon: <Briefcase className="h-4 w-4" />,
        href: "/rangaone-wealth",
      },
      {
        label: "Model Portfolios",
        icon: <LineChart className="h-4 w-4" />,
        href: "/rangaone-wealth/model-portfolios",
      },
    ],
  },
  {
    title: "Resources",
    items: [
      {
        label: "Videos For You",
        icon: <Video className="h-4 w-4" />,
        href: "/videos-for-you",
      },
      {
        label: "Contact Support",
        icon: <Users className="h-4 w-4" />,
        href: "/contact-us",
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

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleMobileNavClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          data-sidebar-overlay="true"
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-lg transition-transform duration-200 lg:shadow-none lg:translate-x-0 lg:z-0 lg:relative",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >


        {/* Navigation */}
        <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-4rem-1px)]">
          {navigationItems.map((section) => (
            <div key={section.title} className="mb-2">
              <button
                onClick={() => toggleSection(section.title)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-gray-600 uppercase tracking-wider"
              >
                {section.title}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-gray-500 transition-transform",
                    expandedSections[section.title] && "rotate-180"
                  )}
                />
              </button>

              {expandedSections[section.title] && (
                <div className="mt-1 space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleMobileNavClick}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
                        pathname === item.href
                          ? "bg-[#1e1b4b] text-white font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <span
                        className={cn(
                          pathname === item.href ? "text-white" : "text-gray-500"
                        )}
                      >
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Settings */}
          <Link
            href="/settings"
            onClick={handleMobileNavClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors mt-4",
              pathname === "/settings"
                ? "bg-[#1e1b4b] text-white font-medium"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <span
              className={cn(
                pathname === "/settings" ? "text-white" : "text-gray-500"
              )}
            >
              <Settings className="h-4 w-4" />
            </span>
            Settings
          </Link>
        </nav>
      </aside>
    </>
  );
}
