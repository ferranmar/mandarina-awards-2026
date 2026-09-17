export interface DatabaseCategory {
  id: string;
  name: string;
  status: "open" | "closed";
}

export interface DatabaseNominee {
  id: string;
  name: string;
}

export interface DatabaseTallyRow {
  nominee_id: string;
  count: number;
}

export interface DatabaseTotalRow {
  total: number;
}
