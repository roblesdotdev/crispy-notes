import { LoaderFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { db } from '~/lib/db.server'
import { invariantResponse } from '~/lib/misc'

export async function loader({ params }: LoaderFunctionArgs) {
  const { noteId } = params
  const note = await db.note.findUnique({
    where: { id: noteId },
    select: {
      id: true,
      title: true,
      content: true,
      ownerId: true,
      updatedAt: true,
    },
  })

  invariantResponse(note, 'Note not found', { status: 404 })

  return json({ note })
}

export default function NoteDetailRoute() {
  const data = useLoaderData<typeof loader>()
  const { note } = data

  return (
    <div className="container">
      <h1 className="mb-2 font-bold">{note.title}</h1>
      <p>{note.content}</p>
    </div>
  )
}
