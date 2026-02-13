"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import {
    FaEye,
    FaEyeSlash,
    FaUserTag,
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

// Customer registration only (public signup)
const customerRegisterSchema = z.object({
    first_name: z.string().min(1, "First name is required."),
    last_name: z.string().min(1, "Last name is required."),
    username: z.string().min(2, "Username must be at least 2 characters."),
    email: z.string().email("Invalid email address."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string().min(6, "Confirmation password is required."),
    company_name: z.string().min(1, "Company name is required."),
    privacy: z.boolean().refine((val) => val === true, {
        message: "You must agree to the privacy policy & terms"
    }),
});

const RegisterForm = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const { showAlert } = useAlert();

    const togglePasswordVisibility = () => setPasswordVisible((prev) => !prev);
    const toggleConfirmPasswordVisibility = () => setConfirmPasswordVisible((prev) => !prev);

    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
    } = useForm({
        resolver: zodResolver(customerRegisterSchema),
    });

    const onSubmit = async (data) => {
        if (data.password !== data.confirmPassword) {
            showAlert("Passwords do not match!", "error");
            return;
        }
        try {
            setLoading(true);
            await api("/api/auth/register", "POST", { ...data, role: "customer", isRegister: true });
            showAlert("Registration successful!", "success");
            router.push("/");
        } catch (error) {
            console.error("Error during registration:", error);
            showAlert(error?.message || "Registration failed.", "error");
        } finally {
            setLoading(false);
        }
    };

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
                            Create Your <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-green-600">
                                Customer Account
                            </span>
                        </h1>
                        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                            Register to access reports, project updates, and your customer dashboard.
                        </p>

                        <div className="space-y-4">
                            {[
                                "Secure Account Protection",
                                "Access to Reports & Data",
                                "Personalized Dashboard",
                                "24/7 Support"
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
                                <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-2xl shadow-lg text-white">
                                    <FaUserTag className="h-6 w-6" />
                                </div>
                            </div>

                            <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                Customer Registration
                            </h1>

                            <CardDescription className="text-sm text-gray-600">
                                Create your account to access your dashboard and reports
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="px-6 pb-6">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                {/* Company Name (required for customer) */}
                                <div className="space-y-2">
                                    <Label htmlFor="company_name" className="text-sm font-semibold text-gray-700">
                                        Company Name
                                    </Label>
                                    <Input
                                        {...register("company_name")}
                                        type="text"
                                        id="company_name"
                                        placeholder="Your company name"
                                        className="h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all"
                                    />
                                    {errors.company_name && (
                                        <p className="text-red-500 text-xs mt-1 font-medium">
                                            {errors.company_name.message}
                                        </p>
                                    )}
                                </div>

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
                                        "Create Customer Account"
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