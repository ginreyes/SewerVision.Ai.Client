"use client";

import React, { useState, useMemo, memo } from "react";
import { Eye, Code, Variable, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const AVAILABLE_VARIABLES = [
  { key: "customerName", label: "Customer Name" },
  { key: "projectName", label: "Project Name" },
  { key: "projectCode", label: "Project Code" },
  { key: "companyName", label: "Company Name" },
  { key: "link", label: "Action Link" },
  { key: "date", label: "Current Date" },
  { key: "operatorName", label: "Operator Name" },
  { key: "reportUrl", label: "Report URL" },
  { key: "ticketId", label: "Ticket ID" },
  { key: "surveyLink", label: "Survey Link" },
];

const CATEGORIES = ["system", "notification", "marketing", "custom"];

const TemplateEditor = memo(function TemplateEditor({ template, onSave, onCancel, saving }) {
  const [name, setName] = useState(template?.name || "");
  const [subject, setSubject] = useState(template?.subject || "");
  const [body, setBody] = useState(template?.body || getDefaultBody());
  const [category, setCategory] = useState(template?.category || "custom");
  const [showPreview, setShowPreview] = useState(false);

  // Live preview with sample data
  const preview = useMemo(() => {
    const sampleData = {
      customerName: "John Smith",
      projectName: "Main St Sewer Inspection",
      projectCode: "PRJ-0087",
      companyName: "SewerVision AI",
      link: "https://app.sewervision.ai",
      date: new Date().toLocaleDateString(),
      operatorName: "Alex Torres",
      reportUrl: "https://app.sewervision.ai/reports/123",
      ticketId: "TKT-0042",
      surveyLink: "https://app.sewervision.ai/survey/abc123",
    };
    let rendered = body;
    let renderedSubject = subject;
    for (const [key, value] of Object.entries(sampleData)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      rendered = rendered.replace(regex, value);
      renderedSubject = renderedSubject.replace(regex, value);
    }
    return { subject: renderedSubject, body: rendered };
  }, [body, subject]);

  // Detected variables
  const detectedVars = useMemo(() => {
    const matches = [...(body.matchAll(/\{\{(\w+)\}\}/g)), ...(subject.matchAll(/\{\{(\w+)\}\}/g))];
    return [...new Set(matches.map(m => m[1]))];
  }, [body, subject]);

  function insertVariable(varKey) {
    setBody(prev => prev + `{{${varKey}}}`);
  }

  function handleSave() {
    if (!name.trim() || !subject.trim() || !body.trim()) return;
    onSave({ name, subject, body, category, variables: detectedVars });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Template Name</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. welcome-email, survey-invite" className="h-9" />
        </div>
        <div>
          <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Subject Line</Label>
        <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Welcome to {{companyName}}, {{customerName}}!" className="h-9" />
      </div>

      {/* Variable insertion buttons */}
      <div>
        <Label className="text-xs font-semibold text-gray-700 mb-1.5 block flex items-center gap-1">
          <Variable className="w-3.5 h-3.5" />Insert Variable
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {AVAILABLE_VARIABLES.map(v => (
            <button key={v.key} onClick={() => insertVariable(v.key)}
              className="px-2 py-1 text-[10px] font-mono bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors">
              {`{{${v.key}}}`}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs: Editor / Preview */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
        <button onClick={() => setShowPreview(false)}
          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors ${!showPreview ? "bg-white border border-b-white border-gray-200 text-rose-700 -mb-px" : "text-gray-500 hover:text-gray-700"}`}>
          <Code className="w-3.5 h-3.5" />HTML Editor
        </button>
        <button onClick={() => setShowPreview(true)}
          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors ${showPreview ? "bg-white border border-b-white border-gray-200 text-rose-700 -mb-px" : "text-gray-500 hover:text-gray-700"}`}>
          <Eye className="w-3.5 h-3.5" />Live Preview
        </button>
      </div>

      {showPreview ? (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
            <p className="text-xs text-gray-500">Subject: <span className="font-medium text-gray-800">{preview.subject}</span></p>
          </div>
          <div className="p-4 bg-white min-h-[300px]" dangerouslySetInnerHTML={{ __html: preview.body }} />
        </div>
      ) : (
        <Textarea value={body} onChange={e => setBody(e.target.value)} rows={14}
          className="font-mono text-xs leading-relaxed" placeholder="<html>..." />
      )}

      {/* Detected variables */}
      {detectedVars.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-gray-400">Variables used:</span>
          {detectedVars.map(v => (
            <Badge key={v} variant="outline" className="text-[10px] font-mono bg-gray-50">{`{{${v}}}`}</Badge>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving || !name.trim() || !subject.trim()}
          className="bg-rose-600 hover:bg-rose-700 text-white">
          {template ? "Save Changes" : "Create Template"}
        </Button>
      </div>
    </div>
  );
});

function getDefaultBody() {
  return `<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #f43f5e, #ec4899); padding: 32px; border-radius: 16px 16px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">{{companyName}}</h1>
  </div>
  <div style="padding: 32px; background: white; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
    <p>Hello {{customerName}},</p>
    <p>Your message content goes here.</p>
    <a href="{{link}}" style="display: inline-block; padding: 12px 24px; background: #f43f5e; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Take Action</a>
    <p style="margin-top: 24px; color: #6b7280; font-size: 12px;">— The {{companyName}} Team</p>
  </div>
</div>`;
}

export default TemplateEditor;
