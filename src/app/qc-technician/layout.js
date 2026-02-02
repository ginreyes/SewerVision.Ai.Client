'use client';

import QcSidebar from "@/components/ui/QcSidebar";
import Navbar from "@/components/ui/navbar";
import { api } from "@/lib/helper";
import { useEffect, useState } from "react";
import { TourGuide, useTourGuide } from "@/components/TourGuide";

export default function QcTechLayout({ children }) {
  const [openSidebar, setOpenSidebar] = useState(false);
  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null);

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

  useEffect(() => {
    async function fetchUserRole() {
      try {
        const storedUsername = localStorage.getItem("username");
        if (!storedUsername) return;

        const { data, error } = await api(`/api/users/role/${storedUsername}`);

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
