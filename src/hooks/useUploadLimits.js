import { useState, useEffect } from 'react';
import { api } from '@/lib/helper';

const DEFAULT_LIMITS = {
  videoMaxMB: 500,
  imageMaxMB: 100,
  documentMaxMB: 100,
  chatAttachmentMaxMB: 100,
};

let cachedLimits = null;

export function useUploadLimits() {
  const [limits, setLimits] = useState(cachedLimits || DEFAULT_LIMITS);

  useEffect(() => {
    if (cachedLimits) return;

    let cancelled = false;
    (async () => {
      try {
        const { ok, data } = await api('/api/settings', 'GET');
        if (!cancelled && ok) {
          const ul = data?.data?.systemAdmin?.uploadLimits || data?.systemAdmin?.uploadLimits;
          if (ul) {
            const resolved = {
              videoMaxMB: Number(ul.videoMaxMB) || DEFAULT_LIMITS.videoMaxMB,
              imageMaxMB: Number(ul.imageMaxMB) || DEFAULT_LIMITS.imageMaxMB,
              documentMaxMB: Number(ul.documentMaxMB) || DEFAULT_LIMITS.documentMaxMB,
              chatAttachmentMaxMB: Number(ul.chatAttachmentMaxMB) || DEFAULT_LIMITS.chatAttachmentMaxMB,
            };
            cachedLimits = resolved;
            setLimits(resolved);
          }
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  return limits;
}

export default useUploadLimits;
