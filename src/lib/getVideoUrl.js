import { BACKEND_URL } from './config';

/**
 * Asset URL helpers — construct full URLs for browser-rendered resources
 * (images, videos, snapshots, avatars). These are NOT API calls — they're
 * <img src>, <video src>, window.open targets that need the full server URL.
 *
 * For actual API requests, always use `api()` from `@/lib/helper` instead.
 */

/** Video streaming URL */
export function getVideoUrl(videoPath) {
  if (!videoPath) return '';
  if (videoPath.startsWith('http')) return videoPath;
  if (videoPath.startsWith('/api/videos/')) return `${BACKEND_URL}${videoPath}`;
  return `${BACKEND_URL}/api/videos/${videoPath}`;
}

/** AI detection snapshot image URL */
export function getSnapshotUrl(snapshotPath) {
  if (!snapshotPath) return '';
  if (snapshotPath.startsWith('http')) return snapshotPath;
  return `${BACKEND_URL}/api/videos/snapshot/${snapshotPath}`;
}

/** User avatar URL with fallback to initials */
export function getAvatarUrl(userId, avatarPath) {
  if (!avatarPath) return '';
  if (avatarPath.startsWith('http')) return avatarPath;
  return `${BACKEND_URL}/api/users/avatar/${userId}`;
}

/** Generic asset URL — prepends BACKEND_URL to any relative path */
export function getAssetUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}
