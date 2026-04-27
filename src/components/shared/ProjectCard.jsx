"use client";

import { memo, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Eye,
  FileVideo,
  Target,
  PencilIcon,
  Trash2Icon,
  Building2,
  UserCog,
  Check,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAlert } from "@/components/providers/AlertProvider";
import { useDialog } from "@/components/providers/DialogProvider";
import { api } from "@/lib/helper";
import {
  avatarSrc,
  getAvatarColor as getAdminAvatarColor,
  getInitials as getAdminInitials,
} from "@/components/admin/constants";
import { STATUS_GRADIENTS, EDIT_ROUTE_PREFIX } from "./projectCard.constants";
import ProjectHealthBadge from "@/components/admin/project/ProjectHealthBadge";

// ---------------------------------------------------------------------------
// Default status-color & priority-color helpers (used when the caller does NOT
// pass its own functions).  The mapping is a superset of all roles.
// ---------------------------------------------------------------------------
const defaultGetStatusColor = (status) => {
  const colors = {
    planning: "bg-slate-100 text-slate-800",
    "field-capture": "bg-rose-100 text-rose-800",
    "in-progress": "bg-emerald-100 text-emerald-800",
    uploading: "bg-indigo-100 text-indigo-800",
    "ai-processing": "bg-yellow-100 text-yellow-800",
    "qc-review": "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    "customer-notified": "bg-teal-100 text-teal-800",
    review: "bg-amber-100 text-amber-800",
    "on-hold": "bg-gray-100 text-gray-600",
  };
  return colors[status] || "bg-gray-100 text-gray-600";
};

const defaultGetPriorityColor = (priority) => {
  const colors = {
    high: "text-red-600",
    medium: "text-yellow-600",
    low: "text-green-600",
  };
  return colors[priority] || "text-gray-600";
};

// ---------------------------------------------------------------------------
// Shared ProjectCard
// ---------------------------------------------------------------------------
const ProjectCard = memo((props) => {
  const {
    project,
    // Selection
    setSelectedProject,
    onSelect,
    // Actions
    onDelete,
    onEdit,
    onStatusChange,
    // Data refresh
    loadData,
    // Appearance / behaviour
    role = "admin",
    hideActions = false,
    isReadOnly = false,
    theme = "rose", // unused for now; kept for future theming hooks
    // Colour helpers – callers may pass their own (admin/operator pages do)
    getStatusColor: getStatusColorProp,
    getPriorityColor: getPriorityColorProp,
  } = props;

  const router = useRouter();
  const { showAlert } = useAlert();
  const { showDelete } = useDialog();

  // Resolve colour helpers – prefer prop, fallback to built-in
  const getStatusColor = getStatusColorProp || defaultGetStatusColor;
  const getPriorityColor = getPriorityColorProp || defaultGetPriorityColor;

  // Determine capabilities based on role
  const canEdit = !isReadOnly && !hideActions && ["admin", "operator", "user"].includes(role);
  const canDelete = !isReadOnly && !hideActions && ["admin", "user"].includes(role);
  const canApproveRejectDelete = !isReadOnly && !hideActions && role === "admin";
  const showViewButton = hideActions || isReadOnly || ["customer-rep", "customer"].includes(role);

  // ---- Status gradient ----
  const statusGradient = useMemo(() => {
    const status = project.status?.toLowerCase() || "";
    return STATUS_GRADIENTS[status] || STATUS_GRADIENTS["default"];
  }, [project.status]);

  // ---- Helper: initials ----
  const getInitials = useCallback((name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, []);

  // ---- Helper: customer name ----
  const getCustomerName = useCallback(() => {
    if (!project.customerId) return null;
    if (typeof project.customerId === "string") return null;
    const { first_name, last_name } = project.customerId;
    if (first_name || last_name) {
      return `${first_name || ""} ${last_name || ""}`.trim();
    }
    return null;
  }, [project.customerId]);

  // ---- Helper: avatar colour ----
  const getAvatarColor = useCallback((name) => {
    if (!name) return "bg-gray-500";
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    return colors[name.length % colors.length];
  }, []);

  // ---- Helper: manager display name ----
  const getManagerDisplayName = useCallback((mgr) => {
    if (!mgr) return "Unassigned";
    if (mgr.first_name) return `${mgr.first_name} ${mgr.last_name || ""}`.trim();
    return mgr.username || "Unassigned";
  }, []);

  // ---------- Delete handling (request) ----------
  const handleDelete = useCallback(
    async (projectId) => {
      if (onDelete) {
        onDelete(projectId);
        return;
      }

      const isAdmin = role === "admin";
      showDelete({
        title: "Request project deletion",
        description: isAdmin
          ? "This will mark the project for deletion and notify the assigned team and customer. The project will only be permanently removed after admin approval."
          : "This will send a delete request to the admin. The project will only be permanently removed after admin approval.",
        onConfirm: async () => {
          try {
            const response = await api(`/api/projects/request-delete/${projectId}`, "POST", {});
            if (!response.ok) {
              showAlert("Delete request failed", "error");
            } else {
              showAlert(
                isAdmin ? "Delete request submitted" : "Delete request submitted for admin approval",
                "success"
              );
              loadData?.();
            }
          } catch (error) {
            showAlert("Failed to request project deletion", "error");
          }
        },
        onCancel: () => showAlert("Cancelled", "info"),
      });
    },
    [role, onDelete, showDelete, showAlert, loadData]
  );

  // ---------- Approve / reject delete (admin only) ----------
  const handleApproveDelete = useCallback(
    async (e, projectId) => {
      e?.stopPropagation?.();
      showDelete({
        title: "Approve project deletion",
        description: "Approve and permanently delete this project?",
        onConfirm: async () => {
          try {
            const approveRes = await api(`/api/projects/approve-delete/${projectId}`, "POST");
            if (!approveRes.ok) {
              showAlert("Approval failed", "error");
              return;
            }
            const delRes = await api(`/api/projects/delete-project/${projectId}`, "DELETE");
            if (!delRes.ok) {
              showAlert("Deletion failed", "error");
              return;
            }
            showAlert("Project deleted", "success");
            loadData?.();
          } catch (err) {
            showAlert("Failed to approve/delete project", "error");
          }
        },
        onCancel: () => {},
      });
    },
    [showDelete, showAlert, loadData]
  );

  const handleRejectDelete = useCallback(
    async (e, projectId) => {
      e?.stopPropagation?.();
      try {
        const res = await api(`/api/projects/reject-delete/${projectId}`, "POST");
        if (res.ok) {
          showAlert("Delete request rejected", "success");
          loadData?.();
        } else {
          showAlert("Reject failed", "error");
        }
      } catch (err) {
        showAlert("Failed to reject delete request", "error");
      }
    },
    [showAlert, loadData]
  );

  // ---------- Card click handler ----------
  const handleCardClick = useCallback(() => {
    if (onSelect) {
      onSelect(project);
      return;
    }
    router.push(`?selectedProject=${project._id}`, { scroll: false });
    setSelectedProject?.(project);
  }, [onSelect, project, router, setSelectedProject]);

  // ---------- Edit handler ----------
  const handleEdit = useCallback(
    (e) => {
      e.stopPropagation();
      if (onEdit) {
        onEdit(project);
        return;
      }
      const prefix = EDIT_ROUTE_PREFIX[role] || EDIT_ROUTE_PREFIX.admin;
      router.push(`${prefix}/${project._id}`);
    },
    [onEdit, project, role, router]
  );

  // ---------- Derived values ----------
  const customerName = getCustomerName();
  const videoCount = project.videoCount ?? (project.videoUrl ? 1 : 0);
  const isPendingDelete = project.deleteStatus === "pending";
  const headerGradient = isPendingDelete
    ? "from-gray-300 via-gray-400 to-gray-500"
    : statusGradient.header;

  // Footer data for the user role (operator + QC tech)
  const operatorUser = project.assignedOperator?.userId;
  const operatorName =
    operatorUser && typeof operatorUser === "object"
      ? `${operatorUser.first_name || ""} ${operatorUser.last_name || ""}`.trim()
      : null;
  const operatorId = operatorUser?._id;
  const qcUser = project.qcTechnician?.userId;
  const qcName =
    qcUser && typeof qcUser === "object"
      ? `${qcUser.first_name || ""} ${qcUser.last_name || ""}`.trim()
      : null;
  const qcId = qcUser?._id;

  // -----------------------------------------------------------------------
  return (
    <Card
      className={`flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 p-0 cursor-pointer border-0 shadow-md ${
        isPendingDelete ? "bg-gray-100 dark:bg-[#27272a]" : ""
      }`}
      onClick={handleCardClick}
    >
      {/* ── Header with Status-based Gradient ── */}
      <CardHeader
        className={`bg-gradient-to-r ${headerGradient} text-white p-6 h-full relative overflow-hidden`}
      >
        {/* Decorative circles */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full border-4 border-white" />
          <div className="absolute -right-4 -bottom-12 w-24 h-24 rounded-full border-4 border-white" />
        </div>

        <div className="flex justify-between items-start relative z-10">
          <div className="flex-1">
            <CardTitle className="text-white text-xl mb-2 font-bold">
              {project.name}
            </CardTitle>
            <p className="text-white/90 text-sm mb-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {project.client}
            </p>
            <p className="text-white/80 text-sm">{project.location}</p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {role === "admin" && project?._id && (
              <div className="mr-1">
                <ProjectHealthBadge projectId={project._id} compact />
              </div>
            )}
            {canEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 h-8 w-8"
                onClick={handleEdit}
              >
                <PencilIcon size={16} />
              </Button>
            )}

            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(project._id);
                }}
              >
                <Trash2Icon size={16} />
              </Button>
            )}

            {showViewButton && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick();
                }}
              >
                <Eye size={16} />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* ── Card Body ── */}
      <CardContent className="flex flex-col justify-between flex-grow p-5 space-y-4 bg-white dark:bg-zinc-900">
        <div>
          {/* Status + Priority badges */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                project.status
              )}`}
            >
              {project.status?.replace("-", " ").toUpperCase()}
            </span>
            <span
              className={`text-xs font-semibold ${getPriorityColor(project.priority)}`}
            >
              {project.priority?.toUpperCase()}
            </span>
            {isPendingDelete && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                Pending Deletion
              </span>
            )}
          </div>

          {/* Pending-delete messaging & approve/reject (admin) */}
          {isPendingDelete && canApproveRejectDelete && (
            <>
              <p className="mb-3 text-xs text-gray-100/90">
                This project is pending deletion. Review the request and choose{" "}
                <span className="font-semibold">Approve delete</span> or{" "}
                <span className="font-semibold">Reject</span>.
              </p>
              <div className="flex gap-2 mb-4" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  variant="default"
                  className="gap-1 bg-green-600 hover:bg-green-700"
                  onClick={(e) => handleApproveDelete(e, project._id)}
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve delete
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 bg-white/90 text-gray-800 hover:bg-white"
                  onClick={(e) => handleRejectDelete(e, project._id)}
                >
                  <X className="w-3.5 h-3.5" />
                  Reject
                </Button>
              </div>
            </>
          )}

          {/* Pending-delete info for non-admin roles */}
          {isPendingDelete && !canApproveRejectDelete && (
            <p className="mb-4 text-xs text-gray-600 bg-gray-100 border border-gray-200 rounded-lg px-3 py-2">
              This project is pending deletion and will be permanently removed
              after an admin approves the request.
            </p>
          )}

          {/* Customer Info Section */}
          {customerName && (
            <div
              className={`bg-gradient-to-r from-${statusGradient.accent}-50 to-${statusGradient.accent}-50/50 p-3 rounded-xl mb-4 border border-${statusGradient.accent}-100`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium ${getAvatarColor(
                    customerName
                  )}`}
                >
                  {getInitials(customerName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Building2 className={`h-3.5 w-3.5 ${statusGradient.videoText}`} />
                    <span className={`text-xs ${statusGradient.videoText} font-medium`}>
                      Customer
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {customerName}
                  </p>
                  {project.customerId?.email && (
                    <p className="text-xs text-gray-500 truncate">
                      {project.customerId.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Progress Section */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400 font-medium">
                Progress
              </span>
              <span className="font-bold text-gray-900 dark:text-gray-100">
                {project.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-zinc-700 rounded-full h-2.5 overflow-hidden">
              <div
                className={`bg-gradient-to-r ${statusGradient.progress} h-2.5 rounded-full transition-all duration-500 ease-out`}
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          {/* Videos & AI Detections */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div
              className={`${statusGradient.videoBg} p-3 rounded-xl flex items-center gap-3 transition-all hover:scale-[1.02]`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusGradient.videoText} bg-white shadow-sm`}
              >
                <FileVideo size={20} />
              </div>
              <div>
                <div className={`font-bold text-lg ${statusGradient.videoTextDark}`}>
                  {videoCount}
                </div>
                <div className={`text-xs ${statusGradient.videoText}`}>Videos</div>
              </div>
            </div>
            <div
              className={`${statusGradient.aiDetectionBg} p-3 rounded-xl flex items-center gap-3 transition-all hover:scale-[1.02]`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusGradient.aiDetectionText} bg-white shadow-sm`}
              >
                <Target size={20} />
              </div>
              <div>
                <div className={`font-bold text-lg ${statusGradient.aiDetectionTextDark}`}>
                  {project.aiDetections?.total || 0}
                </div>
                <div className={`text-xs ${statusGradient.aiDetectionText}`}>
                  AI Detections
                </div>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="space-y-2 text-sm bg-gray-50 dark:bg-zinc-800 rounded-xl p-3">
            {/* Operator role shows Project Lead inside details */}
            {role === "operator" && project.managerId && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500 flex items-center gap-1">
                  <UserCog className="w-3.5 h-3.5" /> Project Lead:
                </span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {getManagerDisplayName(project.managerId)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Length:</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {project.totalLength}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Material:</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {project.pipelineMaterial}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Work Order:</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {project.workOrder}
              </span>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        {role === "user" ? (
          /* User role: Operator + QC Tech footer */
          <div className="pt-4 border-t border-gray-100 dark:border-zinc-700 mt-auto">
            <div className="flex items-center justify-between">
              {/* Operator */}
              <div className="flex items-center gap-2">
                {operatorId ? (
                  <img
                    src={avatarSrc({ _id: operatorId })}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover border-2 border-blue-200"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-blue-200 ${getAdminAvatarColor(
                    operatorName || "?"
                  )}`}
                  style={{ display: operatorId ? "none" : "flex" }}
                >
                  {getAdminInitials(operatorName || "?")}
                </div>
                <div>
                  <p className="text-[9px] text-blue-500 font-medium">Operator</p>
                  <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[90px]">
                    {operatorName || "Unassigned"}
                  </p>
                </div>
              </div>

              {/* QC Tech */}
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-[9px] text-rose-500 font-medium">QC Tech</p>
                  <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[90px]">
                    {qcName || "Unassigned"}
                  </p>
                </div>
                {qcId ? (
                  <img
                    src={avatarSrc({ _id: qcId })}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover border-2 border-rose-200"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-rose-200 ${getAdminAvatarColor(
                    qcName || "?"
                  )}`}
                  style={{ display: qcId ? "none" : "flex" }}
                >
                  {getAdminInitials(qcName || "?")}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Admin / Operator / other roles: Team Lead footer */
          <div className="pt-4 border-t border-gray-100 dark:border-zinc-700 text-sm flex items-center mt-auto">
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <div className="relative w-9 h-9 shrink-0">
                {project.managerId?._id && (
                  <img
                    src={avatarSrc({ _id: project.managerId._id })}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover shadow-sm"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                )}
                <div
                  className={`w-9 h-9 rounded-full items-center justify-center text-white text-sm font-medium shadow-sm ${getAvatarColor(
                    getManagerDisplayName(project.managerId)
                  )}`}
                  style={{
                    display: project.managerId?._id ? "none" : "flex",
                  }}
                >
                  {getInitials(getManagerDisplayName(project.managerId))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400">Team Lead</p>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {getManagerDisplayName(project.managerId)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

ProjectCard.displayName = "ProjectCard";

export default ProjectCard;
