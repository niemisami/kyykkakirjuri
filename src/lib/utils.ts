import { clsx } from 'clsx'
import type { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const fiCardinalRules = new Intl.PluralRules('fi-FI')

export function pluralize(count: number, singular: string, plural: string) {
  const pluralForm = fiCardinalRules.select(count) === 'one' ? singular : plural
  return `${count} ${pluralForm}`
}
