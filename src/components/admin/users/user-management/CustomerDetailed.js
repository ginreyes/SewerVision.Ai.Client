'use client';

import React from "react";
import {
  FaBuilding,
  FaPhone,
  FaMapMarkerAlt,
  FaIndustry,
  FaUsers,
  FaFileInvoice,
  FaUserTie,
  FaImage,
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
import { Badge } from "@/components/ui/badge";

const companySizeOptions = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501-1000", label: "501-1000 employees" },
  { value: "1000+", label: "1000+ employees" },
];

/**
 * Build the company logo URL from the stored value.
 * If it starts with "http" it's already an absolute URL (e.g. B2),
 * otherwise hit the backend streaming endpoint.
 */
const getCompanyLogoUrl = (user) => {
  if (!user?.company_logo) return null;
  if (user.company_logo.startsWith("http")) return user.company_logo;
  return `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/users/company-logo/${user._id}`;
};


const CustomerDetailed = ({ user, form, isEdit, setForm }) => {
  const logoUrl = getCompanyLogoUrl(user);

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

      <CardContent className="p-6 space-y-6">
        {/* Company Logo + Name Row */}
        <div className="flex items-start gap-5">
          {/* Logo */}
          <div className="shrink-0">
            <div className="w-20 h-20 rounded-xl border-2 border-emerald-100 bg-emerald-50/50 flex items-center justify-center overflow-hidden shadow-sm">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Company Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaImage className="w-8 h-8 text-emerald-300" />
              )}
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-1">Logo</p>
          </div>

          {/* Company Name + Industry */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-emerald-800 flex items-center gap-1.5">
                <FaBuilding className="w-3 h-3" /> Company Name
              </Label>
              <Input
                disabled={!isEdit}
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                className={!isEdit ? "bg-gray-50" : "bg-white"}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-emerald-800 flex items-center gap-1.5">
                <FaIndustry className="w-3 h-3" /> Industry
              </Label>
              <Input
                disabled={!isEdit}
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                className={!isEdit ? "bg-gray-50" : "bg-white"}
              />
            </div>
          </div>
        </div>

        {/* Contact & Location */}
        <div className="pt-4 border-t border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
              Contact & Location
            </Badge>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-gray-700 flex items-center gap-1.5">
                <FaPhone className="w-3 h-3 text-gray-400" /> Phone Number
              </Label>
              <Input
                disabled={!isEdit}
                value={form.phone_number}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                placeholder="e.g. +1 (555) 123-4567"
                className={!isEdit ? "bg-gray-50" : "bg-white"}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-700 flex items-center gap-1.5">
                <FaUsers className="w-3 h-3 text-gray-400" /> Company Size
              </Label>
              <Select
                disabled={!isEdit}
                value={form.company_size}
                onValueChange={(v) => setForm({ ...form, company_size: v })}
              >
                <SelectTrigger className={!isEdit ? "bg-gray-50" : "bg-white"}>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {companySizeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="text-gray-700 flex items-center gap-1.5">
                <FaMapMarkerAlt className="w-3 h-3 text-gray-400" /> Address
              </Label>
              <Textarea
                disabled={!isEdit}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={2}
                className={!isEdit ? "bg-gray-50" : "bg-white"}
              />
            </div>
          </div>
        </div>

        {/* Billing Details */}
        <div className="pt-4 border-t border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm">
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-medium">
              Billing Details
            </Badge>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-gray-700 flex items-center gap-1.5">
                <FaFileInvoice className="w-3 h-3 text-gray-400" /> Tax ID
              </Label>
              <Input
                disabled={!isEdit}
                value={form.tax_id}
                onChange={(e) => setForm({ ...form, tax_id: e.target.value })}
                placeholder="e.g. XX-XXXXXXX"
                className={!isEdit ? "bg-gray-50" : "bg-white"}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-700 flex items-center gap-1.5">
                <FaUserTie className="w-3 h-3 text-gray-400" /> Billing Contact
              </Label>
              <Input
                disabled={!isEdit}
                value={form.billing_contact}
                onChange={(e) => setForm({ ...form, billing_contact: e.target.value })}
                placeholder="e.g. billing@company.com"
                className={!isEdit ? "bg-gray-50" : "bg-white"}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerDetailed;
