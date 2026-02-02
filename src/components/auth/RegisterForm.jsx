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
    FaLock,
    FaEnvelope,
    FaIdCard,
    FaCheckCircle
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

const RegisterForm = () => {
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
            icon: <FaUserShield className="h-6 w-6" />,
            gradient: 'from-red-500 to-red-600',
            bgGradient: 'from-red-50 to-red-100',
            borderColor: 'border-red-200',
            hoverBorder: 'hover:border-red-400'
        },
        {
            value: 'user',
            label: 'User',
            description: 'Standard user with basic system access',
            icon: <FaUser className="h-6 w-6" />,
            gradient: 'from-blue-500 to-blue-600',
            bgGradient: 'from-blue-50 to-blue-100',
            borderColor: 'border-blue-200',
            hoverBorder: 'hover:border-blue-400'
        },
        {
            value: 'customer',
            label: 'Customer',
            description: 'Read-only access to reports and data',
            icon: <FaUserTag className="h-6 w-6" />,
            gradient: 'from-green-500 to-green-600',
            bgGradient: 'from-green-50 to-green-100',
            borderColor: 'border-green-200',
            hoverBorder: 'hover:border-green-400'
        },
        {
            value: 'qc-technician',
            label: 'QC Technician',
            description: 'Quality control and technical operations',
            icon: <FaCog className="h-6 w-6" />,
            gradient: 'from-purple-500 to-purple-600',
            bgGradient: 'from-purple-50 to-purple-100',
            borderColor: 'border-purple-200',
            hoverBorder: 'hover:border-purple-400'
        },
        {
            value: 'operator',
            label: 'Operator',
            description: 'Equipment operation and maintenance',
            icon: <FaTools className="h-6 w-6" />,
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
                        <div className={`p-4 bg-gradient-to-r ${currentRole.bgGradient} rounded-xl border ${currentRole.borderColor}`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 bg-gradient-to-r ${currentRole.gradient} rounded-lg text-white`}>
                                    {currentRole.icon}
                                </div>
                                <div>
                                    <span className="font-bold text-gray-900 text-base">{currentRole.label} Information</span>
                                    <p className="text-xs text-gray-600">Please provide your certification details</p>
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
                                    className="h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-purple-500 focus:ring-purple-500/20 rounded-xl transition-all"
                                />
                                {errors.certification && (
                                    <p className="text-red-500 text-xs mt-1 font-medium">
                                        {errors.certification.message}
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
                                    className="h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-purple-500 focus:ring-purple-500/20 rounded-xl transition-all"
                                />
                                {errors.license_number && (
                                    <p className="text-red-500 text-xs mt-1 font-medium">
                                        {errors.license_number.message}
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
                                className="h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-purple-500 focus:ring-purple-500/20 rounded-xl transition-all"
                            />
                            {errors.experience_years && (
                                <p className="text-red-500 text-xs mt-1 font-medium">
                                    {errors.experience_years.message}
                                </p>
                            )}
                        </div>
                    </div>
                );

            case "operator":
                return (
                    <div className="space-y-4 mb-6">
                        <div className={`p-4 bg-gradient-to-r ${currentRole.bgGradient} rounded-xl border ${currentRole.borderColor}`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 bg-gradient-to-r ${currentRole.gradient} rounded-lg text-white`}>
                                    {currentRole.icon}
                                </div>
                                <div>
                                    <span className="font-bold text-gray-900 text-base">{currentRole.label} Information</span>
                                    <p className="text-xs text-gray-600">Please provide your operational details</p>
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
                                    className="h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-orange-500 focus:ring-orange-500/20 rounded-xl transition-all"
                                />
                                {errors.certification && (
                                    <p className="text-red-500 text-xs mt-1 font-medium">
                                        {errors.certification.message}
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
                                            <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-orange-500 focus:ring-orange-500/20">
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
                                    <p className="text-red-500 text-xs mt-1 font-medium">
                                        {errors.shift_preference.message}
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
                                className="h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-orange-500 focus:ring-orange-500/20 rounded-xl transition-all"
                            />
                            {errors.equipment_experience && (
                                <p className="text-red-500 text-xs mt-1 font-medium">
                                    {errors.equipment_experience.message}
                                </p>
                            )}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    // Role Selection Screen
    if (!showForm) {
        return (
            <div className="min-h-screen flex bg-white font-sans">
                {/* Left Side: Brand & Feature Showcase (Hidden on Mobile) */}
                <div className="hidden lg:flex lg:w-1/2 relative bg-gray-50 flex-col justify-between p-12 overflow-hidden">
                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-rose-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-12">
                            <div className="bg-white p-2 rounded-xl shadow-md">
                                <Image src='/Logo.png' width={40} height={40} alt="Logo" className="object-contain" />
                            </div>
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-purple-600">
                                SewerVision.ai
                            </span>
                        </div>

                        <div className="max-w-md">
                            <h1 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                                Join Our <br />
                                <span className="text-rose-600">Innovation Team</span>
                            </h1>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                Be part of the future of pipeline inspection. Select your role and start making an impact with cutting-edge AI technology.
                            </p>

                            <div className="space-y-4">
                                {[
                                    "Role-Based Access Control",
                                    "Comprehensive Onboarding",
                                    "Collaborative Workspace",
                                    "Advanced Analytics Dashboard"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-white/60 backdrop-blur-sm p-3 rounded-lg border border-white shadow-sm">
                                        <FaCheckCircle className="text-green-500 w-5 h-5 flex-shrink-0" />
                                        <span className="text-gray-700 font-medium text-sm">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 text-sm text-gray-400">
                        © {new Date().getFullYear()} SewerVision AI. Trusted by industry leaders.
                    </div>
                </div>

                {/* Right Side: Role Selection */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12 relative bg-gray-50/30">
                    <div className="w-full max-w-lg">
                        {/* Mobile Logo */}
                        <div className="lg:hidden flex justify-center mb-8">
                            <Image src='/Logo.png' width={60} height={60} alt="Logo" />
                        </div>

                        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden">
                            <div className="h-1.5 bg-gradient-to-r from-rose-500 to-purple-600"></div>

                            <CardHeader className="text-center pt-8 pb-6 px-6">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    Choose Your Role
                                </h1>
                                <CardDescription className="text-base text-gray-600">
                                    Select the role that best describes your position
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="px-6 pb-8">
                                <div className="grid grid-cols-1 gap-3 mb-6">
                                    {roles.map((role) => (
                                        <div
                                            key={role.value}
                                            onClick={() => handleRoleSelect(role.value)}
                                            className={`p-4 bg-gradient-to-r ${role.bgGradient} border ${role.borderColor} ${role.hoverBorder} rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 bg-gradient-to-r ${role.gradient} rounded-lg text-white group-hover:scale-110 transition-transform shadow-md`}>
                                                    {role.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-bold text-gray-900 text-base mb-0.5">{role.label}</div>
                                                    <div className="text-xs text-gray-600 leading-relaxed">{role.description}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-white text-gray-500 font-medium">Already have an account?</span>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors group"
                                    >
                                        Sign in to your account
                                        <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                                    </Link>
                                </div>
                            </CardContent>

                            <div className="h-1.5 bg-gradient-to-r from-rose-500 to-purple-600"></div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    // Registration Form Screen
    const currentRole = roles.find(r => r.value === selectedRole);

    return (
        <div className="min-h-screen flex bg-white font-sans">
            {/* Left Side: Brand & Feature Showcase (Hidden on Mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gray-50 flex-col justify-between p-12 overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-rose-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="bg-white p-2 rounded-xl shadow-md">
                            <Image src='/Logo.png' width={40} height={40} alt="Logo" className="object-contain" />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-purple-600">
                            SewerVision.ai
                        </span>
                    </div>

                    <div className="max-w-md">
                        <h1 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                            Welcome <br />
                            <span className={`bg-clip-text text-transparent bg-gradient-to-r ${currentRole.gradient}`}>
                                {currentRole.label}
                            </span>
                        </h1>
                        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                            Complete your registration to access your personalized dashboard and start collaborating with your team.
                        </p>

                        <div className="space-y-4">
                            {[
                                "Secure Account Protection",
                                "Instant Team Access",
                                "Personalized Dashboard",
                                "24/7 Technical Support"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 bg-white/60 backdrop-blur-sm p-3 rounded-lg border border-white shadow-sm">
                                    <FaCheckCircle className="text-green-500 w-5 h-5 flex-shrink-0" />
                                    <span className="text-gray-700 font-medium text-sm">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-sm text-gray-400">
                    © {new Date().getFullYear()} SewerVision AI. Trusted by industry leaders.
                </div>
            </div>

            {/* Right Side: Registration Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12 relative bg-gray-50/30 overflow-y-auto">
                <div className="w-full max-w-lg">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-6">
                        <Image src='/Logo.png' width={60} height={60} alt="Logo" />
                    </div>

                    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden">
                        <div className="h-1.5 bg-gradient-to-r from-rose-500 to-purple-600"></div>

                        <CardHeader className="text-center pt-6 pb-4 px-6">
                            <div className="flex justify-center mb-3">
                                <div className={`bg-gradient-to-r ${currentRole.gradient} p-3 rounded-2xl shadow-lg text-white`}>
                                    {currentRole.icon}
                                </div>
                            </div>

                            <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                {currentRole.label} Registration
                            </h1>

                            <CardDescription className="text-sm">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleBackToRoleSelection}
                                    className="mb-1 text-gray-600 hover:text-rose-600 text-sm h-auto p-1"
                                >
                                    <FaArrowLeft className="mr-1.5 h-3 w-3" />
                                    Change Role
                                </Button>
                                <p className="text-gray-600">
                                    Complete your registration to get started
                                </p>
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="px-6 pb-6">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                {/* Role-specific fields */}
                                {getRoleSpecificFields()}

                                {/* Name Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="first_name" className="text-sm font-semibold text-gray-700">
                                            First Name
                                        </Label>
                                        <Input
                                            {...register("first_name")}
                                            type="text"
                                            id="first_name"
                                            placeholder="First name"
                                            className="h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-rose-500 focus:ring-rose-500/20 rounded-xl transition-all"
                                        />
                                        {errors.first_name && (
                                            <p className="text-red-500 text-xs mt-1 font-medium">
                                                {errors.first_name.message}
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
                                            className="h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-rose-500 focus:ring-rose-500/20 rounded-xl transition-all"
                                        />
                                        {errors.last_name && (
                                            <p className="text-red-500 text-xs mt-1 font-medium">
                                                {errors.last_name.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Username and Email */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2 group">
                                        <Label htmlFor="username" className="text-sm font-semibold text-gray-700">
                                            Username
                                        </Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaIdCard className="h-4 w-4 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                                            </div>
                                            <Input
                                                {...register("username")}
                                                type="text"
                                                id="username"
                                                placeholder="Choose a username"
                                                className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-rose-500 focus:ring-rose-500/20 rounded-xl transition-all"
                                            />
                                        </div>
                                        {errors.username && (
                                            <p className="text-red-500 text-xs mt-1 font-medium">
                                                {errors.username.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2 group">
                                        <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                                            Email
                                        </Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaEnvelope className="h-4 w-4 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                                            </div>
                                            <Input
                                                {...register("email")}
                                                type="email"
                                                id="email"
                                                placeholder="your.email@example.com"
                                                className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-rose-500 focus:ring-rose-500/20 rounded-xl transition-all"
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-red-500 text-xs mt-1 font-medium">
                                                {errors.email.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Passwords */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2 group">
                                        <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                                            Password
                                        </Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaLock className="h-4 w-4 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                                            </div>
                                            <Input
                                                {...register("password")}
                                                type={passwordVisible ? "text" : "password"}
                                                id="password"
                                                placeholder="••••••••"
                                                className="pl-10 pr-10 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-rose-500 focus:ring-rose-500/20 rounded-xl transition-all"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-rose-600 transition-colors"
                                                onClick={togglePasswordVisibility}
                                            >
                                                {passwordVisible ? (
                                                    <FaEyeSlash className="h-4 w-4" />
                                                ) : (
                                                    <FaEye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="text-red-500 text-xs mt-1 font-medium">
                                                {errors.password.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2 group">
                                        <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                                            Confirm Password
                                        </Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaLock className="h-4 w-4 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                                            </div>
                                            <Input
                                                {...register("confirmPassword")}
                                                type={confirmPasswordVisible ? "text" : "password"}
                                                id="confirmPassword"
                                                placeholder="••••••••"
                                                className="pl-10 pr-10 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-rose-500 focus:ring-rose-500/20 rounded-xl transition-all"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-rose-600 transition-colors"
                                                onClick={toggleConfirmPasswordVisibility}
                                            >
                                                {confirmPasswordVisible ? (
                                                    <FaEyeSlash className="h-4 w-4" />
                                                ) : (
                                                    <FaEye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && (
                                            <p className="text-red-500 text-xs mt-1 font-medium">
                                                {errors.confirmPassword.message}
                                            </p>
                                        )}
                                    </div>
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
                                                className="mt-0.5 border-gray-300 data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600"
                                            />
                                        )}
                                    />
                                    <Label htmlFor="privacy" className="text-xs text-gray-700 cursor-pointer leading-relaxed">
                                        I agree to the{" "}
                                        <span className="text-rose-600 hover:underline font-medium">privacy policy</span>
                                        {" "}and{" "}
                                        <span className="text-rose-600 hover:underline font-medium">terms of service</span>
                                    </Label>
                                </div>
                                {errors.privacy && (
                                    <p className="text-red-500 text-xs font-medium">
                                        {errors.privacy.message}
                                    </p>
                                )}

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                            <span>Creating Account...</span>
                                        </div>
                                    ) : (
                                        `Register as ${currentRole.label}`
                                    )}
                                </Button>

                                {/* Divider */}
                                <div className="relative my-5">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-white text-gray-500 font-medium">Already have an account?</span>
                                    </div>
                                </div>

                                {/* Sign In Link */}
                                <div className="text-center">
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors group"
                                    >
                                        Sign in to your account
                                        <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                                    </Link>
                                </div>
                            </form>
                        </CardContent>

                        <div className="h-1.5 bg-gradient-to-r from-rose-500 to-purple-600"></div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;