import MembersNav from './MembersNav'

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
      `}</style>
      <MembersNav />
      <main style={{ paddingTop: '90px' }}>
        {children}
      </main>
    </>
  )
}
