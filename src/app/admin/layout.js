'use client';

import Navbar from "@/components/ui/navbar";
import Sidebar from "@/components/ui/sidebar";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }) {
  const [openSidebar, setOpenSidebar] = useState(false);
  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null); 

  const handleToggleSidebar = () => {
    setOpenSidebar((prev) => !prev);
  };

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      // Set the username from local storage
      setUsername(storedUsername);

      // Fetch role for that username
      fetch(`/api/user/role/${storedUsername}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch role");
          return res.json();
        })
        .then((data) => {
          setRole(data.role?.toLowerCase() || null);
        })
        .catch((error) => {
          console.error("Error fetching user role:", error);
          setRole(null);
        });
    }
  }, []);
  

  return (
    <>
      <div className="flex">
        <div
          className={`fixed top-0 left-0 h-full transition-all duration-300 border-2 bg-gray-100 ${
            openSidebar ? "w-[270px]" : "w-[90px]"
          }`}
        >
          
          <Sidebar isOpen={openSidebar} role={role} />
        </div>

        <div
          className={`flex-1 transition-all duration-300 ${
            openSidebar ? "ml-[270px]" : "ml-[90px]"
          }`}
        >
          <Navbar openSideBar={handleToggleSidebar} />
          <main className="p-4">{children}</main>
        </div>
      </div>
    </>
  );
}
