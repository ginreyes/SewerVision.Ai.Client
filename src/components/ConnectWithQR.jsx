'use client'

import React, { useMemo } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Smartphone } from 'lucide-react'

/**
 * Shows a QR code that opens Concertina on the same URL (e.g. on your phone).
 * Set NEXT_PUBLIC_APP_URL in .env to your PC's IP (e.g. http://192.168.100.12:3000)
 * so when you open the app on PC, the QR encodes that URL for scanning.
 */
export default function ConnectWithQR() {
  const appUrl = useMemo(() => {
    if (typeof window !== 'undefined') {
      return process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    }
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }, [])

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
        <Smartphone className="w-4 h-4 text-indigo-600" />
        Connect with your phone
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Scan with your phone camera to open Concertina in the browser.
      </p>
      <div className="flex justify-center bg-gray-50 rounded-lg p-3">
        <QRCodeSVG
          value={appUrl}
          size={160}
          level="M"
          includeMargin={false}
          className="rounded"
        />
      </div>
      <p className="text-xs text-gray-400 mt-2 font-mono truncate" title={appUrl}>
        {appUrl}
      </p>
    </div>
  )
}
