import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
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
import type { SelectBaseProps } from './FormSelectInput'

type Value = string | number | null

type MultipleProps<T, TValue extends Value> = SelectBaseProps<T, TValue> & {
  multiple: true
  value: TValue[]
  onChange: (value: TValue[] | []) => void
}

type CommonSelectInputProps<T, TValue extends Value> = SelectBaseProps<T, TValue> & {
  hasError?: boolean
  dropdownContent: React.ReactNode
}

export type FormMultiSelectInputProps<T, TValue extends Value> = MultipleProps<T, TValue>

const emptyArray: never[] = []

const MultipleSelectInput = <T, TValue extends Value>({
  items,
  value,
  getLabel,
  getKey,
  disabled,
  hasError,
  placeholder,
  dropdownContent,
  onChange,
}: CommonSelectInputProps<T, TValue> & Omit<MultipleProps<T, TValue>, 'multiple'>) => {
  const selection = items.filter((item) => {
    const key = getKey(item)
    return !!key && value.includes(key)
  }) || emptyArray

  return (
    <Combobox
      items={items}
      itemToStringLabel={getLabel}
      multiple
      value={selection}
      onValueChange={value => onChange(value?.map(getKey).filter(Boolean) || emptyArray)}
      disabled={disabled}
    >
      <ComboboxChips aria-invalid={hasError || undefined}>
        <ComboboxValue>
          {items?.map(item => (
            <ComboboxChip key={getKey(item)}>
              {getLabel(item)}
            </ComboboxChip>
          ))}
        </ComboboxValue>
        <ComboboxChipsInput
          placeholder={placeholder}
          disabled={disabled}
        />
      </ComboboxChips>
      {dropdownContent}
    </Combobox>
  )
}

export function FormMultiSelectInput<T, TValue extends Value>({
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
}: FormMultiSelectInputProps<T, TValue>) {
  const errorMessages = Array.isArray(error) ? error : error ? [error] : []
  const hasError = errorMessages.length > 0

  const dropdownContent = (
    <>
      <ComboboxTrigger render={<Button variant='outline' className='w-64 justify-between font-normal'><ComboboxValue /></Button>} />
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
      <MultipleSelectInput
        items={items}
        value={value}
        getLabel={getLabel}
        getKey={getKey}
        disabled={disabled}
        hasError={hasError}
        placeholder={placeholder}
        dropdownContent={dropdownContent}
        onChange={onChange}
      />
      {errorMessages.length > 0 && (
        <p className='text-xs text-destructive'>{errorMessages.join(', ')}</p>
      )}
    </div>
  )
}
