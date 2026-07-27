// KYN evergreen session loop. Single source of truth for the Live Experiences calendar.
// Order never changes. loop_index wraps 1 to 48 forever. Do not reorder or renumber.

export type SessionType = 'teaching' | 'open discussion' | 'somatic'
export type Delivery = 'somatic' | 'breathwork' | null

export interface KynSession {
  loop_index: number
  theme_number: number
  theme_name: string
  week_number: number
  session_type: SessionType
  delivery: Delivery
  title: string
  description: string
}

export const KYN_SESSION_LOOP: KynSession[] = [
  // 1. Return To The Body
  { loop_index: 1, theme_number: 1, theme_name: 'Return To The Body', week_number: 1, session_type: 'somatic', delivery: 'breathwork',
    title: "Living in the head, and the way back to the body.",
    description: "You've spent most of your life up in your head and called it thinking. This is where you drop back into the body you've been ignoring, because it's been keeping the score the whole time." },
  { loop_index: 2, theme_number: 1, theme_name: 'Return To The Body', week_number: 2, session_type: 'teaching', delivery: null,
    title: "The difference between feeling calm and feeling numb.",
    description: "They can feel the same from the inside. This week we look at which one you've actually been living in." },
  { loop_index: 3, theme_number: 1, theme_name: 'Return To The Body', week_number: 3, session_type: 'open discussion', delivery: null,
    title: "Is there still something unseen weighing you down? This week we bring it to the light.",
    description: "You feel the weight but you can't always name it. We go looking for what's sat underneath, quietly running the show." },
  { loop_index: 4, theme_number: 1, theme_name: 'Return To The Body', week_number: 4, session_type: 'open discussion', delivery: null,
    title: "Learning to trust what you already know.",
    description: "Your body's been telling you the truth for years. This week you start listening again instead of talking yourself out of it." },

  // 2. The Heat Of Anger
  { loop_index: 5, theme_number: 2, theme_name: 'The Heat Of Anger', week_number: 1, session_type: 'teaching', delivery: null,
    title: "Anger, and what sits underneath the smoke.",
    description: "You think the anger is the shouting. That's just the smoke. This week we go looking for the fire." },
  { loop_index: 6, theme_number: 2, theme_name: 'The Heat Of Anger', week_number: 2, session_type: 'open discussion', delivery: null,
    title: "The quieter side of anger, the kind that doesn't shout.",
    description: "Some of it went quiet years ago. The flatness, the cold, the short patience. Anger lingers, and this week we name yours." },
  { loop_index: 7, theme_number: 2, theme_name: 'The Heat Of Anger', week_number: 3, session_type: 'somatic', delivery: 'somatic',
    title: "What the anger has been protecting.",
    description: "Your anger took a job a long time ago, standing at the door so you never had to feel what's behind it. This week we meet what it's guarding." },
  { loop_index: 8, theme_number: 2, theme_name: 'The Heat Of Anger', week_number: 4, session_type: 'open discussion', delivery: null,
    title: "The gap between the trigger and the reaction.",
    description: "There's a space between the thing that sets you off and what you do next. This week you get that space back, because that's where the choice lives." },

  // 3. The Masks
  { loop_index: 9, theme_number: 3, theme_name: 'The Masks', week_number: 1, session_type: 'teaching', delivery: null,
    title: "The habits we reach for, and the job they're really doing.",
    description: "The drink, the scroll, the porn, the staying busy. Different masks, same job. This week we look at what that job actually is." },
  { loop_index: 10, theme_number: 3, theme_name: 'The Masks', week_number: 2, session_type: 'open discussion', delivery: null,
    title: "The masks that look like a good work ethic.",
    description: "Some of it nobody calls a problem. The overwork, the always being busy, the chasing. This week we're honest that it's the same thing wearing a nicer coat." },
  { loop_index: 11, theme_number: 3, theme_name: 'The Masks', week_number: 3, session_type: 'somatic', delivery: 'somatic',
    title: "The feeling we've been staying busy enough not to feel.",
    description: "There's a feeling you've been outrunning. Take the fix away and it's still sat there. This week we stop running." },
  { loop_index: 12, theme_number: 3, theme_name: 'The Masks', week_number: 4, session_type: 'open discussion', delivery: null,
    title: "Owning it. Not for shame, for freedom.",
    description: "The way you see your addiction is what loosens its grip. This week you own it honestly, and that's where the shift starts." },

  // 4. The Saboteur
  { loop_index: 13, theme_number: 4, theme_name: 'The Saboteur', week_number: 1, session_type: 'teaching', delivery: null,
    title: "The patterns that run without our say so.",
    description: "Your patterns are proof you're not as in control as you think. This week we stop pretending and start looking." },
  { loop_index: 14, theme_number: 4, theme_name: 'The Saboteur', week_number: 2, session_type: 'open discussion', delivery: null,
    title: "Pulling back right before it matters.",
    description: "You go half in right when it counts, then tell yourself a story about why. This week we look at the story." },
  { loop_index: 15, theme_number: 4, theme_name: 'The Saboteur', week_number: 3, session_type: 'somatic', delivery: 'somatic',
    title: "What half effort is really protecting.",
    description: "If you never go all in, you never have to find out what you're worth. This week we look at the fear underneath that." },
  { loop_index: 16, theme_number: 4, theme_name: 'The Saboteur', week_number: 4, session_type: 'open discussion', delivery: null,
    title: "Why there's no shortcut through a pattern.",
    description: "You've been looking for the easy way. There isn't one, my friend. This week we do the actual work." },

  // 5. The Ones Closest
  { loop_index: 17, theme_number: 5, theme_name: 'The Ones Closest', week_number: 1, session_type: 'teaching', delivery: null,
    title: "The version of you only she gets to see.",
    description: "There's a you that only comes out at home, and it's not the one everyone else gets. This week we look at why." },
  { loop_index: 18, theme_number: 5, theme_name: 'The Ones Closest', week_number: 2, session_type: 'open discussion', delivery: null,
    title: "The walls that once kept you safe, and what they keep out now.",
    description: "The walls did a job when you were younger. Now they're keeping her out too. They go up a lot easier than they come down." },
  { loop_index: 19, theme_number: 5, theme_name: 'The Ones Closest', week_number: 3, session_type: 'somatic', delivery: 'somatic',
    title: "What we learned about love long before we met them.",
    description: "What you learned about love as a boy is still running the show. This week we look at where it came from." },
  { loop_index: 20, theme_number: 5, theme_name: 'The Ones Closest', week_number: 4, session_type: 'open discussion', delivery: null,
    title: "The hurt we pass on without meaning to.",
    description: "Hurt people hurt people. This week you own the hurt you've been passing on, so it stops with you." },

  // 6. Know Your North
  { loop_index: 21, theme_number: 6, theme_name: 'Know Your North', week_number: 1, session_type: 'teaching', delivery: null,
    title: "A life that looks alright on paper, and whether it feels like yours.",
    description: "On paper it's fine. But something's missing and you feel it. This week we name what." },
  { loop_index: 22, theme_number: 6, theme_name: 'Know Your North', week_number: 2, session_type: 'open discussion', delivery: null,
    title: "Whose goals have you been chasing?",
    description: "A lot of what you've been chasing was never even yours. This week we go looking for what actually is." },
  { loop_index: 23, theme_number: 6, theme_name: 'Know Your North', week_number: 3, session_type: 'somatic', delivery: 'somatic',
    title: "The direction you already know, and where it got buried.",
    description: "You already know your north. You buried it under fear and everyone else's expectations. This week we dig it back up." },
  { loop_index: 24, theme_number: 6, theme_name: 'Know Your North', week_number: 4, session_type: 'open discussion', delivery: null,
    title: "The quiet fear that it might actually work.",
    description: "Here's the one no man admits to. Not the fear of failing. The fear that it works, and then you'd have to keep showing up. This week we face it." },

  // 7. Stillness
  { loop_index: 25, theme_number: 7, theme_name: 'Stillness', week_number: 1, session_type: 'teaching', delivery: null,
    title: "When the rest is the work.",
    description: "You think rest is the reward for the work. Sometimes the rest is the work. This week you stop." },
  { loop_index: 26, theme_number: 7, theme_name: 'Stillness', week_number: 2, session_type: 'open discussion', delivery: null,
    title: "Staying busy, and what it helps us avoid.",
    description: "The busiest man in the room is usually the most avoidant one in it. This week we look at what you've been outrunning." },
  { loop_index: 27, theme_number: 7, theme_name: 'Stillness', week_number: 3, session_type: 'somatic', delivery: 'somatic',
    title: "Why stopping can feel like danger.",
    description: "You've been on go so long that stillness feels unsafe. It isn't. This week you prove that to yourself." },
  { loop_index: 28, theme_number: 7, theme_name: 'Stillness', week_number: 4, session_type: 'open discussion', delivery: null,
    title: "Life is for living, not just for healing.",
    description: "We don't want to spend every day looking at our wounds. This week you let yourself live." },

  // 8. Underneath
  { loop_index: 29, theme_number: 8, theme_name: 'Underneath', week_number: 1, session_type: 'teaching', delivery: null,
    title: "The door we've been avoiding.",
    description: "The thing you've spent years not looking at is the exact door you need to walk through. This week we walk to it." },
  { loop_index: 30, theme_number: 8, theme_name: 'Underneath', week_number: 2, session_type: 'open discussion', delivery: null,
    title: "Under the anger, grief. Under the busy, fear.",
    description: "There's always something softer underneath. This week we go there, slowly and safely." },
  { loop_index: 31, theme_number: 8, theme_name: 'Underneath', week_number: 3, session_type: 'somatic', delivery: 'somatic',
    title: "The younger you that got left behind.",
    description: "There's a younger you still carrying what never got healed. This week you go back for him." },
  { loop_index: 32, theme_number: 8, theme_name: 'Underneath', week_number: 4, session_type: 'open discussion', delivery: null,
    title: "Letting yourself feel it so it can move.",
    description: "Pain isn't the enemy. Avoiding it is what kept you stuck. This week you feel it, so it can finally move." },

  // 9. The Follow Through
  { loop_index: 33, theme_number: 9, theme_name: 'The Follow Through', week_number: 1, session_type: 'teaching', delivery: null,
    title: "Knowing it, and living it, are not the same thing.",
    description: "You already know most of what you need. Knowing it was never the problem. This week we look at the gap between knowing and living." },
  { loop_index: 34, theme_number: 9, theme_name: 'The Follow Through', week_number: 2, session_type: 'open discussion', delivery: null,
    title: "When learning becomes another way to avoid.",
    description: "The mind's tricked you into thinking reading about the work is the same as doing it. This week we call that out." },
  { loop_index: 35, theme_number: 9, theme_name: 'The Follow Through', week_number: 3, session_type: 'somatic', delivery: 'somatic',
    title: "Mistaking feeling wise for actually changing.",
    description: "You've educated your mates and felt kind of wise. And your life's the same. This week that ends." },
  { loop_index: 36, theme_number: 9, theme_name: 'The Follow Through', week_number: 4, session_type: 'open discussion', delivery: null,
    title: "No one can do the pushups for you my friend.",
    description: "I can show you the door. I can't walk you through it. This week you do the pushups." },

  // 10. Brotherhood
  { loop_index: 37, theme_number: 10, theme_name: 'Brotherhood', week_number: 1, session_type: 'teaching', delivery: null,
    title: "Independence, and the point it becomes isolation.",
    description: "You've been calling it independence. Be honest, it's isolation. This week we look at what it's cost you." },
  { loop_index: 38, theme_number: 10, theme_name: 'Brotherhood', week_number: 2, session_type: 'open discussion', delivery: null,
    title: "Why so many men break in private and perform in public.",
    description: "Men break behind closed doors and put on the show out front. It's killing us. This week we drop the show." },
  { loop_index: 39, theme_number: 10, theme_name: 'Brotherhood', week_number: 3, session_type: 'somatic', delivery: 'somatic',
    title: "What changes when you stop carrying it alone.",
    description: "You were never meant to carry all of it on your own. This week you put some of it down, with other men around you." },
  { loop_index: 40, theme_number: 10, theme_name: 'Brotherhood', week_number: 4, session_type: 'open discussion', delivery: null,
    title: "Being truly seen by other men.",
    description: "Something shifts the first time other men actually see you. This week you feel it." },

  // 11. The Return
  { loop_index: 41, theme_number: 11, theme_name: 'The Return', week_number: 1, session_type: 'teaching', delivery: null,
    title: "Not forward into someone new. Back to who you already were.",
    description: "This was never about becoming someone new. It's inward, and back to who you always were underneath it all." },
  { loop_index: 42, theme_number: 11, theme_name: 'The Return', week_number: 2, session_type: 'open discussion', delivery: null,
    title: "Where managing yourself becomes meeting yourself.",
    description: "This is the year you stopped managing yourself and started meeting yourself." },
  { loop_index: 43, theme_number: 11, theme_name: 'The Return', week_number: 3, session_type: 'somatic', delivery: 'somatic',
    title: "Telling a real shift from just another high.",
    description: "You'll finally know the difference between a real shift and another quick high that fades. This week we look at what's actually changed." },
  { loop_index: 44, theme_number: 11, theme_name: 'The Return', week_number: 4, session_type: 'open discussion', delivery: null,
    title: "Where you are now does not have to be where you end up.",
    description: "Where you are now does not have to be where you end up. This week you look at how far you've come." },

  // 12. The Body Remembers
  { loop_index: 45, theme_number: 12, theme_name: 'The Body Remembers', week_number: 1, session_type: 'teaching', delivery: null,
    title: "What the mind forgets, the body holds.",
    description: "You can't talk your way into healing when the body's holding this much. The mind will tell you it's processed the pain. The body knows different. This week we stop working top down and start working from the body up." },
  { loop_index: 46, theme_number: 12, theme_name: 'The Body Remembers', week_number: 2, session_type: 'open discussion', delivery: null,
    title: "The jaw, the chest, the gut, and where you hold yours.",
    description: "It's stored somewhere, and you already know where. This week we go looking for it." },
  { loop_index: 47, theme_number: 12, theme_name: 'The Body Remembers', week_number: 3, session_type: 'somatic', delivery: 'somatic',
    title: "The fascia, and the tension it's been holding onto.",
    description: "The tissue that wraps your muscles and organs holds the stress and the old stuff you never dealt with. Those blocks can be stubborn. This week we work into them and start to shift what's been stuck." },
  { loop_index: 48, theme_number: 12, theme_name: 'The Body Remembers', week_number: 4, session_type: 'open discussion', delivery: null,
    title: "Surrender, and letting the body do the work.",
    description: "You can't force this open. The block only moves when you stop fighting it and surrender. This week is the breath and the body work, letting your body do the job your mind never could." },
]

export const KYN_LOOP_LENGTH = KYN_SESSION_LOOP.length
