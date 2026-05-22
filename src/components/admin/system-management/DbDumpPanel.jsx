"use client";

import { useState } from "react";
import { Download, Loader2, Database } from "lucide-react";
import { api, getCookie } from "@/lib/helper";

const DEFAULT_BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export default function DbDumpPanel() {
  const [dialect, setDialect] = useState("postgres");
  const [collectionsInput, setCollectionsInput] = useState("");
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  const collectionsParam = collectionsInput.trim()
    ? `&collections=${encodeURIComponent(collectionsInput.trim())}`
    : "";

  const handlePreview = async () => {
    setError(null);
    setLoadingPreview(true);
    try {
      const res = await api(
        `/api/system-health/db-dump/preview?placeholder=1${collectionsParam}`,
        "GET"
      );
      if (!res?.ok) throw new Error(res?.message || "Preview failed");
      setPreview(res.data?.data || null);
    } catch (err) {
      setError(err.message || "Preview failed");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleDownload = async () => {
    setError(null);
    setDownloading(true);
    try {
      // Streaming download — bypass `api()` (which buffers JSON) and hit
      // the endpoint directly with the auth token.
      const token = getCookie("token");
      const url = `${DEFAULT_BACKEND}/api/system-health/db-dump?dialect=${dialect}${collectionsParam}`;
      const res = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${txt.slice(0, 200)}`);
      }
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      const ts = new Date().toISOString().replace(/[:]/g, "-").slice(0, 19);
      a.download = `concertina-backup-${dialect}-${ts}.sql`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError(err.message || "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
          <Database className="w-4 h-4 text-rose-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Database Dump</h3>
          <p className="text-[11px] text-gray-500">
            Stream a SQL backup of all (or selected) collections in postgres / mysql dialect.
          </p>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Dialect</label>
          <select
            value={dialect}
            onChange={(e) => setDialect(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white"
          >
            <option value="postgres">PostgreSQL</option>
            <option value="mysql">MySQL</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Collections (comma-separated, blank = all)
          </label>
          <input
            value={collectionsInput}
            onChange={(e) => setCollectionsInput(e.target.value)}
            placeholder="users,projects,observations"
            className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5"
          />
        </div>
      </div>

      <div className="px-4 pb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handlePreview}
          disabled={loadingPreview}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-md hover:bg-gray-50 flex items-center gap-1.5"
        >
          {loadingPreview && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Dry-run preview
        </button>
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="px-3 py-1.5 text-sm bg-rose-600 text-white rounded-md hover:bg-rose-700 disabled:opacity-50 flex items-center gap-1.5"
        >
          {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          Download .sql
        </button>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>

      {preview && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
          <div className="text-xs font-semibold text-gray-700 mb-2">
            Preview — {preview.collections?.length || 0} collections
          </div>
          <div className="max-h-48 overflow-y-auto text-xs">
            <table className="w-full">
              <thead className="text-gray-500">
                <tr>
                  <th className="text-left font-medium pb-1">Collection</th>
                  <th className="text-right font-medium pb-1">Rows</th>
                </tr>
              </thead>
              <tbody>
                {(preview.collections || []).map((c) => (
                  <tr key={c.name} className="border-t border-gray-100">
                    <td className="py-1">{c.name}</td>
                    <td className="py-1 text-right tabular-nums">{c.rows.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
