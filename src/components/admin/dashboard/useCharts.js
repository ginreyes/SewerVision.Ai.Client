'use client'
import { useRef, useEffect, useState, useMemo } from 'react'
import {
  getPieChartConfig,
  getWorkflowChartConfig,
  getProductivityChartConfig,
  getAccuracyChartConfig,
  getDefectTrendChartConfigFixed,
  getAiPerformanceChartConfig,
} from './chartConfigs'
import { useChartTheme } from '@/lib/chartTheme'

const loadChart = async () => {
  const chartModule = await import('chart.js/auto')
  return chartModule.default || chartModule
}

const CHART_KEYS = ['pie', 'workflow', 'productivity', 'accuracy', 'defectTrend', 'aiPerformance']

export function useCharts({ activeTab, aiDetections, workflowData, productivityData, defectTrendData, aiPerformanceData }) {
  useChartTheme(); // Apply dark/light defaults to Chart.js globally
  const [chartLoaded, setChartLoaded] = useState(false)

  // One ref per chart for canvas, one for instance
  const canvasRefs = useRef({})
  const instanceRefs = useRef({})

  // Provide stable ref getters
  const getCanvasRef = (key) => {
    if (!canvasRefs.current[key]) canvasRefs.current[key] = { current: null }
    return (el) => { canvasRefs.current[key].current = el }
  }

  // Lazy load Chart.js once
  useEffect(() => {
    loadChart().then((Chart) => {
      window.Chart = Chart
      setChartLoaded(true)
    })
  }, [])

  // Memoize data to avoid unnecessary chart rebuilds
  const chartData = useMemo(() => ({
    aiDetections, workflowData, productivityData, defectTrendData, aiPerformanceData
  }), [aiDetections, workflowData, productivityData, defectTrendData, aiPerformanceData])

  // Create/update charts
  useEffect(() => {
    if (!chartLoaded || !window.Chart) return
    const Chart = window.Chart

    // Destroy all existing
    CHART_KEYS.forEach(key => {
      if (instanceRefs.current[key]) {
        instanceRefs.current[key].destroy()
        instanceRefs.current[key] = null
      }
    })

    if (activeTab === 'overview') {
      const configs = {
        pie: getPieChartConfig(chartData.aiDetections),
        workflow: getWorkflowChartConfig(chartData.workflowData),
        productivity: getProductivityChartConfig(chartData.productivityData),
        accuracy: getAccuracyChartConfig(chartData.productivityData),
        defectTrend: getDefectTrendChartConfigFixed(chartData.defectTrendData),
      }
      Object.entries(configs).forEach(([key, config]) => {
        const canvas = canvasRefs.current[key]?.current
        if (canvas) instanceRefs.current[key] = new Chart(canvas, config)
      })
    }

    if (activeTab === 'ai-models') {
      const canvas = canvasRefs.current.aiPerformance?.current
      if (canvas) {
        instanceRefs.current.aiPerformance = new Chart(canvas, getAiPerformanceChartConfig(chartData.aiPerformanceData))
      }
    }
  }, [activeTab, chartLoaded, chartData])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      CHART_KEYS.forEach(key => {
        if (instanceRefs.current[key]) instanceRefs.current[key].destroy()
      })
    }
  }, [])

  return { getCanvasRef }
}
