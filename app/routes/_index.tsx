import type { MetaFunction } from '@remix-run/node'

export const meta: MetaFunction = () => {
  return [
    { title: 'Crispy Notes' },
    { name: 'description', content: 'Crispy Notes App' },
  ]
}

export default function Index() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="font-bold">Working...</h1>
    </div>
  )
}
