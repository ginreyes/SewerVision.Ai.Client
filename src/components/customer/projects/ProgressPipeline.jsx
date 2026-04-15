'use client';

import React from 'react';
import { PipelineProgressBar } from '@/components/shared/ProjectPipeline';

const ProgressPipeline = ({ currentStatus, size = 'md' }) => {
  return (
    <PipelineProgressBar
      currentStatus={currentStatus}
      size={size}
      customerFriendly={true}
      showLabels={size !== 'sm'}
    />
  );
};

export default ProgressPipeline;
