"use client";
import RoleLayout from "@/components/shared/RoleLayout";

export default function UserLayout({ children }) {
  return <RoleLayout role="user">{children}</RoleLayout>;
}
