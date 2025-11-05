'use client'

import { supabase } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.replace('/login')
      } else {
        setUser(data.user)
      }
    }
    fetchUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (!user) return <p className="text-white p-10">Chargement...</p>

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Bienvenue 👋</h1>
      <p>Email : {user.email}</p>

      <div className="flex gap-3 mt-4">
        <button
          onClick={() => router.push('/profile')}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
        >
          Voir mon profil
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  )
}
