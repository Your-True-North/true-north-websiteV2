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
    localStorage.removeItem('user');
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    setUser(null);
    setIsOpen(false);
    router.push('/');
  };

  return (
    <nav className="nav">
      <div className="nav-container">
        <Link href="/" className="nav-logo">
          <Image 
            src="/logo.png" 
            alt="True North" 
            width={72} 
            height={72} 
            className="nav-logo-image"
            priority
          />
        </Link>
        
        <div className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <ul>
            <li><Link href="/work">Work With Me</Link></li>
            <li>
              <Link href="/circle" className="cor-link">The CoR</Link>     
            </li>
            <li><Link href="/library">Library</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li>
              {user ? (
                <button onClick={handleLogout} className="breathing-button" style={{
                  padding: '0.5rem 1.25rem',
                  background: 'linear-gradient(135deg, #9bc4b8, #7fb069)',
                  color: '#000',
                  borderRadius: '6px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  border: 'none',
                  cursor: 'pointer'
                }}>Logout</button>
              ) : (
                <Link href="/auth/login" className="breathing-button" style={{
                  padding: '0.5rem 1.25rem',
                  background: 'linear-gradient(135deg, #9bc4b8, #7fb069)',
                  color: '#000',
                  borderRadius: '6px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}>Login</Link>
              )}
            </li>
          </ul>
        </div>

        <button 
          className="mobile-nav-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div className={`mobile-nav-overlay ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
        <div className="mobile-nav-content" onClick={(e) => e.stopPropagation()}>
          <button 
            className="mobile-nav-close"
            onClick={() => setIsOpen(false)}
            aria-label="Close navigation"
          >
            ×
          </button>
          
          <ul className="mobile-nav-links">
            <li>
              <Link href="/" onClick={() => setIsOpen(false)}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/work" onClick={() => setIsOpen(false)}>
                Work With Me
              </Link>
            </li>
            <li>
              <Link href="/circle" onClick={() => setIsOpen(false)} className="cor-link">
                The CoR
              </Link>
            </li>
            <li>
              <Link href="/library" onClick={() => setIsOpen(false)}>
                Library
              </Link>
            </li>
            <li>
              <Link href="/contact" onClick={() => setIsOpen(false)}>
                Contact
              </Link>
            </li>
            <li>
              {user ? (
                <button onClick={handleLogout} className="breathing-button" style={{
                  padding: '0.5rem 1.25rem',
                  background: 'linear-gradient(135deg, #9bc4b8, #7fb069)',
                  color: '#000',
                  borderRadius: '6px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  display: 'block',
                  width: '100%',
                  textAlign: 'center',
                  border: 'none',
                  cursor: 'pointer'
                }}>Logout</button>
              ) : (
                <Link href="/auth/login" onClick={() => setIsOpen(false)} className="breathing-button" style={{
                  padding: '0.5rem 1.25rem',
                  background: 'linear-gradient(135deg, #9bc4b8, #7fb069)',
                  color: '#000',
                  borderRadius: '6px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  display: 'block',
                  textAlign: 'center'
                }}>Login</Link>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
