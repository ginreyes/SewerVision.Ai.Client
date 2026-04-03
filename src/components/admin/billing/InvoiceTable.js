"use client";

import React from "react";
import { Building, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { INVOICE_STATUS_COLORS } from "../constants";

export default function InvoiceTable({ invoices }) {
  return (
    <Card className="border-gray-200">
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {["Invoice", "Customer", "Tier", "Amount", "Issue Date", "Due Date", "Status", ""].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                <td className="px-4 py-3 text-xs font-mono font-medium text-gray-900">{inv.id}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="text-xs font-medium text-gray-900">{inv.customer}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="text-[10px] border-rose-200 bg-rose-50 text-rose-700">{inv.tier}</Badge>
                </td>
                <td className="px-4 py-3 text-xs font-bold text-gray-900">${inv.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{inv.date}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{inv.due}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={`text-[10px] capitalize ${INVOICE_STATUS_COLORS[inv.status] || ""}`}>{inv.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-rose-600 transition-colors">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
