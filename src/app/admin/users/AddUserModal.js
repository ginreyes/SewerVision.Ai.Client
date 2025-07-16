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

const AddUserModal = ({fetchUser}) => {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1) // 1: Role Selection, 2: User Details
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    role: "",
    // Role-specific fields
    certification: "",
    license_number: "",
    experience_years: "",
    shift_preference: "",
    equipment_experience: "",
  })
  const { showAlert } = useAlert()

  const roles = [
    { 
      value: 'admin', 
      label: 'Admin', 
      description: 'Full system access and management',
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: '⚡'
    },
    { 
      value: 'user', 
      label: 'User', 
      description: 'Standard user with basic access',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: '👤'
    },
    { 
      value: 'viewer', 
      label: 'Viewer', 
      description: 'Read-only access to reports',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: '👁️'
    },
    { 
      value: 'Qc-Technician', 
      label: 'QC Technician', 
      description: 'Quality control and technical operations',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: '🔧'
    },
    { 
      value: 'Operator', 
      label: 'Operator', 
      description: 'Equipment operation and maintenance',
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: '⚙️'
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
      // Reset role-specific fields when role changes
      certification: "",
      license_number: "",
      experience_years: "",
      shift_preference: "",
      equipment_experience: "",
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

      // Add role-specific fields only if they exist and are not empty
      if (formData.role === 'Qc-Technician') {
        if (formData.certification) payload.certification = formData.certification
        if (formData.license_number) payload.license_number = formData.license_number
        if (formData.experience_years) payload.experience_years = formData.experience_years
      } else if (formData.role === 'Operator') {
        if (formData.certification) payload.certification = formData.certification
        if (formData.shift_preference) payload.shift_preference = formData.shift_preference
        if (formData.equipment_experience) payload.equipment_experience = formData.equipment_experience
      }

      await api("/api/users/create-user", "POST", payload)

      // Reset form and close modal
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
      })
      setStep(1)
      setOpen(false)
      showAlert("User created successfully! Account is pending activation.", "success")
      fetchUser()
    } catch (error) {
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
    })
    setStep(1)
    setOpen(false)
  }

  const selectedRole = roles.find(r => r.value === formData.role)

  const getRoleSpecificFields = () => {
    switch (formData.role) {
      case "Qc-Technician":
        return (
          <Card className="border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🔧</span>
                <div>
                  <h4 className="font-semibold text-purple-700">QC Technician Details</h4>
                  <p className="text-sm text-gray-600">Please provide certification information</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="certification">Certification *</Label>
                  <Input
                    name="certification"
                    value={formData.certification}
                    onChange={handleChange}
                    required
                    placeholder="Enter certification name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="license_number">License Number *</Label>
                  <Input
                    name="license_number"
                    value={formData.license_number}
                    onChange={handleChange}
                    required
                    placeholder="Enter license number"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="experience_years">Years of Experience *</Label>
                  <Input
                    name="experience_years"
                    type="number"
                    min="0"
                    value={formData.experience_years}
                    onChange={handleChange}
                    required
                    placeholder="Enter years of experience"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case "Operator":
        return (
          <Card className="border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">⚙️</span>
                <div>
                  <h4 className="font-semibold text-orange-700">Operator Details</h4>
                  <p className="text-sm text-gray-600">Please provide operational information</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="certification">Certification *</Label>
                  <Input
                    name="certification"
                    value={formData.certification}
                    onChange={handleChange}
                    required
                    placeholder="Enter certification name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="shift_preference">Shift Preference *</Label>
                  <Select 
                    value={formData.shift_preference} 
                    onValueChange={(value) => handleSelectChange('shift_preference', value)}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select preferred shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">🌅 Day Shift</SelectItem>
                      <SelectItem value="night">🌙 Night Shift</SelectItem>
                      <SelectItem value="rotating">🔄 Rotating Shift</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="equipment_experience">Equipment Experience *</Label>
                  <Input
                    name="equipment_experience"
                    value={formData.equipment_experience}
                    onChange={handleChange}
                    required
                    placeholder="Describe equipment experience"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="rose" className="gap-2">
          <span>+</span> Add New User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            {step === 1 ? (
              <>
                <span>👥</span> Create New User
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBack}
                  className="mr-2 p-1"
                >
                  ←
                </Button>
                <span>{selectedRole?.icon}</span> {selectedRole?.label} Registration
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          // Step 1: Role Selection
          <div className="space-y-4 py-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Choose User Role</h3>
              <p className="text-sm text-gray-600">Select the appropriate role for the new user</p>
            </div>
            
            <div className="grid gap-3">
              {roles.map((role) => (
                <Card
                  key={role.value}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 border-2 hover:border-gray-300"
                  onClick={() => handleRoleSelect(role.value)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{role.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{role.label}</h4>
                          <Badge variant="outline" className={role.color}>
                            {role.value}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{role.description}</p>
                      </div>
                      <div className="text-gray-400">→</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          // Step 2: User Details Form
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            {/* Role Badge */}
            <div className="flex items-center justify-center">
              <Badge className={`${selectedRole?.color} px-4 py-2 text-sm`}>
                {selectedRole?.icon} {selectedRole?.label}
              </Badge>
            </div>

            {/* Role-specific fields first */}
            {getRoleSpecificFields()}

            {getRoleSpecificFields() && <Separator />}

            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>📝</span> Basic Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    placeholder="Enter first name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    placeholder="Enter last name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="Enter username"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter email address"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <DialogFooter className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={resetAndClose}>
                Cancel
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={handleBack}>
                  ← Back
                </Button>
                <Button type="submit" variant="rose">
                  Create User
                </Button>
              </div>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default AddUserModal