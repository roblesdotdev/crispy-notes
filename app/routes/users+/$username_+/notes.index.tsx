import type { MetaFunction } from '@remix-run/node'
import type { loader as notesLoader } from './notes'

export default function NotesIndexRoute() {
  return (
    <div className="container">
      <p>Select a note</p>
    </div>
  )
}

export const meta: MetaFunction<
  null,
  { 'routes/users+/$username_+/notes': typeof notesLoader }
> = ({ params, matches }) => {
  const notesMatch = matches.find(
    m => m.id === 'routes/users+/$username_+/notes',
  )
  const displayName = notesMatch?.data?.owner.name ?? params.username
  const noteCount = notesMatch?.data?.owner.notes.length ?? 0
  const notesText = noteCount === 1 ? 'note' : 'notes'
  return [
    { title: `${displayName}'s Notes | Crispy Notes` },
    {
      name: 'description',
      content: `Checkout ${displayName}'s ${noteCount} ${notesText} on Crispy Notes`,
    },
  ]
}
