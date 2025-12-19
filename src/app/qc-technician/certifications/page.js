'use client'

import React, { useState, useEffect } from 'react'
import { FileCheck, Download, Eye, Calendar, Award, CheckCircle, Clock, AlertCircle, X, ExternalLink, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUser } from '@/components/providers/UserContext'
import { api } from '@/lib/helper'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const CertificationsPage = () => {
  const [filter, setFilter] = useState('all')
  const [selectedCert, setSelectedCert] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [certifications, setCertifications] = useState([])
  const [loading, setLoading] = useState(false)

  // Form state for new certification
  const [formData, setFormData] = useState({
    name: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    description: '',
    category: '',
    skills: '',
    verificationUrl: '',
    status: 'active' // default
  })

  const { userId } = useUser()

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const { data, ok } = await api(`/api/qc-technicians/get-certifications/${userId}`)
        if (ok && data?.data) {
          setCertifications(data.data)
        }
      } catch (err) {
        console.error('Error fetching certifications:', err.message)
      }
    }

    if (userId) fetchCerts()
  }, [userId])

  const getStatusVariant = (status) => {
    switch (status) {
      case 'active': return 'default'
      case 'expiring': return 'secondary'
      case 'expired': return 'destructive'
      default: return 'outline'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-3 h-3" />
      case 'expiring': return <Clock className="w-3 h-3" />
      case 'expired': return <AlertCircle className="w-3 h-3" />
      default: return null
    }
  }

  const handleViewCertificate = (cert) => {
    setSelectedCert(cert)
    setIsViewModalOpen(true)
  }

  const handleDownloadCertificate = (cert) => {
    const certificateContent = `
CERTIFICATE OF COMPLETION

${cert.name}

This certifies that the holder has successfully completed the requirements for:
${cert.name}

Issued by: ${cert.issuer}
Issue Date: ${new Date(cert.issueDate).toLocaleDateString()}
Expiry Date: ${new Date(cert.expiryDate).toLocaleDateString()}
Credential ID: ${cert.credentialId}
Status: ${cert.status.toUpperCase()}

Description:
${cert.description}

Skills Covered:
${cert.skills.join(', ')}

Verification URL: ${cert.verificationUrl}
    `.trim()

    const blob = new Blob([certificateContent], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${cert.name.replace(/[^a-z0-9]/gi, '_')}_${cert.credentialId}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
  
    const skills = formData.skills
      ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
      : []
  
    const payload = {
      ...formData,
      skills,
    }
  
    try {
      const { ok, data } = await api(
        `/api/qc-technicians/create-certificate/${userId}`,
        'POST',
        payload
      )
  
      if (ok) {

        const { data: certData } = await api(`/api/qc-tecget-certifications/${userId}`)
        setCertifications(certData.data || [])
        setIsAddModalOpen(false)
        setFormData({
          name: '',
          issuer: '',
          issueDate: '',
          expiryDate: '',
          credentialId: '',
          description: '',
          category: '',
          skills: '',
          verificationUrl: '',
          status: 'active'
        })
      } 
      else {
        console.error('Failed to add certification:', data)
        alert('Failed to add certification. Please try again.')
      }
    } catch (err) {
      console.error('Submission error:', err)
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredCertifications = certifications.filter(cert => {
    if (filter === 'all') return true
    return cert.status === filter
  })

  const stats = {
    total: certifications.length,
    active: certifications.filter(c => c.status === 'active').length,
    expiring: certifications.filter(c => c.status === 'expiring').length,
    expired: certifications.filter(c => c.status === 'expired').length
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <Award className="w-8 h-8 text-rose-600" />
            <h1 className="text-3xl font-bold text-gray-900">My Certifications</h1>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Certification
          </Button>
        </div>

        <p className="text-gray-600 mb-6">Manage and track your professional certifications</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription>Total</CardDescription>
                  <CardTitle className="text-2xl">{stats.total}</CardTitle>
                </div>
                <FileCheck className="w-8 h-8 text-rose-500" />
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription>Active</CardDescription>
                  <CardTitle className="text-2xl text-green-600">{stats.active}</CardTitle>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription>Expiring Soon</CardDescription>
                  <CardTitle className="text-2xl text-yellow-600">{stats.expiring}</CardTitle>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription>Expired</CardDescription>
                  <CardTitle className="text-2xl text-red-600">{stats.expired}</CardTitle>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Filter Tabs */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Tabs value={filter} onValueChange={setFilter} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Certifications</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
                <TabsTrigger value="expired">Expired</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Certifications List */}
        <div className="space-y-4">
          {filteredCertifications.map(cert => (
            <Card key={cert._id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-rose-50 rounded-lg">
                        <Award className="w-6 h-6 text-rose-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{cert.name}</h3>
                        <p className="text-sm text-gray-600">{cert.issuer}</p>
                      </div>
                      <Badge variant={getStatusVariant(cert.status)} className="flex items-center gap-1.5">
                        {getStatusIcon(cert.status)}
                        {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Expires: {new Date(cert.expiryDate).toLocaleDateString()}</span>
                      </div>
                      <div className="text-gray-600">
                        <span className="font-medium">ID:</span> {cert.credentialId}
                      </div>
                    </div>

                    <div>
                      <Badge variant="outline">{cert.category}</Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleViewCertificate(cert)}
                      title="View Certificate"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDownloadCertificate(cert)}
                      title="Download Certificate"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCertifications.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <CardTitle className="mb-2">No certifications found</CardTitle>
              <CardDescription>No certifications match the selected filter.</CardDescription>
            </CardContent>
          </Card>
        )}
      </div>

      {/* View Certificate Dialog */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Certificate Details</DialogTitle>
          </DialogHeader>

          {selectedCert && (
            <div className="space-y-6">
              <div className="text-center p-8 bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg border-2 border-rose-200">
                <Award className="w-20 h-20 text-rose-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedCert.name}</h3>
                <p className="text-lg text-gray-700 mb-3">{selectedCert.issuer}</p>
                <Badge variant={getStatusVariant(selectedCert.status)} className="flex items-center gap-2 w-fit mx-auto">
                  {getStatusIcon(selectedCert.status)}
                  {selectedCert.status.charAt(0).toUpperCase() + selectedCert.status.slice(1)}
                </Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Description</h4>
                  <p className="text-gray-700">{selectedCert.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Issue Date</h4>
                    <p className="text-gray-900 font-medium">{new Date(selectedCert.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Expiry Date</h4>
                    <p className="text-gray-900 font-medium">{new Date(selectedCert.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Credential ID</h4>
                  <p className="text-gray-900 font-mono font-medium">{selectedCert.credentialId}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Category</h4>
                  <Badge variant="secondary">{selectedCert.category}</Badge>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Skills Covered</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCert.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Verification</h4>
                  <a
                    href={selectedCert.verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rose-600 hover:text-rose-800 underline break-all flex items-center gap-1"
                  >
                    {selectedCert.verificationUrl}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
            <Button onClick={() => handleDownloadCertificate(selectedCert)}>
              <Download className="w-4 h-4 mr-2" />
              Download Certificate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Certification Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Certification</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Certification Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="issuer">Issuer *</Label>
                <Input
                  id="issuer"
                  name="issuer"
                  value={formData.issuer}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issueDate">Issue Date *</Label>
                <Input
                  id="issueDate"
                  name="issueDate"
                  type="date"
                  value={formData.issueDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  name="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="credentialId">Credential ID</Label>
              <Input
                id="credentialId"
                name="credentialId"
                value={formData.credentialId}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                name="skills"
                placeholder="e.g. React, Leadership, SEO"
                value={formData.skills}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="verificationUrl">Verification URL</Label>
              <Input
                id="verificationUrl"
                name="verificationUrl"
                type="url"
                value={formData.verificationUrl}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expiring">Expiring Soon</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Certification'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CertificationsPage