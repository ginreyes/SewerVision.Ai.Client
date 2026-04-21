'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, MessageSquare, Loader2, Check } from 'lucide-react';
import { useCreateFeedback } from '@/data/pipelineApi';
import { useAlert } from '@/components/providers/AlertProvider';

const FeedbackWidget = ({ projectId, detectionId, customerId, existingFeedback }) => {
  const { showAlert } = useAlert();
  const feedbackMutation = useCreateFeedback();
  const [submitted, setSubmitted] = useState(!!existingFeedback);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedRating, setSelectedRating] = useState(existingFeedback?.rating || null);

  const handleSubmit = (rating) => {
    setSelectedRating(rating);
    feedbackMutation.mutate(
      { projectId, detectionId, customerId, rating, comment: comment.trim() || undefined },
      {
        onSuccess: (res) => {
          if (res?.ok) {
            setSubmitted(true);
            setShowComment(false);
            showAlert('Thank you for your feedback!', 'success');
          } else {
            showAlert('Failed to submit feedback', 'error');
          }
        },
        onError: () => showAlert('Failed to submit feedback', 'error'),
      }
    );
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 py-1">
        <Check className="w-3.5 h-3.5 text-teal-600" />
        <span className="text-xs text-teal-700 font-medium">Feedback submitted</span>
        {selectedRating && (
          selectedRating === 'up'
            ? <ThumbsUp className="w-3 h-3 text-emerald-500" />
            : <ThumbsDown className="w-3 h-3 text-red-400" />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500">Do you agree with this finding?</p>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className={`h-7 text-xs gap-1 ${selectedRating === 'up' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : ''}`}
          onClick={() => handleSubmit('up')}
          disabled={feedbackMutation.isPending}
        >
          {feedbackMutation.isPending && selectedRating === 'up' ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <ThumbsUp className="w-3 h-3" />
          )}
          Agree
        </Button>
        <Button
          size="sm"
          variant="outline"
          className={`h-7 text-xs gap-1 ${selectedRating === 'down' ? 'bg-red-50 border-red-300 text-red-700' : ''}`}
          onClick={() => { setSelectedRating('down'); setShowComment(true); }}
          disabled={feedbackMutation.isPending}
        >
          <ThumbsDown className="w-3 h-3" /> Disagree
        </Button>
        {!showComment && (
          <button
            className="text-xs text-gray-400 hover:text-teal-600 transition-colors ml-1"
            onClick={() => setShowComment(true)}
          >
            <MessageSquare className="w-3 h-3 inline mr-0.5" /> Comment
          </button>
        )}
      </div>
      {showComment && (
        <div className="flex gap-2">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment (optional)..."
            className="flex-1 h-7 text-xs border border-gray-200 rounded-md px-2 focus:outline-none focus:ring-1 focus:ring-teal-400"
            maxLength={500}
          />
          <Button
            size="sm"
            className="h-7 text-xs bg-teal-600 hover:bg-teal-700 text-white"
            onClick={() => handleSubmit('down')}
            disabled={feedbackMutation.isPending}
          >
            {feedbackMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Submit'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FeedbackWidget;
