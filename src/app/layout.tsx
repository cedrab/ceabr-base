import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Ceabr App',
  description: 'Plateforme connectée Ceabr',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-gray-900 text-gray-100 transition-all duration-300">
        {/* 🔝 Barre de navigation globale */}
        <Navbar />

        {/* 🌊 Contenu avec animation fluide */}
        <main className="min-h-screen animate-fadeIn">{children}</main>
      </body>
    </html>
  )
}
