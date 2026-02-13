'use client'
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
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import Image from "next/image";
import { FaEye, FaEyeSlash, FaUser, FaLock, FaArrowRight } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAlert } from "@/components/providers/AlertProvider";
import { useUser } from "@/components/providers/UserContext"; 
import { api, setCookie, deleteCookie } from "@/lib/helper";

const LoginForm = ({ className }) => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [remember, setRemember] = useState(false);

    const router = useRouter();
    const { showAlert } = useAlert();
    const { refetchUser } = useUser(); 
    

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const togglePasswordVisibility = () => {
        setPasswordVisible((prevState) => !prevState);
    };

    const onSubmit = async (data) => {
        try {
            setLoading(true);

            const result = await api("/api/auth/login", "POST", {
                usernameOrEmail: data.usernameOrEmail,
                password: data.password,
            });

            console.log("API Response:", result);

            if (!result.ok) {
                const errorData = result.data?.error;

                if (errorData === "Wrong username or email") {
                    showAlert("Wrong username or email", "error");
                } else if (errorData === "Wrong password") {
                    showAlert("Wrong password", "error");
                } else if (errorData === "Username/Email and Password are required") {
                    showAlert("Please enter both username/email and password", "error");
                } else {
                    showAlert(errorData || "Login failed. Please try again.", "error");
                }

                return;
            }

            const responseData = result.data.data

            if (!responseData || !responseData.token || !responseData.role) {
                throw new Error("Invalid response from server");
            }

            const { token, role, username } = responseData;
            const normalizedRole = role.toLowerCase();

            // Handle "remember me" using cookies instead of localStorage
            if (remember) {
                setCookie("rememberedUsername", data.usernameOrEmail, { days: 7 });
            } else {
                deleteCookie("rememberedUsername");
            }

            // Store auth info in cookies (no localStorage)
            setCookie("authToken", token, { days: 1 });
            setCookie("username", username || data.usernameOrEmail, { days: 1 });
            setCookie("role", normalizedRole, { days: 1 });

            await refetchUser();

            showAlert("Login successful!", "success");

            // Redirect based on role
            const roleRoutes = {
                "admin": "/admin/dashboard",
                "operator": "/operator/dashboard",
                "qc-technician": "/qc-technician/dashboard",
                "customer": "/customer/dashboard",
                "user": "/user/dashboard",
            };

            if (roleRoutes[normalizedRole]) {
                router.push(roleRoutes[normalizedRole]);
            } else {
                showAlert(`Unknown role: ${normalizedRole}. Please contact support.`, "error");
                console.error("Unknown role received:", normalizedRole);
                router.push("/login");
            }
        } catch (e) {
            console.error("Login error:", e);

            let errorMessage = "An unexpected error occurred. Please try again.";

            if (e.message === "Invalid response from server") {
                errorMessage = "Server returned incomplete data. Please contact support.";
            } else if (e.message.includes("401")) {
                errorMessage = "Wrong username or email";
            } else if (e.message.includes("password")) {
                errorMessage = "Wrong password";
            }

            showAlert(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className={`w-full max-w-md bg-white border-0 shadow-xl rounded-2xl overflow-hidden ${className}`}>

            {/* Gradient Top Border */}
            <div className="h-1.5 bg-gradient-to-r from-rose-500 to-purple-600"></div>

            <CardHeader className="text-center pb-2 pt-8">
                <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
                <CardDescription className="text-gray-500">
                    Access your SewerVision portal
                </CardDescription>
            </CardHeader>

            <CardContent className="px-8 pb-8 pt-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                    {/* Username Input */}
                    <div className="space-y-2 group">
                        <Label htmlFor="usernameOrEmail" className="text-sm font-semibold text-gray-700">Username or Email</Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaUser className="h-4 w-4 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                            </div>
                            <Input
                                type="text"
                                id="usernameOrEmail"
                                placeholder="username@example.com"
                                className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-rose-500 focus:ring-rose-500/20 rounded-lg transition-all"
                                {...register("usernameOrEmail", { required: "Required" })}
                            />
                        </div>
                        {errors.usernameOrEmail && <p className="text-rose-500 text-xs mt-1">{errors.usernameOrEmail.message}</p>}
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2 group">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
                            <Link href="/forgotPassword" className="text-xs text-rose-600 hover:text-rose-700 font-medium">Forgot?</Link>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaLock className="h-4 w-4 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                            </div>
                            <Input
                                type={passwordVisible ? "text" : "password"}
                                id="password"
                                placeholder="••••••••"
                                className="pl-10 pr-10 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-rose-500 focus:ring-rose-500/20 rounded-lg transition-all"
                                {...register("password", { required: "Required" })}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-rose-600 transition-colors"
                                onClick={togglePasswordVisibility}
                            >
                                {passwordVisible ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center">
                        <Checkbox
                            id="remember"
                            checked={remember}
                            onCheckedChange={setRemember}
                            className="border-gray-300 data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500 w-4 h-4 rounded"
                        />
                        <Label htmlFor="remember" className="ml-2 text-xs text-gray-600 cursor-pointer select-none">Remember me</Label>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-bold rounded-lg shadow-md shadow-rose-500/20 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                <span className="text-sm">Signing In...</span>
                            </div>
                        ) : (
                            <span className="flex items-center gap-2 text-sm">Sign In <FaArrowRight className="w-3 h-3" /></span>
                        )}
                    </Button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                        <div className="relative flex justify-center text-xs"><span className="px-2 bg-white text-gray-400">or</span></div>
                    </div>

                    <div className="text-center">
                        <Link href="/register" className="text-sm text-gray-600 hover:text-rose-600 font-medium transition-colors">
                            Create an Account
                        </Link>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default LoginForm;
