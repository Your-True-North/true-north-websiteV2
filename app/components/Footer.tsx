'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname();

  const protectedPaths = ['/members', '/journey', '/admin', '/auth'];
  const shouldHideFooter = protectedPaths.some(path => pathname?.startsWith(path));

  return (
    <footer className="footer" style={{
      opacity: shouldHideFooter ? 0 : 1,
      pointerEvents: shouldHideFooter ? 'none' : 'auto',
      transition: 'opacity 0.15s ease-out'
    }}>
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-main">
          <div className="footer-brand">
            <div className="footer-logo">
              <Image
                src="/white white star.png"
                alt="True North"
                width={120}
                height={40}
                style={{objectFit: 'contain'}}
              />
            </div>
            <p className="footer-tagline">
              Transform Your Pain Into Power
            </p>
            <p className="footer-description">
              Authentic transformation through somatic therapy, breathwork, and energy healing.
              Not another coach — a guide for those ready to return to their truth.
            </p>
          </div>

          <div className="footer-links-grid">
            <div className="footer-column">
              <h4 className="footer-heading">Work With Me</h4>
              <ul className="footer-links">
                <li><Link href="/work">1:1 Transformation</Link></li>
                <li><Link href="/circle">The Sacred Circle</Link></li>
                <li><Link href="/resources">Library</Link></li>
                <li><Link href="/contact">Discovery Call</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">Learn</h4>
              <ul className="footer-links">
                <li><Link href="/about">My Story</Link></li>
                <li><Link href="/resources">Free Library</Link></li>
                <li><a href="#blog">Weekly Wisdom</a></li>
                <li><a href="#testimonials">Client Stories</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">Connect</h4>
              <ul className="footer-links">
                <li><a href="mailto:hello@truenorth.com">Email</a></li>
                <li><a href="https://wa.me/447449052909" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
                <li><a href="https://instagram.com/your_truenorth_" target="_blank" rel="noopener noreferrer">Instagram</a></li>
                <li><a href="http://linkedin.com/in/true-north-0b55a533/" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
                <li><a href="https://www.youtube.com/@Your_TrueNorth" target="_blank" rel="noopener noreferrer">YouTube</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quote Section */}
        <div className="footer-quote">
          <blockquote>
            <p>"Where you are now does not have to be where you end up."</p>
          </blockquote>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <p>&copy; 2025 True North. All rights reserved.</p>
          </div>
          <div className="footer-bottom-right">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <span className="footer-location">Based in London</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
