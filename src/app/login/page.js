'use client'
import { useState, useEffect } from "react";
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
import { FaEye, FaEyeSlash, FaUser, FaLock, FaCamera } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAlert } from "@/components/providers/AlertProvider";
import { api } from "@/lib/helper";

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [usernameOrEmail, setUsernameOrEmail] = useState("");

  const router = useRouter();
  const { showAlert } = useAlert();

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

      const { token, role } = responseData;

      remember
        ? localStorage.setItem("rememberedUsername", data.usernameOrEmail)
        : localStorage.removeItem("rememberedUsername");

      const normalizedRole = role.toLowerCase();

      localStorage.setItem("authToken", token);
      localStorage.setItem("username", data.usernameOrEmail);
      localStorage.setItem("role", normalizedRole);

      showAlert("Login successful!", "success");

      if (normalizedRole === "admin") {
        router.push("/admin/dashboard");
      } else if (normalizedRole === "user") {
        router.push("/users/dashboard");
      } else if (normalizedRole === "operator") {
        router.push("/operator/dashboard");
      } else if (normalizedRole === "qc-technician") {
        router.push("/qc-technician/dashboard");
      } else if (normalizedRole === "customer") {
        router.push("/customer/dashboard");
      } else {
        showAlert(`Unknown role: ${normalizedRole}`, "warning");
        router.push("/");
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

  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("authToken");

    // Only redirect if we have a valid token AND a known role
    const knownRoles = ["admin", "user", "operator", "qc-technician", "customer"];

    if (token && role && knownRoles.includes(role)) {
      router.push(`/${role}/dashboard`);
    }
  }, [router]);

  useEffect(() => {
    const savedUsername = localStorage.getItem("rememberedUsername");
    if (savedUsername) {
      setUsernameOrEmail(savedUsername);
      setRemember(true);
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen py-8 px-4 bg-gray-50">
      <Card className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-rose-100">
        {/* Gradient Header */}
        <div className="h-2 bg-gradient-to-r from-[#D76A84] via-rose-500 to-pink-600"></div>

        <CardHeader className="text-center pt-8 pb-4">
          {/* Logo Section */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#D76A84] to-rose-500 rounded-2xl blur-lg opacity-30 animate-pulse"></div>
              <Image
                src='/Logo.png'
                width={45}
                height={45}
                alt="SewerVision Logo"
                className="relative z-10"
              />
            </div>
          </div>

          {/* Brand Name */}
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#D76A84] to-rose-600 bg-clip-text text-transparent mb-2">
            SewerVision
          </h1>

          {/* Welcome Message */}
          <CardDescription className="text-center">
            <div className="font-bold text-gray-900 text-lg mb-1">
              Welcome Back! 👋
            </div>
            <p className="text-gray-600 text-sm">
              Access your account and let the adventure begin!
            </p>
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username/Email Field */}
            <div className="space-y-2">
              <Label htmlFor="usernameOrEmail" className="text-sm font-semibold text-gray-700">
                Username or Email
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  id="usernameOrEmail"
                  placeholder="Enter your email or username"
                  className="pl-10 h-12 border-gray-300 focus:border-[#D76A84] focus:ring-[#D76A84] rounded-xl transition-all duration-200"
                  {...register("usernameOrEmail", {
                    required: "Username or Email is required",
                  })}
                />
              </div>
              {errors.usernameOrEmail && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span className="font-medium">⚠</span> {errors.usernameOrEmail.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Password
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type={passwordVisible ? "text" : "password"}
                  id="password"
                  placeholder="Enter your password"
                  className="pl-10 pr-12 h-12 border-gray-300 focus:border-[#D76A84] focus:ring-[#D76A84] rounded-xl transition-all duration-200"
                  {...register("password", {
                    required: "Password is required",
                  })}
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(checked) => setRemember(checked)}
                  className="border-gray-300 data-[state=checked]:bg-[#D76A84] data-[state=checked]:border-[#D76A84]"
                />
                <Label
                  htmlFor="remember"
                  className="text-sm text-gray-700 cursor-pointer hover:text-[#D76A84] transition-colors"
                >
                  Remember me
                </Label>
              </div>
              <Link
                href="/forgotPassword"
                className="text-sm text-[#D76A84] hover:text-rose-600 font-medium hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-[#D76A84] to-rose-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">New to our platform?</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-[#D76A84] hover:text-rose-600 transition-colors group"
              >
                Create an account
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </form>
        </CardContent>

        {/* Bottom Gradient Line */}
        <div className="h-1 bg-gradient-to-r from-[#D76A84] via-rose-500 to-pink-600"></div>
      </Card>
    </div>
  );
};

export default Login;