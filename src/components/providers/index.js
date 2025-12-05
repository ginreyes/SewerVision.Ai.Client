"use client";

import { useEffect } from "react";
import { AlertProvider } from "./AlertProvider";
import { DialogProvider } from "./DialogProvider";
import { UserProvider } from "./UserContext";
import { useRouter } from "next/navigation";
import NotificationProvider from "./NotificationProvider";



export function AppProviders({ children }) {

  const router = useRouter()
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role) {
      router.push(`/${role}/dashboard`);
    }
  }, [router])
  
  return (
     <UserProvider>
      <NotificationProvider>
        <AlertProvider>
          <DialogProvider>
          
              {children}
          
          </DialogProvider>
        </AlertProvider>
      </NotificationProvider>
    </UserProvider>
  );
}
