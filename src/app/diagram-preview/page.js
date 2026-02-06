'use client'

import React from 'react'
import UserRoleHierarchy from '@/components/diagrams/UserRoleHierarchy'

const DiagramPreviewPage = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-6xl">
        <UserRoleHierarchy isZoomed={false} />
      </div>
    </div>
  )
}

export default DiagramPreviewPage
