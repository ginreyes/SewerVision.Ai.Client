"use client";

import { useCallback } from "react";
import { useUser } from "@/components/providers/UserContext";

/**
 * Hook to check if the current user has access to a specific module.
 * - Admin role always has full access.
 * - Users with no modulePermissions set (legacy/unassigned) get full access.
 * - Otherwise, checks if the module key is in the user's modulePermissions array.
 */
export function useModulePermissions() {
  const { userData } = useUser();

  const hasAccess = useCallback(
    (moduleName) => {
      // Admin always has full access
      if (userData?.role === "admin") return true;

      // No permissions set = full access (backward compatible)
      if (!userData?.modulePermissions || userData.modulePermissions.length === 0) {
        return true;
      }

      return userData.modulePermissions.includes(moduleName);
    },
    [userData?.role, userData?.modulePermissions]
  );

  return {
    hasAccess,
    permissions: userData?.modulePermissions || [],
    permissionLevel: userData?.permissionLevel,
    isRestricted: userData?.modulePermissions?.length > 0,
  };
}

export default useModulePermissions;
