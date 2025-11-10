'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

export default function PricingPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.replace('/login')
      } else {
        setUser(data.user)
        setLoading(false)
      }
    }
    fetchUser()
  }, [router])

  const handleSubscribe = async (price_id: string) => {
    if (!user) return alert('Veuillez vous connecter pour continuer.')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          price_id,
          app_name: 'studyhero',
        }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert('Erreur lors de la création du paiement.')
    } catch (err) {
      console.error(err)
      alert('Erreur lors du paiement.')
    }
  }

  if (loading)
    return <p className="text-white p-10">Chargement...</p>

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10 px-6">
      <h1 className="text-4xl font-bold mb-8">Plans et Tarifs 💳</h1>
      <p className="text-gray-400 text-center max-w-lg mb-12">
        Choisissez un plan adapté à vos besoins. Vous pouvez changer ou annuler votre abonnement à tout moment depuis votre profil.
      </p>

      <div className="grid md:grid-cols-3 gap-6 w-full max-w-5xl">
        {/* 🆓 Plan Gratuit */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 flex flex-col items-center text-center">
          <h2 className="text-2xl font-semibold mb-2">Gratuit</h2>
          <p className="text-gray-400 mb-4">Commencez sans engagement</p>
          <p className="text-4xl font-bold mb-6">0€</p>
          <ul className="text-gray-300 space-y-2 mb-6">
            <li>✔️ Accès de base</li>
            <li>✔️ Limité à 3 résumés</li>
            <li>🚫 Pas de quiz illimités</li>
          </ul>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
          >
            Déjà inclus
          </button>
        </div>

        {/* 💼 Plan Pro */}
        <div className="bg-blue-700 border border-blue-600 rounded-xl p-6 flex flex-col items-center text-center shadow-lg shadow-blue-500/30">
          <h2 className="text-2xl font-semibold mb-2">Pro</h2>
          <p className="text-gray-200 mb-4">Idéal pour les étudiants réguliers</p>
          <p className="text-4xl font-bold mb-6">9,99€<span className="text-lg text-gray-300">/mois</span></p>
          <ul className="text-gray-100 space-y-2 mb-6">
            <li>✔️ Résumés illimités</li>
            <li>✔️ Quiz générés automatiquement</li>
            <li>✔️ Support prioritaire</li>
          </ul>
          <button
            onClick={() => handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO!)}
            className="bg-white text-blue-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-100 transition"
          >
            S'abonner
          </button>
        </div>

        {/* �� Plan Entreprise */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 flex flex-col items-center text-center">
          <h2 className="text-2xl font-semibold mb-2">Entreprise</h2>
          <p className="text-gray-400 mb-4">Pour les écoles ou équipes</p>
          <p className="text-4xl font-bold mb-6">Sur mesure</p>
          <ul className="text-gray-300 space-y-2 mb-6">
            <li>✔️ Accès multi-utilisateurs</li>
            <li>✔️ Intégration API</li>
            <li>✔️ Support dédié</li>
          </ul>
          <button
            onClick={() => alert('Contacte-nous à support@studyhero.app 💬')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Nous contacter
          </button>
        </div>
      </div>

      <button
        onClick={() => router.push('/dashboard')}
        className="mt-10 bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-md"
      >
        ← Retour au dashboard
      </button>
    </div>
  )
}
