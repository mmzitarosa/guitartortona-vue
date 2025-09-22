/**
 * Form validation types
 */
export interface FieldError {
  message: string
}

export interface ResolverResult {
  errors: Record<string, FieldError[]>
}

/**
 * Form field mapping types
 */
export interface FieldMapping<T> {
  key: keyof T
  label: string
  getter?: (v: any) => unknown
  labeler?: (v: any) => unknown
  validator?: (v: any) => { message?: string } | undefined
}

/**
 * Form options interface
 */
export interface FormOptions<T> {
  getById: (id: number) => Promise<T>
  create: (item: T) => Promise<T>
  update: (id: number, item: T) => Promise<T>
  remove?: (id: number) => Promise<void>
  fieldMappings: FieldMapping<T>[]
}
