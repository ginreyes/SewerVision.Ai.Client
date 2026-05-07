"use client";
import RoleLayout from "@/components/shared/RoleLayout";
import { UploadServiceWorkerProvider } from "@/components/providers/UploadServiceWorkerProvider";

export default function OperatorLayout({ children }) {
  return (
    <UploadServiceWorkerProvider>
      <RoleLayout role="operator">{children}</RoleLayout>
    </UploadServiceWorkerProvider>
  );
}
