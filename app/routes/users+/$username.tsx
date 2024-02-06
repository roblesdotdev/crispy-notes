import { LoaderFunctionArgs, MetaFunction, json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { GeneralErrorBoundary } from '~/components/error-boundary'
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

export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
  const displayName = data?.user.name ?? params.username
  return [
    { title: `${displayName} | Crispy Notes` },
    {
      name: 'description',
      content: `Checkoout ${displayName} on crispy notes`,
    },
  ]
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: ({ params }) => (
          <p>No user with the username &quot;{params.username}&quot; exists.</p>
        ),
      }}
    />
  )
}
