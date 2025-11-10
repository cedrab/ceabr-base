'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

type Subscription = {
  app_name: string
  plan_name: string
  status: string
  current_period_end: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>({})
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  // 🧩 Charger profil + utilisateur
  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }
      setUser(user)

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') console.error(error)
      setProfile(profileData || {})
      setLoading(false)
    }

    fetchUserAndProfile()
  }, [router])

  // 🔄 Charger les abonnements actifs
  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!user) return
      const { data, error } = await supabase
        .from('billing')
        .select('app_name, plan_name, status, current_period_end')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) console.error('Erreur récupération abonnements :', error)
      else setSubscriptions(data || [])
    }
    fetchSubscriptions()
  }, [user])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      const file = e.target.files?.[0]
      if (!file || !user) return

      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      const avatarUrl = data.publicUrl

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setProfile((p: any) => ({ ...p, avatar_url: avatarUrl }))
    } catch (error: any) {
      alert(error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteAvatar = async () => {
    if (!user || !profile.avatar_url) return

    try {
      const filePath = profile.avatar_url.split('/').pop()
      if (!filePath) return

      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([filePath])

      if (deleteError) throw deleteError

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id)

      if (updateError) throw updateError

      setProfile((p: any) => ({ ...p, avatar_url: null }))
      alert('Avatar supprimé 🗑️')
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return
    if (!confirm("⚠️ Es-tu sûr de vouloir supprimer ton compte ? Cette action est irréversible.")) return

    try {
      if (profile.avatar_url) {
        const filePath = profile.avatar_url.split('/').pop()
        if (filePath) await supabase.storage.from('avatars').remove([filePath])
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)
      if (profileError) throw profileError

      const { error: authError } = await supabase.auth.admin.deleteUser(user.id)
      if (authError) throw authError

      alert('Ton compte a été supprimé définitivement 🗑️')
      router.replace('/login')
    } catch (error: any) {
      alert('Erreur : ' + error.message)
    }
  }

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    const updates = {
      id: user.id,
      username: profile.username,
      bio: profile.bio,
      updated_at: new Date(),
    }
    const { error } = await supabase.from('profiles').upsert(updates)
    if (error) alert(error.message)
    else alert('Profil sauvegardé ✅')
  }

  if (loading) return <p className="text-white p-10">Chargement...</p>

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <div className="bg-gray-800 p-6 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Mon Profil 🧑‍💼</h1>

        <div className="flex flex-col items-center mb-4">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Avatar"
              className="w-24 h-24 rounded-full mb-2"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-600 mb-2" />
          )}
          <div className="flex flex-col items-center gap-2">
            <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm">
              {uploading ? 'Envoi...' : 'Changer'}
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>

            {profile.avatar_url && (
              <button
                type="button"
                onClick={handleDeleteAvatar}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
              >
                Supprimer
              </button>
            )}
          </div>
        </div>

        <form onSubmit={saveProfile} className="space-y-4">
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={profile.username || ''}
            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
            className="w-full border p-2 rounded-md text-black"
          />
          <textarea
            placeholder="Bio"
            value={profile.bio || ''}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className="w-full border p-2 rounded-md text-black"
          />
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md"
          >
            Sauvegarder
          </button>
        </form>

        {/* 🧾 Bloc abonnements actifs */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-3 text-center">Mes abonnements actifs 💳</h2>

          {subscriptions.length === 0 ? (
            <p className="text-center text-gray-400">Aucun abonnement trouvé.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {subscriptions.map((sub) => (
                <div
                  key={sub.app_name}
                  className="bg-gray-700 p-3 rounded-md border border-gray-600 flex flex-col gap-1"
                >
                  <h3 className="font-semibold capitalize">{sub.app_name}</h3>
                  <p>Plan : {sub.plan_name}</p>
                  <p
                    className={`${
                      sub.status === 'active' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    Statut : {sub.status}
                  </p>
                  {sub.current_period_end && (
                    <p className="text-sm text-gray-300">
                      Fin de période :{' '}
                      {new Date(sub.current_period_end).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                  <button
                    onClick={async () => {
                      const res = await fetch('/api/stripe/portal', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          user_id: user.id,
                          app_name: sub.app_name,
                        }),
                      })
                      const data = await res.json()
                      if (data.url) window.location.href = data.url
                    }}
                    className="mt-2 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-sm"
                  >
                    🔗 Gérer mon abonnement
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          className="mt-6 w-full bg-gray-600 hover:bg-gray-700 py-2 rounded-md"
        >
          ← Retour au dashboard
        </button>

        <button
          onClick={handleDeleteAccount}
          className="mt-4 w-full bg-red-700 hover:bg-red-800 py-2 rounded-md"
        >
          🗑️ Supprimer mon compte
        </button>
      </div>
    </div>
  )
}
