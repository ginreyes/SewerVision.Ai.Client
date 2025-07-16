"use client";

import { AlertProvider } from "./AlertProvider";
import { DialogProvider } from "./DialogProvider";
import { UserProvider } from "./UserContext";

export function AppProviders({ children }) {
  return (
    <AlertProvider>
      <DialogProvider>
        <UserProvider>
          {children}
        </UserProvider>
      </DialogProvider>
    </AlertProvider>
  );
}
