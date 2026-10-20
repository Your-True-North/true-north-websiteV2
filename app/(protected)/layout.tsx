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
        body { background: #ECE6DA !important; }

        /* Member area look. Every colour, radius and size lives here, so the
           whole member area changes from this one block. */
        .kyn-protected {
          --kyn-bg: #ECE6DA;
          --kyn-sidebar: #ECE6DA;
          --kyn-sidebar2: #F6F2EA;
          --kyn-surface: #F6F2EA;
          --kyn-surface-raised: #DCD4C5;
          --kyn-thumb: #DCD4C5;
          --kyn-border: rgba(17,19,17,0.12);
          --kyn-border-mid: rgba(17,19,17,0.12);
          --kyn-border-green: rgba(17,19,17,0.12);
          --kyn-border-blue: rgba(17,19,17,0.12);
          --kyn-ink: #111311;
          --kyn-ink2: rgba(17,19,17,0.68);
          --kyn-ink3: rgba(17,19,17,0.68);
          --kyn-label: #2F5A4E;
          --kyn-green: #2F5A4E;
          --kyn-green-hi: #2F5A4E;
          --kyn-green-bg: rgba(47,90,78,0.08);
          --kyn-green-mid: rgba(47,90,78,0.08);
          --kyn-green-glow: transparent;
          --kyn-blue: #2F5A4E;
          --kyn-blue-hi: #2F5A4E;
          --kyn-blue-bg: rgba(47,90,78,0.08);
          --kyn-blue-mid: rgba(47,90,78,0.08);
          --kyn-main-bg: #111311;
          --kyn-main-text: #ECE6DA;
          --kyn-main-hover: #2B2E2B;
          --kyn-hover: rgba(17,19,17,0.06);
          --kyn-tab-inactive: rgba(17,19,17,0.6);
          --kyn-r: 4px;
          --kyn-r-lg: 4px;
          --kyn-r-thumb: 2px;
          --kyn-side-pad: 20px;
          --kyn-section-gap: 48px;
          --kyn-card-pad: 28px;
          --kyn-title-size: 44px;
          --kyn-session-title-size: 32px;
          color: var(--kyn-ink);
          font-size: 16px;
        }
        @media (min-width: 769px) {
          .kyn-protected {
            --kyn-side-pad: 24px;
            --kyn-card-pad: 40px;
            --kyn-title-size: 56px;
            --kyn-session-title-size: 40px;
          }
        }

        .protected-main { max-width: 720px; margin: 0 auto; padding: 104px var(--kyn-side-pad) 64px; }
        @media (max-width: 768px) {
          .protected-main { padding: calc(88px + env(safe-area-inset-top, 0px)) var(--kyn-side-pad) calc(112px + env(safe-area-inset-bottom, 0px)); }
        }

        /* Shared pieces */
        .kyn-stack { display: flex; flex-direction: column; gap: var(--kyn-section-gap); }
        .kyn-title, .kyn-session-title { line-height: 1.08 !important; letter-spacing: -0.01em; margin: 0; color: var(--kyn-ink); }
        .kyn-title { font-size: var(--kyn-title-size); }
        .kyn-session-title { font-size: var(--kyn-session-title-size); }
        .kyn-section-title { font-size: 28px; line-height: 1.08 !important; letter-spacing: -0.01em; margin: 0 0 16px; color: var(--kyn-ink); }
        .kyn-label { font-size: 14px; font-weight: 500; letter-spacing: 0.02em; color: var(--kyn-label); }
        .kyn-secondary { font-size: 15px; color: var(--kyn-ink2); }
        .kyn-card { background: var(--kyn-surface); border: 1px solid var(--kyn-border); border-radius: var(--kyn-r); padding: var(--kyn-card-pad); }
        .kyn-rows > * + * { border-top: 1px solid var(--kyn-border); }
        .kyn-row { display: flex; align-items: center; gap: 16px; padding: 16px 0; text-decoration: none; color: var(--kyn-ink); }

        .kyn-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          min-height: 52px; padding: 0 24px; border-radius: var(--kyn-r);
          font-size: 16px; font-weight: 600; font-family: inherit; text-decoration: none; cursor: pointer;
          transition: background-color 150ms ease, color 150ms ease, transform 150ms ease, opacity 150ms ease;
        }
        .kyn-btn:active:not(:disabled) { transform: scale(0.98); }
        .kyn-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .kyn-btn-main { background: var(--kyn-main-bg); color: var(--kyn-main-text); border: 1px solid var(--kyn-main-bg); }
        .kyn-btn-main:hover:not(:disabled) { background: var(--kyn-main-hover); }
        .kyn-btn-secondary { background: transparent; color: var(--kyn-ink); border: 1px solid var(--kyn-ink); }
        .kyn-btn-secondary:hover:not(:disabled) { background: var(--kyn-hover); }
        .kyn-btn-block { width: 100%; }
        .kyn-link-btn {
          min-height: 44px; padding: 0; background: none; border: none; font-family: inherit;
          font-size: 15px; color: var(--kyn-ink2); text-decoration: underline; cursor: pointer;
          transition: color 150ms ease;
        }
        .kyn-link-btn:hover { color: var(--kyn-ink); }
        .kyn-menu-row { transition: background-color 150ms ease; }
        .kyn-menu-row:hover { background: var(--kyn-hover) !important; }
        .kyn-row-link { transition: opacity 150ms ease; }
        .kyn-row-link:hover { opacity: 0.75; }
        .kyn-protected :focus-visible { outline: 2px solid #111311; outline-offset: 2px; }

        .kyn-input {
          width: 100%; min-height: 52px; padding: 14px 16px; background: var(--kyn-surface);
          border: 1px solid var(--kyn-border); border-radius: var(--kyn-r);
          color: var(--kyn-ink); font-size: 16px; font-family: inherit;
          transition: border-color 150ms ease;
        }
        .kyn-input:focus { border-color: var(--kyn-ink); }
        .kyn-input::placeholder { color: var(--kyn-ink2); }

        .kyn-thumb { position: relative; aspect-ratio: 16 / 9; background: var(--kyn-thumb); border-radius: var(--kyn-r-thumb); overflow: hidden; flex-shrink: 0; }
        .kyn-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

        .kyn-icon { width: 22px; height: 22px; flex-shrink: 0; }

        /* "What happens in this session": smooth open, rotating chevron */
        .kyn-collapse { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 200ms ease; }
        .kyn-collapse[data-open="true"] { grid-template-rows: 1fr; }
        .kyn-collapse > div { overflow: hidden; }
        .kyn-chevron { transition: transform 200ms ease; }
        [aria-expanded="true"] > .kyn-chevron { transform: rotate(180deg); }

        @media (prefers-reduced-motion: reduce) {
          .kyn-protected *, .kyn-protected *::before, .kyn-protected *::after {
            transition: none !important;
            animation: none !important;
          }
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
