import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { DemoConfigProvider } from '@/hooks/use-demo-config'
import { DemoModeIndicator } from '@/components/demo-mode-indicator'

export const metadata: Metadata = {
  title: 'DTS - Carrier Waterfalls',
  description: 'DTS Carrier Waterfalls Management System',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <DemoConfigProvider>
          <AuthProvider>
            {children}
            <DemoModeIndicator />
          </AuthProvider>
        </DemoConfigProvider>
      </body>
    </html>
  )
}
