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
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FaEye, 
  FaEyeSlash, 
  FaArrowLeft, 
  FaUserShield, 
  FaUser, 
  FaUserTag, 
  FaCog, 
  FaTools,
  FaCamera,
  FaLock,
  FaEnvelope,
  FaIdCard
} from "react-icons/fa";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useAlert } from "@/components/providers/AlertProvider";
import { api } from "@/lib/helper";
import Image from "next/image";

// Base schema for common fields
const baseSchema = z.object({
  first_name: z.string().min(1, "First name is required."),
  last_name: z.string().min(1, "Last name is required."),
  username: z.string().min(2, "Username must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string().min(6, "Confirmation password is required."),
  role: z.enum(["user", "admin", "customer", "qc-technician", "operator"], { 
    required_error: "Role is required." 
  }),
  privacy: z.boolean().refine((val) => val === true, {
    message: "You must agree to the privacy policy & terms"
  }),
});

// Extended schemas for specific roles
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
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { showAlert } = useAlert();

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible((prev) => !prev);
  };

  useEffect(() => {
    switch (selectedRole) {
      case "qc-technician":
        setFormSchema(qcTechnicianSchema);
        break;
      case "operator":
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

  const onSubmit = async (data) => {
    console.log("Form Data:", data);

    if (data.password !== data.confirmPassword) {
      showAlert("Passwords do not match!", "error");
      return;
    }

    try {
      setLoading(true);
      data.isRegister = true;
      await api("/api/auth/register", "POST", data);
      
      showAlert("Registration successful!", "success");
      router.push("/");
    } catch (error) {
      console.error("Error during registration:", error);
      showAlert(`Registration error: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { 
      value: 'admin', 
      label: 'Admin', 
      description: 'Full system access and management capabilities',
      icon: <FaUserShield className="h-7 w-7" />,
      gradient: 'from-red-500 to-red-600',
      bgGradient: 'from-red-50 to-red-100',
      borderColor: 'border-red-200',
      hoverBorder: 'hover:border-red-400'
    },
    { 
      value: 'user', 
      label: 'User', 
      description: 'Standard user with basic system access',
      icon: <FaUser className="h-7 w-7" />,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      hoverBorder: 'hover:border-blue-400'
    },
    { 
      value: 'customer', 
      label: 'Customer', 
      description: 'Read-only access to reports and data',
      icon: <FaUserTag className="h-7 w-7" />,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      borderColor: 'border-green-200',
      hoverBorder: 'hover:border-green-400'
    },
    { 
      value: 'qc-technician', 
      label: 'QC Technician', 
      description: 'Quality control and technical operations',
      icon: <FaCog className="h-7 w-7" />,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-200',
      hoverBorder: 'hover:border-purple-400'
    },
    { 
      value: 'operator', 
      label: 'Operator', 
      description: 'Equipment operation and maintenance',
      icon: <FaTools className="h-7 w-7" />,
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      borderColor: 'border-orange-200',
      hoverBorder: 'hover:border-orange-400'
    },
  ];

  const getRoleSpecificFields = () => {
    const currentRole = roles.find(r => r.value === selectedRole);
    
    switch (selectedRole) {
      case "qc-technician":
        return (
          <div className="space-y-4 mb-6">
            <div className={`p-5 bg-gradient-to-r ${currentRole.bgGradient} rounded-xl border-2 ${currentRole.borderColor}`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 bg-gradient-to-r ${currentRole.gradient} rounded-lg text-white`}>
                  {currentRole.icon}
                </div>
                <div>
                  <span className="font-bold text-gray-900 text-lg">{currentRole.label} Information</span>
                  <p className="text-sm text-gray-600">Please provide your certification details</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="certification" className="text-sm font-semibold text-gray-700">
                  Certification
                </Label>
                <Input
                  {...register("certification")}
                  type="text"
                  id="certification"
                  placeholder="Enter your certification"
                  className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                />
                {errors.certification && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span className="font-medium">⚠</span> {errors.certification.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="license_number" className="text-sm font-semibold text-gray-700">
                  License Number
                </Label>
                <Input
                  {...register("license_number")}
                  type="text"
                  id="license_number"
                  placeholder="Enter your license number"
                  className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                />
                {errors.license_number && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span className="font-medium">⚠</span> {errors.license_number.message}
                  </p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="experience_years" className="text-sm font-semibold text-gray-700">
                Years of Experience
              </Label>
              <Input
                {...register("experience_years")}
                type="number"
                id="experience_years"
                placeholder="Enter years of experience"
                className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
              />
              {errors.experience_years && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span className="font-medium">⚠</span> {errors.experience_years.message}
                </p>
              )}
            </div>
          </div>
        );

      case "operator":
        return (
          <div className="space-y-4 mb-6">
            <div className={`p-5 bg-gradient-to-r ${currentRole.bgGradient} rounded-xl border-2 ${currentRole.borderColor}`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 bg-gradient-to-r ${currentRole.gradient} rounded-lg text-white`}>
                  {currentRole.icon}
                </div>
                <div>
                  <span className="font-bold text-gray-900 text-lg">{currentRole.label} Information</span>
                  <p className="text-sm text-gray-600">Please provide your operational details</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="certification" className="text-sm font-semibold text-gray-700">
                  Certification
                </Label>
                <Input
                  {...register("certification")}
                  type="text"
                  id="certification"
                  placeholder="Enter your certification"
                  className="h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-xl"
                />
                {errors.certification && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span className="font-medium">⚠</span> {errors.certification.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="shift_preference" className="text-sm font-semibold text-gray-700">
                  Shift Preference
                </Label>
                <Controller
                  name="shift_preference"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="h-12 rounded-xl border-gray-300 focus:border-orange-500 focus:ring-orange-500">
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
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span className="font-medium">⚠</span> {errors.shift_preference.message}
                  </p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="equipment_experience" className="text-sm font-semibold text-gray-700">
                Equipment Experience
              </Label>
              <Input
                {...register("equipment_experience")}
                type="text"
                id="equipment_experience"
                placeholder="Describe your equipment experience"
                className="h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-xl"
              />
              {errors.equipment_experience && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span className="font-medium">⚠</span> {errors.equipment_experience.message}
                </p>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="mb-6 p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg text-white">
                {currentRole?.icon}
              </div>
              <div>
                <span className="font-bold text-gray-900 text-lg">
                  {currentRole?.label} Registration
                </span>
                <p className="text-sm text-gray-600">{currentRole?.description}</p>
              </div>
            </div>
          </div>
        );
    }
  };

  // Role Selection Screen
  if (!showForm) {
    return (
      <div className="flex items-center justify-center min-h-screen py-8 px-4">
        <Card className="w-full max-w-6xl bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-rose-100 overflow-hidden">
          <div className="h-3 bg-gradient-to-r from-[#D76A84] via-rose-500 to-pink-600"></div>
          
          <CardHeader className="text-center pt-10 pb-6">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#D76A84] to-rose-500 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>

                  <Image 
                    src ='/Logo.png'
                    width={60}
                    height={60}
                    alt="SewerVision Logo"
                    className="relative z-10"
                  />
               
              </div>
            </div>

            <h1 className="text-5xl font-bold bg-gradient-to-r from-[#D76A84] to-rose-600 bg-clip-text text-transparent mb-3">
              SewerVision
            </h1>
            
            <CardDescription className="text-center max-w-2xl mx-auto">
              <div className="font-bold text-gray-900 text-2xl mb-2">
                Choose Your Role 🎯
              </div>
              <p className="text-gray-600 text-base">
                Select the role that best describes your position and responsibilities
              </p>
            </CardDescription>
          </CardHeader>

          <CardContent className="px-10 pb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {roles.map((role) => (
                <div
                  key={role.value}
                  onClick={() => handleRoleSelect(role.value)}
                  className={`p-6 bg-gradient-to-r ${role.bgGradient} border-2 ${role.borderColor} ${role.hoverBorder} rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group`}
                >
                  <div className="flex flex-col gap-4">
                    <div className={`p-4 bg-gradient-to-r ${role.gradient} rounded-xl w-fit text-white group-hover:scale-110 transition-transform shadow-lg`}>
                      {role.icon}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-xl mb-2">{role.label}</div>
                      <div className="text-sm text-gray-600 leading-relaxed">{role.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-base">
                <span className="px-6 bg-white text-gray-500 font-medium">Already have an account?</span>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 text-base font-semibold text-[#D76A84] hover:text-rose-600 transition-colors group"
              >
                Sign in to your account
                <span className="transform group-hover:translate-x-1 transition-transform text-xl">→</span>
              </Link>
            </div>
          </CardContent>

          <div className="h-2 bg-gradient-to-r from-[#D76A84] via-rose-500 to-pink-600"></div>
        </Card>
      </div>
    );
  }

  // Registration Form Screen
  const currentRole = roles.find(r => r.value === selectedRole);
  
  return (
    <div className="flex items-center justify-center min-h-screen py-8 px-4">
      <Card className="w-full max-w-4xl bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-rose-100 overflow-hidden">
        <div className="h-3 bg-gradient-to-r from-[#D76A84] via-rose-500 to-pink-600"></div>
        
        <CardHeader className="text-center pt-8 pb-6">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-r ${currentRole.gradient} rounded-3xl blur-xl opacity-30 animate-pulse`}></div>
              <div className={`relative bg-gradient-to-r ${currentRole.gradient} p-5 rounded-3xl shadow-xl text-white`}>
                {currentRole.icon}
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#D76A84] to-rose-600 bg-clip-text text-transparent mb-3">
            {currentRole.label} Registration
          </h1>
          
          <CardDescription className="text-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleBackToRoleSelection}
              className="mb-2 text-gray-600 hover:text-[#D76A84] text-base"
            >
              <FaArrowLeft className="mr-2" />
              Change Role
            </Button>
            <p className="text-gray-600 text-base">
              Complete your registration to get started
            </p>
          </CardDescription>
        </CardHeader>

        <CardContent className="px-10 pb-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Role-specific fields */}
            {getRoleSpecificFields()}

            {/* Name and Username Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-sm font-semibold text-gray-700">
                  First Name
                </Label>
                <Input
                  {...register("first_name")}
                  type="text"
                  id="first_name"
                  placeholder="First name"
                  className="h-12 border-gray-300 focus:border-[#D76A84] focus:ring-[#D76A84] rounded-xl"
                />
                {errors.first_name && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span className="font-medium">⚠</span> {errors.first_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-sm font-semibold text-gray-700">
                  Last Name
                </Label>
                <Input
                  {...register("last_name")}
                  type="text"
                  id="last_name"
                  placeholder="Last name"
                  className="h-12 border-gray-300 focus:border-[#D76A84] focus:ring-[#D76A84] rounded-xl"
                />
                {errors.last_name && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span className="font-medium">⚠</span> {errors.last_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold text-gray-700">
                  Username
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaIdCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    {...register("username")}
                    type="text"
                    id="username"
                    placeholder="Choose a username"
                    className="pl-10 h-12 border-gray-300 focus:border-[#D76A84] focus:ring-[#D76A84] rounded-xl"
                  />
                </div>
                {errors.username && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span className="font-medium">⚠</span> {errors.username.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email and Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    {...register("email")}
                    type="email"
                    id="email"
                    placeholder="your.email@example.com"
                    className="pl-10 h-12 border-gray-300 focus:border-[#D76A84] focus:ring-[#D76A84] rounded-xl"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span className="font-medium">⚠</span> {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    {...register("password")}
                    type={passwordVisible ? "text" : "password"}
                    id="password"
                    placeholder="Create a strong password"
                    className="pl-10 pr-12 h-12 border-gray-300 focus:border-[#D76A84] focus:ring-[#D76A84] rounded-xl"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer hover:scale-110 transition-transform"
                    onClick={togglePasswordVisibility}
                  >
                    {passwordVisible ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-[#D76A84]" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400 hover:text-[#D76A84]" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span className="font-medium">⚠</span> {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                Confirm Password
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  {...register("confirmPassword")}
                  type={confirmPasswordVisible ? "text" : "password"}
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  className="pl-10 pr-12 h-12 border-gray-300 focus:border-[#D76A84] focus:ring-[#D76A84] rounded-xl"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer hover:scale-110 transition-transform"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {confirmPasswordVisible ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-[#D76A84]" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400 hover:text-[#D76A84]" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span className="font-medium">⚠</span> {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Privacy Policy */}
            <div className="flex items-start gap-2 pt-2">
              <Controller
                name="privacy"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="privacy"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-1 border-gray-300 data-[state=checked]:bg-[#D76A84] data-[state=checked]:border-[#D76A84]"
                  />
                )}
              />
              <Label htmlFor="privacy" className="text-sm text-gray-700 cursor-pointer">
                I agree to the{" "}
                <span className="text-[#D76A84] hover:underline font-medium">privacy policy</span>
                {" "}and{" "}
                <span className="text-[#D76A84] hover:underline font-medium">terms of service</span>
              </Label>
            </div>
            {errors.privacy && (
              <p className="text-red-500 text-xs flex items-center gap-1">
                <span className="font-medium">⚠</span> {errors.privacy.message}
              </p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-gradient-to-r from-[#D76A84] to-rose-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                `Register as ${currentRole.label}`
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-base">
                <span className="px-6 bg-white text-gray-500 font-medium">Already have an account?</span>
              </div>
            </div>

            {/* Sign In Link */}
            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 text-base font-semibold text-[#D76A84] hover:text-rose-600 transition-colors group"
              >
                Sign in to your account
                <span className="transform group-hover:translate-x-1 transition-transform text-xl">→</span>
              </Link>
            </div>
          </form>
        </CardContent>

        <div className="h-2 bg-gradient-to-r from-[#D76A84] via-rose-500 to-pink-600"></div>
      </Card>
    </div>
  );
};

export default Register;