export interface CategoryCardProps {
  name: string
  catNum: number
  catNomineesLength: number
  votes: number
  status: Category['status']
  winnerName?: string
}

export interface CategoryListProps {
  categories: Category[]
}

export interface AdminCategoryListProps {
  categories: Category[]
}
