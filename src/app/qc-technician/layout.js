'use client';

import QcSidebar from "@/components/ui/QcSidebar";
import Navbar from "@/components/ui/navbar";
import { api } from "@/lib/helper";
import { useEffect, useState } from "react";

export default function userLayout({ children }) {
  const [openSidebar, setOpenSidebar] = useState(false);
  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null);

  const handleToggleSidebar = () => {
    setOpenSidebar((prev) => !prev);
  };

  useEffect(() => {
    async function fetchUserRole() {
      try {
        const storedUsername = localStorage.getItem("username");
        if (!storedUsername) return;

        const {data ,error} = await api(`/api/users/role/${storedUsername}`);
        console.log('data',data)
        
        if (error) {
          console.error("Error fetching user role:", error);
          return;
        }
      
        setUsername(storedUsername);
        setRole(data.role);
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    }

    fetchUserRole();
  }, []);

  return (
    <>
      <div className="flex">
        <div
          className={`fixed top-0 left-0 h-full transition-all duration-300 border-2 bg-gray-100 ${
            openSidebar ? "w-[270px]" : "w-[90px]"
          }`}
        >
          <QcSidebar isOpen={openSidebar} role={role} />
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
