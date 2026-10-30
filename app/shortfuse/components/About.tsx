import s from '../shortfuse.module.css'

const CREDS = [
  'Somatic practitioner, trained by Gabor Maté',
  'ICF accredited coach',
  'Breathwork facilitator, IBF certified',
  'Reiki Master',
]

export default function About() {
  return (
    <section className={`${s.band} ${s.navy}`}>
      <div className={`${s.wrap} ${s.grid}`}>
        <p className={s.side}>Who&apos;s talking</p>
        <div className={`${s.mainN} ${s.flow}`}>
          <h2 className={s.big}>I used to be short fused and highly reactive.</h2>
          <p>Drugs and violence was all I knew. I&apos;d ignored the root cause of my anger for so long that I didn&apos;t know there was one. It caused me more pain than anyone else ever did.</p>
          <p>A part of me had to die to become the man I am today. Now I spend my life helping men do the same work.</p>
          <ul className={s.creds}>
            {CREDS.map(c => <li key={c}>{c}</li>)}
          </ul>
        </div>
      </div>
    </section>
  )
}
