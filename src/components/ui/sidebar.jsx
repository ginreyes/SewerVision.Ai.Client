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

  const qcTechnician = [
    { label: "Dashboard", icon: "dashboard.svg", path: "/qc-technician/dashboard" },
    { label: "Quality Control", icon: "qc.svg", path: "/qc-technician/quality-control" },
    { label: "Inspections", icon: "inspection.svg", path: "/qc-technician/inspections" },
    { label: "Reports", icon: "reports.svg", path: "/qc-technician/reports" },
    { label: "Certifications", icon: "certificate.svg", path: "/qc-technician/certifications" },
    { label: "Settings", icon: "settings.svg", path: "/qc-technician/settings" },
  ];

  const operator = [
    { label: "Dashboard", icon: "dashboard.svg", path: "/operator/dashboard" },
    { label: "Operations", icon: "operations.svg", path: "/operator/operations" },
    { label: "Equipment", icon: "devices.svg", path: "/operator/equipment" },
    { label: "Maintenance", icon: "maintenance.svg", path: "/operator/maintenance" },
    { label: "Logs", icon: "logs.svg", path: "/operator/logs" },
    { label: "Reports", icon: "reports.svg", path: "/operator/reports" },
    { label: "Settings", icon: "settings.svg", path: "/operator/settings" },
  ];

  const sidebarItems = 
    role === 'admin' ? admin :
    role === 'user' ? user :
    role === 'Qc-Technician' ? qcTechnician :
    role === 'Operator' ? operator :
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
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-500">📋</span>
            </div>
            <p className="text-gray-500">No menu items available</p>
          </div>
        ) : (
          sidebarItems.map((item, index) => (
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
                  animationDelay: `${index * 50}ms`
                }}
              >
                <div className="flex items-center justify-center w-10">
                  <Image 
                    src={`/icons/${item.icon}`} 
                    alt={`${item.label} Icon`} 
                    width={24} 
                    height={24} 
                  />
                </div>
                {isOpen && (
                  <span className="text-base transition-all duration-200">
                    {item.label}
                  </span>
                )}
              </div>
            </Link>
          ))
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

export default Sidebar;