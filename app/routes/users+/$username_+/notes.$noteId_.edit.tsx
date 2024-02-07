import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import {
  Form,
  json,
  redirect,
  useActionData,
  useLoaderData,
} from '@remix-run/react'
import { GeneralErrorBoundary } from '~/components/error-boundary'
import {
  Button,
  Input,
  Label,
  TextArea,
  TextField,
  TextFieldErrorMessage,
} from '~/components/ui'
import { db } from '~/lib/db.server'
import { invariantResponse, useHydrated, useIsPending } from '~/lib/misc'

const titleMaxLength = 50
const contentMaxLength = 200

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

  const errors = {
    formErrors: [] as string[],
    fieldErrors: {
      title: [] as string[],
      content: [] as string[],
    },
  }

  if (title === '') {
    errors.fieldErrors.title.push('Title is required')
  }
  if (title.length > titleMaxLength) {
    errors.fieldErrors.title.push(
      `Title must be ${titleMaxLength} characters or less`,
    )
  }
  if (content === '') {
    errors.fieldErrors.content.push('Content is required')
  }
  if (content.length > contentMaxLength) {
    errors.fieldErrors.content.push(
      `Content must be ${contentMaxLength} characters or less`,
    )
  }

  const hasErrors =
    errors.formErrors.length > 0 ||
    Object.values(errors.fieldErrors).some(
      fieldErrors => fieldErrors.length > 0,
    )

  if (hasErrors) {
    return json({ errors }, { status: 400 })
  }

  await db.note.update({
    where: { id: params.noteId },
    data: {
      title,
      content,
    },
  })

  return redirect(`/users/${params.username}/notes/${params.noteId}`)
}

function ErrorList({ errors }: { errors?: Array<string> | null }) {
  return errors?.length ? (
    <ul>
      {errors.map((error, i) => (
        <TextFieldErrorMessage key={i} elementType="li">
          {error}
        </TextFieldErrorMessage>
      ))}
    </ul>
  ) : null
}

export default function NoteEditRoute() {
  const data = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const { note } = data
  const isPending = useIsPending({ state: 'submitting' })
  const isHydrated = useHydrated()

  const fieldErrors = actionData?.errors?.fieldErrors ?? null
  const formErrors = actionData?.errors?.formErrors ?? null

  return (
    <div className="container h-full py-3">
      <Form
        method="POST"
        className="flex h-full flex-col"
        noValidate={isHydrated}
      >
        <div className="flex h-full flex-1 flex-col gap-2">
          <TextField
            name="title"
            defaultValue={note.title}
            isInvalid={Boolean(fieldErrors?.title.length)}
          >
            <Label>Title</Label>
            <Input
              placeholder="Note title..."
              maxLength={titleMaxLength}
              required
            />
            <ErrorList errors={fieldErrors?.title} />
          </TextField>
          <TextField
            name="content"
            defaultValue={note.content}
            isInvalid={Boolean(fieldErrors?.content.length)}
          >
            <Label>Content</Label>
            <TextArea maxLength={contentMaxLength} required />
            <ErrorList errors={fieldErrors?.content} />
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
        <ErrorList errors={formErrors} />
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
