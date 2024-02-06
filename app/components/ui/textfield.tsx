import * as ReactAria from 'react-aria-components'
import { cx } from '~/lib/misc'

export const TextField = ({
  className,
  ...props
}: ReactAria.TextFieldProps) => {
  return <ReactAria.TextField className={cx('w-full', className)} {...props} />
}

export const TextFieldErrorMessage = ({
  className,
  ...props
}: ReactAria.TextProps) => {
  return (
    <ReactAria.Text
      elementType="div"
      slot="errorMessage"
      className={cx('mt-2 text-sm text-red-600', className)}
      {...props}
    />
  )
}
