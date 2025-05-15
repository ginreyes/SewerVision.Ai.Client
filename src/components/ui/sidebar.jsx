import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Sidebar = ({ isOpen, role }) => {
  const [activeItem, setActiveItem] = useState("Dashboard");

  const handleItemClick = (item) => {
    setActiveItem(item);
  };


  // Active and inactive styles
  const activeStyle = "bg-[#826AF91A] text-[#2D99FF] font-semibold"; 
  const inactiveStyle = "text-gray-700";

  const admin = [
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

  const user = [
    { label: "Dashboard", icon: "dashboard.svg", path: "/users/dashboard" },
    { label: "Projects", icon: "projects.svg", path: "/users/project" },
    { label: "Calendar", icon: "calendar.svg", path: "/users/calendar" },
    { label: "Uploads", icon: "uploads.svg", path: "/users/uploads" },
    { label: "Devices", icon: "devices.svg", path: "/users/devices" },
    { label: "Task", icon: "task.svg", path: "/users/task" },
    { label: "Report", icon: "reports.svg", path: "/users/reports" },
    { label: "Notes", icon: "notes.svg", path: "/users/notes" },
    { label: "Users", icon: "users.svg", path: "/users/users" },   
    { label: "Settings", icon: "settings.svg", path: "/users/settings" },
  ];

  const viewer = [
    { label: "Dashboard", icon: "dashboard.svg", path: "/viewer/dashboard" },
    { label: "Projects", icon: "projects.svg", path: "/viewer/project" },
    { label: "Calendar", icon: "calendar.svg", path: "/viewer/calendar" },
    { label: "Notes", icon: "notes.svg", path: "/viewer/notes" },
  ];

  const sidebarItems = 
    role === 'admin' ? admin :
    role === 'user' ? user :
    viewer;

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
          <p className="text-center text-gray-500">No menu items available</p>
        ) : (
          sidebarItems.map((item) => (
            <Link key={item.label} href={item.path}>
              <div
                className={`flex items-center space-x-3 h-[56px] px-4 rounded-2xl cursor-pointer transition-colors 
                  ${activeItem === item.label ? activeStyle : `${inactiveStyle} hover:bg-gray-300`}`}
                onClick={() => handleItemClick(item.label)}
              >
                <div className="flex items-center justify-center w-10">
                  <Image 
                    src={`/icons/${item.icon}`} 
                    alt={`${item.label} Icon`} 
                    width={24} 
                    height={24} 
                  />
                </div>
                {isOpen && <span className="text-base">{item.label}</span>}
              </div>
            </Link>
          ))
        )}
      </div>
    </nav>
  );
};

export default Sidebar;
