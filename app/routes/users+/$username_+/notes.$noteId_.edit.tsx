import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
  unstable_parseMultipartFormData,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  unstable_createMemoryUploadHandler,
} from '@remix-run/node'
import {
  Form,
  json,
  redirect,
  useActionData,
  useLoaderData,
} from '@remix-run/react'
import { useState } from 'react'
import { z } from 'zod'
import { GeneralErrorBoundary } from '~/components/error-boundary'
import { createId as cuid } from '@paralleldrive/cuid2'
import {
  Button,
  Input,
  Label,
  TextArea,
  TextField,
  TextFieldErrorMessage,
} from '~/components/ui'
import { db } from '~/lib/db.server'
import { cn, getNoteImgSrc, invariantResponse, useIsPending } from '~/lib/misc'

const titleMaxLength = 50
const contentMaxLength = 200
const MAX_UPLOAD_SIZE = 1024 * 1024 * 3 // 3M

const NoteEditorSchema = z.object({
  title: z.string().min(1).max(titleMaxLength),
  content: z.string().min(1).max(contentMaxLength),
  imageId: z.string().optional(),
  altText: z.string().optional(),
  file: z
    .instanceof(File)
    .refine(file => file.size <= MAX_UPLOAD_SIZE, 'Image is too large'),
})

export async function loader({ params }: LoaderFunctionArgs) {
  const note = await db.note.findUnique({
    where: { id: params.noteId },
    select: {
      title: true,
      content: true,
      images: {
        select: { id: true, altText: true },
      },
    },
  })
  invariantResponse(note, 'Note not found', { status: 404 })

  return json({ note })
}

export async function action({ params, request }: ActionFunctionArgs) {
  invariantResponse(params.noteId, 'noteId param is required')

  const formData = await unstable_parseMultipartFormData(
    request,
    unstable_createMemoryUploadHandler({
      maxPartSize: MAX_UPLOAD_SIZE,
    }),
  )

  const submission = parseWithZod(formData, {
    schema: NoteEditorSchema,
  })

  if (submission.status !== 'success') {
    return submission.reply()
  }

  const { title, content, imageId, file, altText } = submission.value

  await db.note.update({
    where: { id: params.noteId },
    data: {
      title,
      content,
      images: {
        update: {
          where: { id: imageId },
          data: {
            id: cuid(),
            altText: altText,
            contentType: file.type,
            blob: Buffer.from(await file.arrayBuffer()),
          },
        },
      },
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
        encType="multipart/form-data"
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
          <div>
            <Label>Image</Label>
            <ImageChooser image={data.note.images[0]} />
          </div>
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

function ImageChooser({
  image,
}: {
  image?: { id: string; altText?: string | null }
}) {
  const existingImage = Boolean(image)
  const [previewImage, setPreviewImage] = useState<string | null>(
    existingImage ? getNoteImgSrc(image?.id ?? '') : null,
  )
  const [altText, setAltText] = useState(image?.altText ?? '')

  return (
    <fieldset>
      <div className="flex gap-3">
        <div className="w-32">
          <div className="relative h-32 w-32">
            <label
              htmlFor="image-input"
              className={cn('group absolute h-32 w-32 rounded-lg', {
                'bg-accent opacity-40 focus-within:opacity-100 hover:opacity-100':
                  !previewImage,
                'cursor-pointer focus-within:ring-4': !existingImage,
              })}
            >
              {previewImage ? (
                <div className="relative">
                  <img
                    src={previewImage}
                    alt={altText ?? ''}
                    className="h-32 w-32 rounded-lg object-cover"
                  />
                  {existingImage ? null : (
                    <div className="bg-secondary text-secondary-foreground pointer-events-none absolute -right-0.5 -top-0.5 rotate-12 rounded-sm px-2 py-1 text-xs shadow-md">
                      new
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-muted-foreground text-muted-foreground flex h-32 w-32 items-center justify-center rounded-lg border text-4xl">
                  ➕
                </div>
              )}
              {existingImage ? (
                <input name="imageId" type="hidden" value={image?.id} />
              ) : null}
              <input
                id="image-input"
                aria-label="Image"
                className="absolute left-0 top-0 z-0 h-32 w-32 cursor-pointer opacity-0"
                onChange={event => {
                  const file = event.target.files?.[0]

                  if (file) {
                    const reader = new FileReader()
                    reader.onloadend = () => {
                      setPreviewImage(reader.result as string)
                    }
                    reader.readAsDataURL(file)
                  } else {
                    setPreviewImage(null)
                  }
                }}
                name="file"
                type="file"
                accept="image/*"
              />
            </label>
          </div>
        </div>
        <TextField className="flex-1" name="altText" defaultValue={altText}>
          <Label>Alt Text</Label>
          <TextArea onChange={e => setAltText(e.currentTarget.value)} />
        </TextField>
      </div>
    </fieldset>
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
