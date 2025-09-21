'use client'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import MysticalBackground from '../components/MysticalBackground'
import { useState, useEffect } from 'react'

export default function Contact() {
 const [shimmerPhase, setShimmerPhase] = useState(0)

 useEffect(() => {
   const interval = setInterval(() => {
     setShimmerPhase(prev => (prev + 1) % 4)
   }, 180000) // 3 minutes between transitions

   return () => clearInterval(interval)
 }, [])

 const shimmerThemes = [
   {
     primary: '#9bc4b8',
     accent: '#d4af37',
     shimmer: 'rgba(155, 196, 184, 0.12)'
   },
   {
     primary: '#7fb069',
     accent: '#f4a261',
     shimmer: 'rgba(127, 176, 105, 0.10)'
   },
   {
     primary: '#6a994e',
     accent: '#e76f51',
     shimmer: 'rgba(106, 153, 78, 0.14)'
   },
   {
     primary: '#8db4a8',
     accent: '#c49c30',
     shimmer: 'rgba(141, 180, 168, 0.08)'
   }
 ]

 const currentTheme = shimmerThemes[shimmerPhase]

 return (
   <>
     <style jsx global>{`
       :root {
         --primary: ${currentTheme.primary};
         --accent: ${currentTheme.accent};
         --shimmer-color: ${currentTheme.shimmer};
       }
       
       .page-container::before {
         content: '';
         position: fixed;
         top: 0;
         left: 0;
         width: 100%;
         height: 100vh;
         background: radial-gradient(ellipse at 30% 50%, var(--shimmer-color) 0%, transparent 50%);
         pointer-events: none;
         z-index: 1;
         opacity: 0.6;
         transition: background 15s ease-in-out, opacity 15s ease-in-out;
       }
       
       .shimmer-accent {
         position: relative;
         overflow: hidden;
       }
       
       .shimmer-accent::after {
         content: '';
         position: absolute;
         top: 0;
         left: -100%;
         width: 100%;
         height: 100%;
         background: linear-gradient(
           90deg,
           transparent 0%,
           var(--shimmer-color) 50%,
           transparent 100%
         );
         animation: shimmer 8s ease-in-out infinite;
       }
       
       @keyframes shimmer {
         0% {
           left: -100%;
           opacity: 0;
         }
         25% {
           opacity: 0.3;
         }
         50% {
           opacity: 0.5;
         }
         75% {
           opacity: 0.3;
         }
         100% {
           left: 100%;
           opacity: 0;
         }
       }
       
       .accent-text {
         transition: color 15s ease-in-out;
       }
       
       .btn-primary,
       .btn-secondary {
         transition: all 0.3s ease, color 15s ease-in-out, background-color 15s ease-in-out, border-color 15s ease-in-out;
       }

       @media (max-width: 768px) {
         .contact-grid {
           grid-template-columns: 1fr !important;
           gap: 2rem !important;
         }
         
         .contact-form input,
         .contact-form textarea {
           font-size: 16px !important;
         }
         
         .contact-bottom-grid {
           grid-template-columns: 1fr !important;
           gap: 1.5rem !important;
         }
         
         .container {
           padding: 0 1rem !important;
         }
         
         .section {
           padding-top: 6rem !important;
         }
       }
     `}</style>
     
     <Navigation />
     <MysticalBackground />
     
     <main className="page-container">
       <section className="section" style={{paddingTop: '4rem'}}>
         <div className="container">
           <div style={{textAlign: 'center', marginBottom: '4rem'}}>
             <h1 className="h1 shimmer-accent">Let's Talk</h1>
             <p className="body-large">
               Ready to explore what's possible? Let's have a real conversation.
             </p>
           </div>

           <div className="contact-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start'}}>
             {/* Contact Form */}
             <div className="card contact-form">
               <h2 className="h2 shimmer-accent">Discovery Call</h2>
               <p className="body" style={{marginBottom: '2rem'}}>
                 This isn't a sales call. It's a conversation about where you are, 
                 where you want to go, and whether this work is right for you.
               </p>

               <form style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                 <div>
                   <label style={{
                     display: 'block',
                     marginBottom: '0.5rem',
                     color: 'var(--text-secondary)',
                     fontSize: '0.9rem'
                   }}>
                     Name *
                   </label>
                   <input
                     type="text"
                     required
                     style={{
                       width: '100%',
                       padding: '0.75rem',
                       borderRadius: '0.3rem',
                       border: '1px solid var(--border-primary)',
                       background: 'var(--bg-tertiary)',
                       color: 'var(--text-primary)',
                       fontSize: '1rem'
                     }}
                   />
                 </div>

                 <div>
                   <label style={{
                     display: 'block',
                     marginBottom: '0.5rem',
                     color: 'var(--text-secondary)',
                     fontSize: '0.9rem'
                   }}>
                     Email *
                   </label>
                   <input
                     type="email"
                     required
                     style={{
                       width: '100%',
                       padding: '0.75rem',
                       borderRadius: '0.3rem',
                       border: '1px solid var(--border-primary)',
                       background: 'var(--bg-tertiary)',
                       color: 'var(--text-primary)',
                       fontSize: '1rem'
                     }}
                   />
                 </div>

                 <div>
                   <label style={{
                     display: 'block',
                     marginBottom: '0.5rem',
                     color: 'var(--text-secondary)',
                     fontSize: '0.9rem'
                   }}>
                     What's calling you to this work? *
                   </label>
                   <textarea
                     required
                     rows={4}
                     style={{
                       width: '100%',
                       padding: '0.75rem',
                       borderRadius: '0.3rem',
                       border: '1px solid var(--border-primary)',
                       background: 'var(--bg-tertiary)',
                       color: 'var(--text-primary)',
                       fontSize: '1rem',
                       resize: 'vertical'
                     }}
                     placeholder="Share what's happening in your life that brought you here..."
                   />
                 </div>

                 <div>
                   <label style={{
                     display: 'block',
                     marginBottom: '0.5rem',
                     color: 'var(--text-secondary)',
                     fontSize: '0.9rem'
                   }}>
                     What support are you looking for?
                   </label>
                   <textarea
                     rows={3}
                     style={{
                       width: '100%',
                       padding: '0.75rem',
                       borderRadius: '0.3rem',
                       border: '1px solid var(--border-primary)',
                       background: 'var(--bg-tertiary)',
                       color: 'var(--text-primary)',
                       fontSize: '1rem',
                       resize: 'vertical'
                     }}
                     placeholder="1:1 work? Group support? Not sure yet? All good..."
                   />
                 </div>

                 <button type="submit" className="btn-primary" style={{justifyContent: 'center'}}>
                   Request Discovery Call
                   <span>→</span>
                 </button>
               </form>

               <p className="body-small" style={{marginTop: '1rem', color: 'var(--text-muted)'}}>
                 I'll respond within 24 hours to schedule our conversation.
               </p>
             </div>

             {/* Info & Expectations */}
             <div>
               <div className="card" style={{marginBottom: '2rem'}}>
                 <h3 className="h3 shimmer-accent">What to Expect</h3>
                 <ul style={{color: 'var(--text-secondary)', lineHeight: '1.8'}}>
                   <li>45-minute conversation via Zoom</li>
                   <li>We explore where you are and where you want to go</li>
                   <li>I share how I work and what's involved</li>
                   <li>We see if there's mutual fit</li>
                   <li>No pressure, no hard sell</li>
                   <li>Complete confidentiality</li>
                 </ul>
               </div>

               <div className="card" style={{marginBottom: '2rem'}}>
                 <h3 className="h3 shimmer-accent">Before We Talk</h3>
                 <p className="body" style={{marginBottom: '1rem'}}>
                   This work is intense. It's for men who are:
                 </p>
                 <ul style={{color: 'var(--text-secondary)', lineHeight: '1.8'}}>
                   <li>Ready to feel their feelings</li>
                   <li>Tired of surface-level solutions</li>
                   <li>Committed to real change</li>
                   <li>Open to working with the body</li>
                   <li>Willing to be uncomfortable</li>
                 </ul>
               </div>

               <div className="card">
                 <h3 className="h3 shimmer-accent">Not Ready Yet?</h3>
                 <p className="body" style={{marginBottom: '1.5rem'}}>
                   Start with the free resources in our Library. 
                   Come back when you're ready to go deeper.
                 </p>
                 <a href="/library" className="btn-secondary">
                   Explore Free Resources
                 </a>
               </div>
             </div>
           </div>

           {/* Bottom Section */}
           <div className="card" style={{marginTop: '4rem', textAlign: 'center'}}>
             <h2 className="h2 shimmer-accent">Other Ways to Connect</h2>
             <div className="contact-bottom-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginTop: '2rem'}}>
               <div>
                 <h4 style={{color: 'var(--primary)', marginBottom: '0.5rem'}}>Circle Waitlist</h4>
                 <p className="body-small" style={{marginBottom: '1rem'}}>
                   Join the waitlist for monthly group sessions
                 </p>
                 <a href="/circle" className="btn-secondary" style={{fontSize: '0.85rem', padding: '0.6rem 1.2rem'}}>
                   Learn About Circle
                 </a>
               </div>
               
               <div>
                 <h4 style={{color: 'var(--primary)', marginBottom: '0.5rem'}}>Weekly Insights</h4>
                 <p className="body-small" style={{marginBottom: '1rem'}}>
                   Raw thoughts on masculine transformation
                 </p>
                 <a href="/library" className="btn-secondary" style={{fontSize: '0.85rem', padding: '0.6rem 1.2rem'}}>
                   Subscribe
                 </a>
               </div>
               
               <div>
                 <h4 style={{color: 'var(--primary)', marginBottom: '0.5rem'}}>Emergency Support</h4>
                 <p className="body-small" style={{marginBottom: '1rem'}}>
                   In crisis? Please reach out for help
                 </p>
                 <a href="tel:988" className="btn-secondary" style={{fontSize: '0.85rem', padding: '0.6rem 1.2rem'}}>
                   Crisis Line: 988
                 </a>
               </div>
             </div>
           </div>

           {/* Final Message */}
           <div style={{textAlign: 'center', marginTop: '3rem'}}>
             <p className="body accent-text" style={{fontSize: '1.1rem', fontStyle: 'italic'}}>
               "Where you are now does not have to be where you end up."
             </p>
           </div>
         </div>
       </section>
     </main>
     
     <Footer />
   </>
 )
}