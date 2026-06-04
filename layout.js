import './globals.css'

export const metadata = {
  title: 'Escola de Música - Administració',
  description: 'Sistema de gestió per a escoles de música',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ca">
      <body>{children}</body>
    </html>
  )
}
