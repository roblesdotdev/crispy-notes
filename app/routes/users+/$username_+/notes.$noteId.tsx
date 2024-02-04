import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'
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

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData()
  const intent = formData.get('intent')

  switch (intent) {
    case 'delete':
      await db.note.delete({ where: { id: params.noteId } })
      return redirect(`/users/${params.username}/notes`)

    default:
      throw new Response('Invalid submission', { status: 400 })
  }
}

export default function NoteDetailRoute() {
  const data = useLoaderData<typeof loader>()
  const { note } = data

  return (
    <div className="container flex h-full flex-col py-4">
      <div className="flex-1">
        <h1 className="mb-2 font-bold">{note.title}</h1>
        <p>{note.content}</p>
      </div>
      <div className="flex items-center justify-end gap-2 bg-slate-100 p-2">
        <Link to="edit" className="bg-black px-4 py-2 font-medium text-white">
          Edit
        </Link>
        <Form method="post">
          <button
            type="submit"
            name="intent"
            value="delete"
            className="bg-red-600 px-4 py-2 font-medium text-white"
          >
            Delete
          </button>
        </Form>
      </div>
    </div>
  )
}
