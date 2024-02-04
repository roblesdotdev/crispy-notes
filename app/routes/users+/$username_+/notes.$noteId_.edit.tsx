import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { Form, json, redirect, useLoaderData } from '@remix-run/react'
import { db } from '~/lib/db.server'
import { invariantResponse } from '~/lib/misc'

export async function loader({ params }: LoaderFunctionArgs) {
  const note = await db.note.findUnique({
    where: { id: params.noteId },
    select: {
      title: true,
      content: true,
    },
  })
  invariantResponse(note, 'Note not found', { status: 404 })

  return json({ note })
}

export async function action({ params, request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const title = formData.get('title')
  const content = formData.get('content')

  invariantResponse(typeof title === 'string', 'Title must be a string', {
    status: 400,
  })
  invariantResponse(typeof content === 'string', 'Content must be a string', {
    status: 400,
  })

  await db.note.update({
    where: { id: params.noteId },
    data: {
      title,
      content,
    },
  })

  return redirect(`/users/${params.username}/notes/${params.noteId}`)
}

export default function NoteEditRoute() {
  const data = useLoaderData<typeof loader>()
  const { note } = data

  return (
    <div className="container h-full py-3">
      <Form method="POST" className="flex h-full flex-col">
        <div className="flex h-full flex-1 flex-col gap-2">
          <div className="flex flex-col">
            <label htmlFor="title">Title</label>
            <input
              className="p-2"
              type="text"
              id="title"
              name="title"
              defaultValue={note.title}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="content">Content</label>
            <textarea id="content" name="content" defaultValue={note.content} />
          </div>
        </div>
        <div className="flex items-center gap-2 self-end">
          <button type="reset"> Reset</button>
          <button
            type="submit"
            className="bg-black px-4 py-2 font-medium text-white"
          >
            Save
          </button>
        </div>
      </Form>
    </div>
  )
}
