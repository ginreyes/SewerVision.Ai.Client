'use client';

import UnifiedSidebar from "@/components/ui/UnifiedSidebar";
import Navbar from "@/components/ui/navbar";
import AnnouncementBanner from "@/components/ui/AnnouncementBanner";
import RoleThemeProvider from "@/components/providers/RoleThemeProvider";
import { api, getCookie, deleteCookie } from "@/lib/helper";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TourGuide, useTourGuide } from "@/components/TourGuide";

export default function CustomerRepLayout({ children }) {
  const [openSidebar, setOpenSidebar] = useState(true);
  const [role, setRole] = useState(null);
  const router = useRouter();

  // Tour Guide state
  const { showTour, openTour, closeTour } = useTourGuide('customer-rep');

  const handleToggleSidebar = () => {
    setOpenSidebar((prev) => !prev);
  };

  // Listen for tour guide trigger from navbar
  useEffect(() => {
    const handleOpenTour = () => openTour();
    window.addEventListener('openTourGuide', handleOpenTour);
    return () => window.removeEventListener('openTourGuide', handleOpenTour);
  }, [openTour]);

  useEffect(() => {
    if (role) return;

    const fetchUserRole = async () => {
      try {
        const storedUsername = getCookie('username');
        const token = getCookie('authToken');
        if (!storedUsername || !token) {
          router.push("/login");
          return;
        }

        const { data, error } = await api(`/api/users/role/${storedUsername}`, 'GET');
        if (!error && data?.role) {
          if (data.role !== "customer-rep") {
            router.push(`/${data.role}/dashboard`);
            return;
          }
          setRole("customer-rep");
        } else {
          deleteCookie("authToken");
          deleteCookie("username");
          deleteCookie("role");
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
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
    <RoleThemeProvider role="customer-rep">
      <div className="flex">
        <div
          className={`fixed top-0 left-0 h-full transition-all duration-300 border-r bg-gray-100 dark:bg-gray-900 dark:border-gray-800 z-50 ${openSidebar ? "w-[270px]" : "w-[90px] hidden lg:block"}`}
        >
          <UnifiedSidebar isOpen={openSidebar} role={role} />
        </div>

        <div
          className={`flex-1 transition-all duration-300 ${openSidebar ? "lg:ml-[270px]" : "lg:ml-[90px]"}`}
        >
          <Navbar openSideBar={handleToggleSidebar} role="customer-rep" />
          <main className="p-3 sm:p-4"><AnnouncementBanner role="customer-rep" />{children}</main>
        </div>

        {/* Tour Guide Modal */}
        <TourGuide
          isOpen={showTour}
          onClose={closeTour}
          role="customer-rep"
        />
      </div>
    </RoleThemeProvider>
  );
}
