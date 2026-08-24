import './globals.css'
import GoogleAnalytics from './components/GoogleAnalytics'

export const metadata = {
  title: 'True North | Know Your North — Mason',
  description: 'When men have clear direction, everything changes. Know Your North is a community for men who are done circling and ready to move — built around somatic work, real brotherhood, and the clarity to go where you\'re supposed to go.',
  keywords: 'mens transformation, know your north, masculine coaching, somatic therapy, breathwork, mens community, Circle of Return, direction, clarity, mens coaching',
  authors: [{ name: 'Mason - True North' }],
  icons: {
    icon: '/favicon.png',
    apple: '/cor-app-icon.png',
  },
  // Required. Without it Next emits a relative og:image URL, which most
  // crawlers cannot resolve, so no share image appears.
  metadataBase: new URL('https://yourtruenorth.me'),
  openGraph: {
    title: 'True North | Know Your North',
    description: 'For finding alignment with where you\'re supposed to be going — and then actually going there.',
    type: 'website',
    locale: 'en_GB',
    url: 'https://yourtruenorth.me',
    siteName: 'Know Your North',
    images: [
      {
        url: '/white-green-star.jpg',
        width: 1200,
        height: 630,
        alt: 'Know Your North',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'True North | Know Your North',
    description: 'For finding alignment with where you\'re supposed to be going — and then actually going there.',
    images: ['/white-green-star.jpg'],
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
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CoR" />
        <meta name="mobile-web-app-capable" content="yes" />
        <style dangerouslySetInnerHTML={{__html: `
          * { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important; }
          h1, h2, h3, h4, h5, h6 { font-family: "Gambarino", serif !important; }
          @media (min-width: 769px) {
            .section:first-child { padding-top: 8rem !important; }
          }
        `}} />
        <script dangerouslySetInnerHTML={{__html: `
          !function(f){if(f.fbq)return;var n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[]}(window);
          fbq('init', '${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || 'PIXEL_ID_PLACEHOLDER'}');
          fbq('track', 'PageView');
          window.addEventListener('load',function(){var t=document.createElement('script');t.async=!0;t.src='https://connect.facebook.net/en_US/fbevents.js';document.head.appendChild(t)});
        `}} />
      </head>
      <body>
        <GoogleAnalytics />
        {children}
        <script src="//widget.manychat.com/4464506_d1c15.js" defer></script>
        <script src="https://mccdn.me/assets/js/widget.js" defer></script>
        <script dangerouslySetInnerHTML={{__html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js')
            })
          }
        `}} />
      </body>
    </html>
  )
}