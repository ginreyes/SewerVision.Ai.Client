"use client";

import { memo, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, FileVideo, Target, PencilIcon, Trash2Icon, Building2, UserCog, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAlert } from "@/components/providers/AlertProvider";
import { useDialog } from "@/components/providers/DialogProvider";
import { api } from "@/lib/helper";

const ProjectCard = memo((props) => {
  const {
    project,
    setSelectedProject,
    getStatusColor,
    getPriorityColor,
    loadData,
    hideActions = false, // Hide edit/delete buttons for QC technicians
  } = props;
  const router = useRouter();
  const { showAlert } = useAlert();
  const { showDelete } = useDialog();

  // Status-based gradient colors
  const statusGradient = useMemo(() => {
    const status = project.status?.toLowerCase() || '';

    const gradients = {
      // Planning - Blue theme
      'planning': {
        header: 'from-blue-500 via-blue-600 to-indigo-600',
        progress: 'from-blue-500 via-blue-600 to-indigo-600',
        accent: 'blue',
        videoBg: 'bg-blue-50',
        videoText: 'text-blue-600',
        videoTextDark: 'text-blue-900',
        aiDetectionBg: 'bg-indigo-50',
        aiDetectionText: 'text-indigo-600',
        aiDetectionTextDark: 'text-indigo-900',
      },
      // In Progress - Green theme
      'in-progress': {
        header: 'from-emerald-500 via-green-500 to-teal-600',
        progress: 'from-emerald-500 via-green-500 to-teal-600',
        accent: 'green',
        videoBg: 'bg-emerald-50',
        videoText: 'text-emerald-600',
        videoTextDark: 'text-emerald-900',
        aiDetectionBg: 'bg-teal-50',
        aiDetectionText: 'text-teal-600',
        aiDetectionTextDark: 'text-teal-900',
      },
      // AI Processing - Purple/Violet theme
      'ai-processing': {
        header: 'from-violet-500 via-purple-500 to-fuchsia-600',
        progress: 'from-violet-500 via-purple-500 to-fuchsia-600',
        accent: 'purple',
        videoBg: 'bg-violet-50',
        videoText: 'text-violet-600',
        videoTextDark: 'text-violet-900',
        aiDetectionBg: 'bg-fuchsia-50',
        aiDetectionText: 'text-fuchsia-600',
        aiDetectionTextDark: 'text-fuchsia-900',
      },
      // Completed - Amber/Gold theme
      'completed': {
        header: 'from-amber-500 via-yellow-500 to-orange-500',
        progress: 'from-amber-500 via-yellow-500 to-orange-500',
        accent: 'amber',
        videoBg: 'bg-amber-50',
        videoText: 'text-amber-600',
        videoTextDark: 'text-amber-900',
        aiDetectionBg: 'bg-orange-50',
        aiDetectionText: 'text-orange-600',
        aiDetectionTextDark: 'text-orange-900',
      },
      // On Hold - Slate/Gray theme
      'on-hold': {
        header: 'from-slate-500 via-gray-500 to-zinc-600',
        progress: 'from-slate-500 via-gray-500 to-zinc-600',
        accent: 'gray',
        videoBg: 'bg-slate-50',
        videoText: 'text-slate-600',
        videoTextDark: 'text-slate-900',
        aiDetectionBg: 'bg-zinc-50',
        aiDetectionText: 'text-zinc-600',
        aiDetectionTextDark: 'text-zinc-900',
      },
      // Review - Cyan/Teal theme
      'review': {
        header: 'from-cyan-500 via-sky-500 to-blue-500',
        progress: 'from-cyan-500 via-sky-500 to-blue-500',
        accent: 'cyan',
        videoBg: 'bg-cyan-50',
        videoText: 'text-cyan-600',
        videoTextDark: 'text-cyan-900',
        aiDetectionBg: 'bg-sky-50',
        aiDetectionText: 'text-sky-600',
        aiDetectionTextDark: 'text-sky-900',
      },
      // Default (fallback) - Rose/Pink theme
      'default': {
        header: 'from-rose-500 via-pink-500 to-red-500',
        progress: 'from-rose-500 via-pink-500 to-red-500',
        accent: 'rose',
        videoBg: 'bg-rose-50',
        videoText: 'text-rose-600',
        videoTextDark: 'text-rose-900',
        aiDetectionBg: 'bg-pink-50',
        aiDetectionText: 'text-pink-600',
        aiDetectionTextDark: 'text-pink-900',
      },
    };

    return gradients[status] || gradients['default'];
  }, [project.status]);

  // Memoize helper functions
  const getInitials = useCallback((name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, []);

  // Get customer full name
  const getCustomerName = useCallback(() => {
    if (!project.customerId) return null;
    if (typeof project.customerId === 'string') return null; // Not populated
    const { first_name, last_name } = project.customerId;
    if (first_name || last_name) {
      return `${first_name || ''} ${last_name || ''}`.trim();
    }
    return null;
  }, [project.customerId]);

  // Generate a consistent color based on name
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
    const index = name.length % colors.length;
    return colors[index];
  }, []);

  const handleDelete = async (project_id) => {
    showDelete({
      title: "Delete Projects",
      description:
        "Are you sure it will be deleted to our system but you can create another one ?",
      onConfirm: async () => {
        try {
          const { ok } = await api(`/api/projects/delete-project/${project_id}`, "DELETE");
          if (!ok) {
            showAlert('Project Deletion Failed', 'error');
          } else {
            showAlert("Project deleted", "success");
            loadData?.();
          }
        } catch (error) {
          showAlert("Failed to delete project", "error");
        }
      },
      onCancel: () => showAlert("Cancelled", "info"),
    });
  };

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

  const customerName = getCustomerName();

  // Get actual video count
  const videoCount = project.videoCount ?? (project.videoUrl ? 1 : 0);

  return (
    <Card
      className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 p-0 cursor-pointer border-0 shadow-md"
      onClick={() => {
        router.push(`?selectedProject=${project._id}`, { scroll: false });
        setSelectedProject(project);
      }}
    >
      {/* Header with Status-based Gradient */}
      <CardHeader className={`bg-gradient-to-r ${statusGradient.header} text-white p-6 h-full relative overflow-hidden`}>
        {/* Decorative pattern */}
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
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            {!hideActions && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/user/project/editProject/${project._id}`);
                  }}
                >
                  <PencilIcon size={16} />
                </Button>

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
              </>
            )}
            {hideActions && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`?selectedProject=${project._id}`, { scroll: false });
                  setSelectedProject(project);
                }}
              >
                <Eye size={16} />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col justify-between flex-grow p-5 space-y-4 bg-white">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                project.status
              )}`}
            >
              {project.status.replace("-", " ").toUpperCase()}
            </span>
            <span
              className={`text-xs font-semibold ${getPriorityColor(
                project.priority
              )}`}
            >
              {project.priority.toUpperCase()}
            </span>
            {project.deleteStatus === "pending" && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                Pending Deletion
              </span>
            )}
          </div>
          {project.deleteStatus === "pending" && !hideActions && (
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
                className="gap-1"
                onClick={(e) => handleRejectDelete(e, project._id)}
              >
                <X className="w-3.5 h-3.5" />
                Reject
              </Button>
            </div>
          )}

          {/* Customer Info Section */}
          {customerName && (
            <div className={`bg-gradient-to-r from-${statusGradient.accent}-50 to-${statusGradient.accent}-50/50 p-3 rounded-xl mb-4 border border-${statusGradient.accent}-100`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium ${getAvatarColor(customerName)}`}>
                  {getInitials(customerName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Building2 className={`h-3.5 w-3.5 ${statusGradient.videoText}`} />
                    <span className={`text-xs ${statusGradient.videoText} font-medium`}>Customer</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 truncate">{customerName}</p>
                  {project.customerId?.email && (
                    <p className="text-xs text-gray-500 truncate">{project.customerId.email}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Progress Section */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">Progress</span>
              <span className="font-bold text-gray-900">
                {project.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`bg-gradient-to-r ${statusGradient.progress} h-2.5 rounded-full transition-all duration-500 ease-out`}
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          {/* Videos & AI Detections */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className={`${statusGradient.videoBg} p-3 rounded-xl flex items-center gap-3 transition-all hover:scale-[1.02]`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusGradient.videoText} bg-white shadow-sm`}>
                <FileVideo size={20} />
              </div>
              <div>
                <div className={`font-bold text-lg ${statusGradient.videoTextDark}`}>
                  {videoCount}
                </div>
                <div className={`text-xs ${statusGradient.videoText}`}>Videos</div>
              </div>
            </div>
            <div className={`${statusGradient.aiDetectionBg} p-3 rounded-xl flex items-center gap-3 transition-all hover:scale-[1.02]`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusGradient.aiDetectionText} bg-white shadow-sm`}>
                <Target size={20} />
              </div>
              <div>
                <div className={`font-bold text-lg ${statusGradient.aiDetectionTextDark}`}>
                  {project.aiDetections?.total || 0}
                </div>
                <div className={`text-xs ${statusGradient.aiDetectionText}`}>AI Detections</div>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="space-y-2 text-sm bg-gray-50 rounded-xl p-3">
            {project.managerId && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500 flex items-center gap-1">
                  <UserCog className="w-3.5 h-3.5" /> Project Lead:
                </span>
                <span className="font-semibold text-gray-800">
                  {project.managerId.first_name && project.managerId.last_name
                    ? `${project.managerId.first_name} ${project.managerId.last_name}`
                    : project.managerId.username || "—"}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Length:</span>
              <span className="font-semibold text-gray-800">{project.totalLength}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Material:</span>
              <span className="font-semibold text-gray-800">{project.pipelineMaterial}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Work Order:</span>
              <span className="font-semibold text-gray-800">{project.workOrder}</span>
            </div>
          </div>
        </div>

        {/* Footer section - Team Lead */}
        <div className="pt-4 border-t border-gray-100 text-sm flex items-center mt-auto">
          <div className="flex items-center gap-3 text-gray-600">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm ${getAvatarColor(
                (project.managerId?.first_name && project.managerId?.last_name)
                  ? `${project.managerId.first_name} ${project.managerId.last_name}`
                  : project.managerId?.username || "Unknown"
              )}`}
            >
              {getInitials(
                (project.managerId?.first_name && project.managerId?.last_name)
                  ? `${project.managerId.first_name} ${project.managerId.last_name}`
                  : project.managerId?.username || "UN"
              )}
            </div>
            <div>
              <p className="text-xs text-gray-400">Team Lead</p>
              <span className="font-semibold text-gray-700">
                {(project.managerId?.first_name && project.managerId?.last_name)
                  ? `${project.managerId.first_name} ${project.managerId.last_name}`
                  : project.managerId?.username || "Unassigned"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ProjectCard.displayName = 'ProjectCard';

export default ProjectCard;