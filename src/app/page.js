'use client'
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Login from "./login/page";
import { FaCamera, FaBrain, FaChartLine, FaShieldAlt, FaClock, FaUsers } from "react-icons/fa";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in and redirect them
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("role");
    
    if (token && role) {
      const knownRoles = ["admin", "user", "operator", "qc-technician", "customer"];
      if (knownRoles.includes(role.toLowerCase())) {
        router.push(`/${role}/dashboard`);
      }
    }
  }, [router]);
  const features = [
    {
      icon: <FaCamera className="h-8 w-8" />,
      title: "Advanced CCTV Inspection",
      description: "High-definition pipeline inspection with real-time monitoring"
    },
    {
      icon: <FaBrain className="h-8 w-8" />,
      title: "AI-Powered Analysis",
      description: "Automated defect detection with 95%+ accuracy"
    },
    {
      icon: <FaChartLine className="h-8 w-8" />,
      title: "Smart Analytics",
      description: "Comprehensive reports and data-driven insights"
    },
    {
      icon: <FaShieldAlt className="h-8 w-8" />,
      title: "Quality Control",
      description: "PACP compliant reporting and documentation"
    },
    {
      icon: <FaClock className="h-8 w-8" />,
      title: "Real-Time Monitoring",
      description: "Track inspections live with instant notifications"
    },
    {
      icon: <FaUsers className="h-8 w-8" />,
      title: "Team Collaboration",
      description: "Seamless workflow management for your team"
    }
  ];

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gray-100">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Animated Gradient Orbs with Rose/Pink theme */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-rose-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-0 right-20 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-6000"></div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Hero Content */}
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 py-12">
          {/* Logo/Brand */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-rose-100">
              <div className="p-2 bg-gradient-to-r from-[#D76A84] to-rose-500 rounded-full">
                <FaCamera className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#D76A84] to-rose-600 bg-clip-text text-transparent">
                SewerVision.ai
              </h1>
            </div>
          </div>

          {/* Hero Text */}
          <div className="max-w-2xl mb-12">
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Next-Gen Pipeline
              <span className="block bg-gradient-to-r from-[#D76A84] via-rose-500 to-pink-600 bg-clip-text text-transparent">
                Inspection Platform
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Transform your pipeline inspections with AI-powered defect detection, 
              real-time monitoring, and comprehensive analytics. Join the future of 
              infrastructure maintenance.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-rose-100 hover:shadow-xl transition-all duration-300">
                <div className="text-3xl font-bold bg-gradient-to-r from-[#D76A84] to-rose-600 bg-clip-text text-transparent">
                  95%+
                </div>
                <div className="text-sm text-gray-600 mt-1">Accuracy</div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-rose-100 hover:shadow-xl transition-all duration-300">
                <div className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
                  50%
                </div>
                <div className="text-sm text-gray-600 mt-1">Time Saved</div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-rose-100 hover:shadow-xl transition-all duration-300">
                <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
                  24/7
                </div>
                <div className="text-sm text-gray-600 mt-1">Monitoring</div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-rose-100 hover:bg-white/90 hover:shadow-lg hover:border-rose-200 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="p-2 bg-gradient-to-r from-[#D76A84] to-rose-500 rounded-lg w-fit text-white mb-3">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Login */}
        <div className="flex-shrink-0 lg:w-[500px] flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-md">
            <Login />
          </div>
        </div>
      </div>

      {/* Floating Elements with Rose theme */}
      <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-rose-400 rounded-full animate-ping opacity-20"></div>
      <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-pink-500 rounded-full animate-ping opacity-20 animation-delay-2000"></div>
      <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-red-400 rounded-full animate-ping opacity-20 animation-delay-4000"></div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animation-delay-6000 {
          animation-delay: 6s;
        }

        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, #80808012 1px, transparent 1px),
            linear-gradient(to bottom, #80808012 1px, transparent 1px);
          background-size: 24px 24px;
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}