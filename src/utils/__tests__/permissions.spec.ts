import { describe, expect, it } from 'vitest'
import { documentPermissions, ledgerPermissions, receiptPermissions } from '@/utils/permissions'

const admin = { isAdmin: true, isUser: true }
const operator = { isAdmin: false, isUser: true }
const guest = { isAdmin: false, isUser: false }

describe('documentPermissions', () => {
  it("l'operatore modifica ed elimina solo le bozze", () => {
    const draft = documentPermissions({ status: 'DRAFT' }, operator)
    expect(draft).toMatchObject({ edit: true, archive: true, confirm: true })

    for (const status of ['PENDING', 'COMPLETED'] as const) {
      const p = documentPermissions({ status }, operator)
      expect(p).toMatchObject({ edit: false, archive: false, confirm: false })
    }
  })

  it("l'admin modifica ed elimina in ogni stato, ma conferma solo le bozze", () => {
    for (const status of ['DRAFT', 'PENDING', 'COMPLETED'] as const) {
      const p = documentPermissions({ status }, admin)
      expect(p).toMatchObject({ edit: true, archive: true, confirm: status === 'DRAFT' })
    }
  })

  it("un documento eliminato è in sola lettura: solo l'admin ripristina ed elimina definitivamente", () => {
    for (const status of ['DRAFT', 'PENDING', 'COMPLETED'] as const) {
      expect(documentPermissions({ status, archived: true }, admin)).toEqual({
        edit: false,
        archive: false,
        restore: true,
        hardDelete: true,
        confirm: false,
      })
      expect(documentPermissions({ status, archived: true }, operator)).toEqual({
        edit: false,
        archive: false,
        restore: false,
        hardDelete: false,
        confirm: false,
      })
    }
  })

  it('il guest non può fare nulla', () => {
    expect(documentPermissions({ status: 'DRAFT' }, guest)).toEqual({
      edit: false,
      archive: false,
      restore: false,
      hardDelete: false,
      confirm: false,
    })
  })
})

describe('receiptPermissions', () => {
  it('registra solo se confermata e non eliminata', () => {
    expect(receiptPermissions({ status: 'PENDING' }, operator).register).toBe(true)
    expect(receiptPermissions({ status: 'DRAFT' }, operator).register).toBe(false)
    expect(receiptPermissions({ status: 'COMPLETED' }, admin).register).toBe(false)
    expect(receiptPermissions({ status: 'PENDING', archived: true }, admin).register).toBe(false)
    expect(receiptPermissions({ status: 'PENDING' }, guest).register).toBe(false)
  })

  it('stampa dalla conferma in poi, non da eliminata', () => {
    expect(receiptPermissions({ status: 'DRAFT' }, admin).print).toBe(false)
    expect(receiptPermissions({ status: 'PENDING' }, operator).print).toBe(true)
    expect(receiptPermissions({ status: 'COMPLETED' }, operator).print).toBe(true)
    expect(receiptPermissions({ status: 'COMPLETED', archived: true }, admin).print).toBe(false)
  })
})

describe('ledgerPermissions', () => {
  it("operatore e admin modificano ed eliminano qualsiasi riga, l'ospite nulla", () => {
    for (const roles of [operator, admin]) {
      expect(ledgerPermissions({}, roles)).toEqual({
        edit: true,
        archive: true,
        restore: false,
        hardDelete: false,
      })
    }
    expect(ledgerPermissions({}, guest)).toMatchObject({ edit: false, archive: false })
  })

  it("una riga eliminata è in sola lettura: solo l'admin ripristina ed elimina definitivamente", () => {
    expect(ledgerPermissions({ archived: true }, admin)).toEqual({
      edit: false,
      archive: false,
      restore: true,
      hardDelete: true,
    })
    expect(ledgerPermissions({ archived: true }, operator)).toEqual({
      edit: false,
      archive: false,
      restore: false,
      hardDelete: false,
    })
  })
})
