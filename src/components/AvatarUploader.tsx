'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AvatarUploader({ userId, currentUrl, onUpload }: any) {
  const [uploading, setUploading] = useState(false)

  const uploadAvatar = async (event: any) => {
    try {
      setUploading(true)

      const file = event.target.files[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const filePath = `${userId}/${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      onUpload(data.publicUrl)
    } catch (error: any) {
      alert('Erreur lors de l’upload : ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {currentUrl && (
        <img
          src={currentUrl}
          alt="Avatar"
          className="w-32 h-32 rounded-full mb-3 object-cover"
        />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={uploadAvatar}
        disabled={uploading}
      />
    </div>
  )
}
