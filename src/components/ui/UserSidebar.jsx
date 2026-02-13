'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Inbox,
  Monitor,
  ChevronRight,
  Folder,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Management sidebar for the advanced "User" role.
 * Reuses the visual language from Operator/QC sidebars
 * but provides cross-team navigation (Operator + QC modules).
 */
const UserSidebar = ({ isOpen, role, userRoleMeta }) => {
  const [activeItem, setActiveItem] = useState('Dashboard');
  const pathname = usePathname();

  useEffect(() => {
    const map = {
      '/user/dashboard': 'Dashboard',
      '/user/project': 'My Projects',
      '/user/tasks': 'Track Tasks',
      '/user/team': 'Team Management',
      '/user/device-assignments': 'Device Assignments',
      '/user/inbox': 'Inbox',
    };

    for (const [path, label] of Object.entries(map)) {
      if (pathname?.startsWith(path)) {
        setActiveItem(label);
        break;
      }
    }
  }, [pathname]);

  const groups = [
    {
      label: 'Overview',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/user/dashboard' },
        { label: 'My Projects', icon: Folder, path: '/user/project' },
        { label: 'Track Tasks', icon: ClipboardList, path: '/user/tasks' },
      ],
    },
    {
      label: 'Team & Assets',
      items: [
        { label: 'Team Management', icon: Users, path: '/user/team' },
        { label: 'Device Assignments', icon: Monitor, path: '/user/device-assignments' },
        { label: 'Inbox', icon: Inbox, path: '/user/inbox' },
      ],
    },
  ];

  const isActive = (path) => pathname?.startsWith(path);

  const displayRole =
    userRoleMeta?.displayName ||
    (role === 'user' ? 'Team Manager' : (role || 'User')).toString();

  return (
    <nav
      className={cn(
        'h-full flex flex-col border-r border-gray-200/50 transition-all duration-300'
      )}
      style={{ backgroundColor: '#e5e7eb' }}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-5 border-b border-gray-200/50 transition-all duration-300',
          isOpen ? 'justify-start' : 'justify-center'
        )}
      >
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-transform duration-300 hover:scale-105">
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
            <span className="text-xs text-gray-500">Management Portal</span>
          </div>
        )}
      </div>

      {/* Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {groups.map((group, groupIndex) => (
          <div key={group.label} className="space-y-2">
            {isOpen && (
              <div className="px-3 py-1.5">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {group.label}
                </span>
              </div>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link key={item.label} href={item.path}>
                    <div
                      className={cn(
                        'group relative flex items-center gap-3 h-11 px-3 rounded-xl transition-all duration-200 cursor-pointer select-none',
                        active
                          ? 'bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 font-semibold shadow-sm shadow-rose-500/10'
                          : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900',
                        !isOpen && 'justify-center'
                      )}
                    >
                      <div
                        className={cn(
                          'flex items-center justify-center w-5 h-5 transition-transform duration-200',
                          active && 'scale-110',
                          !isOpen && 'w-6 h-6'
                        )}
                      >
                        <Icon
                          size={isOpen ? 20 : 24}
                          strokeWidth={active ? 2.5 : 1.5}
                          className={cn(
                            'transition-colors duration-200',
                            active ? 'text-rose-600' : 'text-gray-500 group-hover:text-gray-700'
                          )}
                        />
                      </div>

                      {isOpen && (
                        <>
                          <span
                            className={cn(
                              'flex-1 text-sm font-medium transition-colors duration-200',
                              active ? 'text-rose-700' : 'text-gray-700 group-hover:text-gray-900'
                            )}
                          >
                            {item.label}
                          </span>
                          {active && (
                            <ChevronRight
                              size={16}
                              className="text-rose-500 opacity-50"
                            />
                          )}
                        </>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {groupIndex < groups.length - 1 && isOpen && (
              <div className="my-2 h-px bg-gray-200/60" />
            )}
          </div>
        ))}
      </div>

      {/* Footer / role indicator */}
      {isOpen && (
        <div className="px-3 py-4 border-t border-gray-200/50 bg-gray-50/50">
          <div className="flex items-center gap-2.5 px-3 py-2.5 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200/50 shadow-sm">
            <div className="relative">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping opacity-75" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-emerald-700 truncate">
                {displayRole}
              </p>
              <p className="text-[10px] text-emerald-600/70 truncate">
                Cross-team management access
              </p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default UserSidebar;

