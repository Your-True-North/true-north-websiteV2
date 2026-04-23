import Navigation from '../components/Navigation'
import MysticalBackground from '../components/MysticalBackground'
import Footer from '../components/Footer'

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
