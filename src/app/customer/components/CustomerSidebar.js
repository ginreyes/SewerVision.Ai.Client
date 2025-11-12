'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bell, FileText, FolderOpen, Headset, LayoutDashboard, Loader2 } from 'lucide-react';
import ModuleLoading from '@/components/ui/SewerVisionLoadingAnimation';



const CustomerSidebar = ({ isOpen }) => {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [loadingItem, setLoadingItem] = useState(null);

  const handleItemClick = (item) => {
    if (loadingItem) return;
    setLoadingItem(item);
    setActiveItem(item);
    setTimeout(() => {
      setLoadingItem(null);
    }, 5000);
  };

  const activeStyle = "bg-[#826AF91A] text-[#2D99FF] font-semibold";
  const inactiveStyle = "text-gray-700";

const customerMenuItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/customer/dashboard" },
  { label: "Projects", icon: FolderOpen, path: "/customer/projects" },
  { label: "Reports", icon: FileText, path: "/customer/reports" },
  { label: "Notifications", icon: Bell, path: "/customer/notifications" },
  { label: "Support", icon: Headset, path: "/customer/support" },
];
  return (
    <>
      <ModuleLoading isVisible={!!loadingItem} />
      <nav className="h-full bg-gray-200 p-4">
        <div className={`flex items-center gap-2 mb-6 transition-all duration-300 ${isOpen ? 'justify-start' : 'justify-center'}`}>
          <Image src="/logo.png" alt="Logo" width={32} height={30} />
          {isOpen && <span className="text-lg font-bold">SewerVision</span>}
        </div>

        <div className="flex flex-col space-y-2">
          {customerMenuItems.map((item, index) => (
            <Link key={item.label} href={item.path}>
              <div
                className={`flex items-center space-x-3 h-[56px] px-4 rounded-2xl cursor-pointer transition-all duration-200 transform hover:scale-105 relative
                  ${activeItem === item.label ? activeStyle : `${inactiveStyle} hover:bg-gray-300 hover:shadow-sm`}
                  ${loadingItem === item.label ? 'pointer-events-none opacity-70' : ''}`}
                onClick={() => handleItemClick(item.label)}
                style={{
                  animationName: 'slideIn',
                  animationDuration: '0.3s',
                  animationTimingFunction: 'ease-out',
                  animationFillMode: 'forwards',
                  animationDelay: `${index * 50}ms`
                }}
              >
                <div className="flex items-center justify-center w-10">
                  {loadingItem === item.label ? (
                    <Loader2 className="w-6 h-6 animate-spin text-[#2D99FF]" />
                  ) : (
                   <item.icon 
                      size={24} 
                      className="text-gray-700" 
                    />
                  )}
                </div>
                {isOpen && (
                  <span className="text-base transition-all duration-200">
                    {item.label}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>

        {isOpen && (
          <div className="mt-auto pt-4 border-t border-gray-300">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-gray-600 capitalize">
                Customer View
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
    </>
  );
};

export default CustomerSidebar;