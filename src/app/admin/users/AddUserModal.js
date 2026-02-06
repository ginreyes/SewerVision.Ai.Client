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
  const [isSubmitting, setIsSubmitting] = useState(false)
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
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: ShieldCheck
    },
    {
      value: 'customer',
      label: 'Customer',
      description: 'Client account with project viewing access',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      icon: Building2
    },
    {
      value: 'qc-technician',
      label: 'QC Technician',
      description: 'Quality control, inspections and technical reports',
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-200',
      icon: Wrench
    },
    {
      value: 'operator',
      label: 'Operator',
      description: 'Equipment operation, field work and maintenance',
      color: 'text-orange-600',
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

    // Validate required fields
    if (!formData.username || !formData.email || !formData.first_name || !formData.last_name || !formData.role) {
      showAlert("Please fill in all required fields", "warning")
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      showAlert("Please enter a valid email address", "warning")
      return
    }

    // Validate role-specific required fields
    if (formData.role === 'qc-technician') {
      if (!formData.certification || !formData.license_number || !formData.experience_years) {
        showAlert("Please fill in all QC Technician required fields", "warning")
        return
      }
    } else if (formData.role === 'operator') {
      if (!formData.certification || !formData.shift_preference || !formData.equipment_experience) {
        showAlert("Please fill in all Operator required fields", "warning")
        return
      }
    } else if (formData.role === 'customer') {
      if (!formData.company_name || !formData.industry || !formData.phone_number || !formData.address) {
        showAlert("Please fill in all Customer required fields", "warning")
        return
      }
    }

    setIsSubmitting(true)

    try {
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        role: formData.role,
      }

      // Add role-specific fields based on role
      if (formData.role === 'qc-technician') {
        payload.certification = formData.certification.trim()
        payload.license_number = formData.license_number.trim()
        payload.experience_years = parseInt(formData.experience_years) || 0
      } else if (formData.role === 'operator') {
        payload.certification = formData.certification.trim()
        payload.shift_preference = formData.shift_preference
        payload.equipment_experience = formData.equipment_experience.trim()
      } else if (formData.role === 'customer') {
        payload.company_name = formData.company_name.trim()
        payload.industry = formData.industry.trim()
        payload.phone_number = formData.phone_number.trim()
        payload.address = formData.address.trim()
        payload.account_type = formData.account_type
        if (formData.company_size) payload.company_size = formData.company_size
        if (formData.tax_id) payload.tax_id = formData.tax_id.trim()
        if (formData.billing_contact) payload.billing_contact = formData.billing_contact.trim()
      }

      console.log('Creating user with payload:', payload)

      const { ok, data } = await api("/api/users/create-user", "POST", payload)

      if (!ok) {
        throw new Error(data?.message || data?.error || "Failed to create user")
      }

      // Success!
      resetAndClose()
      showAlert("✅ User created successfully! Account credentials sent via email.", "success")
      
      // Refresh user list
      if (fetchUser) {
        await fetchUser()
      }
    } catch (error) {
      console.error('User creation error:', error)
      const errorMessage = error.message || error.toString() || "An unexpected error occurred"
      showAlert(`❌ User creation failed: ${errorMessage}`, "error")
    } finally {
      setIsSubmitting(false)
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
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto p-0 border border-gray-200 shadow-xl bg-white">
        <DialogHeader className="px-6 py-5 border-b border-gray-200 bg-white sticky top-0 z-10">
          <DialogTitle className="text-xl font-bold flex items-center gap-3">
            {step === 1 ? (
              <>
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-rose-600" />
                </div>
                <span>Create New User</span>
              </>
            ) : (
              <div className="flex items-center gap-3 w-full">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="rounded-lg hover:bg-gray-100"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedRole?.bgColor}`}>
                    {selectedRole && <selectedRole.icon className={`w-5 h-5 ${selectedRole.color}`} />}
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
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Select a user role to continue with registration</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    className={`
                      relative group text-left rounded-xl border-2 p-6 transition-all duration-200
                      hover:border-rose-300 hover:shadow-md
                      ${role.bgColor} ${role.borderColor}
                      focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2
                    `}
                    onClick={() => handleRoleSelect(role.value)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center`}>
                        <role.icon className={`w-6 h-6 ${role.color}`} />
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-rose-600" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 mb-2 text-lg">{role.label}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{role.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Step 2: User Details Form
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Progress Indicator */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center font-semibold">1</div>
                  <span className="text-gray-400">Select Role</span>
                </div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center font-semibold">2</div>
                  <span className="font-semibold text-gray-900">User Details</span>
                </div>
              </div>

              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                  <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-rose-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Basic Information</h3>
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

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Account Creation Notice</p>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      A temporary password will be automatically generated and sent to the user's email address. 
                      The user will be prompted to change their password upon first login.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetAndClose} 
                  className="px-6"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="px-6 bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Account
                    </>
                  )}
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