"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  PlayCircle,
  Clock,
  Tag,
  User,
  Edit3,
  Trash2,
  Download,
  Save,
  X,
} from "lucide-react";
import { api } from "@/lib/helper";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useAlert } from "@/components/providers/AlertProvider";
import { useDialog } from "@/components/providers/DialogProvider";

const SelectCustom = ({
  value,
  onChange,
  options,
  className = "",
  disabled = false,
}) => {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${className}`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

const EditableSection = ({
  title,
  children,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  saving = false,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <Button variant="ghost" onClick={onEdit}>
              <Edit3 className="h-3 w-3 mr-1" />
              Edit
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={onCancel}>
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
              <Button variant="success" onClick={onSave} disabled={saving}>
                <Save className="h-3 w-3 mr-1" />
                {saving ? "Saving..." : "Save"}
              </Button>
            </>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};

const ObservationDetailsPage = () => {
  const router = useRouter();
  const [observation, setObservation] = useState(null);
  const [editingSections, setEditingSections] = useState({});
  const [sectionData, setSectionData] = useState({});
  const [projects,setProjects] = useState([]);
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingStates, setSavingStates] = useState({});
  const [pacpCodes, setPacpCodes] = useState([]);

  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  

  const { observation_id } = useParams();
  const { showAlert } = useAlert();
  const {showDelete} = useDialog();


  // Fetch observation data from API
 
  const getSeverityColor = (severity) => {
    const severityMap = {
      high: "bg-red-100 text-red-800 border-red-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-green-100 text-green-800 border-green-200",
    };
    return severityMap[severity] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const handleSectionEdit = (section) => {
    setEditingSections((prev) => ({ ...prev, [section]: true }));
  };

  const handleSectionCancel = (section) => {
    setEditingSections((prev) => ({ ...prev, [section]: false }));
    setSectionData((prev) => ({
      ...prev,
      [section]: { ...observation },
    }));
  };

  const handleSectionSave = async (section) => {
    setSavingStates((prev) => ({ ...prev, [section]: true }));

    try {
      const updatedObservation = { ...observation, ...sectionData[section] };
      const { ok, data } = await api(
        `/api/observations/update-observation/${observation_id}`,
        "PUT",
        updatedObservation
      );

      if (ok) {
        setObservation(updatedObservation);
        setEditingSections((prev) => ({ ...prev, [section]: false }));
        console.log("✅ Update successful");
      } else {
        showAlert(`Failed to save ${section}`, "error");
        console.error("❌ API returned not ok:", data);
      }
    } catch (err) {
      console.error(`❌ Failed to save ${section}:`, err);
      setError(`Failed to save ${section}`);
    } finally {
      setSavingStates((prev) => ({ ...prev, [section]: false }));
    }
  };

  const handleInputChange = (section, field, value) => {
    setSectionData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleFetchProject = useCallback(async () => {
    try {
      const { ok, data } = await api(`/api/projects/get-project/${projectId}`);
      const project = data.data;
      if (ok) {
        setProjects(project);
      } else {
        showAlert('Failed to load project information');
      }
    } 
    catch (error) {
      console.error(`Failed to load project information: ${error.message}`);
    }
  }, [projectId, showAlert]);

  const fetchUserCreatedBy = useCallback(async (userId) => {
    try {
      const { ok, data } = await api(`/api/users/get-user-details/${userId}`, 'GET');
  
      if (ok && data.user) {
        setUsers(`${data.user.first_name} ${data.user.last_name}`);
      } else {
        showAlert('Failed to load user information');
      }
    } catch (error) {
      console.error(`Failed to load user information: ${error.message}`);
      showAlert('An unexpected error occurred while loading user information');
    }
  }, [showAlert]);
  
  
  

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this observation?")) {
      try {
        const { ok } = await api(
          `/api/observations/delete-observation/${observation_id}`,'DELETE');

        if (ok) {
          showAlert(`observation successfully deleted:${observation_id}`)
          router.push(`/admin/project/observationpages/${observation_id}`);
        } 
        else {
          setError("Failed to delete observation");
        }
      } catch (err) {
        setError("Failed to delete observation");
      }
    }
  };


  const fetchpacpCodes = useCallback(async () => {
    try {
      const { ok, data } = await api("/api/pacpcodes/get-all-pacpcodes", "GET");

      if (!ok) {
        showAlert("Failed to load pacpcodes", "error");
      } else {
        setPacpCodes(data.codes);
      }
    } catch (error) {
      console.error(`error fetching pacpcodes: ${error.message}`, "error");
    }
  }, [showAlert]);

  const handleGoToTime = () => {
    console.log("Navigate to time:", observation.time);
  };

  useEffect(() => {
    fetchpacpCodes();
    handleFetchProject();
  }, [fetchpacpCodes,handleFetchProject,fetchUserCreatedBy]);

  useEffect(() => {
    const fetchObservation = async () => {
      try {
        const { ok, data } = await api(
          `/api/observations/get-observation/${observation_id}`
        );
        const observation = data.data;
        const createdBy = observation.createdBy;
  
        setObservation(observation);
  
        if (createdBy) {
          await fetchUserCreatedBy(createdBy);
        }
  
        setSectionData({
          basicInfo: { ...observation },
          observationDetails: { ...observation },
          additionalProperties: { ...observation },
          severity: { ...observation },
        });
  
        setLoading(false);
      } catch (err) {
        setError("Failed to load observation details");
        setLoading(false);
      }
    };
  
    if (observation_id) {
      fetchObservation();
    }
  }, [observation_id, fetchUserCreatedBy]);


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading observation details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() =>
                  router.push(`/admin/project?selectedProject=${projectId}`)
                }
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Observation Details
                </h1>
                <p className="text-sm text-gray-500">ID: {observation._id}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleGoToTime}>
                <PlayCircle className="h-4 w-4 mr-2" />
                Go to Time
              </Button>
              <Button variant="outline" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <EditableSection
              title="Basic Information"
              isEditing={editingSections.basicInfo}
              onEdit={() => handleSectionEdit("basicInfo")}
              onSave={() => handleSectionSave("basicInfo")}
              onCancel={() => handleSectionCancel("basicInfo")}
              saving={savingStates.basicInfo}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distance
                  </label>
                  {editingSections.basicInfo ? (
                    <Input
                      value={sectionData.basicInfo?.distance || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "basicInfo",
                          "distance",
                          e.target.value
                        )
                      }
                      placeholder="Distance"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {observation.distance}m
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PACP Code
                  </label>

                  {editingSections.basicInfo ? (
                    <Select
                      value={sectionData.basicInfo?.pacpCode || ""}
                      onValueChange={(value) =>
                        handleInputChange("basicInfo", "pacpCode", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select PACP Code" />
                      </SelectTrigger>
                      <SelectContent>
                        {pacpCodes.map((item) => (
                          <SelectItem key={item.code} value={item.code}>
                            {item.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {observation.pacpCode}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  {editingSections.basicInfo ? (
                    <Input
                      value={sectionData.basicInfo?.time || ""}
                      onChange={(e) =>
                        handleInputChange("basicInfo", "time", e.target.value)
                      }
                      placeholder="Time"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {observation.time}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Clock Position
                  </label>
                  {editingSections.basicInfo ? (
                    <Input
                      value={sectionData.basicInfo?.clockPosition || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "basicInfo",
                          "clockPosition",
                          e.target.value
                        )
                      }
                      placeholder="Clock Position"
                    />
                  ) : (
                    <span className="text-sm text-gray-900">
                      {observation.clockPosition}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Length
                  </label>
                  {editingSections.basicInfo ? (
                    <Input
                      value={sectionData.basicInfo?.length || ""}
                      onChange={(e) =>
                        handleInputChange("basicInfo", "length", e.target.value)
                      }
                      placeholder="Length"
                    />
                  ) : (
                    <span className="text-sm text-gray-900">
                      {observation.length}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Width
                  </label>
                  {editingSections.basicInfo ? (
                    <Input
                      value={sectionData.basicInfo?.width || ""}
                      onChange={(e) =>
                        handleInputChange("basicInfo", "width", e.target.value)
                      }
                      placeholder="Width"
                    />
                  ) : (
                    <span className="text-sm text-gray-900">
                      {observation.width}cm
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Percentage
                  </label>
                  {editingSections.basicInfo ? (
                    <Input
                      value={sectionData.basicInfo?.percentage || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "basicInfo",
                          "percentage",
                          e.target.value
                        )
                      }
                      placeholder="Percentage"
                    />
                  ) : (
                    <span className="text-sm text-gray-900">
                      {observation.percentage}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Joint
                  </label>
                  {editingSections.basicInfo ? (
                    <Input
                      value={sectionData.basicInfo?.joint || ""}
                      onChange={(e) =>
                        handleInputChange("basicInfo", "joint", e.target.value)
                      }
                      placeholder="Joint"
                    />
                  ) : (
                    <span className="text-sm text-gray-900">
                      {observation.joint || "N/A"}
                    </span>
                  )}
                </div>
              </div>
            </EditableSection>

            {/* Observation Details */}
            <EditableSection
              title="Observation Details"
              isEditing={editingSections.observationDetails}
              onEdit={() => handleSectionEdit("observationDetails")}
              onSave={() => handleSectionSave("observationDetails")}
              onCancel={() => handleSectionCancel("observationDetails")}
              saving={savingStates.observationDetails}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  {editingSections.observationDetails ? (
                    <Textarea
                      value={sectionData.observationDetails?.observation || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "observationDetails",
                          "observation",
                          e.target.value
                        )
                      }
                      placeholder="Observation description"
                      rows={4}
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">
                      {observation.observation}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks
                  </label>
                  {editingSections.observationDetails ? (
                    <Textarea
                      value={sectionData.observationDetails?.remarks || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "observationDetails",
                          "remarks",
                          e.target.value
                        )
                      }
                      placeholder="Remarks"
                      rows={3}
                    />
                  ) : (
                    observation.remarks && (
                      <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">
                        {observation.remarks}
                      </p>
                    )
                  )}
                </div>
              </div>
            </EditableSection>

            {/* Additional Properties */}
            <EditableSection
              title="Additional Properties"
              isEditing={editingSections.additionalProperties}
              onEdit={() => handleSectionEdit("additionalProperties")}
              onSave={() => handleSectionSave("additionalProperties")}
              onCancel={() => handleSectionCancel("additionalProperties")}
              saving={savingStates.additionalProperties}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Continuous
                  </label>
                  {editingSections.additionalProperties ? (
                    <SelectCustom
                      value={
                        sectionData.additionalProperties?.continuous
                          ? "true"
                          : "false"
                      }
                      onChange={(e) =>
                        handleInputChange(
                          "additionalProperties",
                          "continuous",
                          e.target.value === "true"
                        )
                      }
                      options={[
                        { value: "true", label: "Yes" },
                        { value: "false", label: "No" },
                      ]}
                    />
                  ) : (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        observation.continuous
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {observation.continuous ? "Yes" : "No"}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Has Snapshot
                  </label>
                  {editingSections.additionalProperties ? (
                    <SelectCustom
                      value={
                        sectionData.additionalProperties?.snapshot
                          ? "true"
                          : "false"
                      }
                      onChange={(e) =>
                        handleInputChange(
                          "additionalProperties",
                          "snapshot",
                          e.target.value === "true"
                        )
                      }
                      options={[
                        { value: "true", label: "Yes" },
                        { value: "false", label: "No" },
                      ]}
                    />
                  ) : (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        observation.snapshot
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {observation.snapshot ? "Yes" : "No"}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    AI Generated
                  </label>
                  {editingSections.additionalProperties ? (
                    <SelectCustom
                      value={
                        sectionData.additionalProperties?.aiGenerated
                          ? "true"
                          : "false"
                      }
                      onChange={(e) =>
                        handleInputChange(
                          "additionalProperties",
                          "aiGenerated",
                          e.target.value === "true"
                        )
                      }
                      options={[
                        { value: "true", label: "Yes" },
                        { value: "false", label: "No" },
                      ]}
                    />
                  ) : (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        observation.aiGenerated
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {observation.aiGenerated ? "Yes" : "No"}
                    </span>
                  )}
                </div>
              </div>
            </EditableSection>

            {/* Snapshot Section */}
            {observation.snapshot && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Snapshot
                </h2>
                <div className="flex items-center justify-between border rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <PlayCircle className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">
                      Observation Snapshot
                    </span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Severity */}
            <EditableSection
              title="Severity Level"
              isEditing={editingSections.severity}
              onEdit={() => handleSectionEdit("severity")}
              onSave={() => handleSectionSave("severity")}
              onCancel={() => handleSectionCancel("severity")}
              saving={savingStates.severity}
            >
              {editingSections.severity ? (
                <SelectCustom
                  value={sectionData.severity?.severity || "low"}
                  onChange={(e) =>
                    handleInputChange("severity", "severity", e.target.value)
                  }
                  options={[
                    { value: "low", label: "Low" },
                    { value: "medium", label: "Medium" },
                    { value: "high", label: "High" },
                  ]}
                />
              ) : (
                <div
                  className={`px-4 py-2 rounded-lg border ${getSeverityColor(
                    observation.severity
                  )}`}
                >
                  <span className="font-medium capitalize">
                    {observation.severity}
                  </span>
                </div>
              )}
            </EditableSection>

            {/* Project Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Project Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Project Name
                  </label>
                  <p className="text-sm text-gray-900">{projects.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Project Location
                  </label>
                  <p className="text-sm text-gray-900">{projects.location}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Project Status
                  </label>
                  <p className="text-sm text-gray-900">{projects.status}</p>
                </div>
              </div>
            </div>


            {/* Tags */}
            {observation.tags && observation.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {observation.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Metadata
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Created By
                  </label>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {users}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Created At
                  </label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {new Date(observation.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Updated
                  </label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {new Date(observation.updatedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObservationDetailsPage;
