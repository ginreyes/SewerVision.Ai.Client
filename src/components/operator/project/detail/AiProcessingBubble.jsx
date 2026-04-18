import React from 'react';
import { Loader2 } from 'lucide-react';

const AiProcessingBubble = ({ showAiBubble, setIsAiInfoOpen }) => {
  if (!showAiBubble) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        type="button"
        onClick={() => setIsAiInfoOpen(true)}
        className="flex items-center gap-3 px-4 py-3 rounded-full bg-white shadow-lg border border-violet-100 hover:shadow-xl transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
          <Loader2 className="w-4 h-4 text-violet-600 animate-spin" />
        </div>
        <div className="text-left">
          <p className="text-xs font-semibold text-violet-700">AI processing in progress</p>
          <p className="text-[11px] text-gray-500">
            You can keep working while SewerVision.ai analyzes this project.
          </p>
        </div>
      </button>
    </div>
  );
};

export default AiProcessingBubble;
