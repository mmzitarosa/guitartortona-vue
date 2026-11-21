export interface AuditLog {
  id: number
  date: string
  username?: string
  entityType: string
  entityId: number
  operation: 'CREATE' | 'UPDATE' | 'DELETE'
  field?: string
  oldValue?: string
  newValue?: string
}

export interface AuditQuery {
  username?: string
  entityType?: string
  entityId?: number
  operation?: string
  from?: string
  to?: string
  page: number
  size: number
}
