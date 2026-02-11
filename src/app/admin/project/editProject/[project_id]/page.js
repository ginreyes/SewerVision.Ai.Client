"use client";

import { useState, useCallback, memo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAlert } from "@/components/providers/AlertProvider";
import { api } from "@/lib/helper";
import {
  Edit3,
  Building2,
  Settings,
  Users,
  Calendar,
  Video,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Save,
  Loader2,
  UserCheck,
  Search,
  Target,
  FileVideo,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/providers/UserContext";
import { useParams } from "next/navigation";

// Memoized Input Field Component
const InputField = memo(
  ({
    label,
    name,
    value,
    onChange,
    required = false,
    type = "text",
    error,
    placeholder,
    disabled = false,
  }) => {
    const handleChange = useCallback(
      (e) => {
        onChange(name, e.target.value);
      },
      [name, onChange]
    );

    return (
      <div className="space-y-2">
        <Label htmlFor={name} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Input
          id={name}
          name={name}
          value={value || ""}
          onChange={handleChange}
          required={required}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={`h-10 transition-all duration-200 ${
            disabled ? "bg-gray-50 cursor-not-allowed" : ""
          } ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-100"
              : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
          }`}
        />
        {error && (
          <span className="text-red-500 text-sm flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {error}
          </span>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";

export default function EditProjectPage() {
  const { project_id } = useParams();

  const router = useRouter();
  const { userId, userData } = useUser();
  const { showAlert } = useAlert();

  const user_id = userId;
  const isUserRole = userData?.role === "user";
  const projectsPath = isUserRole ? "/user/project" : "/admin/project";

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetchingProject, setFetchingProject] = useState(true);
  const [errors, setErrors] = useState({});

  // Original project data for reset functionality
  const [originalProject, setOriginalProject] = useState(null);

  // User data states (operators & QC for user role; leads = users with role "user" for admin)
  const [operators, setOperators] = useState([]);
  const [qcTechnicians, setQcTechnicians] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    customerId: "",
    client: "",
    workOrder: "",
    priority: "medium",
    status: "planning",
    progress: 0,
    estimated_completion: "",
    totalLength: "",
    pipelineMaterial: "",
    pipelineShape: "",
    videoCount: 0,
    confidence: 0,
    managerId: "",
    assignedOperator: {
      userId: "",
      name: "",
      email: "",
      certification: "",
    },
    qcTechnician: {
      userId: "",
      name: "",
      email: "",
      certification: "",
    },
    metadata: {
      recordingDate: "",
      upstreamMH: "",
      downstreamMH: "",
      shape: "",
      material: "",
      remarks: "",
    },
    aiDetections: {
      fractures: 0,
      cracks: 0,
      broken_pipes: 0,
      roots: 0,
      total: 0,
    },
  });

  const [videoFile, setVideoFile] = useState(null);

  // Fetch project data
  const fetchProject = useCallback(async () => {
    if (!project_id) return;

    try {
      setFetchingProject(true);
      const { ok, data } = await api(
        `/api/projects/get-project/${project_id}`,
        "GET"
      );

      if (!ok || !data) {
        showAlert("Failed to fetch project data", "error");
        router.push(projectsPath);
        return;
      }

      const project = data.data || data;
      setOriginalProject(project);

      const managerIdVal = project.managerId?._id?.toString?.() || project.managerId?.toString?.() || project.managerId || "";

      const customerIdVal = project.customerId?._id?.toString?.() || project.customerId?.toString?.() || project.customerId || "";

      // Initialize form with project data
      setFormData({
        name: project.name || "",
        location: project.location || "",
        customerId: customerIdVal,
        client: project.client || "",
        workOrder: project.workOrder || "",
        priority: project.priority || "medium",
        status: project.status || "planning",
        progress: project.progress || 0,
        estimated_completion: project.estimated_completion
          ? new Date(project.estimated_completion).toISOString().split("T")[0]
          : "",
        totalLength: project.totalLength || "",
        pipelineMaterial: project.pipelineMaterial || "",
        pipelineShape: project.pipelineShape || "",
        videoCount: project.videoCount || 0,
        confidence: project.confidence || 0,
        managerId: managerIdVal,
        assignedOperator: {
          userId: project.assignedOperator?.userId || "",
          name: project.assignedOperator?.name || "",
          email: project.assignedOperator?.email || "",
          certification: project.assignedOperator?.certification || "",
        },
        qcTechnician: {
          userId: project.qcTechnician?.userId || "",
          name: project.qcTechnician?.name || "",
          email: project.qcTechnician?.email || "",
          certification: project.qcTechnician?.certification || "",
        },
        metadata: {
          recordingDate: project.metadata?.recordingDate || "",
          upstreamMH: project.metadata?.upstreamMH || "",
          downstreamMH: project.metadata?.downstreamMH || "",
          shape: project.metadata?.shape || "",
          material: project.metadata?.material || "",
          remarks: project.metadata?.remarks || "",
        },
        aiDetections: {
          fractures: project.aiDetections?.fractures || 0,
          cracks: project.aiDetections?.cracks || 0,
          broken_pipes: project.aiDetections?.broken_pipes || 0,
          roots: project.aiDetections?.roots || 0,
          total: project.aiDetections?.total || 0,
        },
      });
    } catch (error) {
      showAlert("Failed to load project", "error");
      console.error("Error fetching project:", error);
      router.push(projectsPath);
    } finally {
      setFetchingProject(false);
    }
  }, [project_id, showAlert, router, projectsPath]);

  // Fetch users; when user role, restrict to managedMembers
  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const { ok, data } = await api("/api/users/get-all-user", "GET");

      if (ok && data?.users) {
        let operatorUsers = data.users.filter(
          (u) => u.role === "Operator" || u.role === "operator"
        );
        let qcUsers = data.users.filter(
          (u) => u.role === "Qc-Technician" || u.role === "qc-technician"
        );
        const leadUsers = data.users.filter(
          (u) => u.role === "user" || u.role === "User"
        );

        if (isUserRole && Array.isArray(userData?.managedMembers) && userData.managedMembers.length > 0) {
          const managedIds = new Set(userData.managedMembers.map((id) => String(id)));
          operatorUsers = operatorUsers.filter((u) => u._id && managedIds.has(String(u._id)));
          qcUsers = qcUsers.filter((u) => u._id && managedIds.has(String(u._id)));
        }

        setOperators(operatorUsers);
        setQcTechnicians(qcUsers);
        setLeads(leadUsers);
      }
    } catch (error) {
      showAlert("Failed to fetch users", "error");
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  }, [showAlert, isUserRole, userData?.managedMembers]);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoadingCustomers(true);
      const response = await api("/api/users/get-customers", "GET");
      const data = response?.data?.data?.customers;
      if (Array.isArray(data)) setCustomers(data);
    } catch (error) {
      showAlert("Failed to fetch customers", "error");
      console.error("Error fetching customers:", error);
    } finally {
      setLoadingCustomers(false);
    }
  }, [showAlert]);

  useEffect(() => {
    fetchProject();
    fetchUsers();
    fetchCustomers();
  }, [fetchProject, fetchUsers, fetchCustomers]);

  // Handle field changes
  const handleFieldChange = useCallback(
    (fieldName, value) => {
      // Auto-convert to number for certain fields
      if (fieldName === "progress" || fieldName === "videoCount") {
        value = Number(value);
      }
  
      console.log(`[Field Change] ${fieldName}:`, value);
  
      setFormData((prev) => {
        if (fieldName.includes(".")) {
          const [parent, child] = fieldName.split(".");
          return {
            ...prev,
            [parent]: {
              ...prev[parent],
              [child]: value,
            },
          };
        }
        return {
          ...prev,
          [fieldName]: value,
        };
      });
  
      // Clear error for this field
      if (errors[fieldName]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }
    },
    [errors]
  );
  
  

  // Handle operator selection
  const handleOperatorSelect = useCallback(
    (userId) => {
      const selectedOperator = operators.find((op) => op.user_id === userId);
      if (selectedOperator) {
        setFormData((prev) => ({
          ...prev,
          assignedOperator: {
            userId: userId,
            name: selectedOperator.name,
            email: selectedOperator.email,
            certification: selectedOperator.certification || "",
          },
        }));
      }
    },
    [operators]
  );

  // Handle QC selection
  const handleQcSelect = useCallback(
    (userId) => {
      const selectedQc = qcTechnicians.find((qc) => qc.user_id === userId);
      if (selectedQc) {
        setFormData((prev) => ({
          ...prev,
          qcTechnician: {
            userId: userId,
            name: selectedQc.name,
            email: selectedQc.email,
            certification: selectedQc.certification || "",
          },
        }));
      }
    },
    [qcTechnicians]
  );

  // Handle lead selection (admin: user role only)
  const handleLeadSelect = useCallback((userId) => {
    setFormData((prev) => ({ ...prev, managerId: userId || "" }));
  }, []);

  // Auto-calculate AI detections total
  useEffect(() => {
    const total =
      formData.aiDetections.fractures +
      formData.aiDetections.cracks +
      formData.aiDetections.broken_pipes +
      formData.aiDetections.roots;

    setFormData((prev) => ({
      ...prev,
      aiDetections: {
        ...prev.aiDetections,
        total,
      },
    }));
  }, [
    formData.aiDetections.fractures,
    formData.aiDetections.cracks,
    formData.aiDetections.broken_pipes,
    formData.aiDetections.roots,
  ]);

  // Validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Project name is required";
    if (!formData.customerId) newErrors.customerId = "Customer must be selected";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.workOrder.trim())
      newErrors.workOrder = "Work order is required";
    if (!formData.totalLength.trim())
      newErrors.totalLength = "Total length is required";
    if (!formData.pipelineMaterial)
      newErrors.pipelineMaterial = "Pipeline material is required";
    if (!formData.pipelineShape)
      newErrors.pipelineShape = "Pipeline shape is required";
    if (!isUserRole) {
      if (!formData.managerId)
        newErrors.managerId = "Please select an assigned lead";
    } else {
      if (!formData.assignedOperator.userId)
        newErrors["assignedOperator.userId"] = "Please select an operator";
      if (!formData.qcTechnician.userId)
        newErrors["qcTechnician.userId"] = "Please select a QC technician";
    }
    if (!formData.metadata.recordingDate)
      newErrors["metadata.recordingDate"] = "Recording date is required";
    if (!formData.metadata.upstreamMH.trim())
      newErrors["metadata.upstreamMH"] = "Upstream MH is required";
    if (!formData.metadata.downstreamMH.trim())
      newErrors["metadata.downstreamMH"] = "Downstream MH is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Reset form to original data
  const handleReset = () => {
    if (originalProject) {
      setFormData({
        name: originalProject.name || "",
        location: originalProject.location || "",
        customerId: originalProject.customerId?._id?.toString?.() || originalProject.customerId?.toString?.() || originalProject.customerId || "",
        client: originalProject.client || "",
        workOrder: originalProject.workOrder || "",
        priority: originalProject.priority || "medium",
        status: originalProject.status || "planning",
        progress: originalProject.progress || 0,
        estimated_completion: originalProject.estimated_completion
          ? new Date(originalProject.estimated_completion)
              .toISOString()
              .split("T")[0]
          : "",
        totalLength: originalProject.totalLength || "",
        pipelineMaterial: originalProject.pipelineMaterial || "",
        pipelineShape: originalProject.pipelineShape || "",
        videoCount: originalProject.videoCount || 0,
        confidence: originalProject.confidence || 0,
        assignedOperator: {
          userId: originalProject.assignedOperator?.userId || "",
          name: originalProject.assignedOperator?.name || "",
          email: originalProject.assignedOperator?.email || "",
          certification: originalProject.assignedOperator?.certification || "",
        },
        qcTechnician: {
          userId: originalProject.qcTechnician?.userId || "",
          name: originalProject.qcTechnician?.name || "",
          email: originalProject.qcTechnician?.email || "",
          certification: originalProject.qcTechnician?.certification || "",
        },
        metadata: {
          recordingDate: originalProject.metadata?.recordingDate || "",
          upstreamMH: originalProject.metadata?.upstreamMH || "",
          downstreamMH: originalProject.metadata?.downstreamMH || "",
          shape: originalProject.metadata?.shape || "",
          material: originalProject.metadata?.material || "",
          remarks: originalProject.metadata?.remarks || "",
        },
        aiDetections: {
          fractures: originalProject.aiDetections?.fractures || 0,
          cracks: originalProject.aiDetections?.cracks || 0,
          broken_pipes: originalProject.aiDetections?.broken_pipes || 0,
          roots: originalProject.aiDetections?.roots || 0,
          total: originalProject.aiDetections?.total || 0,
        },
        managerId: originalProject.managerId?._id?.toString?.() || originalProject.managerId?.toString?.() || originalProject.managerId || "",
      });
      setVideoFile(null);
      setErrors({});
      showAlert("Form reset to original values", "success");
    }
  };

  // Save changes
  const handleSave = useCallback(async () => {
    if (!validateForm()) return;
  
    try {
      setSaving(true);


      const sel = customers.find((c) => c._id === formData.customerId);
      const clientFromCustomer = sel
        ? [sel.first_name, sel.last_name].filter(Boolean).join(" ").trim() || sel.email || formData.client
        : formData.client;

      const correctedFormData = {
        ...formData,
        client: clientFromCustomer,
        progress: Number(formData.progress),
        confidence: Number(formData.confidence),
      };
      console.log("[handleSave] progress before submit:", correctedFormData.progress);

      const form = new FormData();
      form.append("userId", user_id);
      form.append("projectData", JSON.stringify(correctedFormData));
  
      if (videoFile) {
        form.append("video", videoFile);
      }
  
      const { ok, data } = await api(
        `/api/projects/update-project/${project_id}/${user_id}`,
        "PUT",
        form
      );
  
  
  
      if (!ok) {
        showAlert("Failed to update project", "error");
        return;
      }
  
      showAlert("Project updated successfully", "success");
      router.push(projectsPath);
    } catch (error) {
      showAlert(error.message || "Failed to update project", "error");
      console.error("Error updating project:", error);
    } finally {
      setSaving(false);
    }
  }, [formData, validateForm, videoFile, user_id, project_id, showAlert, router, projectsPath, customers]);
  
  

  const statusOptions = [
    { value: "planning", label: "Planning" },
    { value: "field-capture", label: "Field Capture" },
    { value: "uploading", label: "Uploading" },
    { value: "ai-processing", label: "AI Processing" },
    { value: "qc-review", label: "QC Review" },
    { value: "completed", label: "Completed" },
    { value: "customer-notified", label: "Customer Notified" },
    { value: "on-hold", label: "On Hold" },
  ];

  const getStatusColor = (status) => {
    const colors = {
      planning: "bg-gray-100 text-gray-800",
      "field-capture": "bg-blue-100 text-blue-800",
      uploading: "bg-yellow-100 text-yellow-800",
      "ai-processing": "bg-purple-100 text-purple-800",
      "qc-review": "bg-orange-100 text-orange-800",
      completed: "bg-green-100 text-green-800",
      "customer-notified": "bg-emerald-100 text-emerald-800",
      "on-hold": "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (fetchingProject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading Project
          </h2>
          <p className="text-gray-600">
            Please wait while we fetch the project data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push(projectsPath)}
                className="flex items-center gap-2 h-10"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Projects
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Edit3 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Edit Project
                  </h1>
                  <p className="text-sm text-gray-600">
                    {formData.name || "Unnamed Project"} • {formData.workOrder}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  formData.status
                )}`}
              >
                {formData.status.replace("-", " ").toUpperCase()}
              </span>
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex items-center gap-2 h-10"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 h-10 bg-blue-600 hover:bg-blue-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Project Details
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Project Name"
                  name="name"
                  value={formData.name}
                  onChange={handleFieldChange}
                  required
                  error={errors.name}
                  placeholder="Enter project name"
                />
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Customer
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select
                    value={formData.customerId}
                    onValueChange={(value) => handleFieldChange("customerId", value)}
                  >
                    <SelectTrigger
                      className={`h-10 ${
                        errors.customerId ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="Select a customer..." />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingCustomers ? (
                        <SelectItem value="loading" disabled>
                          Loading customers...
                        </SelectItem>
                      ) : customers.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No customers available
                        </SelectItem>
                      ) : (
                        customers.map((customer) => (
                          <SelectItem
                            key={customer._id}
                            value={customer._id}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {customer.first_name} {customer.last_name}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({customer.email})
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.customerId && (
                    <span className="text-red-500 text-sm">
                      {errors.customerId}
                    </span>
                  )}
                </div>
                <InputField
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleFieldChange}
                  required
                  error={errors.location}
                  placeholder="Enter project location"
                />
                <InputField
                  label="Work Order"
                  name="workOrder"
                  value={formData.workOrder}
                  onChange={handleFieldChange}
                  required
                  error={errors.workOrder}
                  placeholder="Enter work order number"
                />
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Priority
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      handleFieldChange("priority", value)
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleFieldChange("status", value)
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <InputField
                  label="Progress (%)"
                  name="progress"
                  value={formData.progress}
                  onChange={handleFieldChange}
                  type="number"
                  placeholder="0-100"
                />
                <InputField
                  label="Estimated Completion"
                  name="estimated_completion"
                  value={formData.estimated_completion}
                  onChange={handleFieldChange}
                  type="date"
                />
              </div>
            </div>

            {/* Pipeline Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Settings className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Pipeline Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Total Length"
                  name="totalLength"
                  value={formData.totalLength}
                  onChange={handleFieldChange}
                  required
                  error={errors.totalLength}
                  placeholder="e.g., 100 meters"
                />
                <InputField
                  label="Pipeline Material"
                  name="pipelineMaterial"
                  value={formData.pipelineMaterial}
                  onChange={handleFieldChange}
                  required
                  error={errors.pipelineMaterial}
                  placeholder="e.g., PVC, Concrete"
                />
                <InputField
                  label="Pipeline Shape"
                  name="pipelineShape"
                  value={formData.pipelineShape}
                  onChange={handleFieldChange}
                  required
                  error={errors.pipelineShape}
                  placeholder="e.g., Circular, Rectangular"
                />
                <InputField
                  label="Video Count"
                  name="videoCount"
                  value={formData.videoCount}
                  onChange={handleFieldChange}
                  type="number"
                  placeholder="Number of videos"
                />
              </div>
            </div>

            {/* Lead Assignment (admin: user only) / Team Assignment QC & Operator (user role) */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isUserRole ? "Team Assignment (QC & Operator)" : "Lead Assignment"}
                </h2>
              </div>

              {isUserRole && userData && (
                <div className="flex items-center gap-3 mb-6 px-4 py-3 bg-purple-50 border border-purple-100 rounded-xl">
                  <Users className="h-5 w-5 text-purple-600 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-purple-800">Project manager:</span>{" "}
                    {userData.first_name || userData.last_name
                      ? `${userData.first_name || ""} ${userData.last_name || ""}`.trim()
                      : userData.username || "You"}
                    {userData.email && (
                      <span className="text-gray-500 ml-1">({userData.email})</span>
                    )}
                  </p>
                </div>
              )}

              <div className="space-y-6">
                {!isUserRole ? (
                  /* Admin: Assigned Lead (user role only) */
                  <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      Assigned Lead
                    </h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Select Lead (user) *
                        </Label>
                        <Select
                          value={formData.managerId}
                          onValueChange={handleLeadSelect}
                        >
                          <SelectTrigger
                            className={`h-10 ${
                              errors.managerId ? "border-red-500" : ""
                            }`}
                          >
                            <SelectValue placeholder="Choose an assigned lead..." />
                          </SelectTrigger>
                          <SelectContent>
                            {leads.length === 0 ? (
                              <div className="px-4 py-6 text-center text-gray-500 text-sm">
                                No users (lead) available
                              </div>
                            ) : (
                              leads.map((lead) => (
                                <SelectItem
                                  key={lead.user_id}
                                  value={lead.user_id}
                                >
                                  <div className="flex items-center gap-3">
                                    <UserCheck className="h-4 w-4 text-purple-600" />
                                    <div>
                                      <div className="font-medium">{lead.name}</div>
                                      <div className="text-xs text-gray-500">{lead.email}</div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {errors.managerId && (
                          <span className="text-red-500 text-sm">
                            {errors.managerId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* User role: Operator */}
                    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <h4 className="font-semibold text-gray-900 mb-4">
                        Assigned Operator
                      </h4>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Select Operator *
                          </Label>
                          <Select
                            value={formData.assignedOperator.userId}
                            onValueChange={handleOperatorSelect}
                          >
                            <SelectTrigger
                              className={`h-10 ${
                                errors["assignedOperator.userId"]
                                  ? "border-red-500"
                                  : ""
                              }`}
                            >
                              <SelectValue placeholder="Choose an operator..." />
                            </SelectTrigger>
                            <SelectContent>
                              {operators.map((operator) => (
                                <SelectItem
                                  key={operator.user_id}
                                  value={operator.user_id}
                                >
                                  <div className="flex items-center gap-3">
                                    <UserCheck className="h-4 w-4 text-blue-600" />
                                    <div>
                                      <div className="font-medium">
                                        {operator.name}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {operator.email}
                                      </div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors["assignedOperator.userId"] && (
                            <span className="text-red-500 text-sm">
                              {errors["assignedOperator.userId"]}
                            </span>
                          )}
                        </div>

                        {formData.assignedOperator.userId && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                              label="Name"
                              name="assignedOperator.name"
                              value={formData.assignedOperator.name}
                              onChange={handleFieldChange}
                              disabled
                            />
                            <InputField
                              label="Email"
                              name="assignedOperator.email"
                              value={formData.assignedOperator.email}
                              onChange={handleFieldChange}
                              disabled
                            />
                            <div className="md:col-span-2">
                              <InputField
                                label="Certification"
                                name="assignedOperator.certification"
                                value={formData.assignedOperator.certification}
                                onChange={handleFieldChange}
                                placeholder="Enter certification details"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* User role: QC-technician */}
                    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <h4 className="font-semibold text-gray-900 mb-4">
                        Assigned Qc-Technician
                      </h4>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Select Qc-Technician
                          </Label>
                          <Select
                            value={formData.qcTechnician.userId}
                            onValueChange={handleQcSelect}
                          >
                            <SelectTrigger
                              className={`h-10 ${
                                errors["assignedOperator.userId"]
                                  ? "border-red-500"
                                  : ""
                              }`}
                            >
                              <SelectValue placeholder="Choose a QC technician..." />
                            </SelectTrigger>
                            <SelectContent>
                              {qcTechnicians.map((qc) => (
                                <SelectItem
                                  key={qc.user_id}
                                  value={qc.user_id}
                                >
                                  <div className="flex items-center gap-3">
                                    <UserCheck className="h-4 w-4 text-blue-600" />
                                    <div>
                                      <div className="font-medium">{qc.name}</div>
                                      <div className="text-xs text-gray-500">{qc.email}</div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors["qcTechnician.userId"] && (
                            <span className="text-red-500 text-sm">
                              {errors["qcTechnician.userId"]}
                            </span>
                          )}
                        </div>

                        {formData.qcTechnician.userId && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                              label="Name"
                              name="qcTechnician.name"
                              value={formData.qcTechnician.name}
                              onChange={handleFieldChange}
                              disabled
                            />
                            <InputField
                              label="Email"
                              name="qcTechnician.email"
                              value={formData.qcTechnician.email}
                              onChange={handleFieldChange}
                              disabled
                            />
                            <div className="md:col-span-2">
                              <InputField
                                label="Certification"
                                name="qcTechnician.certification"
                                value={formData.qcTechnician.certification}
                                onChange={handleFieldChange}
                                placeholder="Enter certification details"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Inspection Data */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Inspection Data
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Recording Date"
                  name="metadata.recordingDate"
                  value={formData.metadata.recordingDate}
                  onChange={handleFieldChange}
                  type="date"
                  required
                  error={errors["metadata.recordingDate"]}
                />
                <InputField
                  label="Upstream Manhole"
                  name="metadata.upstreamMH"
                  value={formData.metadata.upstreamMH}
                  onChange={handleFieldChange}
                  required
                  error={errors["metadata.upstreamMH"]}
                  placeholder="e.g., MH-001"
                />
                <InputField
                  label="Downstream Manhole"
                  name="metadata.downstreamMH"
                  value={formData.metadata.downstreamMH}
                  onChange={handleFieldChange}
                  required
                  error={errors["metadata.downstreamMH"]}
                  placeholder="e.g., MH-002"
                />
                <InputField
                  label="Material"
                  name="metadata.material"
                  value={formData.metadata.material}
                  onChange={handleFieldChange}
                  placeholder="e.g., Concrete, PVC"
                />
                <InputField
                  label="Shape"
                  name="metadata.shape"
                  value={formData.metadata.shape}
                  onChange={handleFieldChange}
                  placeholder="e.g., Circular, Square"
                />
                <div className="md:col-span-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Remarks
                    </Label>
                    <Textarea
                      value={formData.metadata.remarks}
                      onChange={(e) =>
                        handleFieldChange("metadata.remarks", e.target.value)
                      }
                      placeholder="Add any additional notes or observations..."
                      className="min-h-[100px]"
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Video Upload */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Video className="h-5 w-5 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Video Upload
                </h2>
              </div>

              <div className="space-y-4">
                {originalProject?.videoUrl && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <Video className="h-6 w-6 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-800">
                          Current Video File
                        </p>
                        <p className="text-sm text-blue-600">
                          A video file is already uploaded for this project
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <Label htmlFor="video" className="cursor-pointer">
                    <Input
                      id="video"
                      type="file"
                      accept="video/*"
                      onChange={(e) =>
                        setVideoFile(e.target.files?.[0] || null)
                      }
                      className="hidden"
                    />
                    <span className="text-lg text-blue-600 hover:text-blue-800 font-medium">
                      {originalProject?.videoUrl
                        ? "Upload new video file"
                        : "Click to upload video file"}
                    </span>
                    <p className="text-gray-500 mt-2">
                      Supports MP4, AVI, MOV files
                    </p>
                  </Label>
                </div>

                {videoFile && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <div>
                          <p className="font-semibold text-green-800">
                            New File Selected
                          </p>
                          <p className="text-sm text-green-600">
                            {videoFile.name}
                          </p>
                          <p className="text-xs text-green-500">
                            Size: {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setVideoFile(null)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Project Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileVideo className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Videos
                    </span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    {formData.videoCount}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">
                      AI Detections
                    </span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">
                    {formData.aiDetections.total}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{formData.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, formData.progress)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Detection Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                AI Detection Results
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Fractures
                    </Label>
                    <Input
                      type="number"
                      value={formData.aiDetections.fractures}
                      onChange={(e) =>
                        handleFieldChange(
                          "aiDetections.fractures",
                          parseInt(e.target.value) || 0
                        )
                      }
                      min="0"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Cracks
                    </Label>
                    <Input
                      type="number"
                      value={formData.aiDetections.cracks}
                      onChange={(e) =>
                        handleFieldChange(
                          "aiDetections.cracks",
                          parseInt(e.target.value) || 0
                        )
                      }
                      min="0"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Broken Pipes
                    </Label>
                    <Input
                      type="number"
                      value={formData.aiDetections.broken_pipes}
                      onChange={(e) =>
                        handleFieldChange(
                          "aiDetections.broken_pipes",
                          parseInt(e.target.value) || 0
                        )
                      }
                      min="0"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Roots
                    </Label>
                    <Input
                      type="number"
                      value={formData.aiDetections.roots}
                      onChange={(e) =>
                        handleFieldChange(
                          "aiDetections.roots",
                          parseInt(e.target.value) || 0
                        )
                      }
                      min="0"
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Total Detections
                    </span>
                    <span className="text-xl font-bold text-gray-900">
                      {formData.aiDetections.total}
                    </span>
                  </div>
                </div>

                <InputField
                  label="Confidence Level"
                  name="confidence"
                  value={formData.confidence}
                  onChange={handleFieldChange}
                  type="number"
                  placeholder="0-100"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={fetchUsers}
                  disabled={loadingUsers}
                  className="w-full flex items-center gap-2"
                >
                  {loadingUsers ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Refresh User List
                </Button>

                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="w-full flex items-center gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
