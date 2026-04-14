"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserCheck, Users, UserPlus, UserMinus, UserCog, Shield, ShieldCheck, ShieldX, Clock, Timer, TrendingUp } from "lucide-react";
import { FaUserClock } from "react-icons/fa";
import { api } from "@/lib/helper";

const SkeletonCard = () => (
  <Card className="border border-gray-100 shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-4">
      <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
      <div className="p-2 bg-gray-100 rounded-lg">
        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
      </div>
    </CardHeader>
    <CardContent className="pb-4">
      <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
      <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
    </CardContent>
  </Card>
);

const CardList = ({ activeTab = "users", auditStats = {}, permissionStats = {}, attendanceStats = {} }) => {
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);
  const prevTab = useRef(activeTab);

  // Fetch user stats on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { ok, data } = await api("/api/users/get-all-user?page=1&limit=1", "GET");
        if (!ok) return;

        if (data.stats) {
          setUserStats({
            total: data.stats.total,
            active: data.stats.active,
            pending: data.stats.pending,
          });
        } else {
          const users = Array.isArray(data.users) ? data.users : [];
          const active = users.filter(user => user.status === "Active").length;
          const pending = users.filter(user => user.status === "Inactive" || user.status === "Pending").length;
          setUserStats({
            total: data.pagination?.total || users.length,
            active,
            pending,
          });
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Trigger skeleton on tab change
  useEffect(() => {
    if (prevTab.current !== activeTab) {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 400);
      prevTab.current = activeTab;
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  const userCards = [
    {
      label: "Active Users",
      value: userStats.active,
      icon: <UserCheck className="text-green-600 w-6 h-6" />,
      color: "text-green-600",
      description: "Users currently marked as active.",
    },
    {
      label: "Total Users",
      value: userStats.total,
      icon: <Users className="text-blue-600 w-6 h-6" />,
      color: "text-blue-600",
      description: "All registered users in the system.",
    },
    {
      label: "Pending Users",
      value: userStats.pending,
      icon: <FaUserClock className="text-yellow-600 w-6 h-6" />,
      color: "text-yellow-600",
      description: "Users awaiting activation.",
    },
  ];

  const auditCards = [
    {
      label: "Created",
      value: auditStats.created || 0,
      icon: <UserPlus className="text-emerald-600 w-6 h-6" />,
      color: "text-emerald-600",
      description: "User accounts created.",
    },
    {
      label: "Updated",
      value: auditStats.updated || 0,
      icon: <UserCog className="text-blue-600 w-6 h-6" />,
      color: "text-blue-600",
      description: "User profiles modified.",
    },
    {
      label: "Deleted",
      value: auditStats.deleted || 0,
      icon: <UserMinus className="text-red-600 w-6 h-6" />,
      color: "text-red-600",
      description: "User accounts removed.",
    },
  ];

  const permissionCards = [
    {
      label: "Total Levels",
      value: permissionStats.total || 0,
      icon: <Shield className="text-rose-600 w-6 h-6" />,
      color: "text-rose-600",
      description: "Permission levels created.",
    },
    {
      label: "Assigned Users",
      value: permissionStats.assigned || 0,
      icon: <ShieldCheck className="text-emerald-600 w-6 h-6" />,
      color: "text-emerald-600",
      description: "Users with assigned levels.",
    },
    {
      label: "Default Access",
      value: permissionStats.unassigned || 0,
      icon: <ShieldX className="text-amber-600 w-6 h-6" />,
      color: "text-amber-600",
      description: "Users with full default access.",
    },
  ];

  const attendanceCards = [
    {
      label: "Clocked In Today",
      value: attendanceStats.todayCount || 0,
      icon: <Clock className="text-emerald-600 w-6 h-6" />,
      color: "text-emerald-600",
      description: "Employees clocked in today.",
    },
    {
      label: "Total Hours",
      value: `${attendanceStats.totalHours || 0}h`,
      icon: <Timer className="text-blue-600 w-6 h-6" />,
      color: "text-blue-600",
      description: "Total hours logged this period.",
    },
    {
      label: "Avg Hours/Entry",
      value: `${attendanceStats.avgHours || 0}h`,
      icon: <TrendingUp className="text-rose-600 w-6 h-6" />,
      color: "text-rose-600",
      description: "Average hours per time entry.",
    },
  ];

  const stats = activeTab === "attendance" ? attendanceCards : activeTab === "permissions" ? permissionCards : activeTab === "audit" ? auditCards : userCards;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
      {stats.map((stat, idx) => (
        <Card key={`${activeTab}-${idx}`} className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-4">
            <CardTitle className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{stat.label}</CardTitle>
            <div className="p-2 bg-gray-50 rounded-lg">
              {stat.icon}
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className={`text-3xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CardList;
