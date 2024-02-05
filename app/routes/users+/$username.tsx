import { LoaderFunctionArgs, json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { db } from '~/lib/db.server'
import { invariantResponse } from '~/lib/misc'

export async function loader({ params }: LoaderFunctionArgs) {
  const { username } = params
  const user = await db.user.findUnique({
    where: {
      username,
    },
  })

  invariantResponse(user, 'User Not Found', { status: 404 })

  return json({ user })
}

export default function ProfileRoute() {
  const data = useLoaderData<typeof loader>()

  return (
    <div className="container min-h-[400px] bg-slate-100">
      <h1>{data.user.name} user</h1>
      <Link to="notes" prefetch="intent">
        Notes
      </Link>
    </div>
  )
}
