'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navigation() {
 const [isOpen, setIsOpen] = useState(false);

 return (
   <>
     <nav className="nav">
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
               <Link href="/circle" className="cor-link">The CoR</Link>     
             </li>
             <li><Link href="/library">Library</Link></li>
             <li><Link href="/contact">Contact</Link></li>
           </ul>
         </div>

         <button 
           className="mobile-nav-toggle"
           onClick={() => setIsOpen(!isOpen)}
         >
           <div className={`compass-toggle ${isOpen ? 'open' : ''}`}>
             <div className="compass-center"></div>
             <div className="compass-needle top"></div>
             <div className="compass-needle right"></div>
             <div className="compass-needle bottom"></div>
             <div className="compass-needle left"></div>
           </div>
         </button>
       </div>
     </nav>

     <div className={`mobile-nav ${isOpen ? 'open' : ''}`}>
       <div className="mobile-nav-content">
         <Link href="/" onClick={() => setIsOpen(false)}>Home</Link>
         <Link href="/about" onClick={() => setIsOpen(false)}>About</Link>
         <Link href="/work" onClick={() => setIsOpen(false)}>Work With Me</Link>
         <Link href="/circle" onClick={() => setIsOpen(false)}>The CoR</Link>
         <Link href="/library" onClick={() => setIsOpen(false)}>Library</Link>
         <Link href="/contact" onClick={() => setIsOpen(false)}>Contact</Link>
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