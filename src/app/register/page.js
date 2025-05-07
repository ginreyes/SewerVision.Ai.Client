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
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller } from "react-hook-form";
import { z } from "zod";

// Zod schema for form validation
const formSchema = z.object({
  username: z
    .string()
    .min(2, "Username must be at least 2 characters.")
    .nonempty("Username is required."),
  email: z
    .string()
    .email("Invalid email address.")
    .nonempty("Email is required."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters.")
    .nonempty("Password is required."),
  confirmPassword: z
    .string()
    .min(6, "Confirm password must be at least 6 characters.")
    .nonempty("Confirmation password is required."),
  role: z.enum(["user", "admin"], { required_error: "Role is required." }),
});

const Register = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible((prev) => !prev);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      data.isRegister = true;
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error:", errorData.message);
        alert(errorData.message || "Registration failed");
        return;
      }

      const responseData = await response.json();
      console.log("Registration successful:", responseData);
      alert("Registration successful");
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-6 bg-white rounded-2xl shadow-lg">
        <CardHeader className="text-center text-xl font-bold mb-2 justify-center">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Logo" width={32} height={30} />
            <span>SewerVersion</span>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-6">
            <div className="font-bold text-black pb-2.5">
              Adventure starts here 🚀
            </div>
            Join SewerVision.ai and Transform Sewer Management!
          </CardDescription>
          <form onSubmit={handleSubmit(onSubmit)}>
            {["username", "email"].map((field) => (
              <div key={field} className="mb-4">
                <Label htmlFor={field}>
                  {field
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </Label>
                <Input
                  {...register(field)}
                  type="text"
                  id={field}
                  placeholder={`Enter your ${field}`}
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
                  placeholder={`Enter your ${field}`}
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
            <div className="mb-4">
              <Label htmlFor="role">Role</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => field.onChange(value)}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-full h-12">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <span className="text-red-500 text-sm">
                  {errors.role.message}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Checkbox id="privacy" {...register("privacy")} />
              <Label htmlFor="privacy" className="text-sm">
                I agree to the privacy policy & terms
              </Label>
            </div>
            <Button type="submit" className="w-full py-2 mb-4" variant="rose">
              Register
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
