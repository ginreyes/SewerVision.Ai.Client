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
  Monitor,
  Upload,
  SearchX,
  ClipboardList,
  Calendar,
  Wrench,
  Link2,
  BookOpen,
  BarChart2,
  Bell,
  Settings,
  ChevronRight,
  FolderOpen,
  HardDrive,
  Cloud,
  ClipboardCheck,
  AlertTriangle,
} from 'lucide-react';
import ModuleLoading from './SewerVisionLoadingAnimation';
import { useLoadingModuleSetting } from '@/hooks/useLoadingModuleSettings';
import { useModulePermissions } from '@/hooks/useModulePermissions';

const OperatorSidebar = ({ isOpen, role }) => {
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [loadingItem, setLoadingItem] = useState(null);
  const showLoading = useLoadingModuleSetting('operator');
  const pathname = usePathname();
  const { hasAccess } = useModulePermissions();

  const handleItemClick = (item) => {
    if (loadingItem) return;
    setLoadingItem(item);
    setActiveItem(item);
    setTimeout(() => {
      setLoadingItem(null);
    }, 5000);
  };

  // Sync active item with URL
  useEffect(() => {
    const pathMap = {
      '/operator/dashboard': 'Dashboard',
      '/operator/project': 'Projects',
      '/operator/uploads': 'Uploads',
      '/operator/backups': 'Storage & Backups',
      '/operator/operations': 'Operations',
      '/operator/task': 'Tasks',
      '/operator/calendar': 'Calendar',
      '/operator/equipement': 'Equipment',
      '/operator/connect-device': 'Connect Device',
      '/operator/maintenance': 'Maintenance',
      '/operator/equipment-issues': 'Equipment Issues',
      '/operator/handoffs': 'Shift Handoffs',
      '/operator/logs': 'Logs',
      '/operator/reports': 'Reports',
      '/operator/notifications': 'Notifications',
      '/operator/settings': 'Settings',
    };

    for (const [path, label] of Object.entries(pathMap)) {
      if (pathname?.startsWith(path)) {
        setActiveItem(label);
        break;
      }
    }
  }, [pathname]);

  // Grouped navigation — module key maps to permission system
  const allMenuGroups = useMemo(() => [
    {
      label: 'Main',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/operator/dashboard', module: 'dashboard' },
        { label: 'Projects', icon: FolderOpen, path: '/operator/project', module: 'projects' },
        { label: 'Calendar', icon: Calendar, path: '/operator/calendar', module: 'calendar' },
      ],
    },
    {
      label: 'Field Work',
      items: [
        { label: 'Operations', icon: SearchX, path: '/operator/operations', module: 'operations' },
        { label: 'Uploads', icon: Upload, path: '/operator/uploads', module: 'uploads' },
        { label: 'Storage & Backups', icon: Cloud, path: '/operator/backups', module: 'backups' },
        { label: 'Tasks', icon: ClipboardList, path: '/operator/task', module: 'tasks' },
      ],
    },
    {
      label: 'Equipment',
      items: [
        { label: 'Equipment', icon: HardDrive, path: '/operator/equipement', module: 'equipment' },
        { label: 'Connect Device', icon: Link2, path: '/operator/connect-device', module: 'connect-device' },
        { label: 'Maintenance', icon: Wrench, path: '/operator/maintenance', module: 'maintenance' },
        { label: 'Equipment Issues', icon: AlertTriangle, path: '/operator/equipment-issues', module: 'equipment-issues' },
      ],
    },
    {
      label: 'Records',
      items: [
        { label: 'Logs', icon: BookOpen, path: '/operator/logs', module: 'logs' },
        { label: 'Reports', icon: BarChart2, path: '/operator/reports', module: 'reports' },
        { label: 'Shift Handoffs', icon: ClipboardCheck, path: '/operator/handoffs', module: 'shift-handoffs' },
      ],
    },
    {
      label: 'Account',
      items: [
        { label: 'Notifications', icon: Bell, path: '/operator/notifications', module: 'notifications' },
        { label: 'Settings', icon: Settings, path: '/operator/settings', module: 'settings' },
      ],
    },
  ], []);

  // Filter by module permissions
  const menuGroups = useMemo(() => {
    return allMenuGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => hasAccess(item.module)),
      }))
      .filter((group) => group.items.length > 0);
  }, [allMenuGroups, hasAccess]);

  const isActive = (path) => pathname?.startsWith(path);

  return (
    <>
      <ModuleLoading isVisible={showLoading && !!loadingItem} moduleName={loadingItem} />

      <nav
        className={cn(
          'h-full flex flex-col',
          'border-r border-gray-200/50',
          'transition-all duration-300'
        )}
        style={{ backgroundColor: '#e5e7eb' }}
      >
        {/* Header */}
        <div className={cn(
          'flex items-center gap-3 px-4 py-5',
          'border-b border-gray-200/50',
          'transition-all duration-300',
          isOpen ? 'justify-start' : 'justify-center'
        )}>
          <div className={cn(
            'relative flex items-center justify-center',
            'w-10 h-10 rounded-xl',
            'transition-transform duration-300 hover:scale-105'
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
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-700 bg-clip-text text-transparent">
                SewerVision
              </span>
              <span className="text-xs text-gray-500">Operator Console</span>
            </div>
          )}
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {menuGroups.map((group, groupIndex) => (
            <div key={group.label} className="space-y-1.5">
              {isOpen && (
                <div className="px-3 py-1">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    {group.label}
                  </span>
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item, index) => {
                  const Icon = item.icon;
                  const itemActive = isActive(item.path);
                  const isItemLoading = loadingItem === item.label;

                  return (
                    <Link key={item.label} href={item.path}>
                      <div
                        className={cn(
                          'group relative flex items-center gap-3',
                          'h-10 px-3 rounded-xl',
                          'transition-all duration-200',
                          'cursor-pointer select-none',
                          itemActive
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-semibold shadow-sm shadow-blue-500/10'
                            : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900',
                          isItemLoading && 'pointer-events-none opacity-60',
                          !isOpen && 'justify-center'
                        )}
                        onClick={() => handleItemClick(item.label)}
                        style={{
                          animation: `slideIn 0.3s ease-out ${groupIndex * 80 + index * 40}ms both`,
                        }}
                      >
                        {/* Active indicator bar */}
                        {itemActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-r-full" />
                        )}

                        {/* Icon */}
                        <div className={cn(
                          'flex items-center justify-center',
                          'w-5 h-5',
                          'transition-transform duration-200',
                          itemActive && 'scale-110',
                          !isOpen && 'w-6 h-6'
                        )}>
                          {isItemLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                          ) : (
                            <Icon
                              size={isOpen ? 18 : 22}
                              strokeWidth={itemActive ? 2.5 : 1.5}
                              className={cn(
                                'transition-colors duration-200',
                                itemActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                              )}
                            />
                          )}
                        </div>

                        {/* Label */}
                        {isOpen && (
                          <>
                            <span className={cn(
                              'flex-1 text-sm font-medium transition-colors duration-200',
                              itemActive ? 'text-blue-700' : 'text-gray-700 group-hover:text-gray-900'
                            )}>
                              {item.label}
                            </span>
                            {itemActive && (
                              <ChevronRight size={14} className="text-blue-400 opacity-60" />
                            )}
                          </>
                        )}

                        {/* Hover overlay */}
                        <div className={cn(
                          'absolute inset-0 rounded-xl',
                          'bg-gradient-to-r from-blue-500/0 to-indigo-500/0',
                          'group-hover:from-blue-500/5 group-hover:to-indigo-500/5',
                          'transition-all duration-200',
                          'pointer-events-none',
                          itemActive && 'hidden'
                        )} />
                      </div>
                    </Link>
                  );
                })}
              </div>

              {groupIndex < menuGroups.length - 1 && isOpen && (
                <Separator className="my-1.5 opacity-40" />
              )}
            </div>
          ))}
        </div>

        {/* Footer — Role Indicator */}
        {isOpen && (
          <div className="px-3 py-4 border-t border-gray-200/50 bg-gray-50/50">
            <div className={cn(
              'flex items-center gap-2.5 px-3 py-2.5',
              'bg-gradient-to-r from-blue-50 to-indigo-50',
              'rounded-xl border border-blue-200/50',
              'shadow-sm'
            )}>
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping opacity-75" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-blue-700">
                  Operator
                </p>
                <p className="text-[10px] text-blue-600/70 truncate">
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

export default OperatorSidebar;
