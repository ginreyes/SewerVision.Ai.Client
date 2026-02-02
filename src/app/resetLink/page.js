'use client';

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAlert } from "@/components/providers/AlertProvider";
import Image from "next/image";
import { api } from "@/lib/helper";
import { FaEye, FaEyeSlash, FaLock, FaCheckCircle, FaShieldAlt } from "react-icons/fa";

const ResetForm = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const { showAlert } = useAlert();
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get('token');

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      showAlert("Passwords do not match", "error");
      return;
    }

    if (!token) {
      showAlert("Invalid or missing reset token. Please request a new link.", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await api('/api/auth/reset-password', 'POST', {
        token: token,
        newPassword: data.password,
      });

      if (!result.ok) {
        throw new Error(result.data?.error || "Failed to reset password");
      }

      showAlert("Password reset successfully! Redirecting...", "success");
      setTimeout(() => router.push('/login'), 2000);
    }
    catch (err) {
      showAlert(err.message || "Something went wrong", "error");
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
              Secure Your <br />
              <span className="text-rose-600">Account</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Create a strong, unique password to protect your account. Choose a combination that's secure yet memorable for you.
            </p>

            <div className="space-y-4">
              {[
                "Minimum 6 Characters Required",
                "Encrypted & Secure Storage",
                "Instant Account Access",
                "Password Strength Validation"
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

      {/* Right Side: Reset Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12 relative bg-gray-50/30">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Image src='/Logo.png' width={60} height={60} alt="Logo" />
          </div>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-rose-500 to-purple-600"></div>

            <CardHeader className="text-center pt-8 pb-4 px-6">
              <div className="mx-auto mb-4 bg-gradient-to-r from-rose-500 to-purple-600 p-4 rounded-2xl shadow-lg w-fit">
                <FaShieldAlt className="text-white w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Reset Password
              </h1>
              <CardDescription className="text-base text-gray-600">
                Create a strong password to secure your account
              </CardDescription>
            </CardHeader>

            <CardContent className="px-6 pb-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* New Password */}
                <div className="space-y-2 group">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    New Password
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400 group-focus-within:text-rose-500 transition-colors w-4 h-4" />
                    </div>
                    <Input
                      type={passwordVisible ? "text" : "password"}
                      id="password"
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-rose-500 focus:ring-rose-500/20 rounded-xl transition-all"
                      {...register("password", {
                        required: "Password is required",
                        minLength: { value: 6, message: "Must be at least 6 characters" }
                      })}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-rose-600 transition-colors"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                    >
                      {passwordVisible ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-rose-500 text-xs mt-1 font-medium">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2 group">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400 group-focus-within:text-rose-500 transition-colors w-4 h-4" />
                    </div>
                    <Input
                      type={confirmPasswordVisible ? "text" : "password"}
                      id="confirmPassword"
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-rose-500 focus:ring-rose-500/20 rounded-xl transition-all"
                      {...register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (val) => {
                          if (watch('password') != val) {
                            return "Passwords do not match";
                          }
                        }
                      })}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-rose-600 transition-colors"
                      onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                    >
                      {confirmPasswordVisible ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-rose-500 text-xs mt-1 font-medium">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                      <span>Resetting Password...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <FaShieldAlt className="w-4 h-4" />
                      <span>Reset Password</span>
                    </div>
                  )}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">Password requirements</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Your password must be at least 6 characters long and should include a mix of letters and numbers for better security.
                  </p>
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

const ResetLink = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center justify-center bg-white/50 backdrop-blur-md rounded-2xl p-8 shadow-xl">
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 font-semibold text-gray-700">Loading...</span>
        </div>
      </div>
    }>
      <ResetForm />
    </Suspense>
  );
}

export default ResetLink;