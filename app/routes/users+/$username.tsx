import { Link, useParams } from '@remix-run/react'

export default function ProfileRoute() {
  const { username } = useParams()

  return (
    <div className="container min-h-[400px] bg-slate-100">
      <h1>{username} user</h1>
      <Link to="notes">Notes</Link>
    </div>
  )
}
