import s from '../shortfuse.module.css'

export default function Reframe() {
  return (
    <section className={`${s.band} ${s.paper}`}>
      <div className={`${s.wrap} ${s.grid}`}>
        <p className={s.side}>The truth</p>
        <div className={`${s.main} ${s.flow}`} style={{ gap: '2rem' }}>
          <p className={s.quote}>
            &quot;She, he, they, that is why I&apos;m angry.&quot;<br />
            <span className={s.out}>No.</span> They just showed you an unhealed wound.
          </p>
          <div className={`${s.flow} ${s.body}`}>
            <p>95% of the things that trigger you aren&apos;t the real cause of your anger. That&apos;s why all the things you&apos;ve tried haven&apos;t worked. Why counting to 10 hasn&apos;t worked. Why taking a deep breath hasn&apos;t worked. Why walking away hasn&apos;t worked. Why promising yourself you&apos;d be calmer hasn&apos;t worked.</p>
            <p>You may avoid one or two explosions, but then you&apos;re back repeating the pattern.</p>
            <p>You&apos;ve been working on the reaction. The reaction is the symptom. Your body is holding onto memories your mind has chosen to forget.</p>
            <p><b>Your anger is a mask. The work is finding what it&apos;s covering.</b></p>
          </div>
        </div>
      </div>
    </section>
  )
}
