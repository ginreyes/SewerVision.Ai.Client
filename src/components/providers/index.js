"use client";

import { useEffect } from "react";
import { AlertProvider } from "./AlertProvider";
import { DialogProvider } from "./DialogProvider";
import { UserProvider } from "./UserContext";
import { useRouter, usePathname } from "next/navigation";
import NotificationProvider from "./NotificationProvider";
import { QueryProvider } from "./QueryProvider";
import { getCookie } from "@/lib/helper";



export function AppProviders({ children }) {

  const router = useRouter()
  const pathname = usePathname()
  
  useEffect(() => {
    const role = getCookie("role");
    
    // Only redirect to dashboard if user is on root path, login path, or register path
    // Don't redirect if they're already on a valid page within their role
    if (role && (pathname === '/' || pathname === '/login' || pathname === '/register')) {
      router.push(`/${role}/dashboard`);
    }
  }, [router, pathname])

  return (
    <QueryProvider>
      <UserProvider>
        <NotificationProvider>
          <AlertProvider>
            <DialogProvider>

              {children}

            </DialogProvider>
          </AlertProvider>
        </NotificationProvider>
      </UserProvider>
    </QueryProvider>
  );
}
