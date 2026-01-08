"use client";

import { useRef, useState } from "react";
import { connectors, webrtc } from "@roboflow/inference-sdk";

export default function RoboflowVideoStream({ onComplete, onDetections }) {
  const connectionRef = useRef(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(null);
  const [error, setError] = useState(null);
  const [detections, setDetections] = useState([]);

  async function processFile(file) {
    if (!file) return;

    setProcessing(true);
    setFrameCount(0);
    setError(null);
    setDetections([]);
    setCurrentFrame(null);

    try {
      // Use backend proxy to keep API key secure
      const connector = connectors.withProxyUrl("/api/init-webrtc");

      const VIDEO_OUTPUT = "visualization";
      connectionRef.current = await webrtc.useVideoFile({
        file,
        connector,
        wrtcParams: {
          workspaceName: "sewervisionai",
          workflowId: "detectvideoclassify",
          streamOutputNames: [],
          dataOutputNames: [VIDEO_OUTPUT, "predictions"].filter((v, i, a) => a.indexOf(v) === i),
          processingTimeout: 600,
          requestedPlan: "webrtc-gpu-medium", // Options: webrtc-gpu-small, webrtc-gpu-medium, webrtc-gpu-large
          requestedRegion: "us", // Options: us, eu, ap
          realtimeProcessing: false,
        },
        onData: (data) => {
          setFrameCount((n) => n + 1);
          
          // Get visualization frame
          const viz = data.serialized_output_data?.[VIDEO_OUTPUT];
          if (viz?.value) {
            setCurrentFrame(`data:image/jpeg;base64,${viz.value}`);
          }

          // Get predictions
          const predictions = data.serialized_output_data?.predictions || data.predictions || [];
          if (predictions.length > 0) {
            setDetections((prev) => [...prev, ...predictions]);
            if (onDetections) {
              onDetections(predictions);
            }
          }
        },
        onUploadProgress: (sent, total) => {
          const progressPercent = Math.round((sent / total) * 100);
          setProgress(progressPercent);
        },
        onComplete: () => {
          setProcessing(false);
          if (onComplete) {
            onComplete(detections);
          }
        },
        onError: (err) => {
          console.error("WebRTC processing error:", err);
          setError(err.message || "Failed to process video");
          setProcessing(false);
        },
      });
    } catch (err) {
      console.error("Error starting video processing:", err);
      setError(err.message || "Failed to start video processing");
      setProcessing(false);
    }
  }

  function stopProcessing() {
    if (connectionRef.current) {
      // Close WebRTC connection if needed
      connectionRef.current = null;
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4 bg-white">
        <h3 className="text-lg font-semibold mb-4">Roboflow Video Processing</h3>
        
        {/* Video Preview */}
        <div className="mb-4">
          {currentFrame ? (
            <img 
              src={currentFrame} 
              alt="Processed Frame" 
              className="w-full max-w-2xl rounded-lg border"
            />
          ) : (
            <div 
              className="w-full max-w-2xl h-64 bg-gray-900 rounded-lg border flex items-center justify-center text-gray-400"
            >
              {processing ? "Processing..." : "No frame to display"}
            </div>
          )}
        </div>

        {/* File Input */}
        <div className="mb-4">
          <input
            type="file"
            accept="video/*"
            onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
            disabled={processing}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
        </div>

        {/* Progress and Status */}
        {processing && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Upload Progress: {progress}%</span>
              <span className="text-sm text-gray-600">Frames Processed: {frameCount}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <button
              onClick={stopProcessing}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Stop Processing
            </button>
          </div>
        )}

        {/* Completion Status */}
        {!processing && frameCount > 0 && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-green-800 font-medium">
              ✓ Processed {frameCount} frames
            </p>
            {detections.length > 0 && (
              <p className="text-green-700 text-sm mt-1">
                Found {detections.length} detections
              </p>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-800 font-medium">Error:</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Detections Summary */}
        {detections.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Detections ({detections.length}):</h4>
            <div className="max-h-40 overflow-y-auto text-sm">
              {detections.slice(0, 10).map((det, idx) => (
                <div key={idx} className="py-1 border-b">
                  <span className="font-medium">{det.class || det.class_name || "Unknown"}</span>
                  {" "}
                  <span className="text-gray-600">
                    ({(det.confidence * 100).toFixed(1)}% confidence)
                  </span>
                </div>
              ))}
              {detections.length > 10 && (
                <p className="text-gray-500 text-xs mt-2">
                  ... and {detections.length - 10} more
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


