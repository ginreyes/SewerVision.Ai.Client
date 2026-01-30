'use client';

import Navbar from "@/components/ui/navbar";
import Sidebar from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/helper";
import AdminSidebar from "@/components/ui/AdminSidebar";

export default function AdminLayout({ children }) {
  const [openSidebar, setOpenSidebar] = useState(false);
  const [role, setRole] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  const handleToggleSidebar = () => {
    setOpenSidebar(prev => !prev);
  };

  useEffect(() => {
    // If we already have a role, don't re-fetch unnecessarily
    if (role) return;

    const fetchUserRole = async () => {
      try {
        const storedUsername = localStorage.getItem("username");
        if (!storedUsername) {
          // Only redirect if we definitely don't have a user
          router.push("/login");
          return;
        }

        const { data, error } = await api(`/api/users/role/${storedUsername}`, "GET");

        if (!error && data?.role) {
          setRole(data.role);

          // Redirect based on role if needed, but only if strictly necessary
          if (data.role === "customer" && pathname.startsWith("/admin")) {
            router.push("/viewer/dashboard");
          } else if (data.role === "admin" && pathname.startsWith("/viewer")) {
            router.push("/admin/dashboard");
          }
        } else {
          console.error("Role check failed:", error || "No role returned");
          // Auth failed: Clear session and redirect to login to prevent loops and allow retry
          localStorage.removeItem("authToken");
          localStorage.removeItem("username");
          localStorage.removeItem("role");
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to fetch role", error);
        // Auth failed: Clear session and redirect
        localStorage.removeItem("authToken");
        localStorage.removeItem("username");
        router.push("/login");
      }
    };

    fetchUserRole();
    // Removed pathname and router from dependencies to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run ONCE on mount

  // Secondary effect to handle route protection AFTER role is loaded
  useEffect(() => {
    if (!role) return;

    if (role === "customer" && pathname.startsWith("/admin")) {
      router.push("/viewer/dashboard");
    }
  }, [role, pathname, router]);

  if (!role) return null;

  return (
    <div className="flex">
      <div
        className={`fixed top-0 left-0 h-full transition-all duration-300 border-2 bg-gray-100 ${openSidebar ? "w-[270px]" : "w-[90px]"
          }`}
      >
        <AdminSidebar isOpen={openSidebar} role={role} />
      </div>

      <div
        className={`flex-1 transition-all duration-300 ${openSidebar ? "ml-[270px]" : "ml-[90px]"
          }`}
      >
        <Navbar openSideBar={handleToggleSidebar} />
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
