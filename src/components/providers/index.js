"use client";

import { useEffect } from "react";
import { AlertProvider } from "./AlertProvider";
import { DialogProvider } from "./DialogProvider";
import { UserProvider } from "./UserContext";
import { useRouter, usePathname } from "next/navigation";
import NotificationProvider from "./NotificationProvider";
import { QueryProvider } from "./QueryProvider";
import { SocketProvider } from "./SocketProvider";
import { ThemeProvider } from "./ThemeProvider";
import { getCookie } from "@/lib/helper";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";



export function AppProviders({ children }) {

  const router = useRouter()
  const pathname = usePathname()
  useKeyboardShortcuts();

  useEffect(() => {
    const role = getCookie("role");

    if (role && (pathname === '/' || pathname === '/login' || pathname === '/register')) {
      router.push(`/${role}/dashboard`);
    }
    
  }, [router, pathname])

  return (
    <ThemeProvider>
      <QueryProvider>
        <UserProvider>
          <SocketProvider>
            <NotificationProvider>
              <AlertProvider>
                <DialogProvider>
                  {children}
                </DialogProvider>
              </AlertProvider>
            </NotificationProvider>
          </SocketProvider>
        </UserProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
