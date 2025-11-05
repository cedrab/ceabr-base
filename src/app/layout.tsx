import './globals.css'

export const metadata = {
  title: 'Ceabr App',
  description: 'Plateforme connectée Ceabr',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-gray-900 text-gray-100">{children}</body>
    </html>
  )
}
