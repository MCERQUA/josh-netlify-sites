import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Netlify Domains Showcase',
  description: 'A beautiful gallery of all our Netlify-hosted domains',
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
