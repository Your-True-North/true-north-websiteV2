import Image from 'next/image'
import s from '../shortfuse.module.css'
import OptInForm from './OptInForm'

export default function Hero() {
  return (
    <section className={`${s.hero} ${s.paper}`}>
      <div className={s.wrap}>
        <h1 className={s.mega}>It&apos;s never really about what set you off.</h1>
        <div className={s.heroRow}>
          <div className={s.heroCopy}>
            <p className={s.lede}>
              You don&apos;t know it in the moment, but the reaction is bigger than the thing. <em>The Short Fuse</em> is 14 days of short videos to help you find what&apos;s actually lighting it.
            </p>
            <OptInForm id="top" button="Send me Day 1" fine="Free. One short video a day. Unsubscribe any time." />
          </div>
          <div className={s.heroVid}>
            <figure className={s.heroPhoto}>
              <div className={s.portrait}>
                <Image
                  src="/serious.jpg"
                  alt="Portrait of True"
                  fill
                  priority
                  sizes="(max-width: 859px) 100vw, 416px"
                  style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
                />
              </div>
              <figcaption>True. Used to be short fused and highly reactive.</figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  )
}
