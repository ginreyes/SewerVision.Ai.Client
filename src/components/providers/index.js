"use client";

import { AlertProvider } from "./AlertProvider";
import { DialogProvider } from "./DialogProvider";

export function AppProviders({ children }) {
  return (
    <AlertProvider>
      <DialogProvider>
        {children}
      </DialogProvider>
    </AlertProvider>
  );
}
