'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

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

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

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
      // Récupère le nom du fichier à partir de l'URL publique
      const filePath = profile.avatar_url.split('/').pop()
      if (!filePath) return

      // Supprime du bucket Supabase
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([filePath])

      if (deleteError) throw deleteError

      // Supprime aussi du profil
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Mets à jour le state local
      setProfile((p: any) => ({ ...p, avatar_url: null }))
      alert('Avatar supprimé 🗑️')
    } catch (error: any) {
      alert(error.message)
    }
  }

    const handleDeleteAccount = async () => {
    if (!user) return

    if (!confirm("⚠️ Es-tu sûr de vouloir supprimer ton compte ? Cette action est irréversible.")) {
      return
    }

    try {
      // 1️⃣ Supprimer avatar s’il existe
      if (profile.avatar_url) {
        const filePath = profile.avatar_url.split('/').pop()
        if (filePath) {
          await supabase.storage.from('avatars').remove([filePath])
        }
      }

      // 2️⃣ Supprimer le profil
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)
      if (profileError) throw profileError

      // 3️⃣ Supprimer le compte Auth
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

        <button
          onClick={() => router.push('/dashboard')}
          className="mt-4 w-full bg-gray-600 hover:bg-gray-700 py-2 rounded-md"
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
