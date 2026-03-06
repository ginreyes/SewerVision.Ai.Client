'use client';

import Navbar from "@/components/ui/navbar";
import Sidebar from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getCookie, deleteCookie } from "@/lib/helper";
import AdminSidebar from "@/components/ui/AdminSidebar";
import { TourGuide, useTourGuide } from "@/components/TourGuide";

export default function AdminLayout({ children }) {
  const [openSidebar, setOpenSidebar] = useState(true);
  const [role, setRole] = useState(null);
  const router = useRouter();

  // Tour Guide state
  const { showTour, openTour, closeTour } = useTourGuide('admin');

  const handleToggleSidebar = () => {
    setOpenSidebar(prev => !prev);
  };

  // Listen for tour guide trigger from navbar
  useEffect(() => {
    const handleOpenTour = () => openTour();
    window.addEventListener('openTourGuide', handleOpenTour);
    return () => window.removeEventListener('openTourGuide', handleOpenTour);
  }, [openTour]);

  // Strict role-gating for all /admin pages
  useEffect(() => {
    if (role) return;

    const fetchUserRole = async () => {
      try {
        const storedUsername = getCookie("username");
        const token = getCookie("authToken");
        if (!storedUsername || !token) {
          router.push("/login");
          return;
        }

        const { data, error } = await api(`/api/users/role/${storedUsername}`, "GET");

        if (!error && data?.role) {
          if (data.role !== "admin") {
            // Non-admin users are redirected to their own dashboard
            router.push(`/${data.role}/dashboard`);
            return;
          }
          setRole("admin");
        } else {
          console.error("Role check failed:", error || "No role returned");
          deleteCookie("authToken");
          deleteCookie("username");
          deleteCookie("role");
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to fetch role", error);
        deleteCookie("authToken");
        deleteCookie("username");
        deleteCookie("role");
        router.push("/login");
      }
    };

    fetchUserRole();
  }, [role, router]);

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
        <Navbar openSideBar={handleToggleSidebar} role="admin" />
        <main className="p-4">{children}</main>
      </div>

      {/* Tour Guide Modal */}
      <TourGuide
        isOpen={showTour}
        onClose={closeTour}
        role="admin"
      />
    </div>
  );
}

