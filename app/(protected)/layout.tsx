import MembersNav from './MembersNav'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  icons: {
    icon: '/cor-mark-black.svg',
    apple: '/cor-app-icon.png',
  },
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <style>{`
        nav.nav, nav.site-nav, .mobile-nav, .desktop-nav, #site-nav, #site-navigation, .site-navigation {
          display: none !important;
        }
        body { background: var(--kyn-bg) !important; }
        @media (min-width: 769px) {
          .protected-main { padding-left: 214px; padding-top: 0; }
        }
        @media (max-width: 768px) {
          .protected-main { padding-left: 0; padding-top: 54px; padding-bottom: 72px; }
        }
      `}</style>
      <MembersNav />
      <main className="protected-main" style={{ minHeight: '100vh', background: 'var(--kyn-bg)' }}>
        {children}
      </main>
    </>
  )
}
