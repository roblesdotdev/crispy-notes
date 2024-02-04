import { LoaderFunctionArgs, json } from '@remix-run/node'
import { Link, NavLink, Outlet, useLoaderData } from '@remix-run/react'
import { db } from '~/lib/db.server'
import { invariantResponse } from '~/lib/misc'

export async function loader({ params }: LoaderFunctionArgs) {
  const { username } = params
  const owner = await db.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
      name: true,
      username: true,
      notes: { select: { id: true, title: true } },
    },
  })

  invariantResponse(owner, 'User Not Found', { status: 404 })

  return json({ owner })
}

export default function NotesRoute() {
  const data = useLoaderData<typeof loader>()
  const { owner } = data

  return (
    <main className="container flex h-full min-h-[400px] py-2">
      <div className="grid w-full grid-cols-4">
        <div className="col-span-1 bg-slate-100 pr-12">
          <h1 className="font-bold">Notes</h1>
          <ul className="pt-4">
            <li className="mb-2">
              <Link to={`/users/${owner.username}`} className="font-medium">
                ← Back to {owner.name} profile
              </Link>
            </li>
            {owner.notes.map(note => (
              <li key={note.id}>
                <NavLink
                  to={note.id}
                  className={({ isActive }) => (isActive ? 'underline' : '')}
                >
                  {note.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-3 bg-slate-200">
          <Outlet />
        </div>
      </div>
    </main>
  )
}
