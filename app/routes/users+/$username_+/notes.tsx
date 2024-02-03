import { Link, Outlet } from '@remix-run/react'

export default function NotesRoute() {
  return (
    <main className="container flex h-full min-h-[400px] py-2">
      <div className="grid w-full grid-cols-4">
        <div className="col-span-1 bg-slate-100 pr-12">
          <h1 className="font-bold">Notes</h1>
          <ul className="pt-4">
            <li className="mb-2">
              <Link to="/users/worm" className="font-medium">
                ← Back
              </Link>
            </li>
            <li>
              <Link to="some-note-id">Some note</Link>
            </li>
          </ul>
        </div>
        <div className="col-span-3 bg-slate-200">
          <Outlet />
        </div>
      </div>
    </main>
  )
}
