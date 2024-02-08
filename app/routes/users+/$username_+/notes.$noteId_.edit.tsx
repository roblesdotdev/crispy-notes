import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import {
  Form,
  json,
  redirect,
  useActionData,
  useLoaderData,
} from '@remix-run/react'
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
import { invariantResponse, useIsPending } from '~/lib/misc'

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

  const submission = parseWithZod(formData, {
    schema: NoteEditorSchema,
  })

  if (submission.status !== 'success') {
    return submission.reply()
  }

  const { title, content } = submission.value

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
  const isPending = useIsPending({ state: 'submitting' })
  const lastResult = useActionData<typeof action>()

  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(NoteEditorSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: NoteEditorSchema })
    },
    defaultValue: {
      title: data.note.title,
      content: data.note.content,
    },
  })

  return (
    <div className="container h-full py-3">
      <Form
        method="POST"
        className="flex h-full flex-col"
        {...getFormProps(form)}
      >
        <div className="flex h-full flex-1 flex-col gap-2">
          <TextField {...getInputProps(fields.title, { type: 'text' })}>
            <Label>Title</Label>
            <Input />
            <ErrorList errors={fields.title.errors} id={fields.title.id} />
          </TextField>
          <TextField {...getTextareaProps(fields.content)}>
            <label htmlFor={fields.content.id}>Content</label>
            <TextArea />
            <ErrorList errors={fields.content.errors} id={fields.content.id} />
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
        <ErrorList errors={form.errors} id={form.id} />
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
