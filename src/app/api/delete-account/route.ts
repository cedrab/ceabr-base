import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE! // Service Role (⚠️ pas la clé publique)
  )

  try {
    const { userId, avatarUrl } = await req.json()

    // 🔹 Supprimer l’avatar s’il existe
    if (avatarUrl) {
      const filePath = avatarUrl.split('/').pop()
      if (filePath) {
        await supabaseAdmin.storage.from('avatars').remove([filePath])
      }
    }

    // 🔹 Supprimer le profil dans la table profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId)
    if (profileError) throw profileError

    // 🔹 Supprimer le compte Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (authError) throw authError

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erreur suppression compte:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
