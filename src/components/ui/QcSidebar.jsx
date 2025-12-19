'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2,
  LayoutDashboard,
  FolderOpen,
  Calendar,
  Monitor,
  ClipboardList,
  ClipboardCheck,
  FileText,
  StickyNote,
  Award,
  Bell,
  Settings,
  ChevronRight,
} from 'lucide-react';
import ModuleLoading from './SewerVisionLoadingAnimation';

const QcSidebar = ({ isOpen, role }) => {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [loadingItem, setLoadingItem] = useState(null);
  const pathname = usePathname();

  const handleItemClick = (item) => {
    if (loadingItem) return; 
    
    setLoadingItem(item);
    setActiveItem(item);
    
    setTimeout(() => {
      setLoadingItem(null);
    }, 5000); 
  };

  // Update active item based on current pathname
  useEffect(() => {
    const pathMap = {
      '/qc-technician/dashboard': 'Dashboard',
      '/qc-technician/project': 'Projects',
      '/qc-technician/calendar': 'Calendar',
      '/qc-technician/devices': 'Devices',
      '/qc-technician/task': 'Task',
      '/qc-technician/quality-control': 'Quality Control',
      '/qc-technician/reports': 'Reports',
      '/qc-technician/notes': 'Notes',
      '/qc-technician/certifications': 'Certifications',
      '/qc-technician/notifications': 'Notifications',
      '/qc-technician/settings': 'Settings',
    };

    for (const [path, label] of Object.entries(pathMap)) {
      if (pathname?.startsWith(path)) {
        setActiveItem(label);
        break;
      }
    }
  }, [pathname]);

  // QC Technician menu items grouped by category
  const menuGroups = useMemo(() => [
    {
      label: 'Main',
      items: [
        { label: "Dashboard", icon: LayoutDashboard, path: "/qc-technician/dashboard" },
        { label: "Projects", icon: FolderOpen, path: "/qc-technician/project" },
        { label: "Calendar", icon: Calendar, path: "/qc-technician/calendar" },
      ]
    },
    {
      label: 'Work',
      items: [
        { label: "Task", icon: ClipboardList, path: "/qc-technician/task" },
        { label: "Quality Control", icon: ClipboardCheck, path: "/qc-technician/quality-control" },
        { label: "Devices", icon: Monitor, path: "/qc-technician/devices" },
      ]
    },
    {
      label: 'Records',
      items: [
        { label: "Reports", icon: FileText, path: "/qc-technician/reports" },
        { label: "Notes", icon: StickyNote, path: "/qc-technician/notes" },
        { label: "Certifications", icon: Award, path: "/qc-technician/certifications" },
      ]
    },
    {
      label: 'Account',
      items: [
        { label: "Notifications", icon: Bell, path: "/qc-technician/notifications" },
        { label: "Settings", icon: Settings, path: "/qc-technician/settings" },
      ]
    }
  ], []);

  const isActive = (path) => {
    return pathname?.startsWith(path);
  };

  return (
    <>
      {/* SewerVision Loading Animation */}
      <ModuleLoading isVisible={!!loadingItem} />

      <nav className={cn(
        "h-full flex flex-col",
        "border-r border-gray-200/50",
        "transition-all duration-300"
      )}
      style={{ backgroundColor: '#e5e7eb' }}
      >
        {/* Header Section with Logo */}
        <div className={cn(
          "flex items-center gap-3 px-4 py-5",
          "border-b border-gray-200/50",
          "transition-all duration-300",
          isOpen ? 'justify-start' : 'justify-center'
        )}>
          <div className={cn(
            "relative flex items-center justify-center",
            "w-10 h-10 rounded-xl",
            "transition-transform duration-300 hover:scale-105"
          )}>
            <Image 
              src="/Logo.png" 
              alt="Logo" 
              width={24} 
              height={24}
              className="object-contain"
            />
          </div>
          {isOpen && (
            <div className="flex flex-col">
              <span className="text-lg font-bold bg-gradient-to-r from-[#D76A84] via-rose-500 to-pink-600 bg-clip-text text-transparent">
                SewerVersion
              </span>
              <span className="text-xs text-gray-500">QC Portal</span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {menuGroups.map((group, groupIndex) => (
            <div key={group.label} className="space-y-2">
              {isOpen && (
                <div className="px-3 py-1.5">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {group.label}
                  </span>
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item, index) => {
                  const Icon = item.icon;
                  const itemActive = isActive(item.path);
                  const isItemLoading = loadingItem === item.label;
                  
                  return (
                    <Link key={item.label} href={item.path}>
                      <div
                        className={cn(
                          "group relative flex items-center gap-3",
                          "h-11 px-3 rounded-xl",
                          "transition-all duration-200",
                          "cursor-pointer select-none",
                          itemActive
                            ? "bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 font-semibold shadow-sm shadow-rose-500/10"
                            : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900",
                          isItemLoading && "pointer-events-none opacity-60",
                          !isOpen && "justify-center"
                        )}
                        onClick={() => handleItemClick(item.label)}
                        style={{
                          animation: `slideIn 0.3s ease-out ${(groupIndex * 100 + index * 50)}ms both`
                        }}
                      >
                        {/* Active Indicator */}
                        {itemActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-[#D76A84] to-rose-500 rounded-r-full" />
                        )}
                        
                        {/* Icon */}
                        <div className={cn(
                          "flex items-center justify-center",
                          "w-5 h-5",
                          "transition-transform duration-200",
                          itemActive && "scale-110",
                          !isOpen && "w-6 h-6"
                        )}>
                          {isItemLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
                          ) : (
                            <Icon 
                              size={isOpen ? 20 : 24} 
                              strokeWidth={itemActive ? 2.5 : 1.5}
                              className={cn(
                                "transition-colors duration-200",
                                itemActive ? "text-rose-600" : "text-gray-500 group-hover:text-gray-700"
                              )}
                            />
                          )}
                        </div>
                        
                        {/* Label */}
                        {isOpen && (
                          <>
                            <span className={cn(
                              "flex-1 text-sm font-medium transition-colors duration-200",
                              itemActive ? "text-rose-700" : "text-gray-700 group-hover:text-gray-900"
                            )}>
                              {item.label}
                            </span>
                            {itemActive && (
                              <ChevronRight 
                                size={16} 
                                className="text-rose-500 opacity-50"
                              />
                            )}
                          </>
                        )}

                        {/* Hover Effect */}
                        <div className={cn(
                          "absolute inset-0 rounded-xl",
                          "bg-gradient-to-r from-rose-500/0 to-pink-500/0",
                          "group-hover:from-rose-500/5 group-hover:to-pink-500/5",
                          "transition-all duration-200",
                          "pointer-events-none",
                          itemActive && "hidden"
                        )} />
                      </div>
                    </Link>
                  );
                })}
              </div>
              
              {groupIndex < menuGroups.length - 1 && isOpen && (
                <Separator className="my-2" />
              )}
            </div>
          ))}
        </div>

        {/* Footer Section with Role Indicator */}
        {isOpen && (
          <div className="px-3 py-4 border-t border-gray-200/50 bg-gray-50/50">
            <div className={cn(
              "flex items-center gap-2.5 px-3 py-2.5",
              "bg-gradient-to-r from-green-50 to-emerald-50",
              "rounded-xl border border-green-200/50",
              "shadow-sm"
            )}>
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping opacity-75" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-green-700">
                  QC Technician
                </p>
                <p className="text-[10px] text-green-600/70 truncate">
                  Active Access
                </p>
              </div>
            </div>
          </div>
        )}
      </nav>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default QcSidebar;