'use client'
import React, { useState } from 'react'
import { FileCheck, Download, Eye, Calendar, Award, CheckCircle, Clock, AlertCircle, X, ExternalLink } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const CertificationsPage = () => {
  const [filter, setFilter] = useState('all')
  const [selectedCert, setSelectedCert] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Sample certification data
  const certifications = [
    {
      id: 1,
      name: 'ISO 9001:2015 Quality Management',
      issuer: 'International Organization for Standardization',
      issueDate: '2024-01-15',
      expiryDate: '2027-01-15',
      status: 'active',
      credentialId: 'ISO-QM-2024-001',
      category: 'Quality Management',
      description: 'This certification demonstrates proficiency in implementing and maintaining quality management systems according to ISO 9001:2015 standards.',
      skills: ['Quality Control', 'Process Management', 'Documentation', 'Audit Preparation'],
      verificationUrl: 'https://verify.iso.org/ISO-QM-2024-001'
    },
    {
      id: 2,
      name: 'Six Sigma Green Belt',
      issuer: 'American Society for Quality',
      issueDate: '2023-06-20',
      expiryDate: '2026-06-20',
      status: 'active',
      credentialId: 'SSGB-2023-456',
      category: 'Process Improvement',
      description: 'Certified in Six Sigma methodologies for process improvement and defect reduction in manufacturing and service processes.',
      skills: ['DMAIC', 'Statistical Analysis', 'Root Cause Analysis', 'Project Management'],
      verificationUrl: 'https://verify.asq.org/SSGB-2023-456'
    },
    {
      id: 3,
      name: 'Laboratory Safety Certification',
      issuer: 'National Safety Council',
      issueDate: '2024-03-10',
      expiryDate: '2025-03-10',
      status: 'expiring',
      credentialId: 'LSC-2024-789',
      category: 'Safety',
      description: 'Comprehensive certification covering laboratory safety protocols, hazardous material handling, and emergency response procedures.',
      skills: ['Chemical Safety', 'PPE Usage', 'Emergency Response', 'Hazard Communication'],
      verificationUrl: 'https://verify.nsc.org/LSC-2024-789'
    },
    {
      id: 4,
      name: 'Advanced Materials Testing',
      issuer: 'Institute of Quality Assurance',
      issueDate: '2022-11-05',
      expiryDate: '2024-11-05',
      status: 'expired',
      credentialId: 'AMT-2022-321',
      category: 'Technical Skills',
      description: 'Advanced certification in materials testing techniques including tensile testing, hardness testing, and spectroscopy.',
      skills: ['Tensile Testing', 'Hardness Testing', 'Spectroscopy', 'Data Analysis'],
      verificationUrl: 'https://verify.iqa.org/AMT-2022-321'
    },
    {
      id: 5,
      name: 'GMP Certification',
      issuer: 'FDA Training Institute',
      issueDate: '2024-02-28',
      expiryDate: '2027-02-28',
      status: 'active',
      credentialId: 'GMP-2024-654',
      category: 'Compliance',
      description: 'Good Manufacturing Practice certification for pharmaceutical and medical device quality control and compliance.',
      skills: ['GMP Compliance', 'Documentation', 'Quality Assurance', 'Regulatory Standards'],
      verificationUrl: 'https://verify.fda.gov/GMP-2024-654'
    }
  ]

  const getStatusVariant = (status) => {
    switch(status) {
      case 'active': return 'default'
      case 'expiring': return 'secondary'
      case 'expired': return 'destructive'
      default: return 'outline'
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return <CheckCircle className="w-3 h-3" />
      case 'expiring': return <Clock className="w-3 h-3" />
      case 'expired': return <AlertCircle className="w-3 h-3" />
      default: return null
    }
  }

  const handleViewCertificate = (cert) => {
    setSelectedCert(cert)
    setIsModalOpen(true)
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">My Certifications</h1>
          </div>
          <p className="text-gray-600">Manage and track your professional certifications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription>Total</CardDescription>
                  <CardTitle className="text-2xl">{stats.total}</CardTitle>
                </div>
                <FileCheck className="w-8 h-8 text-blue-500" />
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
            <Card key={cert.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Award className="w-6 h-6 text-blue-600" />
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
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Certificate Details</DialogTitle>
          </DialogHeader>

          {selectedCert && (
            <div className="space-y-6">
              {/* Certificate Badge */}
              <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                <Award className="w-20 h-20 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedCert.name}</h3>
                <p className="text-lg text-gray-700 mb-3">{selectedCert.issuer}</p>
                <Badge variant={getStatusVariant(selectedCert.status)} className="flex items-center gap-2 w-fit mx-auto">
                  {getStatusIcon(selectedCert.status)}
                  {selectedCert.status.charAt(0).toUpperCase() + selectedCert.status.slice(1)}
                </Badge>
              </div>

              {/* Certificate Information */}
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
                    className="text-blue-600 hover:text-blue-800 underline break-all flex items-center gap-1"
                  >
                    {selectedCert.verificationUrl}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
            <Button onClick={() => handleDownloadCertificate(selectedCert)}>
              <Download className="w-4 h-4 mr-2" />
              Download Certificate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CertificationsPage