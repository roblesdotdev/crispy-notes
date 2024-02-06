import * as ReactAria from 'react-aria-components'
import { cx } from '~/lib/misc'

export const Label = ({ className, ...props }: ReactAria.LabelProps) => {
  return (
    <ReactAria.Label
      className={cx(
        'mb-2 mr-3 block font-medium text-fg peer-disabled:cursor-not-allowed peer-disabled:opacity-40',
        className,
      )}
      {...props}
    />
  )
}
