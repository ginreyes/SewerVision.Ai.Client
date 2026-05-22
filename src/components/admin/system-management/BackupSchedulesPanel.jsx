"use client";

import { useEffect, useState, useCallback } from "react";
import { CalendarClock, Loader2, Play, Pencil, Trash2, Plus } from "lucide-react";
import { api } from "@/lib/helper";

const PRESETS = [
  { label: "Every day at 02:00 UTC", cron: "0 2 * * *" },
  { label: "Every Sunday at 02:00", cron: "0 2 * * 0" },
  { label: "Every hour", cron: "0 * * * *" },
  { label: "Every 15 minutes", cron: "*/15 * * * *" },
];

const emptyForm = {
  name: "",
  cronExpression: "0 2 * * *",
  dialect: "postgres",
  collections: "",
  retentionDays: 14,
  targetProvider: "b2",
  enabled: true,
};

const StatusPill = ({ status }) => {
  const map = {
    success: "bg-emerald-50 text-emerald-700",
    failed: "bg-red-50 text-red-700",
    skipped: "bg-amber-50 text-amber-700",
  };
  if (!status) return <span className="text-xs text-gray-400">never run</span>;
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded ${map[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
};

export default function BackupSchedulesPanel() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(null); // null when not editing

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api(`/api/backup-schedules`, "GET");
      if (!res?.ok) throw new Error(res?.message || "Load failed");
      setSchedules(res.data?.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e?.preventDefault?.();
    if (!form) return;
    const payload = {
      ...form,
      collections: form.collections
        ? form.collections.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      retentionDays: Number(form.retentionDays) || 14,
    };
    try {
      const res = form._id
        ? await api(`/api/backup-schedules/${form._id}`, "PUT", payload)
        : await api(`/api/backup-schedules`, "POST", payload);
      if (!res?.ok) throw new Error(res?.message || "Save failed");
      setForm(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this backup schedule?")) return;
    try {
      const res = await api(`/api/backup-schedules/${id}`, "DELETE");
      if (!res?.ok) throw new Error(res?.message || "Delete failed");
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const runNow = async (id) => {
    try {
      const res = await api(`/api/backup-schedules/${id}/run-now`, "POST");
      if (!res?.ok) throw new Error(res?.message || "Run failed");
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
            <CalendarClock className="w-4 h-4 text-rose-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Scheduled Backups</h3>
            <p className="text-[11px] text-gray-500">
              Recurring SQL dumps via node-cron — uploaded through the configured storage provider.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setForm({ ...emptyForm })}
          className="px-3 py-1.5 text-sm bg-rose-600 text-white rounded-md hover:bg-rose-700 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> New schedule
        </button>
      </div>

      {error && <div className="px-4 py-2 text-xs text-red-600 bg-red-50">{error}</div>}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Name</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Cron</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Dialect</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Last run</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Status</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Enabled</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-gray-500 text-xs">
                    No scheduled backups yet.
                  </td>
                </tr>
              ) : (
                schedules.map((s) => (
                  <tr key={s._id} className="border-t border-gray-100">
                    <td className="px-3 py-2 text-gray-900 font-medium">{s.name}</td>
                    <td className="px-3 py-2 text-gray-700 font-mono text-xs">{s.cronExpression}</td>
                    <td className="px-3 py-2 text-gray-700">{s.dialect}</td>
                    <td className="px-3 py-2 text-gray-500 text-xs">
                      {s.lastRunAt ? new Date(s.lastRunAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <StatusPill status={s.lastRunStatus} />
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          s.enabled ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {s.enabled ? "on" : "off"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="inline-flex gap-1">
                        <button
                          type="button"
                          onClick={() => runNow(s._id)}
                          className="p-1 rounded hover:bg-gray-100 text-gray-600"
                          title="Run now"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm({ ...s, collections: (s.collections || []).join(",") })}
                          className="p-1 rounded hover:bg-gray-100 text-gray-600"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(s._id)}
                          className="p-1 rounded hover:bg-red-50 text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {form && (
        <form onSubmit={submit} className="border-t border-gray-100 p-4 bg-gray-50 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Cron expression</label>
            <input
              required
              value={form.cronExpression}
              onChange={(e) => setForm({ ...form, cronExpression: e.target.value })}
              className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5 font-mono"
            />
            <div className="text-[10px] text-gray-500 mt-1">
              Presets:&nbsp;
              {PRESETS.map((p) => (
                <button
                  key={p.cron}
                  type="button"
                  onClick={() => setForm({ ...form, cronExpression: p.cron })}
                  className="underline mr-2 hover:text-rose-700"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Dialect</label>
            <select
              value={form.dialect}
              onChange={(e) => setForm({ ...form, dialect: e.target.value })}
              className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5"
            >
              <option value="postgres">PostgreSQL</option>
              <option value="mysql">MySQL</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Target</label>
            <select
              value={form.targetProvider}
              onChange={(e) => setForm({ ...form, targetProvider: e.target.value })}
              className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5"
            >
              <option value="b2">Backblaze B2</option>
              <option value="s3">AWS S3</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Retention (days)</label>
            <input
              type="number"
              min={1}
              max={365}
              value={form.retentionDays}
              onChange={(e) => setForm({ ...form, retentionDays: e.target.value })}
              className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Collections (blank = all)
            </label>
            <input
              value={form.collections}
              onChange={(e) => setForm({ ...form, collections: e.target.value })}
              placeholder="users,projects"
              className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-700 md:col-span-2">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
            />
            Enabled
          </label>
          <div className="md:col-span-2 flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setForm(null)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-sm bg-rose-600 text-white rounded-md hover:bg-rose-700"
            >
              {form._id ? "Save changes" : "Create schedule"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
