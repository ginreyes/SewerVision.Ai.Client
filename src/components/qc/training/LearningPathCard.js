"use client";

import { Award, Lock, CheckCircle, Play, Clock, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const DIFF = { beginner: "bg-emerald-100 text-emerald-700", intermediate: "bg-amber-100 text-amber-700", advanced: "bg-red-100 text-red-700" };
const PATH_IMAGE = '/training_pictures/certificate_achievementr.jpg';

export default function LearningPathCard({ path, progress, onEnroll, onContinue, onViewCertificate }) {
  const modules = path?.modules || [];
  const modProgress = progress?.moduleProgress || [];
  const completed = modProgress.filter(m => m.status === "completed").length;
  const total = modules.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isCompleted = progress?.status === "completed";
  const isEnrolled = !!progress;

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden hover:shadow-xl transition-all group ${isCompleted ? "border-emerald-200" : "border-gray-100 hover:border-amber-200"}`}>
      {/* Cover Image */}
      <div className="relative h-32 overflow-hidden">
        <img src={PATH_IMAGE} alt={path.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold backdrop-blur-sm border ${
            path.difficulty === 'advanced' ? 'bg-red-500/80 text-white border-red-400/50' :
            path.difficulty === 'intermediate' ? 'bg-amber-500/80 text-white border-amber-400/50' :
            'bg-emerald-500/80 text-white border-emerald-400/50'
          }`}>{path.difficulty}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/20 flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5" /> {path.estimatedHours}h
          </span>
        </div>
        {isCompleted && (
          <div className="absolute top-3 right-3">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/80 text-white backdrop-blur-sm border border-emerald-400/50 font-medium flex items-center gap-0.5">
              <CheckCircle className="w-2.5 h-2.5" /> Completed
            </span>
          </div>
        )}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-sm font-bold text-white truncate drop-shadow-md">{path.title}</h3>
        </div>
      </div>

      <div className="p-4">
        {path.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{path.description}</p>}

        {isCompleted && path.certificateEnabled && (
          <button onClick={() => onViewCertificate?.(path, progress)} className="text-[10px] font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md mb-3 flex items-center gap-1">
            <Award className="w-3 h-3" /> View Certificate
          </button>
        )}

      {/* Progress dots */}
      <div className="flex items-center gap-1 mb-3">
        {modules.map((mod, i) => {
          const mp = modProgress[i];
          const status = mp?.status || "locked";
          return (
            <div key={i} className="flex items-center flex-1">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                status === "completed" ? "bg-emerald-500" :
                status === "available" || status === "in-progress" ? "bg-red-600" :
                "bg-gray-200"
              }`}>
                {status === "completed" ? <CheckCircle className="w-3 h-3 text-white" /> :
                 status === "locked" ? <Lock className="w-2.5 h-2.5 text-gray-400" /> :
                 <Play className="w-2.5 h-2.5 text-white" />}
              </div>
              {i < modules.length - 1 && (
                <div className={`flex-1 h-0.5 mx-0.5 rounded ${status === "completed" ? "bg-emerald-400" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Stats + Action */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          <span className="font-semibold text-gray-700">{completed}</span> of {total} modules {isCompleted && <span className="text-emerald-600 font-medium ml-1">Completed!</span>}
        </div>
        {!isEnrolled ? (
          <Button size="sm" className="h-8 text-xs bg-red-700 hover:bg-red-800 text-white" onClick={() => onEnroll?.(path)}>
            Enroll <ChevronRight className="w-3 h-3 ml-0.5" />
          </Button>
        ) : !isCompleted ? (
          <Button size="sm" className="h-8 text-xs bg-red-700 hover:bg-red-800 text-white" onClick={() => onContinue?.(path, progress)}>
            Continue <ChevronRight className="w-3 h-3 ml-0.5" />
          </Button>
        ) : null}
      </div>

      {/* Progress bar */}
      {isEnrolled && !isCompleted && (
        <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-red-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      )}
      </div>
    </div>
  );
}
