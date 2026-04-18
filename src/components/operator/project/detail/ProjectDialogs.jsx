import React from 'react';
import AddObservation from '../AddObersavation';
import ObservationDetailPanel from '@/components/shared/ObservationDetailPanel';
import {
  AddCustomMetadataDialog,
  EditMetadataDialog,
  DeleteVideoDialog,
  UploadProgressDialog,
} from '@/components/shared/project-dialogs';
import { AiProcessingModal } from '@/components/project/AiProcessingModal';
import { ReprocessModal } from '@/components/project/ReprocessModal';

const ProjectDialogs = ({
  // AddObservation
  isObservationOpen,
  isObservationClose,
  project,
  user_id,
  pacpCodes,
  displaySnapshots,
  videoRef,
  currentTime,
  // AddCustomMetadataDialog
  isAddMetadataOpen,
  setIsAddMetadataOpen,
  newMetadataKey,
  setNewMetadataKey,
  newMetadataValue,
  setNewMetadataValue,
  handleAddMetadata,
  // EditMetadataDialog
  isEditMetadataOpen,
  setIsEditMetadataOpen,
  editingMetadata,
  setEditingMetadata,
  handleEditMetadata,
  // DeleteVideoDialog
  isDeleteVideoOpen,
  setIsDeleteVideoOpen,
  videoToDelete,
  setVideoToDelete,
  handleDeleteVideo,
  deletingVideo,
  // UploadProgressDialog
  isUploading,
  uploadProgress,
  // ReprocessModal (confirm)
  isReprocessConfirmOpen,
  setIsReprocessConfirmOpen,
  startReprocessFlow,
  // ReprocessModal (reset)
  isResetConfirmOpen,
  setIsResetConfirmOpen,
  handleResetAIData,
  // AiProcessingModal
  isAiInfoOpen,
  setIsAiInfoOpen,
  selectedVideo,
  // ObservationDetailPanel
  detailObs,
  setDetailObs,
  refetchObservations,
  setIsPlaying,
}) => {
  return (
    <>
      <AddObservation
        isOpen={isObservationOpen}
        onClose={isObservationClose}
        project_id={project._id}
        user_id={user_id}
        pacpCodes={pacpCodes}
        snapshots={displaySnapshots}
        videoRef={videoRef}
        currentTime={currentTime}
        currentDistance={project?.distance || "0.00"}
        theme="blue"
      />

      <AddCustomMetadataDialog
        open={isAddMetadataOpen}
        onOpenChange={setIsAddMetadataOpen}
        keyValue={newMetadataKey}
        setKeyValue={setNewMetadataKey}
        value={newMetadataValue}
        setValue={setNewMetadataValue}
        onSubmit={handleAddMetadata}
        accent="blue"
      />

      <EditMetadataDialog
        open={isEditMetadataOpen}
        onOpenChange={setIsEditMetadataOpen}
        metadata={editingMetadata}
        setMetadata={setEditingMetadata}
        onSubmit={handleEditMetadata}
        accent="blue"
      />

      <DeleteVideoDialog
        open={isDeleteVideoOpen}
        onOpenChange={setIsDeleteVideoOpen}
        video={videoToDelete}
        onConfirm={handleDeleteVideo}
        onCancel={() => setVideoToDelete(null)}
        loading={deletingVideo}
      />

      <UploadProgressDialog open={isUploading} progress={uploadProgress} accent="blue" />

      <ReprocessModal
        open={isReprocessConfirmOpen}
        onOpenChange={setIsReprocessConfirmOpen}
        onConfirm={startReprocessFlow}
        description="Reprocessing will send this project's video back through the AI pipeline. This can take several minutes depending on video length and system load, but you can safely continue working while it runs."
        bullets={[
          'Existing AI detections may be updated with the latest model.',
          'New detections can appear if the model finds additional issues.',
          'Project status will reflect active AI processing.',
        ]}
      />

      <ReprocessModal open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen} onConfirm={handleResetAIData}
        title="Reset All AI Data?" description="This will permanently delete all AI-generated data for this project."
        bullets={['All AI detections deleted', 'All AI observations removed', 'All AI snapshots cleared', 'Project resets to "Planning"', 'Manual observations preserved']}
        confirmLabel="Yes, reset all AI data" confirmClassName="bg-orange-600 hover:bg-orange-700 text-white" />

      <AiProcessingModal
        open={isAiInfoOpen}
        onOpenChange={setIsAiInfoOpen}
        project={project}
        selectedVideo={selectedVideo}
        logPanelHeight="min-h-[420px] md:min-h-[480px]"
      />

      <ObservationDetailPanel
        open={!!detailObs}
        onOpenChange={(open) => { if (!open) setDetailObs(null); }}
        observation={detailObs}
        projectId={project?._id}
        videoRef={videoRef}
        onDelete={() => { refetchObservations(); setDetailObs(null); }}
        onUpdate={() => { refetchObservations(); }}
        onGoToTime={(obs) => { if (!videoRef.current || !obs?.time) return; const pts = String(obs.time).split(':').map((p) => parseInt(p, 10) || 0); videoRef.current.currentTime = pts[0] * 3600 + pts[1] * 60 + pts[2]; setIsPlaying(true); videoRef.current.play().catch(() => {}); }}
      />
    </>
  );
};

export default ProjectDialogs;
