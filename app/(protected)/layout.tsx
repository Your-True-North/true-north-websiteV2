import MembersNav from './MembersNav'
import MembersNavLegacy from './MembersNavLegacy'
import { features } from '../../lib/features'
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
    <div className={features.legacyNav ? 'kyn-protected kyn-legacy' : 'kyn-protected'}>
      <style>{`
        nav.nav, nav.site-nav, .mobile-nav, .desktop-nav, #site-nav, #site-navigation, .site-navigation {
          display: none !important;
        }
        body { background: #111311 !important; }

        /* Member area look: existing tokens remapped, so every page picks it up */
        .kyn-protected {
          --kyn-bg: #111311;
          --kyn-sidebar: #111311;
          --kyn-sidebar2: #1B1E1B;
          --kyn-surface: #1B1E1B;
          --kyn-surface-raised: #2A2E2A;
          --kyn-border: rgba(236,230,218,0.08);
          --kyn-border-mid: rgba(236,230,218,0.16);
          --kyn-border-green: rgba(236,230,218,0.08);
          --kyn-border-blue: rgba(236,230,218,0.08);
          --kyn-ink: #ECE6DA;
          --kyn-ink2: rgba(236,230,218,0.8);
          --kyn-ink3: rgba(236,230,218,0.8);
          --kyn-green: #9BC4B8;
          --kyn-green-hi: #9BC4B8;
          --kyn-green-bg: rgba(155,196,184,0.12);
          --kyn-green-mid: rgba(155,196,184,0.12);
          --kyn-green-glow: transparent;
          --kyn-blue: #9BC4B8;
          --kyn-blue-hi: #9BC4B8;
          --kyn-blue-bg: rgba(155,196,184,0.12);
          --kyn-blue-mid: rgba(155,196,184,0.12);
          --kyn-r: 12px;
          --kyn-r-lg: 16px;
          color: #ECE6DA;
          font-size: 16px;
        }

        .protected-main { max-width: 720px; margin: 0 auto; padding: 88px 16px 48px; }
        @media (max-width: 768px) {
          .protected-main { padding: calc(72px + env(safe-area-inset-top, 0px)) 16px calc(88px + env(safe-area-inset-bottom, 0px)); }
        }

        /* Old sidebar layout, only when features.legacyNav is on */
        .kyn-legacy .protected-main { max-width: none; margin: 0; }
        @media (min-width: 769px) {
          .kyn-legacy .protected-main { padding: 0 0 0 214px; }
        }
        @media (max-width: 768px) {
          .kyn-legacy .protected-main { padding: 54px 0 72px; }
        }
      `}</style>
      {features.legacyNav ? <MembersNavLegacy /> : <MembersNav />}
      <main className="protected-main" style={{ minHeight: '100vh', background: 'var(--kyn-bg)' }}>
        {children}
      </main>
    </div>
  )
}
