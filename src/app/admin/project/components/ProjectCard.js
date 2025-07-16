"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Share2, FileVideo, Target, User, PencilIcon, DeleteIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAlert } from "@/components/providers/AlertProvider";
import { useDialog } from "@/components/providers/DialogProvider";
import { api } from "@/lib/helper";

const ProjectCard = (props) => {
  const {
    project,
    setSelectedProject,
    getStatusColor,
    getPriorityColor,
    loadData,
  } = props
  const router = useRouter();
  const{showAlert} = useAlert();
  const {showDelete} = useDialog();

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate a consistent color based on name
  const getAvatarColor = (name) => {
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
  };

  const handleDelete = async (project_id) => {
    showDelete({
      title: "Delete Projects",
      description:
        "Are you sure it will be deleted to our system but you can create another one ?",
      onConfirm: async () => {
        try {
          const {ok,data} = await api(`/api/projects/delete-project/${project_id}`, "DELETE")
          if(!ok){
            showAlert('Project Deletion Failed','error')
          } 
          else {
           showAlert("Project deleted", "success");
           loadData();
          }
        } 
        catch (error) {
          showAlert("Failed to delete project", "error");
        }
      },
      onCancel: () => showAlert("Cancelled", "info"),
    });
  };



  return (
    <Card className="flex flex-col h-full overflow-hidden transition-shadow hover:shadow-xl p-0">
     <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-6 h-full">

        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-white text-xl mb-2">
              {project.name}
            </CardTitle>
            <p className="text-blue-100 text-sm mb-1">{project.client}</p>
            <p className="text-blue-100 text-sm">{project.location}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white hover:bg-opacity-20"
              onClick={() => setSelectedProject(project)}
            >
              <Eye size={18} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white hover:bg-opacity-20"
              onClick={() => router.push(`/admin/project/editProject/${project._id}`)}
            >
              <PencilIcon size={18} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white hover:bg-opacity-20"
              onClick={() => handleDelete(project._id)}
            >
              <Trash2Icon size={18} />
            </Button>

          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col justify-between flex-grow p-6 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                project.status
              )}`}
            >
              {project.status.replace("-", " ").toUpperCase()}
            </span>
            <span
              className={`text-sm font-medium ${getPriorityColor(
                project.priority
              )}`}
            >
              {project.priority.toUpperCase()}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-gray-900">
                {project.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-2">
              <FileVideo className="text-blue-600" size={20} />
              <div>
                <div className="font-semibold text-blue-900">
                  {project.videoCount}
                </div>
                <div className="text-xs text-blue-700">Videos</div>
              </div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg flex items-center gap-2">
              <Target className="text-purple-600" size={20} />
              <div>
                <div className="font-semibold text-purple-900">
                  {project.aiDetections.total}
                </div>
                <div className="text-xs text-purple-700">AI Detections</div>
              </div>
            </div>
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Length:</span>
              <span className="font-medium">{project.totalLength}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Material:</span>
              <span className="font-medium">{project.pipelineMaterial}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Work Order:</span>
              <span className="font-medium">{project.workOrder}</span>
            </div>
          </div>
        </div>

        {/* ✅ Fixed footer section at bottom */}
        <div className="pt-4 border-t border-gray-200 text-sm flex justify-between items-center mt-auto">
          <div className="flex items-center gap-3 text-gray-600">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getAvatarColor(
                project.assignedOperator.name
              )}`}
            >
              {getInitials(project.assignedOperator.name)}
            </div>
            <span className="font-medium text-gray-700">
              {project.assignedOperator.name}
            </span>
          </div>
          <div className="text-gray-500">
            Due:{" "}
            {new Date(
              project.estimatedCompletion || project.estimated_completion
            ).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
