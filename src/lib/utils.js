import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

import {
  File,
  Database,
  Image as ImageIcon,
  FileVideo,
  Archive,

} from 'lucide-react'

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


export const getFileTypeIcon = (type) => {
  switch (type) {
    case 'video': return <FileVideo className="w-5 h-5 text-blue-600" />;
    case 'document': return <File className="w-5 h-5 text-green-600" />;
    case 'archive': return <Archive className="w-5 h-5 text-purple-600" />;
    case 'data': return <Database className="w-5 h-5 text-orange-600" />;
    case 'image': return <ImageIcon className="w-5 h-5 text-pink-600" />;
    default: return <File className="w-5 h-5 text-gray-600" />;
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'uploading':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'processing':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'queued':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}