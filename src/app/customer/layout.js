"use client";
import RoleLayout from "@/components/shared/RoleLayout";

export default function CustomerLayout({ children }) {
  return <RoleLayout role="customer">{children}</RoleLayout>;
}
