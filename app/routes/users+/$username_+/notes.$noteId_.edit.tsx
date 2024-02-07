import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import {
  Form,
  json,
  redirect,
  useActionData,
  useLoaderData,
} from '@remix-run/react'
import { useEffect, useId, useRef } from 'react'
import { z } from 'zod'
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

const NoteEditorSchema = z.object({
  title: z.string().min(1).max(titleMaxLength),
  content: z.string().min(1).max(contentMaxLength),
})

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

  const result = NoteEditorSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
  })

  if (!result.success) {
    return json(
      { errors: result.error.flatten(), status: 'error' },
      { status: 400 },
    )
  }

  const { title, content } = result.data

  await db.note.update({
    where: { id: params.noteId },
    data: {
      title,
      content,
    },
  })

  return redirect(`/users/${params.username}/notes/${params.noteId}`)
}

function ErrorList({
  errors,
  id,
}: {
  errors?: Array<string> | null
  id?: string
}) {
  return errors?.length ? (
    <ul id={id}>
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
  const isPending = useIsPending({ state: 'submitting' })
  const isHydrated = useHydrated()
  const formRef = useRef<HTMLFormElement>(null)
  const formId = useId()

  const fieldErrors = actionData?.errors?.fieldErrors ?? null
  const formErrors = actionData?.errors?.formErrors ?? null

  const formHasErrors = Boolean(formErrors?.length)
  const formErrorId = formErrors ? 'form-error' : undefined
  const titleHasErrors = Boolean(fieldErrors?.title?.length)
  const titleErrorId = titleHasErrors ? 'title-error' : undefined
  const contentHasErrors = Boolean(fieldErrors?.content?.length)
  const contentErrorId = contentHasErrors ? 'content-error' : undefined

  console.log('Title:', titleHasErrors)
  console.log('Content:', contentHasErrors)

  useEffect(() => {
    const formEl = formRef.current
    if (!formEl) return

    if (actionData?.status !== 'error') return

    if (formEl.matches('[aria-invalid="true"]')) {
      formEl.focus()
    } else {
      const firstInvalidField = formEl.querySelector('[aria-invalid="true"]')
      if (firstInvalidField instanceof HTMLElement) {
        firstInvalidField.focus()
      }
    }
  }, [actionData])

  return (
    <div className="container h-full py-3">
      <Form
        method="POST"
        className="flex h-full flex-col"
        noValidate={isHydrated}
        aria-invalid={formHasErrors || undefined}
        aria-describedby={formErrorId}
        ref={formRef}
        id={formId}
        tabIndex={-1}
      >
        <div className="flex h-full flex-1 flex-col gap-2">
          <TextField
            name="title"
            defaultValue={data.note.title}
            isInvalid={titleHasErrors || undefined}
            aria-describedby={titleErrorId}
          >
            <Label>Title</Label>
            <Input
              placeholder="Note title..."
              maxLength={titleMaxLength}
              required
            />
            <ErrorList errors={fieldErrors?.title} id={titleErrorId} />
          </TextField>
          <TextField
            name="content"
            defaultValue={data.note.content}
            isInvalid={contentHasErrors}
            aria-describedby={contentErrorId}
          >
            <Label>Content</Label>
            <TextArea maxLength={contentMaxLength} required />
            <ErrorList errors={fieldErrors?.content} id={contentErrorId} />
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
        <ErrorList errors={formErrors} id={formErrorId} />
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
