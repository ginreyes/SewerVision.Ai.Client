import React from 'react'
import { useParams } from 'next/navigation'
const ProfilePage = () => {
    const { user_id } = userParams()

  return (
    <div>User</div>
  )
}

export default ProfilePage