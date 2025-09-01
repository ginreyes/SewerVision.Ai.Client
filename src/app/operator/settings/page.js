'use client'
import React, { useState } from 'react'
import { Settings, MapPin, Wifi, Bell, Save, RefreshCw, Check, Upload, Camera, Shield, Globe, Ruler, Volume2 } from 'lucide-react'

const OperatorSettingsModule = () => {
  const [settings, setSettings] = useState({
    autoUpload: true,
    gpsTagging: true,
    offlineMode: true,
    notificationSounds: true,
    units: 'imperial', // 'imperial' or 'metric'
    language: 'en', // 'en', 'es', 'fr'
    autoSyncOnWifi: true,
    streamQuality: 'high', // 'high', 'medium', 'low'
    aiProcessing: true,
    pacpCompliance: true,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }, 800)
  }

  const ToggleSwitch = ({ checked, onChange, label, description, icon: Icon }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="bg-blue-50 rounded-lg p-2">
            <Icon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{label}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer ml-4">
          <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="sr-only peer"
          />
          <div className="relative w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 rounded-xl p-3">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Operator Settings</h1>
              <p className="text-lg text-gray-600 mt-1">
                Configure your SewerVision.ai field operation preferences
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        <div className="grid gap-8 lg:grid-cols-2">
          
          {/* Data Management Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Upload className="h-6 w-6 text-blue-600 mr-3" />
                Data Management
              </h2>
              
              <div className="space-y-6">
                <ToggleSwitch
                  checked={settings.autoUpload}
                  onChange={(e) => handleChange('autoUpload', e.target.checked)}
                  label="Auto-Upload Videos"
                  description="Automatically upload inspection videos to SewerVision.ai Cloud when connected to Wi-Fi for real-time access and AI processing."
                  icon={Wifi}
                />

                <ToggleSwitch
                  checked={settings.offlineMode}
                  onChange={(e) => handleChange('offlineMode', e.target.checked)}
                  label="Offline Mode"
                  description="Save inspection data locally when offline. Automatically sync when connection is restored to ensure no data loss."
                  icon={Shield}
                />

                <ToggleSwitch
                  checked={settings.autoSyncOnWifi}
                  onChange={(e) => handleChange('autoSyncOnWifi', e.target.checked)}
                  label="Auto-Sync on Wi-Fi"
                  description="Resume pending uploads automatically when Wi-Fi is detected to maintain continuous data flow."
                  icon={RefreshCw}
                />
              </div>
            </div>

            {/* PACP Compliance Section */}
            <div className="space-y-6">
              <ToggleSwitch
                checked={settings.gpsTagging}
                onChange={(e) => handleChange('gpsTagging', e.target.checked)}
                label="GPS Location Tagging"
                description="Automatically attach GPS coordinates to every inspection for accurate pipeline mapping and PACP compliance."
                icon={MapPin}
              />

              <ToggleSwitch
                checked={settings.aiProcessing}
                onChange={(e) => handleChange('aiProcessing', e.target.checked)}
                label="AI Processing"
                description="Enable AI models to detect fractures, cracks, broken pipes, and roots with confidence scores for accelerated productivity."
                icon={Camera}
              />

              <ToggleSwitch
                checked={settings.pacpCompliance}
                onChange={(e) => handleChange('pacpCompliance', e.target.checked)}
                label="PACP Compliance Mode"
                description="Ensure all inspections meet PACP standards with automated compliance checks and certified QC review workflow."
                icon={Shield}
              />
            </div>
          </div>

          {/* System Preferences Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Settings className="h-6 w-6 text-blue-600 mr-3" />
                System Preferences
              </h2>

              <div className="space-y-6">
                <ToggleSwitch
                  checked={settings.notificationSounds}
                  onChange={(e) => handleChange('notificationSounds', e.target.checked)}
                  label="Notification Sounds"
                  description="Play audio alerts for upload completion, AI processing status, and system notifications."
                  icon={Volume2}
                />

                {/* Stream Quality */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <label className="flex items-center text-lg font-semibold text-gray-900 mb-4">
                    <Camera className="h-5 w-5 text-blue-600 mr-2" />
                    Video Stream Quality
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['high', 'medium', 'low'].map((quality) => (
                      <label key={quality} className="relative cursor-pointer">
                        <input
                          type="radio"
                          name="streamQuality"
                          value={quality}
                          checked={settings.streamQuality === quality}
                          onChange={(e) => handleChange('streamQuality', e.target.value)}
                          className="sr-only"
                        />
                        <div className={`px-4 py-3 rounded-lg border-2 text-center font-medium transition-all ${
                          settings.streamQuality === quality
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}>
                          {quality.charAt(0).toUpperCase() + quality.slice(1)}
                        </div>
                      </label>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Higher quality requires more bandwidth but provides better AI detection accuracy.</p>
                </div>

                {/* Measurement Units */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <label className="flex items-center text-lg font-semibold text-gray-900 mb-4">
                    <Ruler className="h-5 w-5 text-blue-600 mr-2" />
                    Measurement Units
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="relative cursor-pointer">
                      <input
                        type="radio"
                        name="units"
                        value="imperial"
                        checked={settings.units === 'imperial'}
                        onChange={(e) => handleChange('units', e.target.value)}
                        className="sr-only"
                      />
                      <div className={`px-6 py-4 rounded-lg border-2 text-center font-medium transition-all ${
                        settings.units === 'imperial'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}>
                        Imperial
                        <div className="text-sm opacity-75">ft, in</div>
                      </div>
                    </label>
                    <label className="relative cursor-pointer">
                      <input
                        type="radio"
                        name="units"
                        value="metric"
                        checked={settings.units === 'metric'}
                        onChange={(e) => handleChange('units', e.target.value)}
                        className="sr-only"
                      />
                      <div className={`px-6 py-4 rounded-lg border-2 text-center font-medium transition-all ${
                        settings.units === 'metric'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}>
                        Metric
                        <div className="text-sm opacity-75">m, cm</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Language Selection */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <label className="flex items-center text-lg font-semibold text-gray-900 mb-4">
                    <Globe className="h-5 w-5 text-blue-600 mr-2" />
                    Interface Language
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleChange('language', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Settings Button */}
        <div className="mt-12 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Save Configuration</h3>
              <p className="text-gray-600 mt-1">Apply these settings to your SewerVision.ai operator interface.</p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white rounded-xl font-semibold text-lg transition-all transform hover:scale-105 disabled:scale-100 shadow-lg"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <Check className="h-5 w-5 mr-3" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-3" />
                  Save Settings
                </>
              )}
            </button>
          </div>
          {saved && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium flex items-center">
                <Check className="h-5 w-5 mr-2" />
                Settings saved successfully! Your preferences are now active.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-blue-600 font-bold text-lg mb-2">
              <Settings className="h-6 w-6" />
              <span>SewerVision.ai</span>
            </div>
            <p className="text-gray-600">
              PACP-Compliant Workflow • AI-Powered Inspection • Cloud-Based Data Management
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default OperatorSettingsModule