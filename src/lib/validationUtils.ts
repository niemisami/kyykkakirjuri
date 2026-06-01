import { z } from 'zod'

/**
 * Trims a string input; empty/whitespace-only becomes `null`,
 * otherwise validates against `schema`. Input stays `string`,
 * output is `<inner> | null`.
 */
export function nullableString<T extends z.ZodType<unknown, string>>(schema: T) {
  return z
    .string()
    .nullable()
    .transform(v => (v === null || v.trim() === '') ? null : v.trim())
    .pipe(schema.nullable())
}

/**
 * Trim, empty -> null, otherwise convert to number and validate.
 **/
export function nullableNumber(schema: z.ZodType<number, number> = z.number()) {
  return z
    .string()
    .nullable()
    .transform(v => (v === null || v.trim() === '') ? null : Number(v.trim()))
    .pipe(schema.nullable())
}
