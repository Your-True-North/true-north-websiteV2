'use client'

import Link from 'next/link'

interface BreadcrumbProps {
  items: { label: string; href?: string }[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div style={{
      maxWidth: '80rem',
      margin: '0 auto',
      padding: '1rem 1.5rem',
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: 300,
        color: 'rgba(255, 255, 255, 0.5)'
      }}>
        {items.map((item, index) => (
          <span key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {item.href ? (
              <Link
                href={item.href}
                style={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#7fb069'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'}
              >
                {item.label}
              </Link>
            ) : (
              <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{item.label}</span>
            )}
            {index < items.length - 1 && <span>→</span>}
          </span>
        ))}
      </div>
    </div>
  )
}
