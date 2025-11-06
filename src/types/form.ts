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
  key: string
  label: string
  getter?: (v: any) => unknown
  labeler?: (v: any) => unknown
  validator?: (v: any) => { message?: string } | undefined
  defaultValue?: boolean
}

/**
 * Form options interface
 */
export interface FormOptions<T> extends ValidationFormOptions<T> {
  initialValue?: T
  getById: (id: number) => Promise<T>
  create: (item: T) => Promise<T>
  update: (id: number, item: T) => Promise<T>
  remove: (id: number) => Promise<void>
  group?: string
}

/**
 * Submit Form options interface
 */
export interface SubmitFormOptions<T, R> {
  fieldMappings: FieldMapping<T>[]
  onSubmit: (item: T) => R
}

/**
 * Generic Form options interface
 */
export interface ValidationFormOptions<T> {
  fieldMappings: FieldMapping<T>[],
}
