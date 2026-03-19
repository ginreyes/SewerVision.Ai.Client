"use client";

import React from "react";
import { ClipboardList } from "lucide-react";
import EmptySewerComponent from "@/components/shared/EmptySewerComponent";

const CustomerRepTasks = () => {
  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-6 py-6 ">
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-md">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Tasks</h1>
            <p className="text-sm text-gray-500">Follow-up tasks from support tickets</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 shadow-sm py-16 bg-gray-50">
          <EmptySewerComponent
            variant="no-projects"
            title="No tasks yet"
            subtitle="Tasks created from tickets will appear here"
            size="md"
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerRepTasks;