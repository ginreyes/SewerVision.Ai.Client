'use client'
import React, { useState, useEffect, useRef } from 'react'
import {
  Save, Clock, MapPin, AlertTriangle, FileText, Plus, Camera,
  Video, CheckCircle2, ChevronRight, Eye, X,
} from 'lucide-react'
import {
  Dialog, DialogContent, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { api } from '@/lib/helper'
import { useAlert } from '@/components/providers/AlertProvider'
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"

const STEPS = [
  { key: 'basic', label: 'Basic Info', desc: 'Distance, time & classification', icon: FileText },
  { key: 'assessment', label: 'Assessment', desc: 'Severity & measurements', icon: AlertTriangle },
  { key: 'snapshot', label: 'Snapshot', desc: 'Capture video frame', icon: Camera },
  { key: 'review', label: 'Review & Save', desc: 'Confirm and submit', icon: Eye },
];

const severityLevels = [
  { value: 'low', label: 'Grade 1-2 (Minor)', color: 'border-green-300 bg-green-50 text-green-700', active: 'ring-2 ring-green-400 border-green-400 bg-green-100' },
  { value: 'medium', label: 'Grade 3 (Moderate)', color: 'border-amber-300 bg-amber-50 text-amber-700', active: 'ring-2 ring-amber-400 border-amber-400 bg-amber-100' },
  { value: 'high', label: 'Grade 4-5 (Severe)', color: 'border-red-300 bg-red-50 text-red-700', active: 'ring-2 ring-red-400 border-red-400 bg-red-100' },
];

const clockPositions = [
  '12:00', '1:00', '2:00', '3:00', '4:00', '5:00',
  '6:00', '7:00', '8:00', '9:00', '10:00', '11:00',
  '12:00-3:00', '3:00-6:00', '6:00-9:00', '9:00-12:00', 'All Around',
];

const snapshotCategories = [
  { value: 'defect', label: 'Defect Documentation' },
  { value: 'reference', label: 'Reference Point' },
  { value: 'measurement', label: 'Measurement' },
  { value: 'joint', label: 'Joint Location' },
  { value: 'general', label: 'General' },
];

const AddObservation = ({
  isOpen, onClose, currentTime = "00:00:00", currentDistance = "0.00",
  project_id, user_id, pacpCodes, snapshots = [], videoRef,
  theme = 'rose', // 'rose' = admin, 'blue' = operator, 'indigo' = user
}) => {
  const { showAlert } = useAlert();

  const themes = {
    rose:   { primary: 'bg-rose-600 hover:bg-rose-700', light: 'bg-rose-100 text-rose-700', border: 'border-rose-200', text: 'text-rose-700', icon: 'text-rose-600', ring: 'ring-rose-400', activeBg: 'bg-rose-600', badge: 'bg-rose-100 text-rose-700' },
    blue:   { primary: 'bg-blue-600 hover:bg-blue-700', light: 'bg-blue-100 text-blue-700', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-600', ring: 'ring-blue-400', activeBg: 'bg-blue-600', badge: 'bg-blue-100 text-blue-700' },
    indigo: { primary: 'bg-indigo-600 hover:bg-indigo-700', light: 'bg-indigo-100 text-indigo-700', border: 'border-indigo-200', text: 'text-indigo-700', icon: 'text-indigo-600', ring: 'ring-indigo-400', activeBg: 'bg-indigo-600', badge: 'bg-indigo-100 text-indigo-700' },
  };
  const t = themes[theme] || themes.rose;

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [capturedFrame, setCapturedFrame] = useState(null);
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef(null);
  const pacpCodesArray = Array.isArray(pacpCodes) ? pacpCodes : [];

  const [formData, setFormData] = useState({
    distance: '', pacpCode: '', observation: '', time: '00:00:00',
    remarks: '', severity: 'low', clockPosition: '', length: '', width: '',
    percentage: '', joint: '', continuous: false, snapshot: false,
    snapshotLabel: '', snapshotTimestamp: '', snapshotCategory: 'defect',
  });

  const formatTime = (t) => {
    if (!t && t !== 0) return '00:00:00';
    if (typeof t === 'string') return t;
    const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = Math.floor(t % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isOpen) {
      setStep(0); setErrors({}); setCapturedFrame(null);
      setFormData({
        distance: currentDistance, pacpCode: '', observation: '',
        time: typeof currentTime === 'number' ? formatTime(currentTime) : currentTime,
        remarks: '', severity: 'low', clockPosition: '', length: '', width: '',
        percentage: '', joint: '', continuous: false, snapshot: false,
        snapshotLabel: '', snapshotTimestamp: '', snapshotCategory: 'defect',
      });
    }
  }, [isOpen, currentTime, currentDistance]);

  // No canvas preview needed — we show the actual video element directly

  const set = (field, value) => {
    setFormData(prev => {
      const d = { ...prev, [field]: value };
      if (field === 'snapshot' && value) {
        d.snapshotTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
        if (prev.pacpCode) { const c = pacpCodesArray.find(x => x.code === prev.pacpCode); d.snapshotLabel = c ? `${c.code} - ${c.name}` : ''; }
      }
      if (field === 'pacpCode' && prev.snapshot) { const c = pacpCodesArray.find(x => x.code === value); d.snapshotLabel = c ? `${c.code} - ${c.name}` : ''; }
      return d;
    });
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const captureFrame = () => {
    if (!videoRef?.current || videoRef.current.readyState < 2) return;
    const video = videoRef.current;
    let canvas = canvasRef.current || document.createElement('canvas');
    canvasRef.current = canvas;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 360;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    try {
      setCapturedFrame(canvas.toDataURL('image/jpeg', 0.9));
      if (!formData.snapshot) set('snapshot', true);
    } catch { showAlert('Cannot capture — CORS issue', 'error'); }
  };

  const validateStep = (s) => {
    const e = {};
    if (s === 0) {
      if (!formData.distance) e.distance = 'Required';
      if (!formData.time) e.time = 'Required';
      if (!formData.pacpCode) e.pacpCode = 'Required';
      if (!formData.observation) e.observation = 'Required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goToStep = (i) => {
    if (i > step && step === 0 && !validateStep(0)) return;
    setStep(i);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const obsData = { ...formData };
      if (formData.snapshot && capturedFrame && project_id) {
        try {
          const { ok, data } = await api(`/api/snapshots/create-snapshot/${project_id}/${user_id}`, 'POST', {
            projectId: project_id, distance: formData.distance,
            label: formData.snapshotLabel || `${formData.pacpCode} - ${formData.time}`,
            timestamp: formData.snapshotTimestamp, imageData: capturedFrame,
          });
          if (ok) { const s = data?.data || data; if (s?.imageUrl) { obsData.snapshot = true; obsData.snapshotUrl = s.imageUrl; } }
        } catch {}
      }
      const { ok } = await api(`/api/observations/create-observations/${project_id}/${user_id}`, 'POST', obsData);
      if (ok) { showAlert('Observation added successfully', 'success'); onClose(); }
      else showAlert('Failed to save observation', 'error');
    } catch { showAlert('Error saving observation', 'error'); }
    finally { setSaving(false); }
  };

  const selectedCode = pacpCodesArray.find(c => c.code === formData.pacpCode);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden h-[80vh] max-h-[700px]">
        <VisuallyHidden.Root><DialogTitle>Add New Observation</DialogTitle></VisuallyHidden.Root>

        <div className="flex h-full">
          {/* ── Left Sidebar ── */}
          <div className="w-56 bg-gray-50 border-r border-gray-200 flex flex-col flex-shrink-0">
            <div className="px-4 pt-5 pb-3 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <Plus className={`h-3.5 w-3.5 ${t.icon}`} />
                New Observation
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Fill in each section</p>
            </div>

            <nav className="flex-1 p-2 space-y-0.5">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const done = i < step;
                const active = i === step;
                const hasError = i === 0 && Object.keys(errors).length > 0;
                return (
                  <button
                    key={s.key}
                    onClick={() => goToStep(i)}
                    className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                      active ? `bg-white shadow-sm border ${t.border}` :
                      done ? 'hover:bg-white/60' : 'hover:bg-white/40'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 ${
                      active ? `${t.activeBg} text-white` :
                      done ? 'bg-green-100 text-green-600' :
                      hasError ? 'bg-red-100 text-red-500' :
                      'bg-gray-200 text-gray-400'
                    }`}>
                      {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold truncate ${active ? t.text : done ? 'text-green-700' : 'text-gray-600'}`}>
                        {s.label}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">{s.desc}</p>
                    </div>
                    {active && <ChevronRight className={`h-3 w-3 ml-auto mt-2 flex-shrink-0 ${t.icon}`} />}
                  </button>
                );
              })}
            </nav>

            {/* Quick info */}
            <div className="px-3 py-3 border-t border-gray-200 text-[10px] text-gray-400 space-y-1">
              {formData.pacpCode && <div className="flex items-center gap-1"><Badge className={`${t.badge} text-[9px] h-4`}>{formData.pacpCode}</Badge></div>}
              {formData.distance && <div>Distance: {formData.distance}</div>}
              {formData.time !== '00:00:00' && <div>Time: {formData.time}</div>}
            </div>
          </div>

          {/* ── Right Content ── */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Content header */}
            <div className="px-6 pt-5 pb-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-900">{STEPS[step].label}</h4>
                <p className="text-[11px] text-gray-400">{STEPS[step].desc}</p>
              </div>
             
            </div>

            {/* Content body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* Step 1: Basic Info */}
              {step === 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Field label="Distance *" icon={MapPin} error={errors.distance}>
                      <Input value={formData.distance} onChange={e => set('distance', e.target.value)} placeholder="0.00"
                        className={`h-9 text-sm ${errors.distance ? 'border-red-400' : ''}`} />
                    </Field>
                    <Field label="Time *" icon={Clock} error={errors.time}>
                      <Input value={formData.time} onChange={e => set('time', e.target.value)} placeholder="00:00:00"
                        className={`h-9 text-sm ${errors.time ? 'border-red-400' : ''}`} />
                    </Field>
                    <Field label="Joint Number">
                      <Input value={formData.joint} onChange={e => set('joint', e.target.value)} placeholder="Optional" className="h-9 text-sm" />
                    </Field>
                  </div>

                  <Field label="PACP Code *" error={errors.pacpCode}>
                    <Select value={formData.pacpCode} onValueChange={v => set('pacpCode', v)}>
                      <SelectTrigger className={`h-9 text-sm ${errors.pacpCode ? 'border-red-400' : ''}`}>
                        <SelectValue placeholder="Select PACP Code" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {pacpCodesArray.map(c => (
                          <SelectItem key={c.code} value={c.code} className="text-sm">
                            <span className="font-semibold">{c.code}</span> — {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedCode && (
                      <div className={`flex items-center gap-2 mt-2 p-2 rounded-lg border text-xs ${t.badge} ${t.border}`}>
                        <Badge className={`${t.activeBg} text-white text-[10px]`}>{selectedCode.code}</Badge>
                        {selectedCode.name}
                      </div>
                    )}
                  </Field>

                  <Field label="Description *" error={errors.observation}>
                    <Textarea value={formData.observation} onChange={e => set('observation', e.target.value)}
                      placeholder="Describe the observation..." rows={3}
                      className={`text-sm resize-none ${errors.observation ? 'border-red-400' : ''}`} />
                  </Field>

                  <Field label="Remarks">
                    <Textarea value={formData.remarks} onChange={e => set('remarks', e.target.value)}
                      placeholder="Additional notes..." rows={2} className="text-sm resize-none" />
                  </Field>
                </div>
              )}

              {/* Step 2: Assessment */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <Label className="text-xs font-semibold mb-2 block">Severity Level</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {severityLevels.map(s => (
                        <button key={s.value} type="button" onClick={() => set('severity', s.value)}
                          className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                            formData.severity === s.value ? s.active : s.color + ' hover:shadow-sm'
                          }`}>{s.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    {/* Clock Position Picker */}
                    <Field label="Clock Position">
                      <ClockPicker value={formData.clockPosition} onChange={v => set('clockPosition', v)} theme={t} />
                    </Field>

                    <div className="grid grid-cols-3 gap-3">
                      <Field label="Length"><Input value={formData.length} onChange={e => set('length', e.target.value)} placeholder="e.g., 25cm" className="h-9 text-sm" /></Field>
                      <Field label="Width"><Input value={formData.width} onChange={e => set('width', e.target.value)} placeholder="e.g., 5mm" className="h-9 text-sm" /></Field>
                      <Field label="Percentage"><Input value={formData.percentage} onChange={e => set('percentage', e.target.value)} placeholder="e.g., 25%" className="h-9 text-sm" /></Field>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <Checkbox checked={formData.continuous} onCheckedChange={v => set('continuous', v)} id="continuous" />
                    <Label htmlFor="continuous" className="text-sm cursor-pointer">Continuous defect <span className="text-gray-400 text-xs">(spans multiple joints)</span></Label>
                  </div>
                </div>
              )}

              {/* Step 3: Snapshot */}
              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-xs text-gray-500">
                    Use the video player behind this dialog to navigate to the exact frame, then click <strong>Capture Frame</strong> to grab it.
                  </p>
                  <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video border border-gray-200">
                    {capturedFrame ? (
                      <>
                        <img src={capturedFrame} alt="Captured frame" className="w-full h-full object-cover" />
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-green-600 text-white">
                            <CheckCircle2 className="h-3 w-3" /> Frame Captured
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-3 text-white text-xs bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md">
                          {formData.distance}m | {formData.time}
                        </div>
                        {formData.pacpCode && (
                          <Badge className={`absolute top-3 right-3 ${t.activeBg} text-white text-[10px]`}>{formData.pacpCode}</Badge>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <Camera className="h-12 w-12 mx-auto mb-3 opacity-40" />
                          <p className="text-sm font-medium">No frame captured yet</p>
                          <p className="text-xs mt-1 opacity-70">Click the button below to capture the current video frame</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button type="button" onClick={captureFrame} disabled={!videoRef?.current} className={`${t.primary} text-white`}>
                      <Camera className="h-4 w-4 mr-2" />{capturedFrame ? 'Recapture' : 'Capture Frame'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setCapturedFrame(null)} disabled={!capturedFrame}>Clear</Button>
                  </div>
                  {capturedFrame && (
                    <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <Field label="Snapshot Label"><Input value={formData.snapshotLabel} onChange={e => set('snapshotLabel', e.target.value)} placeholder="e.g., Main crack" className="h-9 text-sm" /></Field>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Category">
                          <Select value={formData.snapshotCategory} onValueChange={v => set('snapshotCategory', v)}>
                            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>{snapshotCategories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                          </Select>
                        </Field>
                        <Field label="Timestamp"><Input value={formData.snapshotTimestamp} readOnly className="h-9 text-sm bg-gray-100" /></Field>
                      </div>
                    </div>
                  )}
                  {!capturedFrame && (
                    <p className="text-xs text-gray-400 text-center py-4">
                      Snapshot is optional — you can skip this step and save without a frame capture.
                    </p>
                  )}
                </div>
              )}

              {/* Step 4: Review */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <ReviewField label="Distance" value={formData.distance} />
                    <ReviewField label="Time" value={formData.time} />
                    <ReviewField label="PACP Code" value={formData.pacpCode} badge />
                    <ReviewField label="Severity" value={formData.severity} severity />
                    <ReviewField label="Clock Position" value={formData.clockPosition} />
                    <ReviewField label="Joint" value={formData.joint} />
                    <ReviewField label="Length" value={formData.length} />
                    <ReviewField label="Width" value={formData.width} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-medium text-gray-400 uppercase">Description</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{formData.observation || '—'}</p>
                  </div>
                  {formData.remarks && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-medium text-gray-400 uppercase">Remarks</p>
                      <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">{formData.remarks}</p>
                    </div>
                  )}
                  {capturedFrame && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-medium text-gray-400 uppercase">Snapshot</p>
                      <div className="rounded-lg overflow-hidden border border-gray-200 aspect-video">
                        <img src={capturedFrame} alt="Snapshot" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                  {formData.continuous && (
                    <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                      <AlertTriangle className="h-3.5 w-3.5" />Marked as continuous defect
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between flex-shrink-0">
              <Button variant="ghost" size="sm" onClick={step === 0 ? onClose : () => setStep(s => s - 1)} className="text-xs">
                {step === 0 ? 'Cancel' : 'Back'}
              </Button>
              {step < STEPS.length - 1 ? (
                <Button size="sm" onClick={() => goToStep(step + 1)} className={`text-xs ${t.primary} text-white`}>
                  Next <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              ) : (
                <Button size="sm" onClick={handleSave} disabled={saving} className="text-xs bg-green-600 hover:bg-green-700 text-white">
                  <Save className="h-3 w-3 mr-1.5" />{saving ? 'Saving...' : 'Save Observation'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

function Field({ label, icon: Icon, error, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium flex items-center gap-1 text-gray-700">
        {Icon && <Icon className="h-3 w-3 text-gray-400" />} {label}
      </Label>
      {children}
      {error && <p className="text-[10px] text-red-500">{error}</p>}
    </div>
  );
}

function ReviewField({ label, value, badge, severity }) {
  if (!value) return <div><p className="text-[10px] font-medium text-gray-400 uppercase">{label}</p><p className="text-sm text-gray-300">—</p></div>;
  const sc = { high: 'bg-red-100 text-red-700', medium: 'bg-amber-100 text-amber-700', low: 'bg-green-100 text-green-700' };
  return (
    <div>
      <p className="text-[10px] font-medium text-gray-400 uppercase">{label}</p>
      {badge ? <Badge className="bg-blue-100 text-blue-700 text-xs">{value}</Badge>
       : severity ? <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${sc[value] || ''}`}>{value}</span>
       : <p className="text-sm text-gray-700 font-medium">{value}</p>}
    </div>
  );
}

/** Visual clock face picker for pipe cross-section position */
function ClockPicker({ value, onChange, theme: t }) {
  const positions = [
    { label: '12', value: '12:00', angle: 0 },
    { label: '1', value: '1:00', angle: 30 },
    { label: '2', value: '2:00', angle: 60 },
    { label: '3', value: '3:00', angle: 90 },
    { label: '4', value: '4:00', angle: 120 },
    { label: '5', value: '5:00', angle: 150 },
    { label: '6', value: '6:00', angle: 180 },
    { label: '7', value: '7:00', angle: 210 },
    { label: '8', value: '8:00', angle: 240 },
    { label: '9', value: '9:00', angle: 270 },
    { label: '10', value: '10:00', angle: 300 },
    { label: '11', value: '11:00', angle: 330 },
  ];

  const ranges = [
    { label: '12-3', value: '12:00-3:00' },
    { label: '3-6', value: '3:00-6:00' },
    { label: '6-9', value: '6:00-9:00' },
    { label: '9-12', value: '9:00-12:00' },
    { label: 'All', value: 'All Around' },
  ];

  const radius = 72;
  const center = 90;

  return (
    <div className="flex items-start gap-4">
      {/* Clock face */}
      <div className="relative flex-shrink-0" style={{ width: 180, height: 180 }}>
        {/* Pipe circle background */}
        <svg width="180" height="180" className="absolute inset-0">
          <circle cx={center} cy={center} r={radius + 8} fill="none" stroke="#e5e7eb" strokeWidth="2" />
          <circle cx={center} cy={center} r={radius - 18} fill="none" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4 4" />
          {/* Cross lines */}
          <line x1={center} y1={center - radius + 18} x2={center} y2={center + radius - 18} stroke="#f3f4f6" strokeWidth="1" />
          <line x1={center - radius + 18} y1={center} x2={center + radius - 18} y2={center} stroke="#f3f4f6" strokeWidth="1" />
        </svg>

        {/* Clock hour buttons */}
        {positions.map((pos) => {
          const rad = (pos.angle - 90) * (Math.PI / 180);
          const x = center + radius * Math.cos(rad) - 14;
          const y = center + radius * Math.sin(rad) - 14;
          const isSelected = value === pos.value;

          return (
            <button
              key={pos.value}
              type="button"
              onClick={() => onChange(value === pos.value ? '' : pos.value)}
              className={`absolute w-7 h-7 rounded-full text-[11px] font-bold transition-all duration-150 flex items-center justify-center ${
                isSelected
                  ? `${t.activeBg} text-white shadow-md scale-110`
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400 hover:shadow-sm'
              }`}
              style={{ left: x, top: y }}
              title={pos.value}
            >
              {pos.label}
            </button>
          );
        })}

        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-[9px] font-medium text-gray-400 uppercase">Pipe</p>
            <p className="text-[10px] font-bold text-gray-600">{value || '—'}</p>
          </div>
        </div>
      </div>

      {/* Range buttons */}
      <div className="space-y-1.5 pt-1">
        <p className="text-[10px] font-medium text-gray-400 uppercase mb-1">Ranges</p>
        {ranges.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => onChange(value === r.value ? '' : r.value)}
            className={`block w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              value === r.value
                ? `${t.light} ${t.border} border`
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {r.label === 'All' ? 'All Around' : r.label}
          </button>
        ))}
        {value && (
          <button type="button" onClick={() => onChange('')}
            className="text-[10px] text-gray-400 hover:text-gray-600 mt-1 underline">
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

export default AddObservation;
