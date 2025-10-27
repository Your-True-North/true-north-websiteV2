import './globals.css'

export const metadata = {
  title: 'True North - Transformation Through Embodiment | Mason',
  description: 'Deep transformational work for men. 1:1 coaching, breathwork, energy healing, and the Circle of Return community. Teaching regulation, not just mindset.',
  keywords: 'masculine transformation, breathwork, energy healing, mens coaching, emotional regulation, somatic practices, Circle of Return',
  authors: [{ name: 'Mason - True North' }],
  openGraph: {
    title: 'True North - Transformation Through Embodiment',
    description: 'Where you are now does not have to be where you end up',
    type: 'website',
    locale: 'en_GB',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: '#0a0a0b',
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
        {children}
      </body>
    </html>
  )
}