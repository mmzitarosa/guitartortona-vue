export const validateDate = (date?: string) => {
  if (!date) return
  const [day, month, year] = date.split('/').map(Number)
  const d = new Date(year, month - 1, day)
  return (d.getFullYear() !== year ||
    d.getMonth() !== month - 1 ||
    d.getDate() !== day) ? undefined : d
}
