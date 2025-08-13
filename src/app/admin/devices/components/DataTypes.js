import { Camera, Tablet, Monitor, Smartphone, Truck, Brain, Cloud, FileText, Wifi, Bluetooth, Network, Signal } from 'lucide-react'

export const deviceTypes = {
  field: [
    { id: 'inspection-camera', name: 'CCTV Inspection Camera', icon: Camera, description: 'Main pipeline inspection equipment' },
    { id: 'tablet', name: 'Mobile Tablet', icon: Tablet, description: 'Portable data collection device' },
    { id: 'console', name: 'Truck Console', icon: Monitor, description: 'Vehicle-mounted control system' },
    { id: 'scanner', name: 'Handheld Scanner', icon: Smartphone, description: 'Quick inspection tool' },
    { id: 'truck', name: 'Inspection Truck', icon: Truck, description: 'Mobile inspection vehicle' }
  ],
  cloud: [
    { id: 'ai-server', name: 'AI Processing Node', icon: Brain, description: 'AI model processing server' },
    { id: 'storage', name: 'Cloud Storage', icon: Cloud, description: 'Data storage server' },
    { id: 'workstation', name: 'QC Workstation', icon: FileText, description: 'Quality control review station' }
  ]
}

export const connectivityOptions = [
  { id: 'wifi', name: 'Wi-Fi', icon: Wifi },
  { id: 'cellular', name: 'Cellular', icon: Signal },
  { id: 'ethernet', name: 'Ethernet', icon: Network },
  { id: 'bluetooth', name: 'Bluetooth', icon: Bluetooth }
]
