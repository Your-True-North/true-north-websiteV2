'use client'
import { useState } from 'react'
import { trackEvent } from '@/app/components/GoogleAnalytics'

const GOALS = {
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
  },
  addiction: {
    stages: [
      {
        title: 'Inner work',
        sub: 'Find out what the reaching is for',
        mechanism: 'The drink, the scrolling, the porn, the work, the food. The substance is not the point. It is doing a job, and the job is usually regulating something you have never been able to sit with. The breathwork and somatic work brings you into contact with what you have been leaving.',
        outcome: 'You stop fighting the behaviour and start meeting what it was managing.',
      },
      {
        title: 'Regulated nervous system',
        sub: 'The urge stops being an emergency',
        mechanism: 'Craving is a nervous system in distress looking for the fastest available exit. When the baseline comes down, the urge still arrives, but it arrives smaller and it passes on its own. You are no longer negotiating with something that feels like survival.',
        outcome: 'The gap between the urge and the reach gets wide enough to stand in.',
      },
      {
        title: 'Clarity and presence',
        sub: 'You stop needing to leave',
        mechanism: 'Every compulsion is a way of not being here. When a man can tolerate his own internal state, staying becomes possible. Not through willpower, which runs out, but through capacity, which builds. Presence is the thing the substance was standing in for.',
        outcome: 'You can be in your own company without needing to alter it.',
      },
      {
        title: 'External results compound',
        sub: 'The reaching stops on its own',
        mechanism: 'A man who has dealt with the driver does not white knuckle the habit. It loosens because the thing it was holding has been held properly. Sleep returns. Money stops leaking. The people around you stop bracing. And each of those makes the next one easier.',
        outcome: 'You did not beat it. You made it unnecessary.',
      },
    ],
    result: {
      heading: 'Nobody gets sober from the behaviour. They get free from what was underneath it.',
      body: 'Willpower is a bridge, not a destination. This work goes to the thing the reaching was for, which is the only version that holds.',
    }
  },
  direction: {
    stages: [
      {
        title: 'Inner work',
        sub: 'Separate your voice from the ones you inherited',
        mechanism: 'Most men who feel lost are not short of options. They are carrying obligations, other people I should be, and a fear of getting it wrong that was installed early. The inner work clears the interference so you can hear which of it is actually yours.',
        outcome: 'You start telling the difference between what you want and what you were handed.',
      },
      {
        title: 'Regulated nervous system',
        sub: 'The fog lifts',
        mechanism: 'A nervous system in survival mode cannot think past the next week. The part of the brain that handles long range decisions and meaning goes quiet under chronic stress. That is why the drift feels like a character flaw when it is actually physiology.',
        outcome: 'You can think further forward than the end of the month.',
      },
      {
        title: 'Clarity and presence',
        sub: 'You stop keeping every door open',
        mechanism: 'Drifting is not indecision. It is the safest available position when committing has cost you before. When the body no longer reads commitment as danger, you can choose one thing and close the others, which is the only way anything gets built.',
        outcome: 'You commit, because you finally know what you are committing to.',
      },
      {
        title: 'External results compound',
        sub: 'Momentum does the rest',
        mechanism: 'Direction is not found, it is revealed once the noise is gone. A man aiming his energy at one real thing gets further in a year than a man hedging for ten. And it compounds, because each step tells you more about the next one.',
        outcome: 'The path appears by walking it, not by staring at the map.',
      },
    ],
    result: {
      heading: 'You are not lost. You have been listening to the wrong voices, and they were loud.',
      body: 'Direction is what is left when the noise stops. The work is not preparation for it. The work is it.',
    }
  }
}

type GoalKey = keyof typeof GOALS

export default function CompoundGrowthModel() {
  const [currentGoal, setCurrentGoal] = useState<GoalKey | null>(null)
  const [unlockedCount, setUnlockedCount] = useState(0)
  const [openStage, setOpenStage] = useState<number | null>(null)

  const goals: { key: GoalKey; label: string }[] = [
    { key: 'anger', label: 'Anger' },
    { key: 'addiction', label: 'Addiction' },
    { key: 'direction', label: 'Loss of Direction' },
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
        Most men arrive here through one of three doors. Anger. Addiction. Loss of direction. They look different from the outside. Underneath, they are the same nervous system running an old protection pattern. Select what brought you here and follow it through.
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
