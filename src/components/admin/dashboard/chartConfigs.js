import { COLORS } from '@/components/admin/constants'

const commonLegend = { position: 'bottom', labels: { padding: 20, usePointStyle: true } }
const topLegend = { position: 'top', labels: { usePointStyle: true, padding: 20 } }
const noGridX = { grid: { display: false } }
const lightGridY = { grid: { color: '#E5E7EB' } }

export function getPieChartConfig(aiDetections) {
  return {
    type: 'pie',
    data: {
      labels: aiDetections.map(d => d.type),
      datasets: [{
        data: aiDetections.map(d => d.count),
        backgroundColor: COLORS,
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: commonLegend,
        tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed} detected` } }
      }
    }
  }
}

export function getWorkflowChartConfig(workflowData) {
  return {
    type: 'doughnut',
    data: {
      labels: workflowData.map(d => d.name),
      datasets: [{
        data: workflowData.map(d => d.value),
        backgroundColor: workflowData.map(d => d.color),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: { legend: commonLegend }
    }
  }
}

export function getProductivityChartConfig(productivityData) {
  return {
    type: 'bar',
    data: {
      labels: productivityData.map(d => d.month),
      datasets: [
        { label: 'Manual Processing', data: productivityData.map(d => d.manual), backgroundColor: '#EF4444', borderRadius: 4 },
        { label: 'AI Processing', data: productivityData.map(d => d.ai), backgroundColor: '#3B82F6', borderRadius: 4 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true, ...lightGridY }, x: noGridX },
      plugins: { legend: topLegend }
    }
  }
}

export function getAccuracyChartConfig(productivityData) {
  return {
    type: 'line',
    data: {
      labels: productivityData.map(d => d.month),
      datasets: [{
        label: 'AI Accuracy %',
        data: productivityData.map(d => d.accuracy),
        borderColor: '#10B981',
        backgroundColor: '#10B981',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { min: 85, max: 95, ...lightGridY }, x: noGridX },
      plugins: { legend: { display: false } }
    }
  }
}

export function getDefectTrendChartConfig(defectTrendData) {
  const datasets = [
    { label: 'Fractures', key: 'fractures', color: '#EF4444' },
    { label: 'Cracks', key: 'cracks', color: '#F59E0B' },
    { label: 'Broken Pipes', key: 'broken', color: '#8B5CF6' },
    { label: 'Root Intrusion', key: 'roots', color: '#10B981' },
  ]
  return {
    type: 'line',
    data: {
      labels: defectTrendData.map(d => d.week),
      datasets: datasets.map(ds => ({
        label: ds.label,
        data: defectTrendData.map(d => d[ds.key]),
        borderColor: ds.color,
        backgroundColor: ds.color.replace(')', ', 0.3)').replace('rgb', 'rgba').replace('#', ''),
        fill: true,
        tension: 0.4
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: { y: { beginAtZero: true, ...lightGridY }, x: noGridX },
      plugins: { legend: topLegend }
    }
  }
}

// Fix the backgroundColor for hex colors
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// Re-export with proper rgba conversion for defect trend
export function getDefectTrendChartConfigFixed(defectTrendData) {
  const datasets = [
    { label: 'Fractures', key: 'fractures', color: '#EF4444' },
    { label: 'Cracks', key: 'cracks', color: '#F59E0B' },
    { label: 'Broken Pipes', key: 'broken', color: '#8B5CF6' },
    { label: 'Root Intrusion', key: 'roots', color: '#10B981' },
  ]
  return {
    type: 'line',
    data: {
      labels: defectTrendData.map(d => d.week),
      datasets: datasets.map(ds => ({
        label: ds.label,
        data: defectTrendData.map(d => d[ds.key]),
        borderColor: ds.color,
        backgroundColor: hexToRgba(ds.color, 0.3),
        fill: true,
        tension: 0.4
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: { y: { beginAtZero: true, ...lightGridY }, x: noGridX },
      plugins: { legend: topLegend }
    }
  }
}

export function getAiPerformanceChartConfig(aiPerformanceData) {
  return {
    type: 'bar',
    data: {
      labels: aiPerformanceData.map(d => d.metric),
      datasets: [{
        label: 'Accuracy %',
        data: aiPerformanceData.map(d => d.value),
        backgroundColor: '#8B5CF6',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      scales: { x: { min: 80, max: 100, ...lightGridY }, y: noGridX },
      plugins: { legend: { display: false } }
    }
  }
}
