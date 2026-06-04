import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from '@/components/ui/combobox'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'

type Value = string | number | null

export type SelectBaseProps<T, TValue extends Value> = {
  items: T[]
  /** Maps an item to the string shown in the input and dropdown. */
  getLabel: (item: T) => string
  getKey: (item: T | null) => TValue | null | undefined
  label?: string
  required?: boolean
  /** Error message(s) shown below the input. */
  error?: string | string[]
  placeholder?: string
  /** Shows a loading message in the empty state while items are being fetched. */
  loading?: boolean
  /** Shows a clear button to reset the selection. @default true */
  clearable?: boolean
  disabled?: boolean
  className?: string
}

type SingleProps<T, TValue extends Value> = SelectBaseProps<T, TValue> & {
  value: TValue | null
  onChange: (value: TValue | null) => void
}

export type FormSelectInputProps<T, TValue extends Value> = SingleProps<T, TValue>

const SingleSelectInput = <T, TValue extends Value>({
  items,
  value,
  getLabel,
  getKey,
  disabled,
  dropdownContent,
  onChange,
}: SingleProps<T, TValue> & { hasError?: boolean, placeholder?: string, dropdownContent?: React.ReactNode }) => {
  const selection = items.find(item => getKey(item) === value) || null
  return (
    <Combobox
      items={items}
      itemToStringLabel={getLabel}
      value={selection}
      onValueChange={item => onChange(getKey(item) || null)}
      disabled={disabled}
    >
      {dropdownContent}
    </Combobox>
  )
}

export function FormSelectInput<T, TValue extends Value>({
  items,
  getLabel,
  getKey,
  value,
  onChange,
  label,
  required,
  error,
  placeholder,
  loading = false,
  clearable = true,
  disabled = false,
  className,
}: FormSelectInputProps<T, TValue>) {
  const errorMessages = Array.isArray(error) ? error : error ? [error] : []
  const hasError = errorMessages.length > 0

  const dropdownContent = (
    <>
      <ComboboxTrigger render={<Button variant='outline' className='w-64 justify-between font-normal' />}>
        <ComboboxValue />
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxInput
          placeholder={placeholder}
          showClear={clearable}
          disabled={disabled || loading}
          aria-invalid={hasError || undefined}
          showTrigger={false}
        />
        <ComboboxEmpty>{loading ? 'Ladataan…' : 'Ei tuloksia'}</ComboboxEmpty>
        <ComboboxList>
          {(item: T) => {
            const key = getKey(item)
            console.log(key, item)
            return (
              <ComboboxItem key={key} value={item}>
                {getLabel(item)}
              </ComboboxItem>
            )
          }}
        </ComboboxList>
      </ComboboxContent>
    </>
  )

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label className='block text-sm font-medium'>
          {label}
          {required && <span className='ml-0.5 text-destructive'>*</span>}
        </label>
      )}
      <SingleSelectInput
        items={items}
        value={value}
        getLabel={getLabel}
        getKey={getKey}
        disabled={disabled}
        hasError={hasError}
        placeholder={placeholder}
        dropdownContent={dropdownContent}
        onChange={onChange}
        clearable={clearable}
      />
      {errorMessages.length > 0 && (
        <p className='text-xs text-destructive'>{errorMessages.join(', ')}</p>
      )}
    </div>
  )
}
