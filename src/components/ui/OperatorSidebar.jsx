import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Import Lucide icons
import {
  LayoutDashboard,
  Search,
  Monitor,
  Wrench,
  BookOpen,
  BarChart2,
  Settings,
  SearchX,
  Bell,
} from 'lucide-react';

const OperatorSidebar = ({ isOpen, role }) => {
  const [activeItem, setActiveItem] = useState("Dashboard");

  const handleItemClick = (item) => {
    setActiveItem(item);
  };

  const activeStyle = "bg-[#826AF91A] text-[#2D99FF] font-semibold";
  const inactiveStyle = "text-gray-700";

  const operator = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/operator/dashboard" },
    { label: "Operations", icon: SearchX, path: "/operator/operations" },
    { label: "Task", icon: Search, path: "/operator/task" },
    { label: "Equipment", icon: Monitor, path: "/operator/equipement" },
    { label: "Maintenance", icon: Wrench, path: "/operator/maintenance" },
    { label: "Logs", icon: BookOpen, path: "/operator/logs" },
    { label: "Reports", icon: BarChart2, path: "/operator/reports" },
    { label: "Notifications", icon: Bell, path: "/operator/notifications" },
    { label: "Settings", icon: Settings, path: "/operator/settings" },
  ];

  const sidebarItems = role === 'operator' ? operator : operator;

  return (
    <nav className="h-full bg-gray-200 p-4">
      {/* Logo and Title */}
      <div className={`flex items-center gap-2 mb-6 transition-all duration-300 ${isOpen ? 'justify-start' : 'justify-center'}`}>
        <Image src="/logo.png" alt="Logo" width={32} height={30} />
        {isOpen && <span className="text-lg font-bold">SewerVersion</span>}
      </div>

      {/* Sidebar Items */}
      <div className="flex flex-col space-y-2">
        {sidebarItems.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-500">📋</span>
            </div>
            <p className="text-gray-500">No menu items available</p>
          </div>
        ) : (
          sidebarItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link key={item.label} href={item.path}>
                <div
                  className={`flex items-center space-x-3 h-[56px] px-4 rounded-2xl cursor-pointer transition-all duration-200 transform hover:scale-105
                    ${activeItem === item.label ? activeStyle : `${inactiveStyle} hover:bg-gray-300 hover:shadow-sm`}`}
                  onClick={() => handleItemClick(item.label)}
                  style={{
                    animationName: 'slideIn',
                    animationDuration: '0.3s',
                    animationTimingFunction: 'ease-out',
                    animationFillMode: 'forwards',
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <div className="flex items-center justify-center w-10">
                    <Icon size={20} strokeWidth={1.5} />
                  </div>
                  {isOpen && (
                    <span className="text-base transition-all duration-200">
                      {item.label}
                    </span>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Role indicator */}
      {isOpen && (
        <div className="mt-auto pt-4 border-t border-gray-300">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600 capitalize">
              {role === 'Qc-Technician' ? 'QC Technician' : role} Access
            </span>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </nav>
  );
};

export default OperatorSidebar;