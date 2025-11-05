'use client'

import { supabase } from '@/lib/supabase-client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProtectedPage() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) setUser(user)
      else router.replace('/login')
    }
    getUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (!user)
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Chargement...
      </div>
    )

  return (
    <div className="text-center">
      <h2 className="text-xl mb-4">
        Bienvenue, <span className="font-semibold">{user.email}</span>
      </h2>
      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white font-semibold"
      >
        Se déconnecter
      </button>
    </div>
  )
}
