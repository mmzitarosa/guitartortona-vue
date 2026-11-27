/**
 * Matrice dei permessi per fatture e ricevute dell'usato, in base a stato e ruolo.
 * Il controllo reale resta sull'API: qui si adatta solo l'interfaccia.
 */

export type DocumentStatus = 'DRAFT' | 'PENDING' | 'COMPLETED'

export interface Roles {
  /** Admin: può tutto */
  isAdmin: boolean
  /** Operatore o admin */
  isUser: boolean
}

export interface DocumentLike {
  status?: DocumentStatus
  archived?: boolean
}

export interface DocumentPermissions {
  /** Modificare il documento e le sue righe */
  edit: boolean
  /** Eliminare (archiviare) */
  archive: boolean
  /** Ripristinare un documento eliminato */
  restore: boolean
  /** Eliminare definitivamente */
  hardDelete: boolean
  /** Confermare una bozza */
  confirm: boolean
}

export interface ReceiptPermissions extends DocumentPermissions {
  /** Registrare una ricevuta confermata (assegna il numero) */
  register: boolean
  /** Stampare, dalla conferma in poi */
  print: boolean
}

/**
 * Un documento eliminato è in sola lettura: si può solo ripristinare o eliminare definitivamente (admin).
 * Altrimenti l'operatore agisce sulle bozze, l'admin su tutto.
 */
export function documentPermissions(doc: DocumentLike, roles: Roles): DocumentPermissions {
  if (doc.archived) {
    return {
      edit: false,
      archive: false,
      restore: roles.isAdmin,
      hardDelete: roles.isAdmin,
      confirm: false,
    }
  }
  const editable = roles.isUser && (doc.status === 'DRAFT' || roles.isAdmin)
  return {
    edit: editable,
    archive: editable,
    restore: false,
    hardDelete: false,
    confirm: roles.isUser && doc.status === 'DRAFT',
  }
}

export function receiptPermissions(doc: DocumentLike, roles: Roles): ReceiptPermissions {
  const base = documentPermissions(doc, roles)
  return {
    ...base,
    register: roles.isUser && !doc.archived && doc.status === 'PENDING',
    print: !doc.archived && (doc.status === 'PENDING' || doc.status === 'COMPLETED'),
  }
}
