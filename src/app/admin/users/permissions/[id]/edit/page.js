"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { permissionLevelApi } from "@/data/permissionLevelApi";
import PermissionLevelForm from "@/components/admin/users/permissions/PermissionLevelForm";

export default function EditPermissionLevelPage() {
  const params = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await permissionLevelApi.getById(params.id);
        if (res?.ok) setData(res.data);
      } catch (e) {
        console.error("Failed to fetch permission level:", e);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetch();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Permission level not found</p>
      </div>
    );
  }

  return <PermissionLevelForm mode="edit" initialData={data} />;
}
