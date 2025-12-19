"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, AlertCircle, Eye } from "lucide-react";
import { useUser } from "@/components/providers/UserContext";
import { useAlert } from "@/components/providers/AlertProvider";
import qcApi from "@/data/qcApi";
import { useRouter } from "next/navigation";

const QCTaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { userId } = useUser();
  const { showAlert } = useAlert();
  const router = useRouter();

  useEffect(() => {
    if (userId) {
      fetchTasks();
    }
  }, [userId, filter]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const status = filter === "all" ? "all" : filter;
      const assignments = await qcApi.getAssignments(userId, status);
      
      // Convert assignments to tasks format
      const tasksList = assignments.map(assignment => ({
        id: assignment._id,
        title: `QC Review: ${assignment.projectId?.name || 'Project'}`,
        description: `Review ${assignment.totalDetections || 0} detections`,
        status: assignment.status === 'assigned' ? 'pending' : 
                assignment.status === 'in-progress' ? 'in-progress' : 'completed',
        priority: assignment.priority || 'medium',
        dueDate: assignment.deadline,
        assignedAt: assignment.assignedAt,
        projectId: assignment.projectId?._id || assignment.projectId,
        totalDetections: assignment.totalDetections || 0,
        reviewedDetections: assignment.reviewedDetections || 0
      }));
      
      setTasks(tasksList);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      showAlert(`Error: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-rose-600" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-rose-100 text-rose-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleTaskClick = (task) => {
    if (task.projectId) {
      router.push(`/qc-technician/quality-control?projectId=${task.projectId}`);
    }
  };

  const progressPercentage = (task) => {
    if (!task.totalDetections) return 0;
    return Math.round((task.reviewedDetections / task.totalDetections) * 100);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Tasks</h1>
        <p className="text-gray-600">Manage your QC review tasks</p>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
        >
          <option value="all">All Tasks</option>
          <option value="assigned">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-gray-500">Loading tasks...</div>
          </CardContent>
        </Card>
      ) : tasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No tasks found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <Card
              key={task.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleTaskClick(task)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(task.status)}
                    <div>
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority} priority
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {task.totalDetections > 0 && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">
                          {task.reviewedDetections} / {task.totalDetections} reviewed ({progressPercentage(task)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#D76A84] via-rose-500 to-pink-600 h-2 rounded-full transition-all"
                          style={{ width: `${progressPercentage(task)}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {task.dueDate && (
                    <div className="text-sm text-gray-600">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  )}
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Review
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default QCTaskPage;

