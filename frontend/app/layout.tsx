import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import Header from '@/components/Header'
import { Toaster } from '@/components/ui/toaster'
import { LanguageProvider } from '@/components/language-provider'
import { WalletProvider } from '@/contexts/WalletContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'Blocksecx - Block Security Arena',
  description: 'Block Security Arena is a comprehensive platform for blockchain security, providing smart contract audits, vulnerability analysis, and security consulting.',
  generator: 'Blocksecx',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body className="bg-gray-950 text-white">
        <LanguageProvider>
          <WalletProvider>
            <Header />
            {children}
            <Toaster />
          </WalletProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}