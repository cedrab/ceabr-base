'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

type Subscription = {
  app_name: string
  plan_name: string
  status: string
  current_period_end: string
}

export default function BillingPage() {
  const [user, setUser] = useState<any>(null)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // 🔐 Vérifie l’utilisateur
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

  // 📦 Récupère les abonnements liés à l’utilisateur
  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!user) return
      setLoading(true)
      const { data, error } = await supabase
        .from('billing')
        .select('app_name, plan_name, status, current_period_end')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) console.error('Erreur récupération billing:', error)
      else setSubscriptions(data || [])
      setLoading(false)
    }

    fetchSubscriptions()
  }, [user])

  // 🔗 Ouvre le Customer Portal Stripe
  const handleOpenPortal = async (app_name: string) => {
    const res = await fetch('/api/stripe/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, app_name }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else alert('Erreur lors de l’ouverture du portail Stripe.')
  }

  if (!user)
    return <p className="text-white p-10 text-center">Chargement...</p>

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10 px-6">
      <h1 className="text-3xl font-bold mb-6">�� Gestion de la facturation</h1>
      <p className="text-gray-300 mb-10 text-center max-w-2xl">
        Consulte tes abonnements actifs et gère tes paiements via Stripe.
      </p>

      {loading ? (
        <p className="text-gray-400">Chargement des abonnements...</p>
      ) : subscriptions.length === 0 ? (
        <p className="text-gray-500">Aucun abonnement trouvé.</p>
      ) : (
        <div className="w-full max-w-2xl space-y-4">
          {subscriptions.map((sub) => (
            <div
              key={sub.app_name}
              className="border border-gray-700 bg-gray-800 rounded-lg p-4 flex flex-col md:flex-row justify-between items-center"
            >
              <div className="flex flex-col text-center md:text-left">
                <h2 className="text-lg font-semibold capitalize">
                  {sub.app_name}
                </h2>
                <p className="text-gray-300">
                  Plan : {sub.plan_name} ({sub.status})
                </p>
                {sub.current_period_end && (
                  <p className="text-gray-400 text-sm">
                    Fin de période :{' '}
                    {new Date(sub.current_period_end).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleOpenPortal(sub.app_name)}
                className="mt-3 md:mt-0 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Gérer sur Stripe
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => router.push('/dashboard')}
        className="mt-10 bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-md"
      >
        ← Retour au Dashboard
      </button>
    </div>
  )
}
