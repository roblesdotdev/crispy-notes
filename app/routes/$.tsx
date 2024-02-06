import { useLocation } from '@remix-run/react'
import { Link } from 'react-router-dom'
import { GeneralErrorBoundary } from '~/components/error-boundary'

export async function loader() {
  throw new Response('Not found', { status: 404 })
}

export function ErrorBoundary() {
  const location = useLocation()

  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: () => (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h1>We can&apos;t find this page:</h1>
              <pre>{location.pathname}</pre>
            </div>
            <Link to="/">Back to home</Link>
          </div>
        ),
      }}
    />
  )
}
