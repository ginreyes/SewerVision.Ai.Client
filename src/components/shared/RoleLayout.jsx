"use client";

/**
 * RoleLayout — shared layout wrapper for all 6 roles.
 *
 * Replaces the 95% identical layout.js files across admin, operator,
 * qc-technician, user, customer, customer-rep. Each role's layout.js
 * becomes a thin wrapper: `<RoleLayout role="admin">{children}</RoleLayout>`
 *
 * Handles: auth gate, sidebar, navbar, theme provider, tour guide,
 * announcement banner, dark mode, mobile overlay.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Navbar from "@/components/ui/navbar";
import AnnouncementBanner from "@/components/ui/AnnouncementBanner";
import UnifiedSidebar from "@/components/ui/UnifiedSidebar";
import RoleThemeProvider from "@/components/providers/RoleThemeProvider";
import { TourGuide, useTourGuide } from "@/components/TourGuide";
import { SyncProvider } from "@/components/providers/SyncContext";
import { api, getCookie, deleteCookie } from "@/lib/helper";

const CommandPalette = dynamic(
  () => import("@/components/shared/CommandPalette").then((m) => m.CommandPalette),
  { ssr: false }
);

// Only admins trigger + observe sync jobs. Non-admin roles don't get the bubble.
// If later we want operators/users to see read-only progress, add their role here.
const SYNC_BUBBLE_ROLES = new Set(["admin"]);

const SyncProgressBubble = dynamic(
  () => import("@/components/shared/SyncProgressBubble"),
  { ssr: false }
);

import MotionProvider from "@/components/shared/motion/MotionProvider";
import PageTransition from "@/components/shared/motion/PageTransition";
import { ProjectChatLauncherProvider } from "@/components/providers/ProjectChatLauncherProvider";

const ProjectChatBubble = dynamic(
  () => import("@/components/shared/project-chat/ProjectChatBubble"),
  { ssr: false }
);

// Roles that get the floating Messenger-style project chat bubble. The
// customer chat surface uses a different backend so customer keeps its
// existing ChatBubble; admin/customer-rep don't get the bubble (admin has
// other surfaces, customer-rep uses the per-project drawer mounted on
// `/customer-rep/projects/[id]`).
const PROJECT_CHAT_ROLES = new Set(["user", "operator", "qc-technician"]);

export default function RoleLayout({ role: expectedRole, children }) {
  const [openSidebar, setOpenSidebar] = useState(true);
  const [role, setRole] = useState(null);
  const router = useRouter();
  const { showTour, openTour, closeTour } = useTourGuide(expectedRole);

  const handleToggleSidebar = () => setOpenSidebar((prev) => !prev);

  // Tour guide listener
  useEffect(() => {
    const handler = () => openTour();
    window.addEventListener("openTourGuide", handler);
    return () => window.removeEventListener("openTourGuide", handler);
  }, [openTour]);

  // Strict role-gating
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
          if (data.role !== expectedRole) {
            router.push(`/${data.role}/dashboard`);
            return;
          }
          setRole(expectedRole);
        } else {
          deleteCookie("authToken");
          deleteCookie("username");
          deleteCookie("role");
          router.push("/login");
        }
      } catch {
        deleteCookie("authToken");
        deleteCookie("username");
        deleteCookie("role");
        router.push("/login");
      }
    };

    fetchUserRole();
  }, [role, router, expectedRole]);

  if (!role) return null;

  const syncEnabled = SYNC_BUBBLE_ROLES.has(expectedRole);
  const projectChatEnabled = PROJECT_CHAT_ROLES.has(expectedRole);

  return (
    <RoleThemeProvider role={expectedRole}>
      <ProjectChatLauncherProvider>
      <SyncProvider enabled={syncEnabled}>
        <div className="flex">
          {/* Mobile sidebar overlay */}
          {openSidebar && (
            <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpenSidebar(false)} />
          )}

          {/* Sidebar */}
          <div
            className={`fixed top-0 left-0 h-full transition-all duration-300 border-r bg-gray-100 dark:!bg-[#09090b] dark:border-[#27272a] z-50 ${
              openSidebar ? "w-[270px]" : "w-[90px] hidden lg:block"
            }`}
          >
            <UnifiedSidebar isOpen={openSidebar} role={role} />
          </div>

          {/* Main content */}
          <div className={`flex-1 transition-all duration-300 ${openSidebar ? "lg:ml-[270px]" : "lg:ml-[90px]"}`}>
            <Navbar openSideBar={handleToggleSidebar} role={expectedRole} />
            <main className="p-3 sm:p-4 dark:bg-[#09090b] min-h-screen transition-colors">
              <AnnouncementBanner role={expectedRole} />
              <MotionProvider>
                <PageTransition>{children}</PageTransition>
              </MotionProvider>
            </main>
          </div>

          <TourGuide isOpen={showTour} onClose={closeTour} role={expectedRole} />
          <CommandPalette role={expectedRole} />
          {syncEnabled && <SyncProgressBubble />}
          {projectChatEnabled && <ProjectChatBubble />}
        </div>
      </SyncProvider>
      </ProjectChatLauncherProvider>
    </RoleThemeProvider>
  );
}
