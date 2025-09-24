"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useAlert } from "@/components/providers/AlertProvider";
import { api } from "@/lib/helper";

// Base schema for common fields
const baseSchema = z.object({
  first_name: z.string().min(1, "First name is required."),
  last_name: z.string().min(1, "Last name is required."),
  username: z.string().min(2, "Username must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string().min(6, "Confirmation password is required."),
  role: z.enum(["user", "admin", "viewer", "qc-technician", "Operator"], { 
    required_error: "Role is required." 
  }),
  privacy: z.boolean().refine((val) => val === true, {
    message: "You must agree to the privacy policy & terms"
  }),
});

// Extended schemas for specific roles (only QC Technician and Operator)
const qcTechnicianSchema = baseSchema.extend({
  certification: z.string().min(1, "Certification is required for QC Technician role."),
  license_number: z.string().min(1, "License number is required for QC Technician role."),
  experience_years: z.string().min(1, "Years of experience is required."),
});

const operatorSchema = baseSchema.extend({
  certification: z.string().min(1, "Certification is required for Operator role."),
  shift_preference: z.enum(["day", "night", "rotating"], {
    required_error: "Shift preference is required."
  }),
  equipment_experience: z.string().min(1, "Equipment experience is required."),
});

const Register = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formSchema, setFormSchema] = useState(baseSchema);
  
  const router = useRouter();
  const { showAlert } = useAlert();

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible((prev) => !prev);
  };

  // Update form schema based on selected role
  useEffect(() => {
    switch (selectedRole) {
      case "qc-technician":
        setFormSchema(qcTechnicianSchema);
        break;
      case "Operator":
        setFormSchema(operatorSchema);
        break;
      default:
        setFormSchema(baseSchema);
    }
  }, [selectedRole]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  // Handle role selection
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setValue("role", role);
    setShowForm(true);
  };

  // Handle back to role selection
  const handleBackToRoleSelection = () => {
    setShowForm(false);
    setSelectedRole("");
    reset();
  };

  // Handle form submission
  const onSubmit = async (data) => {
    // Verify passwords match
    if (data.password !== data.confirmPassword) {
      showAlert("Passwords do not match!", "error");
      return;
    }

    try {
      data.isRegister = true;
      await api("/api/auth/register", "POST", data);
      
      showAlert("Registration successful!", "success");
      router.push("/login");
    } catch (error) {
      console.error("Error during registration:", error);
      showAlert(`Registration error: ${error.message}`, "error");
    }
  };

  const roles = [
    { 
      value: 'admin', 
      label: 'Admin', 
      description: 'Full system access and management capabilities',
      color: 'bg-red-500'
    },
    { 
      value: 'user', 
      label: 'User', 
      description: 'Standard user with basic system access',
      color: 'bg-blue-500'
    },
    { 
      value: 'viewer', 
      label: 'Viewer', 
      description: 'Read-only access to reports and data',
      color: 'bg-green-500'
    },
    { 
      value: 'qc-technician', 
      label: 'QC Technician', 
      description: 'Quality control and technical operations',
      color: 'bg-purple-500'
    },
    { 
      value: 'Operator', 
      label: 'Operator', 
      description: 'Equipment operation and maintenance',
      color: 'bg-orange-500'
    },
  ];

  const getRoleSpecificFields = () => {
    switch (selectedRole) {
      case "qc-technician":
        return (
          <div className="space-y-4">
            <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="font-semibold text-purple-700">QC Technician Information</span>
              </div>
              <p className="text-sm text-gray-600">Please provide your certification details</p>
            </div>
            
            <div>
              <Label htmlFor="certification">Certification</Label>
              <Input
                {...register("certification")}
                type="text"
                id="certification"
                placeholder="Enter your certification"
                size="xl"
                className="w-full mt-1 border rounded"
              />
              {errors.certification && (
                <span className="text-red-500 text-sm">
                  {errors.certification.message}
                </span>
              )}
            </div>
            
            <div>
              <Label htmlFor="license_number">License Number</Label>
              <Input
                {...register("license_number")}
                type="text"
                id="license_number"
                placeholder="Enter your license number"
                size="xl"
                className="w-full mt-1 border rounded"
              />
              {errors.license_number && (
                <span className="text-red-500 text-sm">
                  {errors.license_number.message}
                </span>
              )}
            </div>
            
            <div>
              <Label htmlFor="experience_years">Years of Experience</Label>
              <Input
                {...register("experience_years")}
                type="number"
                id="experience_years"
                placeholder="Enter years of experience"
                size="xl"
                className="w-full mt-1 border rounded"
              />
              {errors.experience_years && (
                <span className="text-red-500 text-sm">
                  {errors.experience_years.message}
                </span>
              )}
            </div>
          </div>
        );

      case "Operator":
        return (
          <div className="space-y-4">
            <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="font-semibold text-orange-700">Operator Information</span>
              </div>
              <p className="text-sm text-gray-600">Please provide your operational details</p>
            </div>
            
            <div>
              <Label htmlFor="certification">Certification</Label>
              <Input
                {...register("certification")}
                type="text"
                id="certification"
                placeholder="Enter your certification"
                size="xl"
                className="w-full mt-1 border rounded"
              />
              {errors.certification && (
                <span className="text-red-500 text-sm">
                  {errors.certification.message}
                </span>
              )}
            </div>
            
            <div>
              <Label htmlFor="shift_preference">Shift Preference</Label>
              <Controller
                name="shift_preference"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => field.onChange(value)}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-full h-12">
                      <SelectValue placeholder="Select shift preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Day Shift</SelectItem>
                      <SelectItem value="night">Night Shift</SelectItem>
                      <SelectItem value="rotating">Rotating Shift</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.shift_preference && (
                <span className="text-red-500 text-sm">
                  {errors.shift_preference.message}
                </span>
              )}
            </div>
            
            <div>
              <Label htmlFor="equipment_experience">Equipment Experience</Label>
              <Input
                {...register("equipment_experience")}
                type="text"
                id="equipment_experience"
                placeholder="Describe your equipment experience"
                size="xl"
                className="w-full mt-1 border rounded"
              />
              {errors.equipment_experience && (
                <span className="text-red-500 text-sm">
                  {errors.equipment_experience.message}
                </span>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <span className="font-semibold text-gray-700">
                {roles.find(r => r.value === selectedRole)?.label} Registration
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {roles.find(r => r.value === selectedRole)?.description}
            </p>
          </div>
        );
    }
  };

  // Role Selection Screen
  if (!showForm) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 py-8">
        <Card className="w-full max-w-md p-6 bg-white rounded-2xl shadow-lg">
          <CardHeader className="text-center text-xl font-bold mb-2 justify-center">
            <div className="flex items-center justify-center gap-2">
              <Image src="/logo.png" alt="Logo" width={32} height={30} />
              <span>SewerVersion</span>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-6">
              <div className="font-bold text-black pb-2.5">
                Choose Your Role 🎯
              </div>
              Select the role that best describes your position and responsibilities.
            </CardDescription>

            <div className="space-y-3">
              {roles.map((role) => (
                <div
                  key={role.value}
                  onClick={() => handleRoleSelect(role.value)}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${role.color}`}></div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{role.label}</div>
                      <div className="text-sm text-gray-600">{role.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center text-sm mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-[#D76A84] hover:underline">
                Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Registration Form Screen
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 py-8">
      <Card className="w-full max-w-md p-6 bg-white rounded-2xl shadow-lg">
        <CardHeader className="text-center text-xl font-bold mb-2 justify-center">
          <div className="flex items-center justify-center gap-2">
            <Image src="/logo.png" alt="Logo" width={32} height={30} />
            <span>SewerVersion</span>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleBackToRoleSelection}
                className="p-1 h-auto"
              >
                <FaArrowLeft className="text-gray-500" />
              </Button>
              <div className="font-bold text-black">
                {roles.find(r => r.value === selectedRole)?.label} Registration
              </div>
            </div>
            Complete your registration to get started!
          </CardDescription>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Role-specific info section */}
            {getRoleSpecificFields()}

            {/* Basic Information Fields */}
            {["first_name", "last_name", "username", "email"].map((field) => (
              <div key={field} className="mb-4">
                <Label htmlFor={field}>
                  {field
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </Label>
                <Input
                  {...register(field)}
                  type={field === "email" ? "email" : "text"}
                  id={field}
                  placeholder={`Enter your ${field.replace('_', ' ')}`}
                  size="xl"
                  className="w-full mt-1 border rounded"
                />
                {errors[field] && (
                  <span className="text-red-500 text-sm">
                    {errors[field].message}
                  </span>
                )}
              </div>
            ))}

            {/* Password Fields */}
            {["password", "confirmPassword"].map((field, index) => (
              <div key={field} className="mb-4 relative">
                <Label htmlFor={field}>
                  {field
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </Label>
                <Input
                  {...register(field)}
                  type={
                    (index === 0 ? passwordVisible : confirmPasswordVisible)
                      ? "text"
                      : "password"
                  }
                  id={field}
                  placeholder={`Enter your ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`}
                  size="xl"
                  className="w-full mt-1 border rounded"
                />
                <div
                  className="absolute right-3 top-8 cursor-pointer text-gray-500"
                  onClick={
                    index === 0
                      ? togglePasswordVisibility
                      : toggleConfirmPasswordVisibility
                  }
                >
                  {(index === 0 ? passwordVisible : confirmPasswordVisible) ? (
                    <FaEyeSlash size={20} className="text-gray-500" />
                  ) : (
                    <FaEye size={20} className="text-gray-500" />
                  )}
                </div>
                {errors[field] && (
                  <span className="text-red-500 text-sm">
                    {errors[field].message}
                  </span>
                )}
              </div>
            ))}

            {/* Terms and Conditions */}
            <div className="flex items-center gap-2 mb-4 mt-4">
              <Controller
                name="privacy"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="privacy"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="privacy" className="text-sm">
                I agree to the privacy policy & terms
              </Label>
            </div>
            {errors.privacy && (
              <span className="text-red-500 text-sm mb-2 block">
                {errors.privacy.message}
              </span>
            )}

            <Button type="submit" className="w-full py-2 mb-4" variant="rose">
              Register as {roles.find(r => r.value === selectedRole)?.label}
            </Button>
   
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-[#D76A84] hover:underline">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;