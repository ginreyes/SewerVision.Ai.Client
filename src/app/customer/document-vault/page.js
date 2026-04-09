"use client";

import React, { useState, useMemo } from "react";
import {
  Archive, FileText, Download, Search, Filter, FolderOpen,
  File, Image, Clock, ChevronRight, Plus, Shield, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/components/providers/UserContext";
import { useCustomerDocuments, useTrackDocumentDownload } from "@/hooks/useQueryHooks";
import { GridSkeleton } from '@/components/shared/SkeletonLoading';

const FILE_TYPES = {
  pdf: { icon: FileText, color: "text-red-500", bg: "bg-red-50", label: "PDF" },
  report: { icon: FileText, color: "text-blue-500", bg: "bg-blue-50", label: "Report" },
  contract: { icon: File, color: "text-purple-500", bg: "bg-purple-50", label: "Contract" },
  image: { icon: Image, color: "text-emerald-500", bg: "bg-emerald-50", label: "Image" },
  invoice: { icon: FileText, color: "text-amber-500", bg: "bg-amber-50", label: "Invoice" },
  permit: { icon: FileText, color: "text-teal-500", bg: "bg-teal-50", label: "Permit" },
  other: { icon: File, color: "text-gray-500", bg: "bg-gray-50", label: "Other" },
};

function formatSize(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function DocumentVault() {
  const { userId } = useUser();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filters = useMemo(() => ({ type: typeFilter, search }), [typeFilter, search]);
  const { data: response, isLoading } = useCustomerDocuments(userId, filters);
  const trackDownload = useTrackDocumentDownload();

  const documents = response?.data || [];
  const storageUsed = response?.storageUsed || 0;
  const totalDocs = response?.total || 0;

  function handleDownload(doc) {
    trackDownload.mutate(doc._id);
    if (doc.fileUrl) {
      window.open(doc.fileUrl, "_blank");
    }
  }

  if (isLoading) return (<GridSkeleton count={6} />)
  return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Document Vault</h1>
            <p className="text-sm text-gray-500">All your contracts, reports, permits, and invoices in one place</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          <span>{totalDocs} files · {formatSize(storageUsed)} used</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search documents…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        {["all", ...Object.keys(FILE_TYPES)].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border capitalize transition-colors ${typeFilter === t ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Document grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {documents.map(doc => {
          const typeConfig = FILE_TYPES[doc.type] || FILE_TYPES.other;
          const Icon = typeConfig.icon;
          return (
            <Card key={doc._id} className="border-gray-200 hover:border-emerald-200 hover:shadow-sm transition-all">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeConfig.bg}`}>
                  <Icon className={`w-5 h-5 ${typeConfig.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{doc.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-[10px] bg-gray-50">{doc.project || "General"}</Badge>
                    <span className="text-[10px] text-gray-400">{formatSize(doc.size)}</span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />{new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button onClick={() => handleDownload(doc)}
                  className="p-2 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors shrink-0">
                  <Download className="w-4 h-4" />
                </button>
              </CardContent>
            </Card>
          );
        })}
        {documents.length === 0 && (
          <div className="col-span-2 flex flex-col items-center justify-center py-16 text-gray-400">
            <Archive className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">No documents found</p>
          </div>
        )}
      </div>
    </div>
  );
}
