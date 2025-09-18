'use client'

export default function Circle() {
  return (
    <div className="page-container">
      <section className="section">
        <div className="container">
          <h1 className="h1">The Circle of Return</h1>
          <p className="body-large">
            You're not about to join a community. You're entering a portal for you to return to yourself. 
            To return to your truth. To Source. To love. To embodiment. To now.
          </p>
          
          <div className="card" style={{ textAlign: 'center', margin: '3rem 0' }}>
            <h2 className="h2">The Investment</h2>
            <div style={{ fontSize: '3rem', color: 'var(--primary)', margin: '2rem 0' }}>
              £50<span style={{ fontSize: '1.5rem', opacity: '0.7' }}>/month</span>
            </div>
            <p className="body">
              You can cancel anytime. No pressure. No contracts. No tactics.<br />
              Just you, choosing to come home at your own pace, in your own time.
            </p>
            
            <button className="btn-primary" style={{ marginTop: '2rem' }}>
              Enter The Portal
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}