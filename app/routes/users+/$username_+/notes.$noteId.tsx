import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
  json,
  redirect,
} from '@remix-run/node'
import type { loader as notesLoader } from './notes'
import { Form, Link, useLoaderData } from '@remix-run/react'
import { db } from '~/lib/db.server'
import { invariantResponse, useIsPending } from '~/lib/misc'
import { GeneralErrorBoundary } from '~/components/error-boundary'
import { Button, buttonVariants } from '~/components/ui/button'

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
  const isPending = useIsPending()

  return (
    <div className="container flex h-full flex-col py-4">
      <div className="flex-1">
        <h1 className="mb-2 font-bold">{note.title}</h1>
        <p>{note.content}</p>
      </div>
      <div className="flex items-center justify-end gap-2 bg-slate-100 p-2">
        <Link to="edit" className={buttonVariants({ variant: 'solid' })}>
          Edit
        </Link>
        <Form method="post">
          <Button
            type="submit"
            name="intent"
            value="delete"
            variant="destructive"
            isDisabled={isPending}
          >
            Delete
          </Button>
        </Form>
      </div>
    </div>
  )
}

export const meta: MetaFunction<
  typeof loader,
  { 'routes/users+/$username_+/notes': typeof notesLoader }
> = ({ data, params, matches }) => {
  const notesMatch = matches.find(
    m => m.id === 'routes/users+/$username_+/notes',
  )
  const displayName = notesMatch?.data?.owner.name ?? params.username
  const noteTitle = data?.note.title ?? 'Note'
  const noteContentsSummary =
    data && data.note.content.length > 100
      ? data?.note.content.slice(0, 97) + '...'
      : 'No content'
  return [
    { title: `${noteTitle} | ${displayName}'s Notes | Crispy Notes` },
    {
      name: 'description',
      content: noteContentsSummary,
    },
  ]
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
