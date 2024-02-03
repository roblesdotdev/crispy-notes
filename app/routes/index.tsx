import type { MetaFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'

export const meta: MetaFunction = () => {
  return [
    { title: 'Crispy Notes' },
    { name: 'description', content: 'Crispy Notes App' },
  ]
}

export default function Index() {
  return (
    <div className="container mt-16 text-center sm:mt-24">
      <h1>Crispy Notes</h1>
      <Link to="users/worm">Profile</Link>
    </div>
  )
}
