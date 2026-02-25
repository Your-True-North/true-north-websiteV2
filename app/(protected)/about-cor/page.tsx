export default function AboutCorPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#0a0a0a' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1.5rem 4rem' }}>
        <h1 style={{
          fontFamily: 'Gambarino, serif',
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 400,
          color: '#0a0a0a',
          marginBottom: '2.5rem',
          lineHeight: 1.2
        }}>
          About The Circle of Return
        </h1>

        {/* Video placeholder */}
        <div style={{
          background: '#f5f5f5',
          border: '1px solid #e5e5e5',
          borderRadius: '12px',
          aspectRatio: '16 / 9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '3rem'
        }}>
          <span style={{ color: '#999', fontSize: '1rem', fontWeight: 300 }}>Video coming soon</span>
        </div>

        {/* My Story */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{
            fontFamily: 'Gambarino, serif',
            fontSize: '1.75rem',
            fontWeight: 400,
            color: '#0a0a0a',
            marginBottom: '1rem'
          }}>
            My Story
          </h2>
          <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#333', fontWeight: 300 }}>
            This is where Mason&apos;s personal story will be shared &mdash; from where he came from to why he created The Circle of Return.
          </p>
        </section>

        {/* What I Want For You */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{
            fontFamily: 'Gambarino, serif',
            fontSize: '1.75rem',
            fontWeight: 400,
            color: '#0a0a0a',
            marginBottom: '1rem'
          }}>
            What I Want For You
          </h2>
          <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#333', fontWeight: 300 }}>
            This section will explain Mason&apos;s vision for every member of The CoR and what transformation looks like in practice.
          </p>
        </section>

        {/* How The CoR Works */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{
            fontFamily: 'Gambarino, serif',
            fontSize: '1.75rem',
            fontWeight: 400,
            color: '#0a0a0a',
            marginBottom: '1rem'
          }}>
            How The CoR Works
          </h2>
          <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#333', fontWeight: 300 }}>
            An explanation of how the Circle of Return is structured, what members can expect, and how to get the most from the community.
          </p>
        </section>
      </div>
    </div>
  )
}
