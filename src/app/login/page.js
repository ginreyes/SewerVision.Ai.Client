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
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Loading from "@/components/ui/loading";
import { useAlert } from "@/components/providers/AlertProvider";
import { api } from "@/lib/helper";

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [usernameOrEmail, setUsernameOrEmail] = useState("");

  const router = useRouter();
  const {showAlert} = useAlert();

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
  
      remember
        ? localStorage.setItem("rememberedUsername", data.usernameOrEmail)
        : localStorage.removeItem("rememberedUsername");
  
      localStorage.setItem("authToken", result.token);
      localStorage.setItem("username", data.usernameOrEmail);
  
      const role = result.role || "viewer";
      console.log('role',role)
  
      showAlert("Login successful!", "success");
  

      switch (role) {
        case "admin":
          router.push("/admin/dashboard");
          break;
        case "user":
          router.push("/users/dashboard");
          break;
        case "viewer":
        default:
          router.push("/viewer/dashboard");
          break;
      }
    } catch (e) {
      showAlert(`Login error: ${e.message}`, "error");
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      router.push("/admin/dashboard");
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
    <div className="relative flex items-center justify-center min-h-screen bg-gray-100">
      {/* Alert at the top */}
     

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
              Welcome to SewerVision! 👋
            </div>
            Access your account and let the adventure begin!
          </CardDescription>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <Label htmlFor="usernameOrEmail">Username or Email</Label>
              <Input
                type="text"
                id="usernameOrEmail"
                placeholder="Enter your email or username"
                size="xl"
                className="w-full mt-1 border rounded"
                {...register("usernameOrEmail", {
                  required: "Username or Email is required",
                })}
              />
              {errors.usernameOrEmail && (
                <p className="text-red-500 text-sm">{errors.usernameOrEmail.message}</p>
              )}
            </div>
            <div className="mb-4 relative">
              <Label htmlFor="password">Password</Label>
              <Input
                type={passwordVisible ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                size="xl"
                className="w-full mt-1 border rounded"
                {...register("password", {
                  required: "Password is required",
                })}
              />
              <div
                className="absolute right-3 top-8 cursor-pointer text-gray-500"
                onClick={togglePasswordVisibility}
              >
                {passwordVisible ? (
                  <FaEyeSlash size={20} className="text-gray-500" />
                ) : (
                  <FaEye size={20} className="text-gray-500" />
                )}
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message}</p>
              )}
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(checked) => setRemember(checked)}
                 />
                <Label htmlFor="remember" className="text-sm">
                  Remember me
                </Label>
              </div>
              <Link href="/forgotPassword" className="text- hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button
              type="submit"
              className="w-full py-2 mb-4 relative flex items-center justify-center"
              variant="rose"
            >
              Login
            </Button>

            <div className="text-center text-sm">
              New on our platform?{" "}
              <span>
                <Link
                  href="/register"
                  className="text-[#D76A84] hover:text-[#D76A84] hover:underline"
                >
                  Create an account
                </Link>
              </span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
