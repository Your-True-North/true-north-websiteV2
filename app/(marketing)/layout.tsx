import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import MysticalBackground from '../components/MysticalBackground'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <MysticalBackground />
      <Navigation />
      <main>
        {children}
      </main>
      <Footer />
    </>
  )
}
