'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAlert } from "@/components/providers/AlertProvider";
import Image from "next/image";
import { api } from "@/lib/helper";
import { FaArrowLeft, FaEnvelope, FaCheckCircle, FaPaperPlane } from "react-icons/fa";

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();
  const router = useRouter();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await api('/api/auth/forgot-password', 'POST', {
        email: data.email,
      });

      showAlert("Reset link sent to your email", "success");
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
              Account <br />
              <span className="text-rose-600">Recovery</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              No worries! Enter your email address and we'll send you a secure link to reset your password and regain access to your account.
            </p>

            <div className="space-y-4">
              {[
                "Secure Password Reset Process",
                "Email Verification Required",
                "Instant Link Delivery",
                "24/7 Support Available"
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

      {/* Right Side: Recovery Form */}
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
                <FaPaperPlane className="text-white w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Forgot Password?
              </h1>
              <CardDescription className="text-base text-gray-600">
                Enter your email to receive a password reset link
              </CardDescription>
            </CardHeader>

            <CardContent className="px-6 pb-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2 group">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400 group-focus-within:text-rose-500 transition-colors w-4 h-4" />
                    </div>
                    <Input
                      type="email"
                      id="email"
                      placeholder="your.email@example.com"
                      className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-rose-500 focus:ring-rose-500/20 rounded-xl transition-all"
                      {...register("email", { required: "Email is required" })}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-rose-500 text-xs mt-1 font-medium">
                      {errors.email.message}
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
                      <span>Sending Link...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <FaPaperPlane className="w-4 h-4" />
                      <span>Send Reset Link</span>
                    </div>
                  )}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">Remember your password?</span>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors group"
                  >
                    <FaArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                    Back to Login
                  </button>
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

export default ForgotPassword;