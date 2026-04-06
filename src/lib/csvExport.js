import * as XLSX from 'xlsx';

/**
 * Export Utility — generates and downloads Excel (.xlsx) files from array data.
 * Used across all roles for exporting projects, tickets, uploads, reports etc.
 *
 * @example
 * exportToExcel(projects, ['name', 'status', 'progress'], 'projects-export');
 * exportToExcel(tickets, [
 *   { key: 'subject', label: 'Subject' },
 *   { key: 'status', label: 'Status' },
 *   { key: 'createdAt', label: 'Date', format: v => new Date(v).toLocaleDateString() },
 * ], 'tickets-export');
 */

/**
 * @param {Array<object>} data — array of objects to export
 * @param {Array<string | { key: string, label?: string, format?: (value: any, row: object) => string }>} columns — column definitions
 * @param {string} filename — filename without extension
 * @param {string} sheetName — worksheet name (default: 'Sheet1')
 */
export function exportToExcel(data, columns, filename = 'export', sheetName = 'Sheet1') {
  if (!data || data.length === 0) return;

  // Normalize columns
  const cols = columns.map(col => {
    if (typeof col === 'string') return { key: col, label: col, format: null };
    return { key: col.key, label: col.label || col.key, format: col.format || null };
  });

  // Build rows array (header + data)
  const header = cols.map(c => c.label);
  const rows = data.map(row =>
    cols.map(col => {
      let value = getNestedValue(row, col.key);
      if (col.format) value = col.format(value, row);
      return value ?? '';
    })
  );

  // Create workbook
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);

  // Auto-width columns
  const colWidths = cols.map((col, i) => {
    const maxLen = Math.max(
      col.label.length,
      ...rows.map(r => String(r[i] || '').length)
    );
    return { wch: Math.min(maxLen + 2, 50) };
  });
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Trigger download
  XLSX.writeFile(wb, `${filename}-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// Keep CSV export as fallback
export function exportToCSV(data, columns, filename = 'export') {
  if (!data || data.length === 0) return;

  const cols = columns.map(col => {
    if (typeof col === 'string') return { key: col, label: col, format: null };
    return { key: col.key, label: col.label || col.key, format: col.format || null };
  });

  const header = cols.map(c => escapeCSV(c.label)).join(',');
  const rows = data.map(row =>
    cols.map(col => {
      let value = getNestedValue(row, col.key);
      if (col.format) value = col.format(value, row);
      return escapeCSV(value);
    }).join(',')
  );

  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCSV(value) {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function getNestedValue(obj, path) {
  if (!obj || !path) return '';
  return path.split('.').reduce((acc, key) => acc?.[key] ?? '', obj);
}
