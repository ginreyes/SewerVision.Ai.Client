"use client";

/**
 * User edit project — same form as admin. When the current user has role "user",
 * the shared EditProjectPage shows "Team Assignment (QC & Operator)", filters
 * operator/QC to managedMembers, and sends Back/Save to /user/project.
 */
import EditProjectPage from "@/app/admin/project/editProject/[project_id]/page";

export default EditProjectPage;
