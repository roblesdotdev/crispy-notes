import { type VariantProps } from 'cva'
import * as ReactAria from 'react-aria-components'
import { cva, cx } from '~/lib/misc'

const inputVariants = cva({
  base: [
    'flex w-full border border-slate-300 bg-canvas placeholder:text-slate-400 outline-none',
    // Focus
    'focus:ring focus:ring-slate-300 focus:ring-offset-2',
    // Disabled
    'disabled:cursor-not-allowed disabled:opacity-40',
    // Invalid
    'invalid:border-red-600 dark:invalid:border-red-400',
  ],
  variants: {
    size: {
      lg: 'h-12 rounded-lg px-4 text-lg',
      md: 'h-10 rounded-md px-4 text-base',
      sm: 'h-8 rounded px-3 text-sm',
      xs: 'h-6 rounded px-2 text-xs',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export interface InputProps
  extends Omit<ReactAria.InputProps, 'size'>,
    VariantProps<typeof inputVariants> {
  className?: string
}

export const Input = ({ className, size, ...props }: InputProps) => {
  return (
    <ReactAria.Input
      className={cx(
        inputVariants({
          size,
          className,
        }),
      )}
      {...props}
    />
  )
}
