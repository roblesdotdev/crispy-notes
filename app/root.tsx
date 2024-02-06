import { cssBundleHref } from '@remix-run/css-bundle'
import type { LinksFunction } from '@remix-run/node'
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  useLoaderData,
} from '@remix-run/react'
import tailwindStylesHref from '~/styles/tailwind.css'
import fontStylesHref from '~/styles/fonts.css'
import faviconAssetUrl from '~/assets/favicon.svg'
import { getEnv } from './lib/env.server'

export const links: LinksFunction = () => [
  { rel: 'icon', type: 'image/svg+xml', href: faviconAssetUrl },
  { rel: 'stylesheet', href: fontStylesHref },
  { rel: 'stylesheet', href: tailwindStylesHref },
  ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
]

export async function loader() {
  return json({
    ENV: getEnv(),
  })
}

export default function App() {
  const data = useLoaderData<typeof loader>()

  return (
    <html lang="en" className="overflow-x-hidden">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="flex min-h-screen flex-col bg-canvas text-fg antialiased">
        <header className="container mx-auto py-6">
          <Link to="/">
            <h1>Crispy Notes</h1>
          </Link>
        </header>
        <div className="flex-1">
          <Outlet />
        </div>
        <footer className="container mx-auto mt-32 flex justify-between py-6">
          <p>
            &copy; {new Date().getFullYear()} - by{' '}
            <a
              href="https://github.com/roblesdotdev"
              target="_blank"
              rel="noreferrer"
            >
              Aldo Robles
            </a>
          </p>
          <a
            href="https://github.com/roblesdotdev/crispy-notes"
            target="_blank"
            rel="noreferrer"
          >
            Source Code
          </a>
        </footer>
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
