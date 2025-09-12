import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Loader2, 
} from 'lucide-react';
import SewerVisionLoading from './SewerVisionLoadingAnimation';
import ModuleLoading from './SewerVisionLoadingAnimation';

// SewerVision Loading Component


// Main AdminSidebar Component
const AdminSidebar = ({ isOpen }) => {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [loadingItem, setLoadingItem] = useState(null);

  const handleItemClick = (item) => {
    if (loadingItem) return; // Prevent clicking while loading
    
    setLoadingItem(item);
    setActiveItem(item);
    
    // Simulate loading time (you can adjust this or remove it based on your actual navigation)
    setTimeout(() => {
      setLoadingItem(null);
    }, 5000); // 5 seconds to see the full workflow animation
  };

  // Active and inactive styles (keeping your original styles)
  const activeStyle = "bg-[#826AF91A] text-[#2D99FF] font-semibold"; 
  const inactiveStyle = "text-gray-700";

  // Admin menu items only
  const adminMenuItems = [
    { label: "Dashboard", icon: "dashboard.svg", path: "/admin/dashboard" },
    { label: "Projects", icon: "projects.svg", path: "/admin/project" },
    { label: "Calendar", icon: "calendar.svg", path: "/admin/calendar" },
    { label: "Uploads", icon: "uploads.svg", path: "/admin/uploads" },
    { label: "Devices", icon: "devices.svg", path: "/admin/devices" },
    { label: "Task", icon: "task.svg", path: "/admin/task" },
    { label: "Report", icon: "reports.svg", path: "/admin/report" },
    { label: "Notes", icon: "notes.svg", path: "/admin/notes" },
    { label: "Users", icon: "users.svg", path: "/admin/users" },   
    { label: "Settings", icon: "settings.svg", path: "/admin/settings" },
  ];

  return (
    <>
      {/* SewerVision Loading Animation */}
      <ModuleLoading isVisible={!!loadingItem} />

      <nav className="h-full bg-gray-200 p-4">
        {/* Logo and Title (keeping your original design) */}
        <div className={`flex items-center gap-2 mb-6 transition-all duration-300 ${isOpen ? 'justify-start' : 'justify-center'}`}>
          <Image src="/logo.png" alt="Logo" width={32} height={30} />
          {isOpen && <span className="text-lg font-bold">SewerVersion</span>}
        </div>

        {/* Sidebar Items */}
        <div className="flex flex-col space-y-2">
          {adminMenuItems.map((item, index) => (
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
                    <Image 
                      src={`/icons/${item.icon}`} 
                      alt={`${item.label} Icon`} 
                      width={24} 
                      height={24} 
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

        {/* Role indicator (keeping your original design, just changed to admin) */}
        {isOpen && (
          <div className="mt-auto pt-4 border-t border-gray-300">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600 capitalize">
                Admin Access
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

export default AdminSidebar;