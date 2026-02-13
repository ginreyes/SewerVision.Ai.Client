'use client';

import React from "react";
import {
  FaBuilding,
  FaCrown,
} from "react-icons/fa";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

/**
 * Customer-specific detail panel on the admin user profile page.
 * Shows company profile and subscription details.
 */
const CustomerDetailed = ({ form, isEdit, setForm, accountTypeOptions }) => {
  return (
    <Card className="border-emerald-100 shadow-sm">
      <CardHeader className="border-b border-emerald-50 bg-emerald-50/30">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
            <FaBuilding />
          </div>
          <div>
            <CardTitle className="text-lg">Company Profile</CardTitle>
            <CardDescription>Business and billing details</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-2 md:col-span-1">
          <Label className="text-emerald-800">Company Name</Label>
          <Input
            disabled={!isEdit}
            value={form.company_name}
            onChange={(e) =>
              setForm({ ...form, company_name: e.target.value })
            }
          />
        </div>
        <div className="col-span-2 md:col-span-1">
          <Label className="text-emerald-800">Industry</Label>
          <Input
            disabled={!isEdit}
            value={form.industry}
            onChange={(e) =>
              setForm({ ...form, industry: e.target.value })
            }
          />
        </div>
        <div className="col-span-2">
          <Label className="text-emerald-800">Address</Label>
          <Textarea
            disabled={!isEdit}
            value={form.address}
            onChange={(e) =>
              setForm({ ...form, address: e.target.value })
            }
            rows={2}
          />
        </div>
        <div className="col-span-2 pt-4 border-t border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaCrown className="text-amber-500" /> Subscription Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Account Plan</Label>
              <Select
                disabled={!isEdit}
                value={form.account_type}
                onValueChange={(v) =>
                  setForm({ ...form, account_type: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accountTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tax ID</Label>
              <Input
                disabled={!isEdit}
                value={form.tax_id}
                onChange={(e) =>
                  setForm({ ...form, tax_id: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerDetailed;

