"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useAlert } from "@/components/providers/AlertProvider"
import { api } from "@/lib/helper"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Building2,
  UserPlus,
  ShieldCheck,
  Wrench,
  ArrowLeft,
  CheckCircle2,
  User,
  Mail,
  UserCircle
} from "lucide-react"

const AddUserModal = ({ fetchUser }) => {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    role: "",
    // QC Technician & Operator fields
    certification: "",
    license_number: "",
    experience_years: "",
    shift_preference: "",
    equipment_experience: "",
    // Customer fields
    company_name: "",
    industry: "",
    phone_number: "",
    address: "",
    account_type: "standard",
    company_size: "",
    tax_id: "",
    billing_contact: "",
  })
  const { showAlert } = useAlert()

  const roles = [
    {
      value: 'admin',
      label: 'Admin',
      description: 'Full system access and management capabilities',
      color: 'from-red-500 to-rose-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: ShieldCheck
    },
    {
      value: 'customer',
      label: 'Customer',
      description: 'Client account with project viewing access',
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      icon: Building2
    },
    {
      value: 'qc-technician',
      label: 'QC Technician',
      description: 'Quality control, inspections and technical reports',
      color: 'from-violet-500 to-purple-600',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-200',
      icon: Wrench
    },
    {
      value: 'operator',
      label: 'Operator',
      description: 'Equipment operation, field work and maintenance',
      color: 'from-orange-500 to-amber-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      icon: UserPlus
    },
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({
      ...prev,
      role: role,
      // Reset all role-specific fields
      certification: "",
      license_number: "",
      experience_years: "",
      shift_preference: "",
      equipment_experience: "",
      company_name: "",
      industry: "",
      phone_number: "",
      address: "",
      account_type: "standard",
      company_size: "",
      tax_id: "",
      billing_contact: "",
    }))
    setStep(2)
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleBack = () => {
    setStep(1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
      }

      // Add role-specific fields based on role
      if (formData.role === 'qc-technician') {
        payload.certification = formData.certification
        payload.license_number = formData.license_number
        payload.experience_years = formData.experience_years
      } else if (formData.role === 'operator') {
        payload.certification = formData.certification
        payload.shift_preference = formData.shift_preference
        payload.equipment_experience = formData.equipment_experience
      } else if (formData.role === 'customer') {
        payload.company_name = formData.company_name
        payload.industry = formData.industry
        payload.phone_number = formData.phone_number
        payload.address = formData.address
        payload.account_type = formData.account_type
        payload.company_size = formData.company_size
        payload.tax_id = formData.tax_id
        payload.billing_contact = formData.billing_contact
      }

      const { ok, data } = await api("/api/users/create-user", "POST", payload)

      if (!ok) {
        throw new Error(data?.message || "Failed to create user")
      }

      // Reset form
      resetAndClose()
      showAlert("User created successfully! Account credentials sent via email.", "success")
      fetchUser()
    } catch (error) {
      console.error(error)
      showAlert(`User creation failed: ${error.message}`, "error")
    }
  }

  const resetAndClose = () => {
    setFormData({
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      role: "",
      certification: "",
      license_number: "",
      experience_years: "",
      shift_preference: "",
      equipment_experience: "",
      company_name: "",
      industry: "",
      phone_number: "",
      address: "",
      account_type: "standard",
      company_size: "",
      tax_id: "",
      billing_contact: "",
    })
    setStep(1)
    setOpen(false)
  }

  const selectedRole = roles.find(r => r.value === formData.role)

  const getRoleSpecificFields = () => {
    switch (formData.role) {
      case "qc-technician":
        return (
          <div className="bg-violet-50/50 p-4 rounded-xl border border-violet-100 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="w-5 h-5 text-violet-600" />
              <h4 className="font-semibold text-violet-900">Professional Qualifications</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="certification" className="text-violet-900">Certification *</Label>
                <Input
                  name="certification"
                  value={formData.certification}
                  onChange={handleChange}
                  required
                  placeholder="e.g., ACI Level II"
                  className="mt-1 bg-white"
                />
              </div>
              <div>
                <Label htmlFor="license_number" className="text-violet-900">License Number *</Label>
                <Input
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleChange}
                  required
                  placeholder="Enter license #"
                  className="mt-1 bg-white"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="experience_years" className="text-violet-900">Years of Experience *</Label>
                <Input
                  name="experience_years"
                  type="number"
                  min="0"
                  value={formData.experience_years}
                  onChange={handleChange}
                  required
                  placeholder="Total years"
                  className="mt-1 bg-white"
                />
              </div>
            </div>
          </div>
        )

      case "operator":
        return (
          <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <UserPlus className="w-5 h-5 text-orange-600" />
              <h4 className="font-semibold text-orange-900">Operational Details</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="certification" className="text-orange-900">Certification *</Label>
                <Input
                  name="certification"
                  value={formData.certification}
                  onChange={handleChange}
                  required
                  placeholder="Operator License"
                  className="mt-1 bg-white"
                />
              </div>
              <div>
                <Label htmlFor="shift_preference" className="text-orange-900">Shift Preference *</Label>
                <Select
                  value={formData.shift_preference}
                  onValueChange={(value) => handleSelectChange('shift_preference', value)}
                  required
                >
                  <SelectTrigger className="w-full mt-1 bg-white">
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">🌅 Day Shift</SelectItem>
                    <SelectItem value="night">🌙 Night Shift</SelectItem>
                    <SelectItem value="rotating">🔄 Rotating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="equipment_experience" className="text-orange-900">Equipment Experience *</Label>
                <Textarea
                  name="equipment_experience"
                  value={formData.equipment_experience}
                  onChange={handleChange}
                  required
                  placeholder="List equipment details..."
                  className="mt-1 bg-white"
                  rows={2}
                />
              </div>
            </div>
          </div>
        )

      case "customer":
        return (
          <div className="space-y-4">
            {/* Company Information */}
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <h4 className="font-semibold text-emerald-900">Company Profile</h4>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="company_name" className="text-emerald-900">Company Name *</Label>
                  <Input
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                    placeholder="Organization name"
                    className="mt-1 bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="industry" className="text-emerald-900">Industry *</Label>
                    <Input
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      required
                      placeholder="Type of industry"
                      className="mt-1 bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_size" className="text-emerald-900">Employees</Label>
                    <Select
                      value={formData.company_size}
                      onValueChange={(value) => handleSelectChange('company_size', value)}
                    >
                      <SelectTrigger className="mt-1 bg-white">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10</SelectItem>
                        <SelectItem value="11-50">11-50</SelectItem>
                        <SelectItem value="51-200">51-200</SelectItem>
                        <SelectItem value="200+">200+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone_number" className="text-emerald-900">Phone *</Label>
                    <Input
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      required
                      placeholder="+123..."
                      className="mt-1 bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tax_id" className="text-emerald-900">Tax ID</Label>
                    <Input
                      name="tax_id"
                      value={formData.tax_id}
                      onChange={handleChange}
                      placeholder="Optional"
                      className="mt-1 bg-white"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address" className="text-emerald-900">Full Address *</Label>
                  <Textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    placeholder="HQ address"
                    className="mt-1 bg-white"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <UserCircle className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-900">Account Subscription</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="account_type" className="text-blue-900">Plan Type</Label>
                  <Select
                    value={formData.account_type}
                    onValueChange={(value) => handleSelectChange('account_type', value)}
                  >
                    <SelectTrigger className="mt-1 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">🌟 Trial</SelectItem>
                      <SelectItem value="standard">💼 Standard</SelectItem>
                      <SelectItem value="premium">👑 Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="billing_contact" className="text-blue-900">Billing Email</Label>
                  <Input
                    name="billing_contact"
                    type="email"
                    value={formData.billing_contact}
                    onChange={handleChange}
                    placeholder="Optional"
                    className="mt-1 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="rose" className="gap-2 shadow-sm">
          <UserPlus className="w-4 h-4" /> Add New User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
        <DialogHeader className="p-6 pb-2 border-b bg-white sticky top-0 z-10">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {step === 1 ? (
              <>
                <div className="p-2 bg-rose-100 rounded-lg">
                  <UserPlus className="w-6 h-6 text-rose-600" />
                </div>
                Create New User
              </>
            ) : (
              <div className="flex items-center gap-3 w-full">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="rounded-full hover:bg-gray-100 -ml-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md ${selectedRole?.bgColor}`}>
                    {selectedRole && <selectedRole.icon className={`w-5 h-5 ${selectedRole.color.split(' ')[1] || 'text-gray-600'}`} />}
                  </div>
                  <span>{selectedRole?.label} Registration</span>
                </div>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          {step === 1 ? (
            // Step 1: Role Selection
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles.map((role) => (
                  <div
                    key={role.value}
                    className={`
                    relative group cursor-pointer rounded-xl border-2 p-5 transition-all duration-300
                    hover:border-rose-200 hover:shadow-lg hover:-translate-y-1
                    ${role.bgColor} ${role.borderColor}
                  `}
                    onClick={() => handleRoleSelect(role.value)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-3 rounded-xl bg-white shadow-sm ring-1 ring-black/5`}>
                        <role.icon className={`w-6 h-6 bg-gradient-to-br ${role.color} bg-clip-text text-transparent`} />
                      </div>
                      {/* Hover indicator */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <CheckCircle2 className="w-6 h-6 text-rose-500" />
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{role.label}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{role.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Step 2: User Details Form
            <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-right-4 duration-300">

              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <User className="w-5 h-5 text-rose-500" />
                  <h3 className="font-bold text-gray-900">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      placeholder="John"
                      className="focus-visible:ring-rose-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      placeholder="Doe"
                      className="focus-visible:ring-rose-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        placeholder="jdoe123"
                        className="pl-9 focus-visible:ring-rose-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="john@example.com"
                        className="pl-9 focus-visible:ring-rose-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Role Specific Fields */}
              {getRoleSpecificFields()}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={resetAndClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="rose" // Using your custom rose variant
                  className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-md transition-all hover:scale-[1.02]"
                >
                  Create Account
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AddUserModal