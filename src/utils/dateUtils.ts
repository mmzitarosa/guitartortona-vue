export const validateDate = (date?: string) => {
  if (!date) return
  const [day, month, year] = date.split('/').map(Number)
  const d = new Date(year, month - 1, day)
  return (d.getFullYear() !== year ||
    d.getMonth() !== month - 1 ||
    d.getDate() !== day) ? undefined : d
}

export const parseDate = (date?: string | Date, split?: string) : Date | undefined => {
  if (!date) return
  if (date instanceof Date) return date
  const [day, month, year] = date.split(split ?? "/").map(Number);
  return new Date(year, month - 1, day);
}


export const formatDate = (date?: Date | string , split?: string) : string | undefined => {
  if (!date) return
  if (date instanceof Date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}${split ?? "/"}${month}${split ?? "/"}${year}`;
  }
  return date
}
