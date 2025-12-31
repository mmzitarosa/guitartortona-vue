export const formatCurrency = (amount?: number) =>
  amount?.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
