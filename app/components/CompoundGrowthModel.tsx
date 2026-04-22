'use client'
import { useState } from 'react'
import { trackEvent } from '@/app/components/GoogleAnalytics'

const GOALS = {
  money: {
    stages: [
      {
        title: 'Inner work',
        sub: 'Face the wound underneath the pattern',
        mechanism: 'Most men who undercharge, stay stuck, or sabotage success are not lacking skill. They are carrying identity wounds. Shame, unworthiness, inherited scarcity. The breathwork and somatic work surfaces what the mind has spent years avoiding.',
        outcome: 'You meet what has been running the show from the basement.',
      },
      {
        title: 'Regulated nervous system',
        sub: 'Cortisol drops. Capacity opens.',
        mechanism: 'When the body is no longer in low-grade survival mode, energy that was reserved for threat management becomes available. Decisions slow down. Reactivity drops. You stop operating from a place of quiet desperation.',
        outcome: 'You can finally think straight. Not just in your head, in your body.',
      },
      {
        title: 'Clarity and presence',
        sub: 'You stop underselling yourself',
        mechanism: 'Identity wounds make men negotiate from a place of scarcity. When those heal, you hold your ground in a room. You price your work at what it is worth. You walk away from things that do not serve. Presence is the actual currency and now you have it.',
        outcome: 'Same skills. Different internal operating system. Dramatically different results.',
      },
      {
        title: 'External results compound',
        sub: 'The man changes so does the income',
        mechanism: 'This is not manifesting. It is physics. A man who shows up differently, who decides from clarity, leads from presence, and no longer self-sabotages, builds different results. And it compounds. Month by month. The principal is you.',
        outcome: 'Health, income, relationships and inner peace all compound because they share the same root.',
      },
    ],
    result: {
      heading: 'Same man. Same skills. Different operating system.',
      body: 'The ceiling is not out there. It never was. No one can do the pushups for you, but no one can do this inner work and not see it show up in the numbers.',
    }
  },
  relationships: {
    stages: [
      {
        title: 'Inner work',
        sub: 'Trace the pattern back to its root',
        mechanism: 'Every relational pattern, the shutting down, the overreacting, the choosing wrong, the settling, started somewhere. Not because you are broken. Because the body learned to protect. The work begins by meeting what is actually there.',
        outcome: 'The wound gets a name. Once named, it stops steering in the dark.',
      },
      {
        title: 'Regulated nervous system',
        sub: 'Reactivity decreases. Presence increases.',
        mechanism: 'A dysregulated nervous system cannot safely attach. It scans for threat, reads neutral expressions as hostile, withdraws when closeness gets too real. When regulation improves, connection becomes biologically possible, not just intellectually desired.',
        outcome: 'You stop punishing people for wounds they did not cause.',
      },
      {
        title: 'Clarity and presence',
        sub: 'You show up differently',
        mechanism: 'Presence, genuine and undefended, is what people actually respond to. Not strategies, not lines. When you are no longer performing or protecting, you become someone worth being around. That changes the relational field.',
        outcome: 'Your relationships start to reflect a man who has done the work.',
      },
      {
        title: 'External results compound',
        sub: 'Deeper bonds. Cleaner conflict. Real intimacy.',
        mechanism: 'The man who has met his own darkness no longer needs to outsource his emotional regulation to the people closest to him. He becomes safe, to a partner, to children, to men around him. That ripples.',
        outcome: 'The compound interest here is legacy. The work you do changes what your children inherit.',
      },
    ],
    result: {
      heading: 'The work you do on yourself is the work you do on every relationship you carry.',
      body: 'Every relationship you want has the same prerequisite: a man who has been honest with himself.',
    }
  },
  health: {
    stages: [
      {
        title: 'Inner work',
        sub: 'The body holds what the mind avoids',
        mechanism: 'Chronic stress, suppressed emotion, unprocessed grief, all of it lives in the body. Somatic work, breathwork, and energy healing are not alternatives to medicine. They are access points to the nervous system that medicine does not reach.',
        outcome: 'The body begins to speak. You begin to listen.',
      },
      {
        title: 'Regulated nervous system',
        sub: 'Cortisol drops. Biology shifts.',
        mechanism: 'Sustained cortisol elevations suppress immune function, disrupt sleep, drive inflammation, and accelerate aging. A regulated nervous system reverses this cascade, not overnight, but consistently. Sleep deepens. Energy returns. The body stops fighting itself.',
        outcome: 'Physical symptoms that had no apparent cause begin to resolve.',
      },
      {
        title: 'Clarity and presence',
        sub: 'You make different decisions from here',
        mechanism: 'When a man is regulated, he no longer numbs with food, alcohol, screens, or overwork. He exercises because he is connected to his body, not because he is punishing it. The relationship with the body becomes one of care rather than war.',
        outcome: 'Discipline stops being a battle. It becomes an expression of self-respect.',
      },
      {
        title: 'External results compound',
        sub: 'The body reflects the internal shift',
        mechanism: 'A man who has dealt with the root, the emotional drivers beneath the physical habits, will change his body because the driver changed. And it compounds: better sleep, more energy, cleaner decisions, physical vitality. The body follows the man.',
        outcome: 'The best investment in your physical health is the work you are avoiding.',
      },
    ],
    result: {
      heading: 'The body has been asking for your attention. This is how you give it.',
      body: 'Where you are now does not have to be where you end up. The work is not separate from the result. It is the result.',
    }
  },
  purpose: {
    stages: [
      {
        title: 'Inner work',
        sub: 'Clear the noise to hear the signal',
        mechanism: 'Most men are not confused about purpose. They are overwhelmed by obligation, fear of judgment, unresolved wounds, and voices that are not theirs. The inner work clears the interference so the actual signal can be heard.',
        outcome: 'You start to distinguish what is truly yours from what you were handed.',
      },
      {
        title: 'Regulated nervous system',
        sub: 'The fog lifts',
        mechanism: 'A nervous system in survival mode cannot access the prefrontal cortex reliably. The part of the brain responsible for long-range thinking, values-based decisions, and creative meaning-making goes offline under chronic stress. Regulation turns it back on.',
        outcome: 'You can think further forward than next week.',
      },
      {
        title: 'Clarity and presence',
        sub: 'Directed energy becomes force',
        mechanism: 'A man whose energy is no longer scattered across suppression, reactivity, and anxiety has enormous capacity available. That capacity, aimed at something real, becomes force. Not hustle. Force. The difference is that it is sustainable and it is true.',
        outcome: 'You stop dabbling. You commit because you finally know what to commit to.',
      },
      {
        title: 'External results compound',
        sub: 'The work aligns with the man',
        mechanism: 'Purpose is not discovered, it is revealed as the obscuring layers are removed. When a mans work reflects who he actually is, not who he thought he should be, the quality of that work shifts. And the world responds to it differently.',
        outcome: 'Meaning compounds. So does impact. So does fulfilment.',
      },
    ],
    result: {
      heading: 'Purpose does not hide. It waits beneath the noise you have not yet been willing to face.',
      body: 'Stop with the halfhearted living. The work is not preparation for purpose. It is purpose in motion.',
    }
  },
  anger: {
    stages: [
      {
        title: 'Inner work',
        sub: 'Understand what the anger is protecting',
        mechanism: 'Anger is not the problem. Unexamined anger is. The breathwork and somatic work creates access to what the anger is protecting, usually fear, grief, or a wound that never got acknowledged. You cannot choose differently until you can see clearly.',
        outcome: 'You meet what the anger has been guarding.',
      },
      {
        title: 'Regulated nervous system',
        sub: 'The window of tolerance widens',
        mechanism: 'When the nervous system is chronically dysregulated, the threshold for reactivity is low. Small triggers produce large responses. Regulation raises that threshold, not by suppressing anger, but by increasing the space between stimulus and response. That space is everything.',
        outcome: 'You get a second before you react. Then two seconds. Then a choice.',
      },
      {
        title: 'Clarity and presence',
        sub: 'Response replaces reaction',
        mechanism: 'A regulated man can feel anger without being controlled by it. He can express it clearly, without damage. He can use it as information rather than as a weapon. Anger becomes a signal instead of a sentence.',
        outcome: 'You become someone safe, to others, and to yourself.',
      },
      {
        title: 'External results compound',
        sub: 'Everything downstream changes',
        mechanism: 'A man who has done this work does not just manage his anger better. His relationships repair. His authority increases because people can trust him. His children inherit a different nervous system than the one he was given. That is the real work.',
        outcome: 'Anger was never the enemy. It was a messenger. Now you can hear what it was trying to say.',
      },
    ],
    result: {
      heading: 'Anger is a choice once you have done the work to make it one.',
      body: 'This is not anger management. This is transformation. The two are not the same thing.',
    }
  }
}

type GoalKey = keyof typeof GOALS

export default function CompoundGrowthModel() {
  const [currentGoal, setCurrentGoal] = useState<GoalKey | null>(null)
  const [unlockedCount, setUnlockedCount] = useState(0)
  const [openStage, setOpenStage] = useState<number | null>(null)

  const goals: { key: GoalKey; label: string }[] = [
    { key: 'money', label: 'Money' },
    { key: 'relationships', label: 'Relationships' },
    { key: 'health', label: 'Health' },
    { key: 'purpose', label: 'Purpose' },
    { key: 'anger', label: 'Anger' },
  ]

  function selectGoal(key: GoalKey) {
    setCurrentGoal(key)
    setUnlockedCount(1)
    setOpenStage(0)
    trackEvent('healing_journey_domain', { domain: key })
  }

  function toggleStage(i: number) {
    if (i >= unlockedCount) return
    setOpenStage(openStage === i ? null : i)
  }

  function advance(i: number) {
    if (!currentGoal) return
    const stages = GOALS[currentGoal].stages
    const isLast = i === stages.length - 1
    if (isLast) {
      setOpenStage(null)
      setUnlockedCount(stages.length + 1)
    } else {
      setUnlockedCount(i + 2)
      setOpenStage(i + 1)
    }
  }

  const data = currentGoal ? GOALS[currentGoal] : null
  const showResult = currentGoal && unlockedCount > (data?.stages.length ?? 0)

  return (
    <div style={{ marginBottom: '4rem' }}>
      <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, marginBottom: '28px', maxWidth: '560px' }}>
        Most men arrive here through one door - money, relationships, health, anger, or a loss of purpose. The work is the same regardless. Select what brought you here and follow it through.
      </p>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
        {goals.map(g => (
          <button
            key={g.key}
            onClick={() => selectGoal(g.key)}
            style={{
              padding: '11px 22px',
              fontSize: '14px',
              borderRadius: '4px',
              border: currentGoal === g.key ? '1px solid rgba(155,196,184,0.8)' : '1px solid rgba(255,255,255,0.18)',
              background: currentGoal === g.key ? 'rgba(155,196,184,0.15)' : 'rgba(255,255,255,0.04)',
              color: currentGoal === g.key ? '#9bc4b8' : 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '0.02em',
            }}
          >
            {g.label}
          </button>
        ))}
      </div>

      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {data.stages.map((s, i) => {
            const isUnlocked = i < unlockedCount
            const isCurrent = i === unlockedCount - 1
            const isOpen = i === openStage

            return (
              <div
                key={i}
                style={{
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  background: isCurrent ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                  opacity: isUnlocked ? 1 : 0.25,
                  pointerEvents: isUnlocked ? 'auto' : 'none',
                  transition: 'opacity 0.3s, background 0.2s',
                }}
              >
                <div
                  onClick={() => toggleStage(i)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '18px 20px',
                    cursor: isUnlocked ? 'pointer' : 'default',
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 500,
                    flexShrink: 0,
                    border: isCurrent ? '1px solid #9bc4b8' : '1px solid rgba(255,255,255,0.2)',
                    background: isCurrent ? 'rgba(155,196,184,0.2)' : 'transparent',
                    color: isCurrent ? '#9bc4b8' : 'rgba(255,255,255,0.35)',
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: 500, color: 'rgba(255,255,255,0.92)' }}>{s.title}</div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '3px' }}>{s.sub}</div>
                  </div>
                  {isUnlocked && (
                    <div style={{
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.3)',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.25s',
                    }}>▼</div>
                  )}
                </div>

                {isOpen && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '18px 20px 20px' }}>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, marginBottom: '16px' }}>
                      {s.mechanism}
                    </p>
                    <div style={{
                      background: 'rgba(155,196,184,0.08)',
                      borderRadius: '8px',
                      padding: '14px 16px',
                      fontSize: '14px',
                      color: 'rgba(255,255,255,0.85)',
                      fontWeight: 500,
                      lineHeight: 1.6,
                      marginBottom: '16px',
                    }}>
                      {s.outcome}
                    </div>
                    <button
                      onClick={() => advance(i)}
                      style={{
                        fontSize: '13px',
                        padding: '9px 20px',
                        borderRadius: '999px',
                        border: '1px solid rgba(155,196,184,0.4)',
                        background: 'transparent',
                        color: '#9bc4b8',
                        cursor: 'pointer',
                        letterSpacing: '0.01em',
                      }}
                    >
                      {i === data.stages.length - 1 ? 'See where this leads →' : 'As your journey continues →'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}

          {showResult && (
            <div style={{
              marginTop: '8px',
              border: '1px solid rgba(155,196,184,0.2)',
              borderRadius: '8px',
              background: 'rgba(155,196,184,0.05)',
              padding: '20px',
            }}>
              <p style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>
                {data.result.heading}
              </p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>
                {data.result.body}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
