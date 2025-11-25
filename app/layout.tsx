import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Josh Domains',
  description: 'All of Josh\'s domains and websites',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased">{children}</body>
    </html>
  )
}
