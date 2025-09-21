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
 * UI Constants types
 */
export interface CardConst {
  title?: string
  subtitle?: string
}

export interface FieldConst {
  label: string
  messages: {
    required?: string
    tooLong?: string
    other?: string
  }
}

export interface ButtonConst {
  label?: string
  icon: string
}

export interface DialogConst {
  title: string
  message: string
  icon: string
  acceptLabel: string
  rejectLabel: string
  toastTitle?: string
  toastMessage?: string
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
