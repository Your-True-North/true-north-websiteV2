'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 bg-stone-950/80 backdrop-blur-md border-b border-stone-800/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center py-6">
          <Link href="/" className="font-crimson text-2xl font-bold text-amber-400">
            True North
          </Link>
          
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-stone-300 hover:text-amber-400 transition-colors">Portal</Link>
            <Link href="/work" className="text-stone-300 hover:text-amber-400 transition-colors">Fire</Link>
            <Link href="/circle" className="text-stone-300 hover:text-amber-400 transition-colors">Air</Link>
            <Link href="/resources" className="text-stone-300 hover:text-amber-400 transition-colors">Earth</Link>
            <Link href="/about" className="text-stone-300 hover:text-amber-400 transition-colors">True North</Link>
            <Link href="/contact" className="text-stone-300 hover:text-amber-400 transition-colors">Spirit</Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
