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
  Building2, 
  MapPin, 
  Ruler, 
  Package, 
  Circle, 
  FileText, 
  Calendar,
  ArrowUp,
  ArrowDown,
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
  Home,
  UserCheck,
  Search
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
    title: "Team Assignment",
    description: "Assign operators and QC",
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

// Memoized Input Field Component
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

export default function CreateProjectPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [videoFile, setVideoFile] = useState(null);
  const { showAlert } = useAlert();
  const router = useRouter();
  const {userId} = useUser()

  // User data states
  const [operators, setOperators] = useState([]);
  const [qcTechnicians, setQcTechnicians] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Project Details - Step 1
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [client, setClient] = useState("");
  const [workOrder, setWorkOrder] = useState("");
  const [priority, setPriority] = useState("medium");

  // Pipeline Info - Step 2
  const [totalLength, setTotalLength] = useState("");
  const [pipelineMaterial, setPipelineMaterial] = useState("");
  const [pipelineShape, setPipelineShape] = useState("");

  // Team Assignment - Step 3
  const [operatorUserId, setOperatorUserId] = useState("");
  const [operatorName, setOperatorName] = useState("");
  const [operatorEmail, setOperatorEmail] = useState("");
  const [operatorCertification, setOperatorCertification] = useState("");
  const [qcUserId, setQcUserId] = useState("");
  const [qcName, setQcName] = useState("");
  const [qcEmail, setQcEmail] = useState("");
  const [qcCertification, setQcCertification] = useState("");

  // Inspection Data - Step 4
  const [recordingDate, setRecordingDate] = useState("");
  const [upstreamMH, setUpstreamMH] = useState("");
  const [downstreamMH, setDownstreamMH] = useState("");
  const [metadataMaterial, setMetadataMaterial] = useState("");
  const [metadataShape, setMetadataShape] = useState("");
  const [remarks, setRemarks] = useState("");

  // Fetch users with specific roles
  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const { ok, data } = await api("/api/users/get-all-user", "GET");
      
      if (ok && data?.users) {
        // Filter users by role
        const operatorUsers = data.users.filter(user => user.role === 'Operator');
        const qcUsers = data.users.filter(user => user.role === 'Qc-Technician');
        
        setOperators(operatorUsers);
        setQcTechnicians(qcUsers);
      }
    } catch (error) {
      showAlert("Failed to fetch users", "error");
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  }, [showAlert]);


  
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOperatorSelect = useCallback((userId) => {
    const selectedOperator = operators.find(op => op.user_id === userId);
    if (selectedOperator) {
      setOperatorUserId(userId);
      setOperatorName(selectedOperator.name);
      setOperatorEmail(selectedOperator.email);
      // Set certification if available in user data
      setOperatorCertification(selectedOperator.certification || "");
    }
  }, [operators]);

  const handleQcSelect = useCallback((userId) => {
    const selectedQc = qcTechnicians.find(qc => qc.user_id === userId);
    if (selectedQc) {
      setQcUserId(userId);
      setQcName(selectedQc.name);
      setQcEmail(selectedQc.email);
      // Set certification if available in user data
      setQcCertification(selectedQc.certification || "");
    }
  }, [qcTechnicians]);

  const fieldSetters = {
    name: setName,
    location: setLocation,
    client: setClient,
    workOrder: setWorkOrder,
    priority: setPriority,
    totalLength: setTotalLength,
    pipelineMaterial: setPipelineMaterial,
    pipelineShape: setPipelineShape,
    "assignedOperator.userId": setOperatorUserId,
    "assignedOperator.name": setOperatorName,
    "assignedOperator.email": setOperatorEmail,
    "assignedOperator.certification": setOperatorCertification,
    "qcTechnician.userId": setQcUserId,
    "qcTechnician.name": setQcName,
    "qcTechnician.email": setQcEmail,
    "qcTechnician.certification": setQcCertification,
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
    client,
    workOrder,
    priority,
    totalLength,
    pipelineMaterial,
    pipelineShape,
    "assignedOperator.userId": operatorUserId,
    "assignedOperator.name": operatorName,
    "assignedOperator.email": operatorEmail,
    "assignedOperator.certification": operatorCertification,
    "qcTechnician.userId": qcUserId,
    "qcTechnician.name": qcName,
    "qcTechnician.email": qcEmail,
    "qcTechnician.certification": qcCertification,
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

  const getFormData = useCallback(() => ({
    userId,
    name,
    location,
    client,
    totalLength,
    pipelineMaterial,
    pipelineShape,
    workOrder,
    priority,
    assignedOperator: {
      userId: operatorUserId,
      name: operatorName,
      email: operatorEmail,
      certification: operatorCertification
    },
    qcTechnician: {
      userId: qcUserId,
      name: qcName,
      email: qcEmail,
      certification: qcCertification
    },
    metadata: {
      recordingDate,
      upstreamMH,
      downstreamMH,
      shape: metadataShape,
      material: metadataMaterial,
      remarks,
    },
  }), [name, location, client, totalLength, pipelineMaterial, pipelineShape, workOrder, priority,
      operatorUserId, operatorName, operatorEmail, operatorCertification,
      qcUserId, qcName, qcEmail, qcCertification,
      recordingDate, upstreamMH, downstreamMH, metadataShape, metadataMaterial, remarks]);

  const validateStep = useCallback((step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!name) newErrors.name = "Project name is required";
        if (!client) newErrors.client = "Client is required";
        if (!location) newErrors.location = "Location is required";
        if (!workOrder) newErrors.workOrder = "Work order is required";
        break;
      case 2:
        if (!totalLength) newErrors.totalLength = "Total length is required";
        if (!pipelineMaterial) newErrors.pipelineMaterial = "Pipeline material is required";
        if (!pipelineShape) newErrors.pipelineShape = "Pipeline shape is required";
        break;
      case 3:
        if (!operatorUserId) newErrors["assignedOperator.userId"] = "Please select an operator";
        if (!qcUserId) newErrors["qcTechnician.userId"] = "Please select a QC technician";
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
  }, [name, client, location, workOrder, totalLength, pipelineMaterial, pipelineShape,
      operatorUserId, qcUserId, recordingDate, upstreamMH, downstreamMH, metadataMaterial, metadataShape]);

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
      router.push("/admin/project");
  
    } catch (error) {
      showAlert(error.message || "Failed to create project", "error");
    }
  }, [currentStep, getFormData, showAlert, validateStep, videoFile, router]);
  

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
              <InputField
                label="Client"
                name="client"
                value={fieldValues.client}
                onChange={handleFieldChange}
                required
                error={errors.client}
                placeholder="Enter client name"
              />
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
        return (
          <div className="space-y-8">
            <div className="text-center pb-4">
              <div className="inline-flex p-3 bg-purple-100 rounded-xl mb-4">
                <Users className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Team Assignment</h3>
              <p className="text-gray-600">Assign operators and quality control technicians</p>
            </div>
            
            {loadingUsers && (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                <p className="text-gray-600">Loading available users...</p>
              </div>
            )}
            
            <div className="space-y-8 max-w-5xl mx-auto">
              {/* Operator Selection */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  Assigned Operator
                </h4>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Select Operator *
                    </Label>
                    <Select 
                      value={operatorUserId} 
                      onValueChange={handleOperatorSelect}
                    >
                      <SelectTrigger className={`h-10 ${errors["assignedOperator.userId"] ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Choose an operator..." />
                      </SelectTrigger>
                      <SelectContent>
                        {operators.length === 0 ? (
                          <SelectItem value="no-operators" disabled>
                            No operators available
                          </SelectItem>
                        ) : (
                          operators.map((operator) => (
                            <SelectItem key={operator.user_id} value={operator.user_id}>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <UserCheck className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium">{operator.name}</div>
                                  <div className="text-xs text-gray-500">{operator.email}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {errors["assignedOperator.userId"] && (
                      <span className="text-red-500 text-sm flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {errors["assignedOperator.userId"]}
                      </span>
                    )}
                  </div>

                  {operatorUserId && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4 p-4 bg-white rounded-lg border">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Name</Label>
                        <Input value={operatorName} disabled className="bg-gray-50" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Email</Label>
                        <Input value={operatorEmail} disabled className="bg-gray-50" />
                      </div>
                      <div className="lg:col-span-2 space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Certification</Label>
                        <Input
                          value={operatorCertification}
                          onChange={(e) => handleFieldChange("assignedOperator.certification", e.target.value)}
                          placeholder="Enter or update certification details"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* QC Technician Selection */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  QC Technician
                </h4>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Select QC Technician *
                    </Label>
                    <Select 
                      value={qcUserId} 
                      onValueChange={handleQcSelect}
                    >
                      <SelectTrigger className={`h-10 ${errors["qcTechnician.userId"] ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Choose a QC technician..." />
                      </SelectTrigger>
                      <SelectContent>
                        {qcTechnicians.length === 0 ? (
                          <SelectItem value="no-qc" disabled>
                            No QC technicians available
                          </SelectItem>
                        ) : (
                          qcTechnicians.map((qc) => (
                            <SelectItem key={qc.user_id} value={qc.user_id}>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                  <div className="font-medium">{qc.name}</div>
                                  <div className="text-xs text-gray-500">{qc.email}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {errors["qcTechnician.userId"] && (
                      <span className="text-red-500 text-sm flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {errors["qcTechnician.userId"]}
                      </span>
                    )}
                  </div>

                  {qcUserId && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4 p-4 bg-white rounded-lg border">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Name</Label>
                        <Input value={qcName} disabled className="bg-gray-50" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Email</Label>
                        <Input value={qcEmail} disabled className="bg-gray-50" />
                      </div>
                      <div className="lg:col-span-2 space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Certification</Label>
                        <Input
                          value={qcCertification}
                          onChange={(e) => handleFieldChange("qcTechnician.certification", e.target.value)}
                          placeholder="Enter or update certification details"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Refresh button */}
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={fetchUsers}
                  disabled={loadingUsers}
                  className="flex items-center gap-2"
                >
                  {loadingUsers ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Refresh User List
                </Button>
              </div>
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

  const handleBack = ()=> {
    router.push('/admin/project')
  }

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
                <div className={`flex items-center justify-center w-14 h-14 rounded-full text-xl font-bold transition-all duration-300 ${
                    currentStep === step.id 
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
                    <div className={`w-16 h-2 mx-3 rounded-full transition-all duration-500 ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
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