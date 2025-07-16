"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Simple spinner component (replace or style as you like)
function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 text-gray-600"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      aria-label="loading"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  );
}

export function AlertDialog({ open, onClose, title, description }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => onClose(false)} variant="rose" text="ok" />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SuccessDialog({ open, onClose, title, description }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => onClose(false)} variant="success" text="ok" />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function LoadingDialog({ open, title, description }) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Spinner />
            {description}
          </DialogDescription>
        </DialogHeader>
        {/* No footer, no buttons */}
      </DialogContent>
    </Dialog>
  );
}
