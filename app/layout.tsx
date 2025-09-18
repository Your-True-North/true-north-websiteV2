import './globals.css'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import MysticalBackground from './components/MysticalBackground'

export const metadata = {
  title: 'True North - Spiritual Transformation',
  description: 'Where you are now does not have to be where you end up',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{__html: `
          * { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important; }
          h1, h2, h3, h4, h5, h6 { font-family: "Playfair Display", serif !important; }
          @media (min-width: 769px) {
            .section:first-child { padding-top: 8rem !important; }
          }
        `}} />
      </head>
      <body>
        <MysticalBackground />
        <Navigation />
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}