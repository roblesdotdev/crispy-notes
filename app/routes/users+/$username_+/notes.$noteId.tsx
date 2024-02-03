import { useParams } from '@remix-run/react'

export default function NoteDetailRoute() {
  const { noteId } = useParams()

  return (
    <div className="container">
      <h1>{noteId} detail</h1>
    </div>
  )
}
