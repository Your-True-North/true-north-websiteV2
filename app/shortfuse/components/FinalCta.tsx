import s from '../shortfuse.module.css'
import OptInForm from './OptInForm'

export default function FinalCta() {
  return (
    <section className={`${s.band} ${s.navy}`}>
      <div className={`${s.wrap} ${s.grid}`}>
        <p className={s.side}>Ready</p>
        <div className={`${s.mainN} ${s.flow}`}>
          <p className={s.muted}>There are two types of people. Those that sign up to the free gifts and never open them. I see them in exactly the same place years later. Then there are those that open them, do them, and put their growth to the front of the line.</p>
          <p className={s.muted}>If you&apos;re the first one, better you wait until you are ready. And that&apos;s ok.</p>
          <h2 className={`${s.big} ${s.finalH}`}>Where you are now does not have to be where you end up.</h2>
          <OptInForm id="bottom" button="Start The Short Fuse free" fine="14 days. Unsubscribe any time." />
          <p className={`${s.cond} ${s.sign}`}>True</p>
        </div>
      </div>
    </section>
  )
}
