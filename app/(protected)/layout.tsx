import MembersNav from './MembersNav'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <style>{`
        body > nav, header > nav, #site-nav, .site-navigation {
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
