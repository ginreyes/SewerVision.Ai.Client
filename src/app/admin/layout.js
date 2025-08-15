'use client';

import Navbar from "@/components/ui/navbar";
import Sidebar from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/helper";

export default function AdminLayout({ children }) {
  const [openSidebar, setOpenSidebar] = useState(false);
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
          setRole(data.role);

          if (data.role === "viewer" && pathname.startsWith("/admin")) {
            router.push("/viewer/dashboard");
          }

          if (data.role === "admin" && pathname.startsWith("/viewer")) {
            router.push("/admin/dashboard");
          }
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
  );
}
