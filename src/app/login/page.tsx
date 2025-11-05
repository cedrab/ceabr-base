'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      const session = data.session

      if (session?.user) {
        // ✅ Redirige vers le dashboard si connecté
        router.replace('/dashboard')
      } else {
        setLoading(false)
      }
    }

    checkSession()

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          router.replace('/dashboard')
        }
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [router])

  const sendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'http://localhost:3000/login',
      },
    })
    if (error) setError(error.message)
    else setSent(true)
  }

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center text-white">
        <p>Chargement...</p>
      </div>
    )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded-xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4 text-center">Connexion 🔐</h1>

        {sent ? (
          <p className="text-green-400 text-center">
            📩 Vérifie ta boîte mail pour ton lien magique.
          </p>
        ) : (
          <form onSubmit={sendMagicLink} className="space-y-4">
            <input
              type="email"
              placeholder="ton@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border p-2 rounded-md text-black"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md"
            >
              Recevoir le lien magique
            </button>
          </form>
        )}

        {error && <p className="text-red-500 mt-3 text-center">{error}</p>}
      </div>
    </div>
  )
}
