'use client';

import React from 'react';
import { LogOut, Save, Loader2, RefreshCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs } from '@/components/ui/tabs';

/**
 * SettingsPageShell
 *
 * Shared layout for role settings pages that use the sidebar-navigation pattern.
 * Provides the header row (title + actions), vertical sidebar nav, and the
 * <Tabs> wrapper for the main content. Each role page supplies its tab list,
 * handlers, and <TabsContent> children.
 *
 * Props:
 *   title             — page title shown in the header
 *   subtitle          — subtitle text under the title
 *   accentColor       — tailwind color token for active nav item (e.g. 'rose', 'blue', 'amber', 'teal', 'violet')
 *   tabs              — array of { id, label, icon }
 *   activeTab, onTabChange — controlled tab state
 *   saving            — loading state for the save button
 *   onSave            — optional save handler; when omitted, no save button rendered
 *   saveLabel         — optional save button label (defaults to "Save Changes")
 *   showSave          — optional boolean to force show/hide the save button (defaults to !!onSave)
 *   onRefresh         — optional refresh handler; renders a Refresh button when provided
 *   onLogout          — optional sign-out handler; renders the sign-out button in sidebar when provided
 *   extraHeaderActions — optional extra JSX rendered before the save button
 *   wrapInTabs        — defaults to true; when false, children are rendered directly (for pages using conditional rendering instead of <TabsContent>)
 *   children          — <TabsContent> elements for each tab (or raw content if wrapInTabs=false)
 */
const SettingsPageShell = ({
  title,
  subtitle,
  accentColor = 'rose',
  tabs,
  activeTab,
  onTabChange,
  saving = false,
  onSave,
  saveLabel = 'Save Changes',
  showSave,
  onRefresh,
  onLogout,
  extraHeaderActions,
  wrapInTabs = true,
  children,
}) => {
  const shouldShowSave = typeof showSave === 'boolean' ? showSave : !!onSave;

  // Accent color maps for sidebar nav active state
  const accentMap = {
    rose: {
      activeBg: 'bg-rose-50 dark:bg-rose-500/15',
      activeText: 'text-rose-700 dark:text-rose-400',
      activeIcon: 'text-rose-600 dark:text-rose-400',
      saveBtn: 'bg-rose-600 hover:bg-rose-700',
    },
    blue: {
      activeBg: 'bg-blue-50 dark:bg-blue-500/15',
      activeText: 'text-blue-700 dark:text-blue-400',
      activeIcon: 'text-blue-600 dark:text-blue-400',
      saveBtn: 'bg-blue-600 hover:bg-blue-700',
    },
    amber: {
      activeBg: 'bg-amber-50 dark:bg-amber-500/15',
      activeText: 'text-amber-700 dark:text-amber-400',
      activeIcon: 'text-amber-600 dark:text-amber-400',
      saveBtn: 'bg-amber-600 hover:bg-amber-700',
    },
    teal: {
      activeBg: 'bg-teal-50 dark:bg-teal-500/15',
      activeText: 'text-teal-700 dark:text-teal-400',
      activeIcon: 'text-teal-600 dark:text-teal-400',
      saveBtn: 'bg-teal-600 hover:bg-teal-700',
    },
    violet: {
      activeBg: 'bg-violet-50 dark:bg-violet-500/15',
      activeText: 'text-violet-700 dark:text-violet-400',
      activeIcon: 'text-violet-600 dark:text-violet-400',
      saveBtn: 'bg-violet-600 hover:bg-violet-700',
    },
    green: {
      activeBg: 'bg-green-50 dark:bg-green-500/15',
      activeText: 'text-green-700 dark:text-green-400',
      activeIcon: 'text-green-600 dark:text-green-400',
      saveBtn: 'bg-green-600 hover:bg-green-700',
    },
    indigo: {
      activeBg: 'bg-indigo-50 dark:bg-indigo-500/15',
      activeText: 'text-indigo-700 dark:text-indigo-400',
      activeIcon: 'text-indigo-600 dark:text-indigo-400',
      saveBtn: 'bg-indigo-600 hover:bg-indigo-700',
    },
  };

  const accent = accentMap[accentColor] || accentMap.rose;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {onRefresh && (
            <Button
              variant="outline"
              className="text-gray-600 gap-2"
              onClick={onRefresh}
              disabled={saving}
            >
              <RefreshCcw className="w-4 h-4" /> Refresh
            </Button>
          )}
          {extraHeaderActions}
          {shouldShowSave && (
            <Button
              onClick={onSave}
              disabled={saving}
              className={`${accent.saveBtn} text-white`}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saveLabel}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <Card className="lg:w-64 h-fit border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <nav className="space-y-1">
              {tabs.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? `${accent.activeBg} ${accent.activeText}`
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2b2a33] hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {Icon && (
                      <Icon
                        className={`w-4 h-4 mr-3 ${
                          isActive ? accent.activeIcon : 'text-gray-400'
                        }`}
                      />
                    )}
                    {item.label}
                  </button>
                );
              })}
              {onLogout && (
                <>
                  <Separator className="my-4" />
                  <button
                    onClick={onLogout}
                    className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </button>
                </>
              )}
            </nav>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {wrapInTabs ? (
            <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
              {children}
            </Tabs>
          ) : (
            <div className="space-y-6">{children}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPageShell;
