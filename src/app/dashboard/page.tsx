'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) router.replace('/login')
      else setUser(data.user)
    }
    fetchUser()
  }, [router])

  if (!user) return <p className="text-white p-10">Chargement...</p>

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-12 px-6">
      {/* 🌟 Présentation */}
      <section className="text-center max-w-2xl mb-10">
        <h1 className="text-4xl font-bold mb-4 text-blue-400">Bienvenue sur Ceabr App 🚀</h1>
        <p className="text-gray-300 leading-relaxed">
          Ta plateforme connectée tout-en-un pour accéder à tes applications SaaS, gérer tes abonnements et
          centraliser ton expérience Ceabr.
        </p>
      </section>

      {/* 🧩 Applications disponibles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
        {/* StudyHero */}
        <div
          onClick={() => router.push('/studyhero/dashboard')}
          className="cursor-pointer bg-gray-800 hover:bg-gray-700 transition rounded-xl p-6 flex flex-col items-center shadow-lg border border-gray-700 hover:border-blue-500"
        >
          <h2 className="text-2xl font-semibold text-blue-400 mb-2">📘 StudyHero</h2>
          <p className="text-gray-300 text-center">
            Résume tes documents PDF, crée des quiz et booste ta mémoire.
          </p>
        </div>

        {/* Form2PDF */}
        <div
          onClick={() => router.push('/form2pdf/dashboard')}
          className="cursor-pointer bg-gray-800 hover:bg-gray-700 transition rounded-xl p-6 flex flex-col items-center shadow-lg border border-gray-700 hover:border-green-500"
        >
          <h2 className="text-2xl font-semibold text-green-400 mb-2">📄 Form2PDF</h2>
          <p className="text-gray-300 text-center">
            Génére automatiquement des PDF professionnels à partir de formulaires.
          </p>
        </div>

        {/* Autres SaaS */}
        <div
          onClick={() => router.push('/soon')}
          className="cursor-pointer bg-gray-800 hover:bg-gray-700 transition rounded-xl p-6 flex flex-col items-center shadow-lg border border-gray-700 hover:border-purple-500"
        >
          <h2 className="text-2xl font-semibold text-purple-400 mb-2">⚙️ Prochainement</h2>
          <p className="text-gray-300 text-center">
            Découvre bientôt de nouvelles apps Ceabr pour simplifier ton quotidien.
          </p>
        </div>
      </div>

      {/* 🔗 Bouton Plans */}
      <button
        onClick={() => router.push('/pricing')}
        className="mt-10 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-md text-white"
      >
        Voir les plans et tarifs →
      </button>
    </div>
  )
}
