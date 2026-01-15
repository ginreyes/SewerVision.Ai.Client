"use client";

import RoboflowVideoStream from "@/components/RoboflowVideoStream";

export default function RoboflowTestPage() {
  const handleComplete = (detections) => {
    console.log("Video processing complete!", detections);
    alert(`Processing complete! Found ${detections.length} detections.`);
  };

  const handleDetections = (predictions) => {
    console.log("New detections:", predictions);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Roboflow Video Streaming Test</h1>
      <RoboflowVideoStream 
        onComplete={handleComplete}
        onDetections={handleDetections}
      />
    </div>
  );
}



