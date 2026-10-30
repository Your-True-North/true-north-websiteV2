// "Start Day 1" buttons: bring the bottom form into view and put the cursor in its email field.
export function goToForm() {
  const form = document.getElementById('form-bottom')
  if (!form) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  form.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' })
  const email = document.getElementById('email-bottom') as HTMLInputElement | null
  if (email) setTimeout(() => email.focus({ preventScroll: true }), reduce ? 0 : 350)
}
