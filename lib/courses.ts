import { features } from './features'

// Member courses. Content lives in the course_days table; this is just the list.
export const COURSES = [
  {
    slug: 'short-fuse',
    name: 'Short Fuse',
    description: 'A 14 day course to help you release anger without guilt, shame or bottling it up. Five minutes a day to shift how you respond.',
    enabled: true,
  },
  {
    slug: 'space',
    name: 'SPACE',
    description: 'A 14 day self exploration programme that takes you through five steps to elevate your life.',
    enabled: features.courseSpace,
  },
] as const

export const COURSE_DAYS = 14

export type CourseSlug = (typeof COURSES)[number]['slug']

export function getCourse(slug: string) {
  return COURSES.find(c => c.slug === slug && c.enabled) || null
}

export function enabledCourses() {
  return COURSES.filter(c => c.enabled)
}

// Days are released one at a time so the course can't be binged: Day 1 opens
// when he starts, Day 2 24 hours later, and so on.
export function dayOpensAt(startedAt: Date, day: number): Date {
  return new Date(startedAt.getTime() + (day - 1) * 24 * 60 * 60 * 1000)
}

export function isDayOpen(startedAt: Date | null, day: number, now = new Date()): boolean {
  if (!startedAt) return false
  return now >= dayOpensAt(startedAt, day)
}
