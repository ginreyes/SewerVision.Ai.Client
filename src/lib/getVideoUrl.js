const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export function getVideoUrl(videoPath) {
  if (!videoPath) return '';

  if (videoPath.startsWith('/api/videos/')) {
    return `${API}${videoPath}`;
  }

  return `${API}/api/videos/${videoPath}`;
}
