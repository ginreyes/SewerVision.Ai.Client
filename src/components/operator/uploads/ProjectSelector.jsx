"use client";

import React from "react";
import { FolderOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * ProjectSelector — Step 1 card for the operator uploads page.
 *
 * @param {{
 *   projects: Array<{ _id: string, name: string, client?: string, location?: string }>,
 *   value: string,
 *   onChange: (id: string) => void,
 *   loading?: boolean,
 *   disabled?: boolean,
 * }} props
 */
export default function ProjectSelector({ projects, value, onChange, loading, disabled }) {
  const selected = projects.find((p) => p._id === value);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
            1
          </div>
          Select Project
        </CardTitle>
        <CardDescription>Choose which project these files belong to</CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={value} onValueChange={onChange} disabled={disabled || loading}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={loading ? "Loading projects..." : "Select a project"} />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project._id} value={project._id}>
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-3.5 h-3.5 text-gray-400" />
                  <span>{project.name}</span>
                  {project.client && (
                    <span className="text-[11px] text-gray-400">— {project.client}</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selected && (
          <div className="mt-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-3">
              <FolderOpen className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">{selected.name}</p>
                <p className="text-xs text-gray-500">
                  {selected.client && `Client: ${selected.client}`}
                  {selected.location && ` | Location: ${selected.location}`}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
