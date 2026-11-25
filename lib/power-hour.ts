// Power Hour clients. Each client's page lives at /<slug> (e.g. /jermaine).
// To change a client's tasks, edit them here and push.

export type PowerHourItem = { key: string; title: string; short: string; detail?: string; task?: 'priority' | 'bonus' }

export type PowerHourClient = {
  slug: string
  name: string
  start: string // YYYY-MM-DD: first day shown in the coach view
  items: PowerHourItem[]
  priority: string
  bonus: string
  due?: string
}

export const POWER_HOUR_CLIENTS: Record<string, PowerHourClient> = {
  jermaine: {
    slug: 'jermaine',
    name: 'Jermaine',
    start: '2026-11-25',
    items: [
      { key: 'W', title: 'Start your water', short: 'Water', detail: 'Fill your bottle and get it down you' },
      { key: 'O', title: 'Old task', short: 'Old', task: 'priority' },
      { key: 'N', title: 'New task', short: 'New', task: 'bonus' },
      { key: 'F', title: 'Finish your bottle', short: 'Bottle', detail: 'Fully hydrated. Take a picture and celebrate breaking the pattern' },
    ],
    priority: 'Go through your emails and make the calls you need to get the information (Glitter Box etc.), then send the invoice.',
    bonus: "Follow up all the tables from Friday's party and chase the money that's owed.",
    due: 'Friday',
  },
  george: {
    slug: 'george',
    name: 'George',
    start: '2026-11-25',
    items: [
      { key: 'W', title: 'Take 5 minutes', short: 'Breathe', detail: 'Deep breaths. Ground yourself' },
      { key: 'O', title: "Today's priority task", short: 'Priority', task: 'priority' },
      { key: 'N', title: 'Bonus task', short: 'Bonus', task: 'bonus' },
      { key: 'F', title: 'Another 5 minutes', short: 'Breathe again', detail: 'Deep, centred breathing' },
    ],
    priority: '',
    bonus: '',
  },
}
