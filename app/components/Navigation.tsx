'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  const protectedPaths = ['/members', '/videos', '/forum', '/calls', '/journey', '/community', '/admin', '/auth'];
  const shouldHideNav = protectedPaths.some(path => pathname?.startsWith(path));

  // Check if user is in members area (for contextual Dashboard/Logout display)
  const membersAreaPaths = ['/members', '/videos', '/forum', '/calls', '/journey', '/community'];
  const isInMembersArea = membersAreaPaths.some(path => pathname?.startsWith(path));

  // Check if user is admin (cor@yourtruenorth.me)
  const ADMIN_EMAIL = 'cor@yourtruenorth.me';
  const isAdmin = user && (user as any).email?.toLowerCase() === ADMIN_EMAIL;

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        setUser(null);
      }
    }
  }, [pathname]);

  const handleLogout = () => {
    console.log('[NAV LOGOUT] Starting logout...');

    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('videoLikes');
    localStorage.removeItem('videoComments');
    localStorage.clear();

    // Set logout flag BEFORE clearing sessionStorage
    sessionStorage.setItem('justLoggedOut', 'true');

    // Delete all cookies (combining both approaches)
    document.cookie.split(';').forEach(c => {
      document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
    });

    console.log('[NAV LOGOUT] Storage cleared, logout flag set');

    setUser(null);
    setIsOpen(false);

    // Redirect to homepage
    setTimeout(() => {
      console.log('[NAV LOGOUT] Redirecting to homepage');
      window.location.replace('/');
    }, 50);
  };

  return (
   <>
     <nav className="nav" style={{
       opacity: shouldHideNav ? 0 : 1,
       pointerEvents: shouldHideNav ? 'none' : 'auto',
       transition: 'opacity 0.15s ease-out'
     }}>
       <div className="nav-container">
         <Link href="/" className="nav-logo">
           <Image
             src="/white white star.png"
             alt="True North"
             width={72}
             height={72}
             className="nav-logo-image"
             priority
           />
         </Link>

         <div className="desktop-nav">
           <ul className="nav-links">
             <li><Link href="/">Home</Link></li>
             <li><Link href="/about">About</Link></li>
             <li><Link href="/work">Work With Me</Link></li>
             <li>
               <Link href="/circle" className="cor-link">KYN</Link>
             </li>
             <li><Link href="/library">Library</Link></li>
             <li><Link href="/contact">Contact</Link></li>
             {isAdmin && (
               <li>
                 <Link href="/admin/dashboard" style={{
                   color: '#7fb069',
                   fontWeight: 500
                 }}>Admin</Link>
               </li>
             )}
             <li>
               {user ? (
                 isInMembersArea ? (
                   <button onClick={handleLogout} style={{
                     background: 'none',
                     border: 'none',
                     color: 'inherit',
                     font: 'inherit',
                     cursor: 'pointer',
                     padding: 0
                   }}>Logout</button>
                 ) : (
                   <Link href="/members" style={{
                     border: '1px solid #9bc4b8',
                     padding: '8px 16px',
                     borderRadius: '6px'
                   }}>Dashboard</Link>
                 )
               ) : (
                 <Link href="/auth/login" onClick={(e) => { e.preventDefault(); localStorage.clear(); sessionStorage.clear(); window.location.replace("/auth/login"); }}>Login</Link>
               )}
             </li>
           </ul>
         </div>

         <button
           className="mobile-nav-toggle"
           onClick={() => setIsOpen(!isOpen)}
           style={{
             position: 'relative',
             width: '40px',
             height: '40px'
           }}
         >
           <div style={{
             position: 'absolute',
             top: '50%',
             left: '50%',
             transform: 'translate(-50%, -50%) rotate(45deg)',
             width: '20px',
             height: '2px',
             background: 'rgba(255, 255, 255, 0.9)',
             transition: 'all 0.3s ease'
           }}></div>
           <div style={{
             position: 'absolute',
             top: '50%',
             left: '50%',
             transform: 'translate(-50%, -50%) rotate(-45deg)',
             width: '20px',
             height: '2px',
             background: 'rgba(255, 255, 255, 0.9)',
             transition: 'all 0.3s ease'
           }}></div>
         </button>
       </div>
     </nav>

     <div className={`mobile-nav ${isOpen ? 'open' : ''}`}>
       <button 
         className="mobile-nav-close"
         onClick={() => setIsOpen(false)}
         style={{
           position: 'absolute',
           top: '1.5rem',
           right: '1.5rem',
           background: 'transparent',
           border: 'none',
           cursor: 'pointer',
           zIndex: 1001,
           padding: '0.5rem',
           width: '40px',
           height: '40px',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center'
         }}
       >
         <div style={{
           position: 'relative',
           width: '28px',
           height: '28px'
         }}>
           <div style={{
             position: 'absolute',
             top: '50%',
             left: '50%',
             transform: 'translate(-50%, -50%)',
             width: '5px',
             height: '5px',
             background: 'rgba(255, 255, 255, 0.4)',
             borderRadius: '50%'
           }}></div>
           <div style={{
             position: 'absolute',
             top: '0',
             left: '50%',
             transform: 'translateX(-50%) rotate(45deg)',
             width: '1.5px',
             height: '10px',
             background: 'rgba(255, 255, 255, 0.7)'
           }}></div>
           <div style={{
             position: 'absolute',
             right: '0',
             top: '50%',
             transform: 'translateY(-50%) rotate(45deg)',
             width: '10px',
             height: '1.5px',
             background: 'rgba(255, 255, 255, 0.7)'
           }}></div>
           <div style={{
             position: 'absolute',
             bottom: '0',
             left: '50%',
             transform: 'translateX(-50%) rotate(45deg)',
             width: '1.5px',
             height: '10px',
             background: 'rgba(255, 255, 255, 0.7)'
           }}></div>
           <div style={{
             position: 'absolute',
             left: '0',
             top: '50%',
             transform: 'translateY(-50%) rotate(45deg)',
             width: '10px',
             height: '1.5px',
             background: 'rgba(255, 255, 255, 0.7)'
           }}></div>
         </div>
       </button>

       <div className="mobile-nav-content">
         <Link href="/" onClick={() => setIsOpen(false)}>Home</Link>
         <Link href="/about" onClick={() => setIsOpen(false)}>About</Link>
         <Link href="/work" onClick={() => setIsOpen(false)}>Work With Me</Link>
         <Link href="/circle" onClick={() => setIsOpen(false)}>KYN</Link>
         <Link href="/library" onClick={() => setIsOpen(false)}>Library</Link>
         <Link href="/contact" onClick={() => setIsOpen(false)}>Contact</Link>
         {isAdmin && (
           <Link href="/admin/dashboard" onClick={() => setIsOpen(false)} style={{
             color: '#7fb069',
             fontWeight: 500
           }}>Admin</Link>
         )}
         {user ? (
           isInMembersArea ? (
             <button onClick={handleLogout} style={{
               background: 'none',
               border: 'none',
               color: 'inherit',
               font: 'inherit',
               cursor: 'pointer',
               padding: 0,
               textAlign: 'left'
             }}>Logout</button>
           ) : (
             <Link href="/members" onClick={() => setIsOpen(false)} style={{
               border: '1px solid #9bc4b8',
               padding: '8px 16px',
               borderRadius: '6px'
             }}>Dashboard</Link>
           )
         ) : (
           <Link href="/auth/login" onClick={(e) => { e.preventDefault(); setIsOpen(false); localStorage.clear(); sessionStorage.clear(); window.location.replace("/auth/login"); }}>Login</Link>
         )}
       </div>
     </div>

     {isOpen && (
       <div 
         className="mobile-nav-overlay"
         onClick={() => setIsOpen(false)}
       />
     )}
   </>
 );
}