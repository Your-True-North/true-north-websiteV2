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
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <style dangerouslySetInnerHTML={{__html: `
          * { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important; }
          h1, h2, h3, h4, h5, h6 { font-family: "Playfair Display", serif !important; }
          @media (min-width: 769px) {
            .section:first-child { padding-top: 8rem !important; }
          }
        `}} />
        <script dangerouslySetInnerHTML={{__html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || 'PIXEL_ID_PLACEHOLDER'}');
          fbq('track', 'PageView');
        `}} />
        <noscript>
          <img height="1" width="1" style={{display: 'none'}}
            src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || 'PIXEL_ID_PLACEHOLDER'}&ev=PageView&noscript=1`}
            alt="" />
        </noscript>
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}