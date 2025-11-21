'use client';

import Navbar from "@/components/ui/navbar";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/helper";
import CustomerSidebar from "./components/CustomerSidebar";

export default function CustomerLayout({ children }) {
  const [openSidebar, setOpenSidebar] = useState(true);
  const [role, setRole] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  const handleToggleSidebar = () => {
    setOpenSidebar(prev => !prev);
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const storedUsername = localStorage.getItem("username");
        if (!storedUsername) {
          router.push("/login");
          return;
        }

        const { data, error } = await api(`/api/users/role/${storedUsername}`, "GET");

        
        if (!error && data.role) {
          if (data.role !== 'customer') {
            router.push(`/${data.role}/dashboard`);
            return;
          }
          setRole(data.role);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to fetch role", error);
        router.push("/login");
      }
    };

    fetchUserRole();
  }, [pathname, router]);

  if (!role) return null;

  return (
    <div className="flex">
      <div
        className={`fixed top-0 left-0 h-full transition-all duration-300 border-2  ${
          openSidebar ? "w-[270px]" : "w-[90px]"
        }`}
      >
        <CustomerSidebar isOpen={openSidebar} />
      </div>

      <div
        className={`flex-1 transition-all duration-300 ${
          openSidebar ? "ml-[270px]" : "ml-[90px]"
        }`}
      >
        <Navbar openSideBar={handleToggleSidebar} role="customer" />
        <main className="p-4  min-h-screen">{children}</main>
      </div>
    </div>
  );
}
