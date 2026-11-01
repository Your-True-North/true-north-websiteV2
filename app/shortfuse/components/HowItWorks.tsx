import s from '../shortfuse.module.css'

const STEPS = [
  ['Pop your email in', 'No calls, no card, no catch.'],
  ['Day 1 lands', 'A short video from me, straight to your inbox. No fluff. Straight talking.'],
  ['One a day', 'Watch it, sit with the question, notice what comes up.'],
]

export default function HowItWorks() {
  return (
    <section className={`${s.band} ${s.paper} ${s.howBand}`}>
      <div className={`${s.wrap} ${s.grid}`}>
        <p className={s.side}>How it works</p>
        <div className={`${s.main} ${s.flow}`} style={{ gap: '2.4rem' }}>
          <h2 className={s.big}>A few minutes a day. 14 days.</h2>
          <ol className={s.steps}>
            {STEPS.map(([title, text], i) => (
              <li key={title}>
                <span className={s.n}>{i + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
          <p className={s.ask}>&quot;Would the things that have been pissing me off recently still have bothered me if I was living my ideal life?&quot;</p>
        </div>
      </div>
    </section>
  )
}
