import MembersNav from './MembersNav'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <style>{`
        body > nav, header, header nav, nav.nav, nav.site-nav, .mobile-nav, #site-nav, #site-navigation, .site-navigation {
          display: none !important;
        }
      `}</style>
      <MembersNav />
      <main style={{ paddingTop: '60px' }}>
        {children}
      </main>
    </>
  )
}
