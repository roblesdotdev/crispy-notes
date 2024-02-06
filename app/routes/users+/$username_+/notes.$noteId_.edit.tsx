import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { Form, json, redirect, useLoaderData } from '@remix-run/react'
import { GeneralErrorBoundary } from '~/components/error-boundary'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { TextArea } from '~/components/ui/textarea'
import { TextField } from '~/components/ui/textfield'
import { db } from '~/lib/db.server'
import { invariantResponse, useIsPending } from '~/lib/misc'

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
  const isPending = useIsPending()

  return (
    <div className="container h-full py-3">
      <Form method="POST" className="flex h-full flex-col">
        <div className="flex h-full flex-1 flex-col gap-2">
          <TextField>
            <Label htmlFor="title">Title</Label>
            <Input
              defaultValue={note.title}
              name="title"
              id="title"
              placeholder="Note title..."
            />
          </TextField>
          <TextField>
            <Label htmlFor="content">Content</Label>
            <TextArea id="content" name="content" defaultValue={note.content} />
          </TextField>
        </div>
        <div className="flex items-center gap-2 self-end">
          <Button type="reset" variant="outline">
            Reset
          </Button>
          <Button
            type="submit"
            className="bg-black px-4 py-2 font-medium text-white disabled:opacity-50"
            isDisabled={isPending}
          >
            Save
          </Button>
        </div>
      </Form>
    </div>
  )
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: ({ params }) => (
          <p>No note with the id &quot;{params.noteId}&quot; exists.</p>
        ),
      }}
    />
  )
}
