'use client';

import QcSidebar from "@/components/ui/QcSidebar";
import Navbar from "@/components/ui/navbar";
import { api, getCookie, deleteCookie } from "@/lib/helper";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TourGuide, useTourGuide } from "@/components/TourGuide";

export default function QcTechLayout({ children }) {
  const [openSidebar, setOpenSidebar] = useState(true);
  const [role, setRole] = useState(null);
  const router = useRouter();

  // Tour Guide state
  const { showTour, openTour, closeTour } = useTourGuide('qc-technician');

  const handleToggleSidebar = () => {
    setOpenSidebar((prev) => !prev);
  };

  // Listen for tour guide trigger from navbar
  useEffect(() => {
    const handleOpenTour = () => openTour();
    window.addEventListener('openTourGuide', handleOpenTour);
    return () => window.removeEventListener('openTourGuide', handleOpenTour);
  }, [openTour]);

  // Strict role-gating for all /qc-technician pages
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

        const { data, error } = await api(`/api/users/role/${storedUsername}`);

        if (!error && data?.role) {
          if (data.role !== "qc-technician") {
            router.push(`/${data.role}/dashboard`);
            return;
          }
          setRole("qc-technician");
        } else {
          console.error("Error fetching user role:", error || "No role returned");
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
    <>
      <div className="flex">
        <div
          className={`fixed top-0 left-0 h-full transition-all duration-300 border-2 bg-gray-100 ${openSidebar ? "w-[270px]" : "w-[90px]"
            }`}
        >
          <QcSidebar isOpen={openSidebar} role={role} />
        </div>

        <div
          className={`flex-1 transition-all duration-300 ${openSidebar ? "ml-[270px]" : "ml-[90px]"
            }`}
        >
          <Navbar openSideBar={handleToggleSidebar} role="qc-technician" />
          <main className="p-4">{children}</main>
        </div>
      </div>

      {/* Tour Guide Modal */}
      <TourGuide
        isOpen={showTour}
        onClose={closeTour}
        role="qc-technician"
      />
    </>
  );
}
