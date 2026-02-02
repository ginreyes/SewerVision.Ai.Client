'use client'
import LoginForm from "@/components/auth/LoginForm";
import Link from "next/link";
import Image from "next/image";
import { FaCheckCircle } from "react-icons/fa";

const Login = () => {
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
              Next-Gen <br />
              <span className="text-rose-600">Pipeline Inspection</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Transform your inspections with AI-powered defect detection, real-time monitoring, and comprehensive analytics.
              Join the future of infrastructure maintenance.
            </p>

            <div className="space-y-4">
              {[
                "AI-Powered Defect Detection (95%+ Accuracy)",
                "Real-time Monitoring & Alerts",
                "PACP Compliant Reporting",
                "Seamless Team Collaboration"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/60 backdrop-blur-sm p-3 rounded-lg border border-white shadow-sm w-fit">
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

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12 relative bg-gray-50/30">
        <div className="w-full max-w-md">
          {/* Mobile Logo (Visible only on small screens) */}
          <div className="lg:hidden flex justify-center mb-8">
            <Image src='/Logo.png' width={60} height={60} alt="Logo" />
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;