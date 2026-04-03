'use client';

import { useEffect, useState } from "react";
import Navbar from "@/components/ui/navbar";
import AnnouncementBanner from "@/components/ui/AnnouncementBanner";
import UnifiedSidebar from "@/components/ui/UnifiedSidebar";
import { api } from "@/lib/helper";
import { useUser } from "@/components/providers/UserContext";
import { TourGuide, useTourGuide } from "@/components/TourGuide";
import RoleThemeProvider from "@/components/providers/RoleThemeProvider";
import { useRouter } from "next/navigation";

export default function UserLayout({ children }) {
  const [openSidebar, setOpenSidebar] = useState(true);
  const [role, setRole] = useState("user");
  const [userRoleMeta, setUserRoleMeta] = useState(null);
  const { userData } = useUser();
  const router = useRouter();

  // Tour Guide state for User (Team Lead) role
  const { showTour, openTour, closeTour } = useTourGuide("user");

  const handleToggleSidebar = () => {
    setOpenSidebar((prev) => !prev);
  };

  // Allow navbar or other components to trigger the tour via a custom event
  useEffect(() => {
    const handleOpenTour = () => openTour();
    window.addEventListener("openTourGuide", handleOpenTour);
    return () => window.removeEventListener("openTourGuide", handleOpenTour);
  }, [openTour]);

  // Load extended role metadata and gate /user routes to team-lead "user" role
  useEffect(() => {
    const fetchUserRoleMeta = async () => {
      try {
        if (!userData?.username) return;

        const { data, error } = await api(
          `/api/users/get-user/${userData.username}`,
          "GET"
        );

        if (!error && data?.user) {
          const backendRole = data.user.role || "user";

          // If this account is not a management "user" role, redirect them
          if (backendRole !== "user") {
            router.push(`/${backendRole}/dashboard`);
            return;
          }

          setRole("user");
          if (data.user.userRole) {
            setUserRoleMeta(data.user.userRole);
          }
        }
      } catch (error) {
        console.error("Error fetching user management role info:", error);
      }
    };

    fetchUserRoleMeta();
  }, [userData, router]);

  if (!userData?.username || role !== "user") {
    return null;
  }

  return (
    <RoleThemeProvider role="user">
      <>
        <div className="flex">
          <div
            className={`fixed top-0 left-0 h-full transition-all duration-300 border-2 bg-gray-100 ${
              openSidebar ? "w-[270px]" : "w-[90px]"
            }`}
          >
            <UnifiedSidebar isOpen={openSidebar} role={role} displayName={userRoleMeta?.displayName} />
          </div>

          <div
            className={`flex-1 transition-all duration-300 ${
              openSidebar ? "ml-[270px]" : "ml-[90px]"
            }`}
          >
            <Navbar openSideBar={handleToggleSidebar} role="user" />
            <main className="p-4"><AnnouncementBanner role="user" />{children}</main>
          </div>
        </div>

        {/* Tour Guide Modal for User role */}
        <TourGuide isOpen={showTour} onClose={closeTour} role="user" />
      </>
    </RoleThemeProvider>
  );
}

