'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  const navLinks = [
    { href: '/dashboard', label: 'Accueil' },
    { href: '/pricing', label: 'Plans' },
    { href: '/billing', label: 'Facturation' },
  ]

  return (
    <nav className="w-full bg-gray-900 text-white border-b border-gray-800 py-3 px-6 flex justify-between items-center">
      {/* 👋 Bienvenue à gauche */}
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold text-blue-400">👋 Bienvenue</span>
        <span className="text-gray-300">{user ? user.user_metadata?.username || 'Utilisateur' : 'Invité'}</span>
      </div>

      {/* 🔗 Liens au centre */}
      <div className="hidden md:flex gap-6">
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`transition-colors duration-200 ${
              pathname === href
                ? 'text-blue-400 font-semibold'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* ⚙️ Profil / Déconnexion à droite */}
      <div className="flex flex-col items-end gap-1">
        {user ? (
          <>
            <button
              onClick={() => router.push('/profile')}
              className="text-gray-300 hover:text-white text-sm"
            >
              Voir mon profil
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
            >
              Déconnexion
            </button>

            {/* 📧 Email affiché en dessous */}
            <p className="text-gray-400 text-xs mt-1">{user.email}</p>
          </>
        ) : (
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
          >
            Connexion
          </Link>
        )}
      </div>
    </nav>
  )
}
