"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getUserName } from "../constants";

export default function TicketRow({ ticket, onClick }) {
  const customer = ticket.customerId;
  const name = getUserName(customer);

  return (
    <div
      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
          ticket.priority === "high" ? "bg-red-500" :
          ticket.priority === "medium" ? "bg-amber-500" : "bg-green-500"
        }`} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{ticket.subject}</p>
          <p className="text-xs text-gray-500">{name}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge
          variant="outline"
          className={`text-[10px] ${
            ticket.status === "open"
              ? "bg-amber-100 text-amber-700 border-amber-200"
              : "bg-blue-100 text-blue-700 border-blue-200"
          }`}
        >
          {ticket.status}
        </Badge>
        <ArrowUpRight className="w-3.5 h-3.5 text-gray-400" />
      </div>
    </div>
  );
}
