import MysticalBackground from '../components/MysticalBackground'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <MysticalBackground />
      <main>
        {children}
      </main>
    </>
  )
}
