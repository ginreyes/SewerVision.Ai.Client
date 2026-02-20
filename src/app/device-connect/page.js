'use client'

import React, { useEffect, useState } from 'react'

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
const DEVICE_APP_URL = process.env.NEXT_PUBLIC_DEVICE_APP_DOWNLOAD_URL || '/downloads/concertina-device.apk'

/**
 * Public page: open this on the device (e.g. by scanning QR from Concertina).
 * Query: ?deviceId=...&secret=...
 * This page POSTs to the ingest API to register the device connection and send initial data (e.g. battery).
 * For accurate serial, model, manufacturer and MAC, the user can download the Concertina Device app.
 */
function isAndroid() {
  if (typeof navigator === 'undefined') return false
  return /Android/i.test(navigator.userAgent)
}

export default function DeviceConnectPage() {
  const [status, setStatus] = useState('loading') // loading | success | error
  const [message, setMessage] = useState('')
  const [detail, setDetail] = useState('')
  const [isAndroidDevice, setIsAndroidDevice] = useState(false)
  useEffect(() => setIsAndroidDevice(isAndroid()), [])

  useEffect(() => {
    let cancelled = false
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
    const deviceId = params?.get('deviceId')
    const secret = params?.get('secret')

    if (!deviceId || !secret) {
      setStatus('error')
      setMessage('Missing connection details')
      setDetail('This link should be opened from the QR code or link in Concertina.')
      return
    }

    const run = async () => {
      try {
        let battery
        let signal = 'unknown'
        // Web: no library adds battery/signal where the browser doesn't support it.
        // We use standard APIs (Battery Status API, Network Information API).
        // For native/hybrid apps (Capacitor, React Native) use platform plugins instead.
        if (typeof navigator !== 'undefined' && navigator.getBattery) {
          const b = await navigator.getBattery()
          battery = Math.round((b.level ?? 0) * 100)
        }
        const conn = typeof navigator !== 'undefined' && navigator.connection
        if (conn) {
          // Prefer effectiveType (e.g. "4g", "3g"); fallback to type ("wifi", "cellular")
          signal = conn.effectiveType || conn.type || (conn.downlink != null ? `~${conn.downlink}Mbps` : null) || 'unknown'
        }
        const res = await fetch(`${API}/api/devices/${encodeURIComponent(deviceId)}/ingest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceSecret: secret,
            battery: battery ?? undefined,
            signal: signal || undefined,
            status: 'active',
          }),
        })
        const data = await res.json().catch(() => ({}))
        if (cancelled) return
        if (res.ok && data.success) {
          setStatus('success')
          setMessage('Device connected to Concertina')
          setDetail('This device can now send data. You can close this page.')
        } else {
          setStatus('error')
          setMessage(data.message || 'Connection failed')
          setDetail(data.error || 'Check that the link was not expired and try again from Concertina.')
        }
      } catch (e) {
        if (cancelled) return
        setStatus('error')
        setMessage('Connection failed')
        setDetail(e?.message || 'Network error. Ensure this device can reach Concertina.')
      }
    }

    run()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-lg p-6 text-center">
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h1 className="text-lg font-semibold text-gray-900">Connecting to Concertina...</h1>
            <p className="text-sm text-gray-500 mt-2">Registering this device.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">{message}</h1>
            <p className="text-sm text-gray-500 mt-2">{detail}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">{message}</h1>
            <p className="text-sm text-gray-500 mt-2">{detail}</p>
          </>
        )}

        {/* Download software for accurate device info (serial, model, manufacturer, MAC) */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-left">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Get accurate device information</h2>
          <p className="text-xs text-gray-500 mb-3">
            This page sends battery and connection data. For real serial number, model, manufacturer and MAC address, install the Concertina Device app. It reads hardware info from your device and sends it to Concertina.
          </p>
          {isAndroidDevice ? (
            <a
              href={DEVICE_APP_URL}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
              download
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Concertina Device app (Android)
            </a>
          ) : (
            <p className="text-xs text-gray-500">
              Android: <a href={DEVICE_APP_URL} className="text-indigo-600 hover:underline" download>Download app</a>.
              iOS app coming later.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
