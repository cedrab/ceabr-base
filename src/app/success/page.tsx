'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SuccessPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 4000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center">
      <div className="bg-green-800 border border-green-600 rounded-xl p-8 shadow-md max-w-md">
        <h1 className="text-3xl font-bold mb-4">🎉 Paiement réussi !</h1>
        <p className="text-gray-200 mb-4">
          Merci pour ton abonnement 💪<br />
          Ton compte a été mis à jour automatiquement.
        </p>
        <p className="text-gray-400 text-sm">
          Redirection vers ton tableau de bord dans quelques secondes...
        </p>
      </div>
      <button
        onClick={() => router.push('/dashboard')}
        className="mt-6 bg-green-600 hover:bg-green-700 px-6 py-2 rounded-md text-white"
      >
        Aller au dashboard →
      </button>
    </div>
  )
}
