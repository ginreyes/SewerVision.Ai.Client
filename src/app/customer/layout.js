'use client';

import Navbar from "@/components/ui/navbar";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api, getCookie, deleteCookie } from "@/lib/helper";
import CustomerSidebar from "./components/CustomerSidebar";
import { TourGuide, useTourGuide } from "@/components/TourGuide";

export default function CustomerLayout({ children }) {
  const [openSidebar, setOpenSidebar] = useState(true);
  const [role, setRole] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  // Tour Guide state
  const { showTour, openTour, closeTour } = useTourGuide('customer');

  const handleToggleSidebar = () => {
    setOpenSidebar(prev => !prev);
  };

  // Listen for tour guide trigger from navbar
  useEffect(() => {
    const handleOpenTour = () => openTour();
    window.addEventListener('openTourGuide', handleOpenTour);
    return () => window.removeEventListener('openTourGuide', handleOpenTour);
  }, [openTour]);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const storedUsername = getCookie("username");
        const token = getCookie("authToken");
        if (!storedUsername || !token) {
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
  }, [pathname, router]);

  if (!role) return null;

  return (
    <div className="flex">
      <div
        className={`fixed top-0 left-0 h-full transition-all duration-300 border-2  ${openSidebar ? "w-[270px]" : "w-[90px]"
          }`}
      >
        <CustomerSidebar isOpen={openSidebar} />
      </div>

      <div
        className={`flex-1 transition-all duration-300 ${openSidebar ? "ml-[270px]" : "ml-[90px]"
          }`}
      >
        <Navbar openSideBar={handleToggleSidebar} role="customer" />
        <main className="p-4  min-h-screen">{children}</main>
      </div>

      {/* Tour Guide Modal */}
      <TourGuide
        isOpen={showTour}
        onClose={closeTour}
        role="customer"
      />
    </div>
  );
}
