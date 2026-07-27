"use client" 

import React from 'react'
import UserProfilePage from './UserProfileComponent'
import { useAuthStore } from '@/store/authStore'

export default function ProfilePage() {
  const {user, logout} = useAuthStore();
  return (
    <div>
      {user && (
        <UserProfilePage
          user={user}
          onLogout={logout}
      />
      )}
    </div>
  )
}
