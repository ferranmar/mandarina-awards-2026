export interface Nominee {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  status: "open" | "closed";
  nominees: Nominee[];
  counts: Record<string, number>;
  total: number;
}

export interface CategoryCardProps {
  name: string;
  catNum: number;
  catNomineesLength: number;
  votes: number;
  status: Category["status"];
  winnerName?: string;
}

export interface CategoryListProps {
  categories: Category[];
}

export interface AdminCategoryListProps {
  categories: Category[];
}
