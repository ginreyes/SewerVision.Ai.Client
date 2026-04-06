"use client";

import React, { memo, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { usePathname } from "next/navigation";

const LABEL_MAP = {
  admin: "Admin",
  operator: "Operator",
  "qc-technician": "QC Technician",
  "customer-rep": "Customer Rep",
  user: "Team Lead",
  customer: "Customer",
  dashboard: "Dashboard",
  project: "Projects",
  createProject: "Create Project",
  editProject: "Edit Project",
  settings: "Settings",
  users: "Users",
  permissions: "Permissions",
  create: "Create",
  edit: "Edit",
  report: "Reports",
  uploads: "Uploads",
  view: "View",
  support: "Support",
  "system-management": "System Management",
  "email-templates": "Email Templates",
  training: "Training",
  "live-tracker": "Live Tracker",
  "budget-tracker": "Budget Tracker",
  "client-hub": "Client Hub",
  "resource-scheduler": "Resource Scheduler",
  "performance-reviews": "Performance Reviews",
  "project-templates": "Project Templates",
  "defect-library": "Defect Library",
  "review-templates": "Review Templates",
  "review-analytics": "Review Analytics",
  "quality-control": "Quality Control",
  "knowledge-base": "Knowledge Base",
  "customer-profiles": "Customer Profiles",
  escalation: "Escalation",
  workflows: "Workflows",
  surveys: "Surveys",
  announcements: "Announcements",
  analytics: "Analytics",
  billing: "Billing",
  "time-tracking": "Time Tracking",
  "route-planner": "Route Planner",
  checklists: "Checklists",
  incidents: "Incidents",
  offline: "Offline Mode",
  appointments: "Appointments",
  "document-vault": "Document Vault",
  "report-annotations": "Report Annotations",
  "dashboard-widgets": "Dashboard Widgets",
};

/**
 * Breadcrumb — auto-generates breadcrumb trail from URL path.
 * Skips dynamic segments like [id] and renders as clickable links.
 */
const Breadcrumb = memo(function Breadcrumb({ className = "" }) {
  const pathname = usePathname();

  const crumbs = useMemo(() => {
    if (!pathname) return [];
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length <= 2) return []; // Don't show for top-level pages

    return segments.map((seg, i) => {
      const path = "/" + segments.slice(0, i + 1).join("/");
      const isLast = i === segments.length - 1;
      // Skip dynamic segments (MongoDB IDs)
      const isDynamic = /^[a-f0-9]{24}$/.test(seg) || seg.startsWith("[");
      const label = isDynamic ? "Details" : LABEL_MAP[seg] || seg.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

      return { path, label, isLast, isDynamic };
    });
  }, [pathname]);

  if (crumbs.length === 0) return null;

  return (
    <nav className={`flex items-center gap-1 text-xs text-gray-400 mb-4 ${className}`}>
      {crumbs.map((crumb, i) => (
        <React.Fragment key={crumb.path}>
          {i > 0 && <ChevronRight className="w-3 h-3 shrink-0" />}
          {crumb.isLast ? (
            <span className="text-gray-700 font-medium truncate max-w-[150px]">{crumb.label}</span>
          ) : (
            <Link href={crumb.path} className="hover:text-gray-600 transition-colors truncate max-w-[120px]">
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
});

export default Breadcrumb;
