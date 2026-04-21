'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Loader2, LayoutDashboard, ChevronRight } from 'lucide-react';
import ModuleLoading from './SewerVisionLoadingAnimation';
import { useLoadingModuleSetting } from '@/hooks/useLoadingModuleSettings';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { api } from '@/lib/helper';
import {
  ADMIN_MENU_GROUPS,
  FALLBACK_MENUS,
  ICON_MAP,
  LOADING_KEYS,
  ROLE_THEMES,
} from './sidebar/constants';

const UnifiedSidebar = ({ isOpen, role, displayName }) => {
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [loadingItem, setLoadingItem] = useState(null);
  const showLoading = useLoadingModuleSetting(LOADING_KEYS[role] || 'admin');
  const [dbModules, setDbModules] = useState(null);
  const pathname = usePathname();
  const { hasAccess } = useModulePermissions();

  useEffect(() => {
    if (role === 'admin' || role === 'customer') return; 
    const fetchModules = async () => {
      try {
        const response = await api(`/api/security-modules/by-role/${role}`, 'GET');
        const raw = response?.data?.data ?? response?.data;
        if (response?.ok && Array.isArray(raw) && raw.length > 0) {
          setDbModules(raw);
        } 
        else {
          setDbModules(FALLBACK_MENUS[role] || []);
        }
      } catch (e) {
        console.error('Failed to fetch security modules, using fallback:', e);
        setDbModules(FALLBACK_MENUS[role] || []);
      }
    };
    fetchModules();
  }, [role]);

  const handleItemClick = (item) => {
    if (loadingItem) return;
    setLoadingItem(item);
    setActiveItem(item);
    setTimeout(() => setLoadingItem(null), 5000);
  };

  useEffect(() => {
    if (!pathname) return;
    const allItems = role === 'admin'
      ? ADMIN_MENU_GROUPS.flatMap((g) => g.items)
      : role === 'customer'
        ? (FALLBACK_MENUS.customer || []).flatMap((g) => g.items || [])
        : (dbModules || []).flatMap((g) => g.items || []);

    for (const item of allItems) {
      const path = item.path;
      if (path && pathname.startsWith(path)) {
        setActiveItem(item.label);
        break;
      }
    }
  }, [pathname, role, dbModules]);

  const menuGroups = useMemo(() => {
    if (role === 'admin') return ADMIN_MENU_GROUPS;
    if (role === 'customer') return FALLBACK_MENUS.customer || [];
    if (!dbModules) return []; 

    return dbModules
      .map((group) => ({
        ...group,
        items: (group.items || []).filter((item) => {
          if (item.locked) return true;
          return hasAccess(item.key || item.module);
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [role, dbModules, hasAccess]);

  const theme = ROLE_THEMES[role] || ROLE_THEMES.admin;
  const isActive = (path) => pathname?.startsWith(path);

  return (
    <>
      <ModuleLoading isVisible={showLoading && !!loadingItem} moduleName={loadingItem} />

      <nav
        className={cn(
          'h-full flex flex-col',
          'border-r border-gray-200/50 dark:border-[#27272a]',
          'bg-gray-200 dark:!bg-[#09090b]',
          'transition-all duration-300'
        )}
      >
        {/* Header */}
        <div className={cn(
          'flex items-center gap-3 px-4 py-5',
          'border-b border-gray-200/50 dark:border-[#27272a]',
          'transition-all duration-300',
          isOpen ? 'justify-start' : 'justify-center'
        )}>
          <div className={cn(
            'relative flex items-center justify-center',
            'w-10 h-10 rounded-xl',
            'transition-transform duration-300 hover:scale-105'
          )}>
            <Image src="/Logo.png" alt="Logo" width={24} height={24} className="object-contain" />
          </div>
          {isOpen && (
            <div className="flex flex-col">
              <span className={`text-lg font-bold bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
                SewerVision
              </span>
              <span className="text-xs text-gray-500">{theme.portal}</span>
            </div>
          )}
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {menuGroups.map((group, groupIndex) => (
            <div key={group.label} className="space-y-1.5">
              {isOpen && (
                <div className="px-3 py-1">
                  <span className="text-[11px] font-semibold text-gray-400 dark:text-[#52525b] uppercase tracking-wider">
                    {group.label}
                  </span>
                </div>
              )}
              <div className="space-y-0.5">
                {(group.items || []).map((item, index) => {
                  const iconKey = item.icon;
                  const Icon = ICON_MAP[iconKey] || LayoutDashboard;
                  const itemPath = item.path;
                  const itemActive = isActive(itemPath);
                  const isItemLoading = loadingItem === item.label;

                  return (
                    <Link key={item.key || item.label} href={itemPath || '#'}>
                      <div
                        className={cn(
                          'group relative flex items-center gap-3',
                          'h-10 px-3 rounded-xl',
                          'transition-all duration-200',
                          'cursor-pointer select-none',
                          itemActive
                            ? `bg-gradient-to-r ${theme.activeBg} ${theme.activeText} font-semibold shadow-sm`
                            : 'text-gray-700 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-[#18181b] hover:text-gray-900 dark:hover:text-white',
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
                          <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b ${theme.activeBar} rounded-r-full`} />
                        )}

                        {/* Icon */}
                        <div className={cn(
                          'flex items-center justify-center w-5 h-5',
                          'transition-transform duration-200',
                          itemActive && 'scale-110',
                          !isOpen && 'w-6 h-6'
                        )}>
                          {isItemLoading ? (
                            <Loader2 className={`w-5 h-5 animate-spin ${theme.loaderColor}`} />
                          ) : (
                            <Icon
                              size={isOpen ? 18 : 22}
                              strokeWidth={itemActive ? 2.5 : 1.5}
                              className={cn(
                                'transition-colors duration-200',
                                itemActive ? theme.activeIcon : 'text-gray-500 dark:text-[#71717a] group-hover:text-gray-700 dark:group-hover:text-white'
                              )}
                            />
                          )}
                        </div>

                        {/* Label */}
                        {isOpen && (
                          <>
                            <span className={cn(
                              'flex-1 text-sm font-medium transition-colors duration-200',
                              itemActive ? theme.activeText : 'text-gray-700 dark:text-[#a1a1aa] group-hover:text-gray-900 dark:group-hover:text-white'
                            )}>
                              {item.label}
                            </span>
                            {itemActive && (
                              <ChevronRight size={14} className={`${theme.chevronColor} opacity-60`} />
                            )}
                          </>
                        )}

                        {/* Hover overlay */}
                        <div className={cn(
                          'absolute inset-0 rounded-xl',
                          'bg-gradient-to-r from-transparent to-transparent',
                          theme.hoverOverlay,
                          'transition-all duration-200 pointer-events-none',
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
              `bg-gradient-to-r ${theme.footerBg}`,
              `rounded-xl border ${theme.footerBorder}`,
              'shadow-sm'
            )}>
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping opacity-75" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${theme.footerText}`}>
                  {displayName || theme.title}
                </p>
                <p className={`text-[10px] ${theme.footerSub} truncate`}>
                  {theme.subtitle}
                </p>
              </div>
              {theme.footerIcon && (
                <theme.footerIcon className={`w-4 h-4 ${theme.chevronColor}`} />
              )}
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

export default UnifiedSidebar;
