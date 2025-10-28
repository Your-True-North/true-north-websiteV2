'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface FoundingMember {
  signup_number: number
  name: string
  email: string
  signup_date: string
  subscription_status: string
  last_login: string | null
  stripe_customer_id: string
}

export default function AdminFoundingPage() {
  const router = useRouter()
  const [members, setMembers] = useState<FoundingMember[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'signup_number' | 'name' | 'signup_date'>('signup_number')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    // Check if user is admin
    const userData = localStorage.getItem('user')
    if (!userData) {
      window.location.replace('/auth/login')
      return
    }

    try {
      const user = JSON.parse(userData)
      if (user.role !== 'admin') {
        router.push('/members')
        return
      }
    } catch (error) {
      window.location.replace('/auth/login')
      return
    }

    fetchMembers()
  }, [router])

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/admin/founding')
      const data = await res.json()

      if (res.ok) {
        setMembers(data.members || [])
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  const sortedMembers = [...members].sort((a, b) => {
    let aVal = a[sortBy]
    let bVal = b[sortBy]

    if (sortBy === 'signup_date') {
      aVal = new Date(aVal as string).getTime()
      bVal = new Date(bVal as string).getTime()
    }

    if (sortDir === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  const exportToCSV = () => {
    const headers = ['Signup #', 'Name', 'Email', 'Signup Date', 'Status', 'Last Login', 'Stripe Customer ID']
    const rows = sortedMembers.map(m => [
      m.signup_number,
      m.name,
      m.email,
      new Date(m.signup_date).toLocaleDateString(),
      m.subscription_status,
      m.last_login ? new Date(m.last_login).toLocaleDateString() : 'Never',
      m.stripe_customer_id
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `founding-members-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDir('asc')
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 300 }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '2rem' }}>
      <div style={{ maxWidth: '90rem', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 300, marginBottom: '0.5rem' }}>
              Founding Members
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Circle of Return - First 30
            </p>
          </div>

          <Link href="/members" style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            color: '#fff',
            textDecoration: 'none',
            fontSize: '0.875rem'
          }}>
            ← Back to Dashboard
          </Link>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(155, 196, 184, 0.15), rgba(127, 176, 105, 0.1))',
            border: '1px solid rgba(155, 196, 184, 0.3)',
            borderRadius: '6px'
          }}>
            <div style={{ fontSize: '3rem', fontWeight: 300, color: '#9bc4b8', marginBottom: '0.5rem' }}>
              {members.length}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              Total Founding Members
            </div>
          </div>

          <div style={{
            padding: '1.5rem',
            background: members.length >= 30
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.1))'
              : 'linear-gradient(135deg, rgba(127, 176, 105, 0.15), rgba(155, 196, 184, 0.1))',
            border: members.length >= 30
              ? '1px solid rgba(239, 68, 68, 0.4)'
              : '1px solid rgba(127, 176, 105, 0.3)',
            borderRadius: '6px'
          }}>
            <div style={{
              fontSize: '3rem',
              fontWeight: 300,
              color: members.length >= 30 ? '#ef4444' : '#7fb069',
              marginBottom: '0.5rem'
            }}>
              {Math.max(0, 30 - members.length)}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              {members.length >= 30 ? 'Sold Out!' : 'Spots Remaining'}
            </div>
          </div>

          <div style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(106, 153, 78, 0.15), rgba(155, 196, 184, 0.1))',
            border: '1px solid rgba(106, 153, 78, 0.3)',
            borderRadius: '6px'
          }}>
            <div style={{ fontSize: '3rem', fontWeight: 300, color: '#6a994e', marginBottom: '0.5rem' }}>
              {members.filter(m => m.subscription_status === 'active').length}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              Active Subscriptions
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ fontSize: '1.125rem', fontWeight: 400 }}>
            {members.length} members
          </div>

          <button
            onClick={exportToCSV}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #9bc4b8, #7fb069)',
              border: 'none',
              borderRadius: '6px',
              color: '#000',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Export to CSV
          </button>
        </div>

        {/* Table */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.875rem'
            }}>
              <thead>
                <tr style={{ background: 'rgba(0, 0, 0, 0.3)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <th
                    onClick={() => handleSort('signup_number')}
                    style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: 500,
                      color: '#9bc4b8',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    # {sortBy === 'signup_number' && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('name')}
                    style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: 500,
                      color: '#9bc4b8',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Name {sortBy === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500, color: '#9bc4b8' }}>
                    Email
                  </th>
                  <th
                    onClick={() => handleSort('signup_date')}
                    style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: 500,
                      color: '#9bc4b8',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Signup Date {sortBy === 'signup_date' && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500, color: '#9bc4b8' }}>
                    Status
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 500, color: '#9bc4b8' }}>
                    Last Login
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{
                      padding: '3rem',
                      textAlign: 'center',
                      color: 'rgba(255, 255, 255, 0.5)'
                    }}>
                      No founding members yet
                    </td>
                  </tr>
                ) : (
                  sortedMembers.map((member, index) => (
                    <tr key={index} style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '1rem', color: '#9bc4b8', fontWeight: 600 }}>
                        #{member.signup_number}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {member.name}
                      </td>
                      <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                        {member.email}
                      </td>
                      <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                        {new Date(member.signup_date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          background: member.subscription_status === 'active'
                            ? 'rgba(127, 176, 105, 0.2)'
                            : 'rgba(239, 68, 68, 0.2)',
                          border: `1px solid ${member.subscription_status === 'active'
                            ? 'rgba(127, 176, 105, 0.4)'
                            : 'rgba(239, 68, 68, 0.4)'}`,
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          color: member.subscription_status === 'active' ? '#7fb069' : '#ef4444'
                        }}>
                          {member.subscription_status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.875rem' }}>
                        {member.last_login ? new Date(member.last_login).toLocaleDateString() : 'Never'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
