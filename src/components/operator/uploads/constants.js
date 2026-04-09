import React from "react";
import { FileVideo, FileText, Archive, Image as ImageIcon, Database } from "lucide-react";

export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const getFileType = (file) => {
  if (file?.type?.startsWith?.("video/")) return "video";
  if (file?.type?.startsWith?.("image/")) return "image";
  if (file?.type?.includes?.("pdf") || file?.type?.includes?.("document")) return "document";
  if (file?.type?.includes?.("zip") || file?.type?.includes?.("rar")) return "archive";
  return "data";
};

export const getFileIcon = (type) => {
  switch (type) {
    case "video":
      return <FileVideo className="w-5 h-5 text-blue-500" />;
    case "image":
      return <ImageIcon className="w-5 h-5 text-pink-500" />;
    case "document":
      return <FileText className="w-5 h-5 text-green-500" />;
    case "archive":
      return <Archive className="w-5 h-5 text-purple-500" />;
    default:
      return <Database className="w-5 h-5 text-orange-500" />;
  }
};

export const FILE_TYPE_BADGE = {
  video: "bg-blue-100 text-blue-700",
  image: "bg-pink-100 text-pink-700",
  document: "bg-green-100 text-green-700",
  archive: "bg-purple-100 text-purple-700",
  data: "bg-orange-100 text-orange-700",
};

export const getFileTypeBadge = (type) => FILE_TYPE_BADGE[type] || "bg-gray-100 text-gray-700";
