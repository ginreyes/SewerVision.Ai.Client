"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserCheck, Users } from "lucide-react";
import { FaUserClock } from "react-icons/fa";
import { api } from "@/lib/helper";

const CardList = () => {
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
  });

  const [userList,setUserList] = useState([])

  const fetchUsers = async () => {
    try {
      const { ok, data } = await api("/api/users/get-all-user", "GET");
  
      if (!ok || !Array.isArray(data.users)) {
        console.error("Invalid response format", data);
        return;
      }
  
      const users = data.users; 
  
      setUserList(users);
  
      const active = users.filter(user => user.status === "Active").length;
      const pending = users.filter(user => user.status === "Inactive" || user.status === "Pending").length;
  
      setUserStats({
        total: users.length,
        active,
        pending,
      });
  
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };
  

  useEffect(() => {
    fetchUsers();
  }, []);

  const stats = [
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

  return (
    <div className="p-4 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, idx) => (
        <Card key={idx} className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CardList;
