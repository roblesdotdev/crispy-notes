import * as ReactAria from 'react-aria-components'
import { cx } from '~/lib/misc'

export const TextArea = ({ className, ...props }: ReactAria.TextAreaProps) => {
  return (
    <ReactAria.TextArea
      className={cx(
        'w-full rounded-md border border-slate-300 bg-canvas p-4 outline-none focus:ring focus:ring-slate-300 focus:ring-offset-2',
        'invalid:border-red-500',
        className,
      )}
      {...props}
    />
  )
}
