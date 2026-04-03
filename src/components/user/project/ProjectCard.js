"use client";

import { memo, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, FileVideo, Target, PencilIcon, Trash2Icon, Building2, UserCog, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAlert } from "@/components/providers/AlertProvider";
import { useDialog } from "@/components/providers/DialogProvider";
import { api } from "@/lib/helper";
import { getProjectStatusColor, getProjectPriorityColor } from "@/components/user/constants";
import { avatarSrc, getAvatarColor as getAdminAvatarColor, getInitials as getAdminInitials } from "@/components/admin/constants";

const ProjectCard = memo((props) => {
  const {
    project,
    setSelectedProject,
    loadData,
    hideActions = false,
  } = props;
  const router = useRouter();
  const { showAlert } = useAlert();
  const { showDelete } = useDialog();

  // Clean, elegant status header colors (single-tone, professional)
  const statusGradient = useMemo(() => {
    const status = project.status?.toLowerCase() || '';
    const styles = {
      'planning': {
        header: 'from-slate-500 to-slate-600',
        progress: 'bg-slate-500',
        accent: 'slate',
        videoBg: 'bg-slate-50', videoText: 'text-slate-600', videoTextDark: 'text-slate-900',
        aiDetectionBg: 'bg-slate-50', aiDetectionText: 'text-slate-600', aiDetectionTextDark: 'text-slate-900',
      },
      'in-progress': {
        header: 'from-blue-500 to-blue-600',
        progress: 'bg-blue-500',
        accent: 'blue',
        videoBg: 'bg-blue-50', videoText: 'text-blue-600', videoTextDark: 'text-blue-900',
        aiDetectionBg: 'bg-blue-50', aiDetectionText: 'text-blue-600', aiDetectionTextDark: 'text-blue-900',
      },
      'field-capture': {
        header: 'from-blue-500 to-blue-600',
        progress: 'bg-blue-500',
        accent: 'blue',
        videoBg: 'bg-blue-50', videoText: 'text-blue-600', videoTextDark: 'text-blue-900',
        aiDetectionBg: 'bg-blue-50', aiDetectionText: 'text-blue-600', aiDetectionTextDark: 'text-blue-900',
      },
      'uploading': {
        header: 'from-cyan-500 to-cyan-600',
        progress: 'bg-cyan-500',
        accent: 'cyan',
        videoBg: 'bg-cyan-50', videoText: 'text-cyan-600', videoTextDark: 'text-cyan-900',
        aiDetectionBg: 'bg-cyan-50', aiDetectionText: 'text-cyan-600', aiDetectionTextDark: 'text-cyan-900',
      },
      'ai-processing': {
        header: 'from-violet-500 to-violet-600',
        progress: 'bg-violet-500',
        accent: 'violet',
        videoBg: 'bg-violet-50', videoText: 'text-violet-600', videoTextDark: 'text-violet-900',
        aiDetectionBg: 'bg-violet-50', aiDetectionText: 'text-violet-600', aiDetectionTextDark: 'text-violet-900',
      },
      'qc-review': {
        header: 'from-amber-500 to-amber-600',
        progress: 'bg-amber-500',
        accent: 'amber',
        videoBg: 'bg-amber-50', videoText: 'text-amber-600', videoTextDark: 'text-amber-900',
        aiDetectionBg: 'bg-amber-50', aiDetectionText: 'text-amber-600', aiDetectionTextDark: 'text-amber-900',
      },
      'completed': {
        header: 'from-emerald-500 to-emerald-600',
        progress: 'bg-emerald-500',
        accent: 'emerald',
        videoBg: 'bg-emerald-50', videoText: 'text-emerald-600', videoTextDark: 'text-emerald-900',
        aiDetectionBg: 'bg-emerald-50', aiDetectionText: 'text-emerald-600', aiDetectionTextDark: 'text-emerald-900',
      },
      'customer-notified': {
        header: 'from-emerald-500 to-emerald-600',
        progress: 'bg-emerald-500',
        accent: 'emerald',
        videoBg: 'bg-emerald-50', videoText: 'text-emerald-600', videoTextDark: 'text-emerald-900',
        aiDetectionBg: 'bg-emerald-50', aiDetectionText: 'text-emerald-600', aiDetectionTextDark: 'text-emerald-900',
      },
      'on-hold': {
        header: 'from-red-400 to-red-500',
        progress: 'bg-red-400',
        accent: 'red',
        videoBg: 'bg-red-50', videoText: 'text-red-600', videoTextDark: 'text-red-900',
        aiDetectionBg: 'bg-red-50', aiDetectionText: 'text-red-600', aiDetectionTextDark: 'text-red-900',
      },
      'default': {
        header: 'from-indigo-500 to-indigo-600',
        progress: 'bg-indigo-500',
        accent: 'indigo',
        videoBg: 'bg-indigo-50', videoText: 'text-indigo-600', videoTextDark: 'text-indigo-900',
        aiDetectionBg: 'bg-indigo-50', aiDetectionText: 'text-indigo-600', aiDetectionTextDark: 'text-indigo-900',
      },
    };
    return styles[status] || styles['default'];
  }, [project.status]);

  const getInitials = useCallback((name) => {
    if (!name) return "??";
    return name.split(" ").map((word) => word.charAt(0)).join("").toUpperCase().slice(0, 2);
  }, []);

  const getCustomerName = useCallback(() => {
    if (!project.customerId) return null;
    if (typeof project.customerId === 'string') return null;
    const { first_name, last_name } = project.customerId;
    if (first_name || last_name) return `${first_name || ''} ${last_name || ''}`.trim();
    return null;
  }, [project.customerId]);

  const getAvatarColor = useCallback((name) => {
    if (!name) return "bg-gray-500";
    const colors = ["bg-red-500","bg-blue-500","bg-green-500","bg-yellow-500","bg-purple-500","bg-pink-500","bg-indigo-500","bg-teal-500"];
    return colors[name.length % colors.length];
  }, []);

  const handleDelete = async (project_id) => {
    showDelete({
      title: "Request project deletion",
      description: "This will send a delete request to the admin. The project will only be permanently removed after admin approval.",
      onConfirm: async () => {
        try {
          const response = await api(`/api/projects/request-delete/${project_id}`, "POST", {});
          if (response.ok) { showAlert("Delete request submitted for admin approval", "success"); loadData?.(); }
          else showAlert('Delete request failed', 'error');
        } catch { showAlert("Failed to request project deletion", "error"); }
      },
      onCancel: () => showAlert("Cancelled", "info"),
    });
  };

  const customerName = getCustomerName();
  const videoCount = project.videoCount ?? (project.videoUrl ? 1 : 0);
  const isPendingDelete = project.deleteStatus === "pending";
  const headerGradient = isPendingDelete ? "from-gray-300 to-gray-400" : statusGradient.header;

  // Team members for footer
  const operatorUser = project.assignedOperator?.userId;
  const operatorName = operatorUser && typeof operatorUser === 'object' ? `${operatorUser.first_name || ''} ${operatorUser.last_name || ''}`.trim() : null;
  const operatorId = operatorUser?._id;
  const qcUser = project.qcTechnician?.userId;
  const qcName = qcUser && typeof qcUser === 'object' ? `${qcUser.first_name || ''} ${qcUser.last_name || ''}`.trim() : null;
  const qcId = qcUser?._id;

  return (
    <Card
      className={`flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 p-0 cursor-pointer border-0 shadow-md ${isPendingDelete ? "bg-gray-50" : ""}`}
      onClick={() => { router.push(`?selectedProject=${project._id}`, { scroll: false }); setSelectedProject(project); }}
    >
      {/* Header — clean single-tone gradient */}
      <CardHeader className={`bg-gradient-to-r ${headerGradient} text-white p-6 h-full relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full border-4 border-white" />
          <div className="absolute -right-4 -bottom-12 w-24 h-24 rounded-full border-4 border-white" />
        </div>
        <div className="flex justify-between items-start relative z-10">
          <div className="flex-1">
            <CardTitle className="text-white text-xl mb-2 font-bold">{project.name}</CardTitle>
            <p className="text-white/90 text-sm mb-1 flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{project.client}</p>
            <p className="text-white/80 text-sm">{project.location}</p>
          </div>
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            {!hideActions && (
              <>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8"
                  onClick={(e) => { e.stopPropagation(); router.push(`/user/project/editProject/${project._id}`); }}>
                  <PencilIcon size={16} />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8"
                  onClick={(e) => { e.stopPropagation(); handleDelete(project._id); }}>
                  <Trash2Icon size={16} />
                </Button>
              </>
            )}
            {hideActions && (
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8"
                onClick={(e) => { e.stopPropagation(); setSelectedProject(project); }}>
                <Eye size={16} />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col justify-between flex-grow p-5 space-y-4 bg-white">
        <div>
          {/* Status + Priority */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getProjectStatusColor(project.status)}`}>
              {project.status.replace("-", " ").toUpperCase()}
            </span>
            <span className={`text-xs font-semibold ${getProjectPriorityColor(project.priority)}`}>
              {project.priority?.toUpperCase()}
            </span>
          </div>

          {/* Customer */}
          {customerName && (
            <div className={`bg-${statusGradient.accent}-50 p-3 rounded-xl mb-4 border border-${statusGradient.accent}-100`}>
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
                  {project.customerId?.email && <p className="text-xs text-gray-500 truncate">{project.customerId.email}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Progress */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">Progress</span>
              <span className="font-bold text-gray-900">{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div className={`${statusGradient.progress} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${project.progress}%` }} />
            </div>
          </div>

          {/* Videos & AI Detections */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className={`${statusGradient.videoBg} p-3 rounded-xl flex items-center gap-3`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusGradient.videoText} bg-white shadow-sm`}>
                <FileVideo size={20} />
              </div>
              <div>
                <div className={`font-bold text-lg ${statusGradient.videoTextDark}`}>{videoCount}</div>
                <div className={`text-xs ${statusGradient.videoText}`}>Videos</div>
              </div>
            </div>
            <div className={`${statusGradient.aiDetectionBg} p-3 rounded-xl flex items-center gap-3`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusGradient.aiDetectionText} bg-white shadow-sm`}>
                <Target size={20} />
              </div>
              <div>
                <div className={`font-bold text-lg ${statusGradient.aiDetectionTextDark}`}>{project.aiDetections?.total || 0}</div>
                <div className={`text-xs ${statusGradient.aiDetectionText}`}>AI Detections</div>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="space-y-2 text-sm bg-gray-50 rounded-xl p-3">
            <div className="flex justify-between"><span className="text-gray-500">Length:</span><span className="font-semibold text-gray-800">{project.totalLength}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Material:</span><span className="font-semibold text-gray-800">{project.pipelineMaterial}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Work Order:</span><span className="font-semibold text-gray-800">{project.workOrder}</span></div>
          </div>
        </div>

        {/* Footer: Operator + QC Tech (not Team Lead — since user IS the team lead) */}
        <div className="pt-4 border-t border-gray-100 mt-auto">
          <div className="flex items-center justify-between">
            {/* Operator */}
            <div className="flex items-center gap-2">
              {operatorId ? (
                <img src={avatarSrc({ _id: operatorId })} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-blue-200"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
              ) : null}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-blue-200 ${getAdminAvatarColor(operatorName || '?')}`}
                style={{ display: operatorId ? 'none' : 'flex' }}>
                {getAdminInitials(operatorName || '?')}
              </div>
              <div>
                <p className="text-[9px] text-blue-500 font-medium">Operator</p>
                <p className="text-[11px] font-semibold text-gray-700 truncate max-w-[90px]">{operatorName || "Unassigned"}</p>
              </div>
            </div>

            {/* QC Tech */}
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-[9px] text-rose-500 font-medium">QC Tech</p>
                <p className="text-[11px] font-semibold text-gray-700 truncate max-w-[90px]">{qcName || "Unassigned"}</p>
              </div>
              {qcId ? (
                <img src={avatarSrc({ _id: qcId })} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-rose-200"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
              ) : null}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-rose-200 ${getAdminAvatarColor(qcName || '?')}`}
                style={{ display: qcId ? 'none' : 'flex' }}>
                {getAdminInitials(qcName || '?')}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ProjectCard.displayName = 'ProjectCard';
export default ProjectCard;
