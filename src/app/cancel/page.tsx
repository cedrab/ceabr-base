'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CancelPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/pricing')
    }, 4000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center">
      <div className="bg-red-800 border border-red-600 rounded-xl p-8 shadow-md max-w-md">
        <h1 className="text-3xl font-bold mb-4">❌ Paiement annulé</h1>
        <p className="text-gray-200 mb-4">
          Aucun paiement n’a été effectué.<br />
          Tu peux réessayer à tout moment.
        </p>
        <p className="text-gray-400 text-sm">
          Redirection vers la page des tarifs dans quelques secondes...
        </p>
      </div>
      <button
        onClick={() => router.push('/pricing')}
        className="mt-6 bg-red-600 hover:bg-red-700 px-6 py-2 rounded-md text-white"
      >
        Retour aux plans →
      </button>
    </div>
  )
}
