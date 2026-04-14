"use client";
import RoleLayout from "@/components/shared/RoleLayout";

export default function AdminLayout({ children }) {
  return <RoleLayout role="admin">{children}</RoleLayout>;
}
