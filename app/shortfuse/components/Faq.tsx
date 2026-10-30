import s from '../shortfuse.module.css'

export default function Faq() {
  return (
    <section className={`${s.band} ${s.paper}`}>
      <div className={`${s.wrap} ${s.grid}`}>
        <p className={s.side}>Questions</p>
        <div className={`${s.main} ${s.faq}`}>
          <details>
            <summary>Is this anger management?</summary>
            <div className={s.a}><p>No. Anger management works on the reaction. This goes underneath it, to what&apos;s lighting the fuse in the first place.</p></div>
          </details>
          <details>
            <summary>I don&apos;t shout or kick off. Is this for me?</summary>
            <div className={s.a}>
              <p>So many confuse anger with rage. They&apos;re not the same. You can be angry in silence, and for a long period of time. So long that it becomes a constant numbness you carry around.</p>
              <p>If any of those lines sounded like you, it&apos;s for you.</p>
            </div>
          </details>
          <details>
            <summary>How much time does it take?</summary>
            <div className={s.a}><p>A few minutes a day. One short video, one question to sit with.</p></div>
          </details>
          <details>
            <summary>Is it actually free?</summary>
            <div className={s.a}><p>Yes. No card, no catch. Unsubscribe whenever you like.</p></div>
          </details>
        </div>
      </div>
    </section>
  )
}
