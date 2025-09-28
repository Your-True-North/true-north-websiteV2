'use client';

import { useState } from 'react';
import Image from 'next/image';

interface NavigationProps {
  triggerTransition?: (callback: () => void) => void;
}

export default function Navigation({ triggerTransition }: NavigationProps) {
 const [isOpen, setIsOpen] = useState(false);

 const handleNavClick = (href: string) => {
   setIsOpen(false);
   
   if (triggerTransition) {
     triggerTransition(() => {
       window.location.href = href;
     });
   } else {
     window.location.href = href;
   }
 };

 return (
   <>
     <nav className="nav">
       <div className="nav-container">
         <button onClick={() => handleNavClick('/')} className="nav-logo">
           <Image
             src="/white white star.png"
             alt="True North"
             width={72}
             height={72}
             className="nav-logo-image"
             priority
           />
         </button>

         <div className="desktop-nav">
           <ul className="nav-links">
             <li><button onClick={() => handleNavClick('/')}>Home</button></li>
             <li><button onClick={() => handleNavClick('/about')}>About</button></li>
             <li><button onClick={() => handleNavClick('/work')}>Work With Me</button></li>
             <li>
               <button onClick={() => handleNavClick('/circle')} className="cor-link">
                 The CoR
               </button>
             </li>
             <li><button onClick={() => handleNavClick('/library')}>Library</button></li>
             <li><button onClick={() => handleNavClick('/contact')}>Contact</button></li>
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
         <button onClick={() => handleNavClick('/')}>Home</button>
         <button onClick={() => handleNavClick('/about')}>About</button>
         <button onClick={() => handleNavClick('/work')}>Work With Me</button>
         <button onClick={() => handleNavClick('/circle')} className="cor-link">
           The CoR
         </button>
         <button onClick={() => handleNavClick('/library')}>Library</button>
         <button onClick={() => handleNavClick('/contact')}>Contact</button>
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