export type CategoryStatus = "open" | "closed";

export interface Nominee {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  status: CategoryStatus;
  nominees: Nominee[];
  counts: Record<string, number>;
  total: number;
}
