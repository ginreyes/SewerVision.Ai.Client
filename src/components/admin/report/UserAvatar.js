import React from 'react'
import { getInitials, getAvatarColor, avatarSrc } from '@/components/admin/constants'

const UserAvatar = ({ user, size = 'md', showRole = false }) => {
  if (!user) return null
  const initials = getInitials(user.first_name, user.last_name, user.username, user.email)
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || user.email || ''
  const color = user._avatarOverrideColor || getAvatarColor(name)
  const sizeClass = size === 'sm' ? 'w-7 h-7 text-xs' : size === 'lg' ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs'
  const src = avatarSrc(user)

  const handleImgError = (e) => {
    e.target.style.display = 'none'
    const fallback = e.target.nextElementSibling
    if (fallback) fallback.classList.remove('hidden')
  }
  if (showRole) {
    return (
      <div className="flex items-center gap-2">
        <div className={`${sizeClass} ${color} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ring-2 ring-white shadow-sm overflow-hidden relative`}>
          {src ? (
            <>
              <img src={src} alt={name} className="w-full h-full rounded-full object-cover absolute inset-0" onError={handleImgError} />
              <span className="hidden">{initials}</span>
            </>
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{name || '\u2014'}</p>
          {user.role && <p className="text-xs text-gray-400 capitalize truncate">{user.role}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className={`${sizeClass} ${color} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ring-2 ring-white shadow-sm overflow-hidden relative`} title={name}>
      {src ? (
        <>
          <img src={src} alt={name} className="w-full h-full rounded-full object-cover absolute inset-0" onError={handleImgError} />
          <span className="hidden">{initials}</span>
        </>
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}

export default UserAvatar
