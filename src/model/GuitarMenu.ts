export interface GuitarMenu {
  label: string
  items: GuitarMenuItem[]
}

export interface GuitarMenuItem {
  label: string
  icon?: string
  route?: string
}
