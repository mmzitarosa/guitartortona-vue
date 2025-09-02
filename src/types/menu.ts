export interface Menu {
  label: string
  items: MenuItem[]
}

export interface MenuItem {
  label: string
  icon?: string
  route?: string
}
