"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Star, Send, CheckCircle2, AlertCircle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSurveyInvite, useRespondToSurvey } from "@/hooks/useQueryHooks";

function StarSelector({ rating, setRating }) {
  return (
    <div className="flex items-center gap-2 justify-center">
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} onClick={() => setRating(star)}
          className="transition-transform hover:scale-110 focus:outline-none">
          <Star
            className={`w-10 h-10 transition-colors ${star <= rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
          />
        </button>
      ))}
    </div>
  );
}

const LABELS = { 1: "Terrible", 2: "Poor", 3: "Okay", 4: "Good", 5: "Excellent" };

export default function SurveyPage() {
  const params = useParams();
  const token = params?.token;

  const { data: invite, isLoading, error, isError } = useSurveyInvite(token);
  const respondMutation = useRespondToSurvey();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (rating === 0) return;
    respondMutation.mutate(
      { token, rating, comment },
      { onSuccess: () => setSubmitted(true) }
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  // Error states
  if (isError || !invite) {
    const msg = error?.message || "Survey not found";
    const isExpired = msg.includes("expired");
    const isCompleted = msg.includes("already been completed");
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          {isCompleted ? (
            <>
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-gray-900 mb-2">Already Submitted</h1>
              <p className="text-gray-500">Thank you — your feedback has already been recorded.</p>
            </>
          ) : isExpired ? (
            <>
              <Clock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-gray-900 mb-2">Survey Expired</h1>
              <p className="text-gray-500">This survey link has expired. Please contact support if you'd like to provide feedback.</p>
            </>
          ) : (
            <>
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-gray-900 mb-2">Survey Not Found</h1>
              <p className="text-gray-500">{msg}</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Submitted state
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-500 mb-4">Your feedback helps us improve our service for everyone.</p>
          <div className="flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} className={`w-6 h-6 ${s <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
            ))}
          </div>
          <p className="text-sm text-gray-400 mt-2">You rated {LABELS[rating] || rating} stars</p>
        </div>
      </div>
    );
  }

  // Survey form
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-t-2xl px-8 py-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-1">How was your experience?</h1>
          <p className="text-teal-100 text-sm">We'd love to hear your feedback</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-b-2xl shadow-lg px-8 py-8 space-y-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Hi <strong className="text-gray-900">{invite.customerName}</strong>,</p>
            <p className="text-sm text-gray-500">
              Your ticket <strong className="text-teal-700">"{invite.ticketSubject}"</strong> has been resolved. Please rate your experience:
            </p>
          </div>

          {/* Star rating */}
          <div className="py-4">
            <StarSelector rating={rating} setRating={setRating} />
            {rating > 0 && (
              <p className="text-center text-sm text-gray-500 mt-2 font-medium">
                {LABELS[rating]}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Additional feedback (optional)</label>
            <Textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Tell us more about your experience…"
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || respondMutation.isPending}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white h-12 text-base font-semibold"
          >
            {respondMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {respondMutation.isPending ? "Submitting…" : "Submit Feedback"}
          </Button>

          {respondMutation.isError && (
            <p className="text-sm text-red-500 text-center">{respondMutation.error?.message || "Failed to submit"}</p>
          )}

          <p className="text-xs text-gray-400 text-center">
            Powered by SewerVision.ai — Your response is confidential
          </p>
        </div>
      </div>
    </div>
  );
}
