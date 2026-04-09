"use client";

import React from "react";

/**
 * Role color map — HSL values for CSS custom properties.
 * These get injected as --role-primary, --role-primary-light, etc.
 * and referenced by shadcn components via CSS variables.
 */
const ROLE_HSL = {
  admin:          { h: 347, s: 77, l: 50 },  // rose-600
  operator:       { h: 217, s: 91, l: 60 },  // blue-600
  "qc-technician":{ h:   0, s: 74, l: 42 },  // red-700 (matches sidebar red-700 → amber-500 gradient)
  user:           { h: 239, s: 84, l: 67 },  // indigo-600
  customer:       { h: 160, s: 84, l: 39 },  // emerald-600
  "customer-rep": { h: 175, s: 77, l: 40 },  // teal-600
};

/**
 * Wraps children with CSS custom properties for the active role.
 *
 * Usage in a role layout:
 *   <RoleThemeProvider role="operator">
 *     {children}
 *   </RoleThemeProvider>
 *
 * Then in CSS / components:
 *   color: hsl(var(--role-primary));
 *   border-color: hsl(var(--role-primary));
 */
export default function RoleThemeProvider({ role, children }) {
  const hsl = ROLE_HSL[role] || ROLE_HSL.admin;

  const cssVars = {
    "--role-primary": `${hsl.h} ${hsl.s}% ${hsl.l}%`,
    "--role-primary-light": `${hsl.h} ${hsl.s}% ${Math.min(hsl.l + 35, 95)}%`,
    "--role-primary-ring": `${hsl.h} ${hsl.s}% ${hsl.l}%`,
    "--role-accent": `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%)`,
  };

  return (
    <div style={cssVars} data-role={role}>
      {children}
    </div>
  );
}
