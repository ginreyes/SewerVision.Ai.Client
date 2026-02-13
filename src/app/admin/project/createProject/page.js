'use client'

import { useState, useCallback, memo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAlert } from "@/components/providers/AlertProvider";
import { api } from "@/lib/helper";
import {
  FolderPlus,
  Calendar,
  Upload,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Users,
  Settings,
  Video,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  UserCheck,
  RefreshCw,
  Building2,
  Mail,
  User
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/providers/UserContext";

const steps = [
  {
    id: 1,
    title: "Project Details",
    description: "Basic project information",
    icon: FolderPlus,
    color: "bg-blue-500"
  },
  {
    id: 2,
    title: "Pipeline Info",
    description: "Technical specifications",
    icon: Settings,
    color: "bg-green-500"
  },
  {
    id: 3,
    title: "Assign Team Members",
    description: "Assign operator and QC technician",
    icon: Users,
    color: "bg-purple-500"
  },
  {
    id: 4,
    title: "Inspection Data",
    description: "Recording details",
    icon: Calendar,
    color: "bg-orange-500"
  },
  {
    id: 5,
    title: "Video Upload",
    description: "Upload inspection video",
    icon: Video,
    color: "bg-red-500"
  }
];


const InputField = memo(({ label, name, value, onChange, required = false, type = "text", error, placeholder }) => {
  const handleChange = useCallback((e) => {
    onChange(name, e.target.value);
  }, [name, onChange]);

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
        className={`h-10 transition-all duration-200 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'}`}
      />
      {error && <span className="text-red-500 text-sm flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        {error}
      </span>}
    </div>
  );
});

InputField.displayName = 'InputField';

export default function CreateProjectPage({ backUrl = "/admin/project", returnTo }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [videoFile, setVideoFile] = useState(null);
  const { showAlert } = useAlert();
  const router = useRouter();
  const { userId, userData } = useUser() || {}
  const redirectAfterCreate = returnTo ?? (userData?.role === "user" ? "/user/project" : "/admin/project");

  // User data states (operators & QC for user role; leads = users with role "user" for admin)
  const [operators, setOperators] = useState([]);
  const [qcTechnicians, setQcTechnicians] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [leadUserId, setLeadUserId] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customerId, setCustomerId] = useState("");

  // Project Details - Step 1
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [workOrder, setWorkOrder] = useState("");
  const [priority, setPriority] = useState("medium");

  // Pipeline Info - Step 2
  const [totalLength, setTotalLength] = useState("");
  const [pipelineMaterial, setPipelineMaterial] = useState("");
  const [pipelineShape, setPipelineShape] = useState("");

  // Team Assignment - Step 3 (removed certification states)
  const [operatorUserId, setOperatorUserId] = useState("");
  const [operatorName, setOperatorName] = useState("");
  const [operatorEmail, setOperatorEmail] = useState("");
  const [qcUserId, setQcUserId] = useState("");
  const [qcName, setQcName] = useState("");
  const [qcEmail, setQcEmail] = useState("");

  // Inspection Data - Step 4
  const [recordingDate, setRecordingDate] = useState("");
  const [upstreamMH, setUpstreamMH] = useState("");
  const [downstreamMH, setDownstreamMH] = useState("");
  const [metadataMaterial, setMetadataMaterial] = useState("");
  const [metadataShape, setMetadataShape] = useState("");
  const [remarks, setRemarks] = useState("");

  // Fetch users with specific roles; when current user is "user" role, restrict to managedMembers
  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const { ok, data } = await api("/api/users/get-all-user", "GET");

      if (ok && data?.users) {
        let operatorUsers = data.users.filter((u) => u.role === "operator");
        let qcUsers = data.users.filter((u) => u.role === "qc-technician");
        const leadUsers = data.users.filter((u) => u.role === "user" || u.role === "User");

        if (userData?.role === "user" && Array.isArray(userData.managedMembers) && userData.managedMembers.length > 0) {
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
  }, [showAlert, userData?.role, userData?.managedMembers]);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoadingCustomers(true);
      const response = await api("/api/users/get-customers", "GET");
      const data = response.data.data.customers
      setCustomers(data)
    }
    catch (error) {
      showAlert("Failed to fetch customers", "error");
      console.error("Error fetching customers:", error);
    }
    finally {
      setLoadingCustomers(false);
    }
  }, [showAlert]);

  useEffect(() => {
    fetchUsers();
    fetchCustomers();
  }, [fetchUsers, fetchCustomers]);

  const handleOperatorSelect = useCallback((userId) => {
    const selectedOperator = operators.find(op => op.user_id === userId);
    if (selectedOperator) {
      setOperatorUserId(userId);
      setOperatorName(selectedOperator.name);
      setOperatorEmail(selectedOperator.email);
    }
  }, [operators]);

  const handleQcSelect = useCallback((userId) => {
    const selectedQc = qcTechnicians.find(qc => qc.user_id === userId);
    if (selectedQc) {
      setQcUserId(userId);
      setQcName(selectedQc.name);
      setQcEmail(selectedQc.email);
    }
  }, [qcTechnicians]);

  // Clear operator selection
  const clearOperatorSelection = useCallback(() => {
    setOperatorUserId("");
    setOperatorName("");
    setOperatorEmail("");
  }, []);

  // Clear QC selection
  const clearQcSelection = useCallback(() => {
    setQcUserId("");
    setQcName("");
    setQcEmail("");
  }, []);

  const fieldSetters = {
    name: setName,
    location: setLocation,
    customerId: setCustomerId,
    workOrder: setWorkOrder,
    priority: setPriority,
    totalLength: setTotalLength,
    pipelineMaterial: setPipelineMaterial,
    pipelineShape: setPipelineShape,
    "assignedOperator.userId": setOperatorUserId,
    "assignedOperator.name": setOperatorName,
    "assignedOperator.email": setOperatorEmail,
    "qcTechnician.userId": setQcUserId,
    "qcTechnician.name": setQcName,
    "qcTechnician.email": setQcEmail,
    "metadata.recordingDate": setRecordingDate,
    "metadata.upstreamMH": setUpstreamMH,
    "metadata.downstreamMH": setDownstreamMH,
    "metadata.material": setMetadataMaterial,
    "metadata.shape": setMetadataShape,
    "metadata.remarks": setRemarks,
  };

  // Field values map
  const fieldValues = {
    name,
    location,
    customerId,
    workOrder,
    priority,
    totalLength,
    pipelineMaterial,
    pipelineShape,
    "assignedOperator.userId": operatorUserId,
    "assignedOperator.name": operatorName,
    "assignedOperator.email": operatorEmail,
    "qcTechnician.userId": qcUserId,
    "qcTechnician.name": qcName,
    "qcTechnician.email": qcEmail,
    "metadata.recordingDate": recordingDate,
    "metadata.upstreamMH": upstreamMH,
    "metadata.downstreamMH": downstreamMH,
    "metadata.material": metadataMaterial,
    "metadata.shape": metadataShape,
    "metadata.remarks": remarks,
  };

  const handleFieldChange = useCallback((fieldName, value) => {
    const setter = fieldSetters[fieldName];
    if (setter) {
      setter(value);
      if (errors[fieldName]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }
    }
  }, [errors]);

  const getFormData = useCallback(() => {
    const sel = customers.find((c) => c._id === customerId);
    const clientFromCustomer = sel
      ? [sel.first_name, sel.last_name].filter(Boolean).join(" ").trim() || sel.email || ""
      : "";
    const base = {
      userId,
      name,
      location,
      client: clientFromCustomer,
      customerId,
      totalLength,
      pipelineMaterial,
      pipelineShape,
      workOrder,
      priority,
      ...(userData?.role === "user" && userId ? { managerId: userId } : userData?.role !== "user" && leadUserId ? { managerId: leadUserId } : {}),
      assignedOperator: userData?.role === "user" ? {
        userId: operatorUserId,
        name: operatorName,
        email: operatorEmail
      } : { userId: "", name: "", email: "" },
      qcTechnician: userData?.role === "user" ? {
        userId: qcUserId,
        name: qcName,
        email: qcEmail
      } : { userId: "", name: "", email: "" },
      metadata: {
        recordingDate,
        upstreamMH,
        downstreamMH,
        shape: metadataShape,
        material: metadataMaterial,
        remarks,
      },
    };
    return base;
  }, [name, location, customers, customerId, totalLength, pipelineMaterial, pipelineShape, workOrder, priority,
    operatorUserId, operatorName, operatorEmail,
    qcUserId, qcName, qcEmail,
    leadUserId,
    recordingDate, upstreamMH, downstreamMH, metadataShape, metadataMaterial, remarks, userId, userData?.role]);

  const validateStep = useCallback((step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!name) newErrors.name = "Project name is required";
        if (!customerId) newErrors.customerId = "Customer must be selected";
        if (!location) newErrors.location = "Location is required";
        if (!workOrder) newErrors.workOrder = "Work order is required";
        break;
      case 2:
        if (!totalLength) newErrors.totalLength = "Total length is required";
        if (!pipelineMaterial) newErrors.pipelineMaterial = "Pipeline material is required";
        if (!pipelineShape) newErrors.pipelineShape = "Pipeline shape is required";
        break;
      case 3:
        if (userData?.role === "user") {
          if (!operatorUserId) newErrors["assignedOperator.userId"] = "Please select an operator";
          if (!qcUserId) newErrors["qcTechnician.userId"] = "Please select a QC technician";
        } else {
          if (!leadUserId) newErrors.managerId = "Please select an assigned lead";
        }
        break;
      case 4:
        if (!recordingDate) newErrors["metadata.recordingDate"] = "Recording date is required";
        if (!upstreamMH) newErrors["metadata.upstreamMH"] = "Upstream MH is required";
        if (!downstreamMH) newErrors["metadata.downstreamMH"] = "Downstream MH is required";
        if (!metadataMaterial) newErrors["metadata.material"] = "Material is required";
        if (!metadataShape) newErrors["metadata.shape"] = "Shape is required";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, location, workOrder, totalLength, pipelineMaterial, pipelineShape,
    operatorUserId, qcUserId, leadUserId, userData?.role, recordingDate, upstreamMH, downstreamMH, metadataMaterial, metadataShape, customerId]);

  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validateStep(currentStep)) return;

    try {
      setLoading(true);
      const formData = getFormData();

      const { userId, ...projectFields } = formData;

      const form = new FormData();
      form.append("userId", userId);
      form.append("projectData", JSON.stringify(projectFields));

      if (videoFile) {
        form.append("video", videoFile);
      }

      const { ok, data } = await api("/api/projects/create-project", "POST", form);

      if (!ok) {
        showAlert("Project creation failed", "error");
        return;
      }

      showAlert("Project created successfully", "success");
      setCurrentStep(1);
      router.push(redirectAfterCreate);

    } catch (error) {
      showAlert(error.message || "Failed to create project", "error");
    } finally {
      setLoading(false);
    }
  }, [currentStep, getFormData, showAlert, validateStep, videoFile, router, redirectAfterCreate]);


  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center pb-4">
              <div className="inline-flex p-3 bg-blue-100 rounded-xl mb-4">
                <Building2 className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Project Details</h3>
              <p className="text-gray-600">Let's start with the basic project information</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InputField
                label="Project Name"
                name="name"
                value={fieldValues.name}
                onChange={handleFieldChange}
                required
                error={errors.name}
                placeholder="Enter project name"
              />

              {/* Customer Selection Dropdown */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Customer
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={customerId}
                  onValueChange={(value) => handleFieldChange("customerId", value)}
                >
                  <SelectTrigger className={`h-10 ${errors.customerId ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'}`}>
                    <SelectValue placeholder="Select a customer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingCustomers ? (
                      <SelectItem value="loading" disabled>
                        Loading customers...
                      </SelectItem>
                    ) : customers.length === 0 ? (
                      <SelectItem value="no-customers" disabled>
                        No customers available
                      </SelectItem>
                    ) : (
                      customers.map((customer) => (
                        <SelectItem key={customer._id} value={customer._id}>
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
                  <span className="text-red-500 text-sm flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.customerId}
                  </span>
                )}
              </div>

              <InputField
                label="Location"
                name="location"
                value={fieldValues.location}
                onChange={handleFieldChange}
                required
                error={errors.location}
                placeholder="Enter project location"
              />

              <InputField
                label="Work Order"
                name="workOrder"
                value={fieldValues.workOrder}
                onChange={handleFieldChange}
                required
                error={errors.workOrder}
                placeholder="Enter work order number"
              />

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Priority</Label>
                <Select value={priority} onValueChange={(value) => handleFieldChange("priority", value)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center pb-4">
              <div className="inline-flex p-3 bg-green-100 rounded-xl mb-4">
                <Settings className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Pipeline Information</h3>
              <p className="text-gray-600">Technical specifications of the pipeline</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <InputField
                label="Total Length"
                name="totalLength"
                value={fieldValues.totalLength}
                onChange={handleFieldChange}
                required
                error={errors.totalLength}
                placeholder="e.g., 100 meters"
              />
              <InputField
                label="Pipeline Material"
                name="pipelineMaterial"
                value={fieldValues.pipelineMaterial}
                onChange={handleFieldChange}
                required
                error={errors.pipelineMaterial}
                placeholder="e.g., PVC, Concrete, Steel"
              />
              <InputField
                label="Pipeline Shape"
                name="pipelineShape"
                value={fieldValues.pipelineShape}
                onChange={handleFieldChange}
                required
                error={errors.pipelineShape}
                placeholder="e.g., Circular, Rectangular"
              />
            </div>
          </div>
        );

      case 3:
        const isUserRole = userData?.role === "user";
        const teamLeadName = userData?.first_name || userData?.last_name
          ? `${userData.first_name || ""} ${userData.last_name || ""}`.trim()
          : userData?.username || "You";
        return (
          <div className="space-y-8">
            <div className="text-center pb-4">
              <div className="inline-flex p-3 bg-purple-100 rounded-xl mb-4">
                <Users className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {isUserRole ? "Assign Team Members" : "Lead Assignment"}
              </h3>
              <p className="text-gray-600">
                {isUserRole
                  ? "Select the operator and QC technician who will work on this project."
                  : "Assign a lead (user) to this project."}
              </p>
            </div>

            {/* For user role: compact "You're the project manager" note; for admin: full Team Lead card */}
            {isUserRole ? (
              <div className="max-w-5xl mx-auto flex items-center gap-3 px-4 py-3 bg-purple-50 border border-purple-100 rounded-xl">
                <User className="h-5 w-5 text-purple-600 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-purple-800">Project manager:</span> {teamLeadName}
                  {userData?.email && <span className="text-gray-500 ml-1">({userData.email})</span>}
                </p>
              </div>
            ) : null}

            {loadingUsers ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-purple-500 mb-4" />
                <p className="text-gray-600 font-medium">Loading team members...</p>
              </div>
            ) : isUserRole ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Operator Selection Card (user role only) */}
                <div className="bg-white rounded-2xl border-2 border-blue-100 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <UserCheck className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Assigned Operator</h4>
                        <p className="text-blue-100 text-sm">Select a field operator</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Select Operator <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={operatorUserId}
                        onValueChange={handleOperatorSelect}
                      >
                        <SelectTrigger className={`h-12 ${errors["assignedOperator.userId"] ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'}`}>
                          <SelectValue placeholder="Choose an operator..." />
                        </SelectTrigger>
                        <SelectContent>
                          {operators.length === 0 ? (
                            <div className="px-4 py-6 text-center">
                              <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                              <p className="text-gray-500 text-sm">No operators available</p>
                            </div>
                          ) : (
                            operators.map((operator) => (
                              <SelectItem key={operator.user_id} value={operator.user_id}>
                                <div className="flex items-center gap-3 py-1">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <User className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div className="text-left">
                                    <p className="font-medium text-gray-900">{operator.name}</p>
                                    <p className="text-xs text-gray-500">{operator.email}</p>
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {errors["assignedOperator.userId"] && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errors["assignedOperator.userId"]}
                        </p>
                      )}
                    </div>

                    {operatorUserId ? (
                      <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-900">Selected Operator</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearOperatorSelection}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 h-8 px-2"
                          >
                            Change
                          </Button>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{operatorName}</p>
                            <div className="flex items-center gap-1 text-gray-600 text-sm">
                              <Mail className="h-3 w-3" />
                              {operatorEmail}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-6 text-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                          <User className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm">No operator selected</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* QC Technician Selection Card */}
                <div className="bg-white rounded-2xl border-2 border-green-100 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">QC Technician</h4>
                        <p className="text-green-100 text-sm">Select a QC reviewer</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Select QC Technician <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={qcUserId}
                        onValueChange={handleQcSelect}
                      >
                        <SelectTrigger className={`h-12 ${errors["qcTechnician.userId"] ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'}`}>
                          <SelectValue placeholder="Choose a QC technician..." />
                        </SelectTrigger>
                        <SelectContent>
                          {qcTechnicians.length === 0 ? (
                            <div className="px-4 py-6 text-center">
                              <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                              <p className="text-gray-500 text-sm">No QC technicians available</p>
                            </div>
                          ) : (
                            qcTechnicians.map((qc) => (
                              <SelectItem key={qc.user_id} value={qc.user_id}>
                                <div className="flex items-center gap-3 py-1">
                                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <User className="h-4 w-4 text-green-600" />
                                  </div>
                                  <div className="text-left">
                                    <p className="font-medium text-gray-900">{qc.name}</p>
                                    <p className="text-xs text-gray-500">{qc.email}</p>
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {errors["qcTechnician.userId"] && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errors["qcTechnician.userId"]}
                        </p>
                      )}
                    </div>

                    {qcUserId ? (
                      <div className="bg-green-50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-900">Selected QC Technician</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearQcSelection}
                            className="text-green-600 hover:text-green-700 hover:bg-green-100 h-8 px-2"
                          >
                            Change
                          </Button>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{qcName}</p>
                            <div className="flex items-center gap-1 text-gray-600 text-sm">
                              <Mail className="h-3 w-3" />
                              {qcEmail}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-6 text-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                          <User className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm">No QC technician selected</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Admin: Assigned Lead (user role only) */
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl border-2 border-purple-100 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <UserCheck className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Assigned Lead</h4>
                        <p className="text-purple-100 text-sm">Select a user (lead) for this project</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Select Lead (user) <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={leadUserId}
                        onValueChange={setLeadUserId}
                      >
                        <SelectTrigger className={`h-12 ${errors.managerId ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'}`}>
                          <SelectValue placeholder="Choose an assigned lead..." />
                        </SelectTrigger>
                        <SelectContent>
                          {leads.length === 0 ? (
                            <div className="px-4 py-6 text-center">
                              <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                              <p className="text-gray-500 text-sm">No users (lead) available</p>
                            </div>
                          ) : (
                            leads.map((lead) => (
                              <SelectItem key={lead.user_id} value={lead.user_id}>
                                <div className="flex items-center gap-3 py-1">
                                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <User className="h-4 w-4 text-purple-600" />
                                  </div>
                                  <div className="text-left">
                                    <p className="font-medium text-gray-900">{lead.name}</p>
                                    <p className="text-xs text-gray-500">{lead.email}</p>
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {errors.managerId && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errors.managerId}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Refresh button */}
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={fetchUsers}
                disabled={loadingUsers}
                className="flex items-center gap-2 h-10 px-6"
              >
                <RefreshCw className={`h-4 w-4 ${loadingUsers ? 'animate-spin' : ''}`} />
                Refresh Team List
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center pb-4">
              <div className="inline-flex p-3 bg-orange-100 rounded-xl mb-4">
                <Calendar className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Inspection Data</h3>
              <p className="text-gray-600">Recording details and metadata</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
              <InputField
                label="Recording Date"
                name="metadata.recordingDate"
                value={fieldValues["metadata.recordingDate"]}
                onChange={handleFieldChange}
                type="date"
                required
                error={errors["metadata.recordingDate"]}
              />
              <InputField
                label="Upstream Manhole"
                name="metadata.upstreamMH"
                value={fieldValues["metadata.upstreamMH"]}
                onChange={handleFieldChange}
                required
                error={errors["metadata.upstreamMH"]}
                placeholder="e.g., MH-001"
              />
              <InputField
                label="Downstream Manhole"
                name="metadata.downstreamMH"
                value={fieldValues["metadata.downstreamMH"]}
                onChange={handleFieldChange}
                required
                error={errors["metadata.downstreamMH"]}
                placeholder="e.g., MH-002"
              />
              <InputField
                label="Material"
                name="metadata.material"
                value={fieldValues["metadata.material"]}
                onChange={handleFieldChange}
                required
                error={errors["metadata.material"]}
                placeholder="e.g., Concrete, PVC"
              />
              <InputField
                label="Shape"
                name="metadata.shape"
                value={fieldValues["metadata.shape"]}
                onChange={handleFieldChange}
                required
                error={errors["metadata.shape"]}
                placeholder="e.g., Circular, Square"
              />
              <div className="lg:col-span-2">
                <div className="space-y-2">
                  <Label htmlFor="metadata.remarks" className="text-sm font-medium text-gray-700">
                    Remarks
                  </Label>
                  <Textarea
                    id="metadata.remarks"
                    name="metadata.remarks"
                    value={remarks}
                    onChange={(e) => handleFieldChange("metadata.remarks", e.target.value)}
                    placeholder="Add any additional notes or observations..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[100px]"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8">
            <div className="text-center pb-4">
              <div className="inline-flex p-3 bg-red-100 rounded-xl mb-4">
                <Video className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Video Upload</h3>
              <p className="text-gray-600">Upload the inspection video file (optional)</p>
            </div>

            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors bg-gray-50">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <Label htmlFor="video" className="cursor-pointer">
                  <Input
                    id="video"
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <span className="text-lg text-blue-600 hover:text-blue-800 font-medium">
                    Click to upload video file
                  </span>
                  <p className="text-gray-500 mt-2">or drag and drop</p>
                  <p className="text-gray-400 mt-2 text-sm">Supports MP4, AVI, MOV files</p>
                </Label>
              </div>

              {videoFile && (
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-green-800">File Selected Successfully</p>
                        <p className="text-sm text-green-600">{videoFile.name}</p>
                        <p className="text-xs text-green-500">
                          Size: {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setVideoFile(null)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleBack = () => {
    router.push(backUrl);
  };

  return (
    <div className="max-w-7xl mx-auto h-auto bg-gray-100 border-gray-200 shadow-2xl">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2 h-10"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FolderPlus className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
                  <p className="text-sm text-gray-600">Pipeline inspection project setup</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6 space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-14 h-14 rounded-full text-xl font-bold transition-all duration-300 ${currentStep === step.id
                  ? step.color + ' text-white shadow-md transform scale-110'
                  : currentStep > step.id
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                  }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <step.icon className="h-6 w-6" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-2 mx-3 rounded-full transition-all duration-500 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-gray-900">
              Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.title}
            </h2>
            <p className="text-md text-gray-600 mt-2">{steps[currentStep - 1]?.description}</p>
          </div>
        </div>
      </div>


      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {renderStepContent()}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2 h-10 px-4"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={loading}
                className="h-10 px-4"
              >
                Cancel
              </Button>

              {currentStep < steps.length ? (
                <Button
                  onClick={nextStep}
                  className="flex items-center gap-2 h-10 px-6 bg-blue-600 hover:bg-blue-700"
                >
                  Next Step
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 h-10 px-6 bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Create Project
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}