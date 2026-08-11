// Anger Decoder question set.
//
// Root keys are readable on purpose. Never use single letter codes: these
// strings become Kit tags (root_wound, secondary_cover) and appear in logs.

export type Root = 'wound' | 'cover' | 'signal' | 'tool' | 'overload'

export type Option = {
  id: string
  label: string
  weights: Partial<Record<Root, number>>
}

export type Question = {
  id: string
  prompt: string
  helper?: string
  type: 'single' | 'multi' | 'freetext' | 'flag'
  maxSelections?: number
  options?: Option[]
}

export const ROOTS: Root[] = ['wound', 'cover', 'signal', 'tool', 'overload']

/** Human readable root names, used on the result screen and in the emails. */
export const ROOT_NAMES: Record<Root, string> = {
  wound: 'The Wound',
  cover: 'The Cover',
  signal: 'The Signal',
  tool: 'The Tool',
  overload: 'The Overload',
}

/** One line shown on screen with the root name. The breakdown goes by email. */
export const ROOT_ONE_LINERS: Record<Root, string> = {
  wound: 'Your anger comes from being made small.',
  cover: 'Your anger is covering something you have never been able to say.',
  signal: 'Your anger is telling you something is wrong and you already know it.',
  tool: 'Your anger is the tool you learned to use to stay in control.',
  overload: 'Your anger is what happens when there is nothing left in the tank.',
}

/** Q11 maps one to one onto a root. Used to break scoring ties. */
export const TIE_BREAK_QUESTION_ID = 'q11'

export const SAFETY_QUESTION_ID = 'q_safety'
export const FREETEXT_QUESTION_ID = 'q12'

/** Selecting either of these on the safety question sets flagSafety. */
export const SAFETY_FLAG_OPTION_IDS = ['c', 'd']

export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    prompt: 'When did this start?',
    type: 'single',
    options: [
      { id: 'a', label: 'As far back as I can remember.', weights: { wound: 3, tool: 2 } },
      { id: 'b', label: 'Somewhere in my teens or early twenties.', weights: { wound: 2, cover: 1 } },
      { id: 'c', label: 'The last two or three years.', weights: { signal: 3, overload: 2 } },
      { id: 'd', label: 'The last twelve months.', weights: { signal: 2, overload: 3 } },
      { id: 'e', label: "I honestly couldn't tell you.", weights: { cover: 2, wound: 1 } },
    ],
  },
  {
    id: 'q2',
    prompt: 'Which of these gets you fastest?',
    helper:
      'Pick the one that gets there fastest. Not the one that is most true. The fastest. Two maximum.',
    type: 'multi',
    maxSelections: 2,
    options: [
      { id: 'a', label: "Being spoken to like I'm stupid, or corrected in front of other people.", weights: { wound: 3 } },
      { id: 'b', label: "Someone not doing what they said they'd do.", weights: { signal: 2, tool: 1 } },
      { id: 'c', label: 'Being ignored, talked over, not taken seriously.', weights: { wound: 3, cover: 1 } },
      { id: 'd', label: 'Small things. Traffic. Tech. Noise. Someone chewing.', weights: { overload: 3 } },
      { id: 'e', label: "Feeling stuck in something I can't get out of.", weights: { signal: 3, cover: 1 } },
    ],
  },
  {
    id: 'q3',
    prompt: 'How does it arrive?',
    type: 'single',
    options: [
      { id: 'a', label: 'Nought to a hundred. No warning.', weights: { cover: 2, wound: 2 } },
      { id: 'b', label: "Builds over a few hours, then it's gone.", weights: { overload: 2 } },
      { id: 'c', label: 'Simmers for days and comes out sideways.', weights: { cover: 3 } },
      { id: 'd', label: 'I decide when it arrives.', weights: { tool: 3 } },
    ],
  },
  {
    id: 'q4',
    prompt: 'Where does it land in your body first?',
    type: 'single',
    options: [
      { id: 'a', label: 'Chest. Heat rising.', weights: { wound: 1, cover: 1 } },
      { id: 'b', label: 'Jaw, throat, everything tightens.', weights: { cover: 2 } },
      { id: 'c', label: 'Gut. Slightly sick.', weights: { cover: 2, wound: 1 } },
      { id: 'd', label: 'Hands and arms. I need to move.', weights: { overload: 2 } },
      { id: 'e', label: "I don't feel anything. I just act.", weights: { cover: 3, tool: 1 } },
    ],
  },
  {
    id: 'q5',
    prompt: "Ninety seconds after it's over, what's actually there?",
    type: 'single',
    options: [
      { id: 'a', label: 'Shame. I hate myself for it.', weights: { wound: 3 } },
      { id: 'b', label: 'Justified. They had it coming.', weights: { tool: 2, signal: 1 } },
      { id: 'c', label: 'Hollow. Flat. Empty.', weights: { cover: 3 } },
      { id: 'd', label: 'Wiped out.', weights: { overload: 3 } },
      { id: 'e', label: "Nothing. I've moved on.", weights: { tool: 3 } },
    ],
  },
  {
    id: 'q6',
    prompt: 'Who sees it?',
    type: 'single',
    options: [
      { id: 'a', label: 'Only the people closest to me.', weights: { wound: 3, cover: 2 } },
      { id: 'b', label: 'Everywhere, fairly evenly.', weights: { overload: 2, signal: 1 } },
      { id: 'c', label: "Mostly where I'm the one in charge.", weights: { tool: 3 } },
      { id: 'd', label: 'Almost nobody. It stays in.', weights: { cover: 3 } },
    ],
  },
  {
    id: 'q7',
    prompt: 'Growing up, who did the house arrange itself around?',
    type: 'single',
    options: [
      { id: 'a', label: "One person's mood set the temperature for everybody.", weights: { wound: 2, tool: 2 } },
      { id: 'b', label: 'Nobody. It was chaos.', weights: { cover: 2, wound: 1 } },
      { id: 'c', label: 'Nobody. It was calm.', weights: { signal: 2, overload: 1 } },
      { id: 'd', label: 'Me, eventually.', weights: { tool: 3 } },
    ],
  },
  {
    id: 'q8',
    prompt: 'What made the arguing stop?',
    type: 'single',
    options: [
      { id: 'a', label: 'Somebody getting louder, or frightening.', weights: { tool: 3 } },
      { id: 'b', label: 'Somebody going silent, or walking out.', weights: { cover: 2 } },
      { id: 'c', label: 'It never really stopped.', weights: { wound: 2, cover: 1 } },
      { id: 'd', label: 'People talked it through.', weights: { signal: 2 } },
    ],
  },
  {
    id: 'q9',
    prompt: 'Was there someone whose job it should have been to step in?',
    type: 'single',
    options: [
      { id: 'a', label: "Yes. And they didn't.", weights: { wound: 3, cover: 2 } },
      { id: 'b', label: 'Yes. And they did.', weights: { signal: 1 } },
      { id: 'c', label: 'There was nothing to step into.', weights: { signal: 2, overload: 1 } },
      { id: 'd', label: 'I was the one who stepped in.', weights: { tool: 2, wound: 1 } },
    ],
  },
  {
    id: SAFETY_QUESTION_ID,
    prompt: 'Has your anger ever become physical towards another person?',
    type: 'flag',
    options: [
      { id: 'a', label: 'No', weights: {} },
      { id: 'b', label: "I've thrown or broken things", weights: {} },
      { id: 'c', label: 'Once. It frightened me', weights: {} },
      { id: 'd', label: 'More than once', weights: {} },
    ],
  },
  {
    id: 'q10',
    prompt: 'How are you sleeping?',
    type: 'single',
    options: [
      { id: 'a', label: 'Seven hours or more. I wake up recovered.', weights: { wound: 1, tool: 1, signal: 1 } },
      { id: 'b', label: 'Under six. Running on fumes.', weights: { overload: 3 } },
      { id: 'c', label: 'I sleep, but I never switch off.', weights: { overload: 2, cover: 1 } },
      { id: 'd', label: 'Depends entirely on the week.', weights: { overload: 1 } },
    ],
  },
  {
    id: TIE_BREAK_QUESTION_ID,
    prompt: 'If your anger could say one sentence, what would it be?',
    type: 'single',
    options: [
      { id: 'a', label: '"Don’t you dare treat me like that."', weights: { wound: 3 } },
      { id: 'b', label: '"I can’t say what this actually is."', weights: { cover: 3 } },
      { id: 'c', label: '"This is wrong and I’m done pretending it isn’t."', weights: { signal: 3 } },
      { id: 'd', label: '"Do what I need you to do."', weights: { tool: 3 } },
      { id: 'e', label: '"I’ve got nothing left."', weights: { overload: 3 } },
    ],
  },
  {
    id: FREETEXT_QUESTION_ID,
    prompt: 'Think about the last time you lost it. What actually happened?',
    type: 'freetext',
  },
]

/** Q11 option id to root, used for tie breaking. */
export const TIE_BREAK_MAP: Record<string, Root> = {
  a: 'wound',
  b: 'cover',
  c: 'signal',
  d: 'tool',
  e: 'overload',
}

/** Questions shown before the interstitial. */
export const PRE_INTERSTITIAL_IDS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6']

export function getQuestion(id: string): Question | undefined {
  return QUESTIONS.find((q) => q.id === id)
}
