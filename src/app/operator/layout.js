'use client';

import OperatorSidebar from "@/components/ui/OperatorSidebar";
import Navbar from "@/components/ui/navbar";
import { api } from "@/lib/helper";
import { useEffect, useState } from "react";
import { TourGuide, useTourGuide } from "@/components/TourGuide";

export default function OperatorLayout({ children }) {
  const [openSidebar, setOpenSidebar] = useState(false);
  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null);

  // Tour Guide state
  const { showTour, openTour, closeTour } = useTourGuide('operator');

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
    const fetchUserRole = async () => {
      try {
        const storedUsername = localStorage.getItem('username')
        const { data, error } = await api(`/api/users/role/${storedUsername}`, 'GET')
        if (!error) {
          setRole(data.role)
        }
        else {
          setRole(role)
        }
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
          <OperatorSidebar isOpen={openSidebar} role={role} />
        </div>

        <div
          className={`flex-1 transition-all duration-300 ${openSidebar ? "ml-[270px]" : "ml-[90px]"
            }`}
        >
          <Navbar openSideBar={handleToggleSidebar} role="operator" />
          <main className="p-4">{children}</main>
        </div>
      </div>

      {/* Tour Guide Modal */}
      <TourGuide
        isOpen={showTour}
        onClose={closeTour}
        role="operator"
      />
    </>
  );
}
