import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ceabr App',
  description: 'Simplified Supabase Auth',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
