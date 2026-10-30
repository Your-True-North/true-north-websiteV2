import s from '../shortfuse.module.css'

const STEPS = [
  ['Pop your email in', 'No calls, no card, no catch.'],
  ['Day 1 lands', 'A short video from me, straight to your inbox. No fluff. Straight talking.'],
  ['One a day', 'Watch it, sit with the question, notice what comes up.'],
]

const LEARN = [
  ["What's under it", "What's really sitting under your reactions, and why it keeps coming back."],
  ['Where it lives', "How your body stores what you've never dealt with, and how to start letting it move."],
  ['The gap', 'How to create space between the trigger and the reaction. That space is where your choice lives.'],
  ['Your answers', "I'm not going to tell you what to do. I'll ask you questions. You already have the answers."],
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
          <div className={s.learn}>
            {LEARN.map(([title, text]) => (
              <div key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
          <p className={s.ask}>&quot;Would the things that have been pissing me off recently still have bothered me if I was living my ideal life?&quot;</p>
        </div>
      </div>
    </section>
  )
}
