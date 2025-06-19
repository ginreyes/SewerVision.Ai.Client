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
    <div className="relative flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-6 bg-white rounded-2xl shadow-lg">
        <CardHeader className="text-center text-xl font-bold mb-2 justify-center">
          <div className="flex items-center gap-2 justify-center">
            <Image src="/logo.png" alt="Logo" width={32} height={30} />
            <span>SewerVersion</span>
          </div>
        </CardHeader>

        <CardContent>
          <CardDescription className="mb-6">
            <div className="font-bold text-black pb-2.5">
              Forgot Password? 🔒
            </div>
            Your new password must be different from previously used passwords
          </CardDescription>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4 space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                type="email"
                id="email"
                placeholder="Enter your email"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="mt-6">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
                variant="rose"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </div>

            {/* Text-style link button */}
            <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-lg transition hover:underline"
              style={{ color: "#d76b84" }}
            >
              &lt; Back to login
            </button>

            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
