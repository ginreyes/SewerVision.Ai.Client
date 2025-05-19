"use client";

import React, { createContext, useState, useContext, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const DialogContext = createContext({
  showConfirm: () => {},
  showSessionExpiredDialog: () => {},
  showAlert: () => {},
  hideDialog: () => {},
});

export function useDialog() {
  return useContext(DialogContext);
}

export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState({
    open: false,
    type: null, // "success", "error", "info", "confirm", "sessionExpired"
    title: "",
    description: "",
    onConfirm: null,
    onCancel: null,
  });

  const showConfirm = useCallback(({ title, description, onConfirm, onCancel }) => {
    setDialog({
      open: true,
      type: "confirm",
      title,
      description,
      onConfirm,
      onCancel,
    });
  }, []);

  const showAlert = useCallback((message, type = "info") => {
    setDialog({
      open: true,
      type,
      title: type === "success" ? "Success" : type === "error" ? "Error" : "Info",
      description: message,
    });
  }, []);

  const showSessionExpiredDialog = useCallback(() => {
    setDialog({
      open: true,
      type: "sessionExpired",
      title: "Session Expired",
      description: "Your session has expired. Please log in again inorder to change your password.",
      onConfirm: () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("username");
        window.location.href = "/login";
      },
      onCancel: () => {
        setDialog((prev) => ({ ...prev, open: false }));
      },
    });
  }, []);

  const hideDialog = useCallback(() => {
    setDialog((prev) => ({ ...prev, open: false }));
  }, []);

  const handleConfirm = () => {
    if (dialog.onConfirm) dialog.onConfirm();
    hideDialog();
  };

  const handleCancel = () => {
    if (dialog.onCancel) dialog.onCancel();
    hideDialog();
  };

  return (
    <DialogContext.Provider
      value={{
        showConfirm,
        showAlert,
        showSessionExpiredDialog,
        hideDialog,
      }}
    >
      {children}

      <Dialog open={dialog.open} onOpenChange={handleCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle
              className={
                dialog.type === "error"
                  ? "text-red-500"
                  : dialog.type === "success"
                  ? "text-green-500"
                  : dialog.type === "confirm"
                  ? "text-blue-600"
                  : dialog.type === "sessionExpired"
                  ? "text-orange-600"
                  : "text-gray-800"
              }
            >
              {dialog.title}
            </DialogTitle>
            <DialogDescription>{dialog.description}</DialogDescription>
          </DialogHeader>

          {(dialog.type === "confirm" || dialog.type === "sessionExpired") ? (
            <DialogFooter>
              <Button variant="rose" onClick={handleConfirm} text={dialog.type === "sessionExpired" ? "Relogin" : "Confirm"} />
              <Button variant="secondary" onClick={handleCancel} text="Cancel" />
            </DialogFooter>
          ) : (
            <DialogFooter>
              <Button onClick={hideDialog} variant="rose" text="Ok" />
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </DialogContext.Provider>
  );
}
