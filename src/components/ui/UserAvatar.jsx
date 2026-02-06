"use client";

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

/**
 * UserAvatar - Enhanced avatar component with robust error handling
 * Automatically falls back to initials if image fails to load
 */
export function UserAvatar({ 
  src, 
  fallback, 
  className,
  size = 'md',
  ...props 
}) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Size variants
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  // Normalize avatar URL
  const getAvatarUrl = (url) => {
    if (!url || url === '/avatar_default.png' || imageError) {
      return null;
    }
    
    return url;
  };

  const avatarUrl = getAvatarUrl(src);

  const handleError = () => {
    console.log('[UserAvatar] Failed to load:', src);
    setImageError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    console.log('[UserAvatar] Successfully loaded:', src);
    setImageError(false);
    setIsLoading(false);
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className || ''}`} {...props}>
      {avatarUrl && !imageError && (
        <AvatarImage 
          src={avatarUrl} 
          alt={fallback || 'User avatar'}
          referrerPolicy="no-referrer"
          onError={handleError}
          onLoad={handleLoad}
        />
      )}
      <AvatarFallback className="bg-gradient-to-br from-rose-400 to-pink-500 text-white font-semibold">
        {fallback || '?'}
      </AvatarFallback>
    </Avatar>
  );
}

export default UserAvatar;