'use client'

import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '1rem',
      fontSize: '0.875rem',
      fontWeight: 300
    }}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {item.href && !isLast ? (
              <Link
                href={item.href}
                style={{
                  color: '#9bc4b8',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#7fb069'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#9bc4b8'}
              >
                {item.label}
              </Link>
            ) : (
              <span style={{
                color: isLast ? 'rgba(255, 255, 255, 0.9)' : '#9bc4b8'
              }}>
                {item.label}
              </span>
            )}

            {!isLast && (
              <svg
                style={{
                  width: '1rem',
                  height: '1rem',
                  color: 'rgba(255, 255, 255, 0.3)'
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </div>
        )
      })}
    </nav>
  )
}
