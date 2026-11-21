export interface Column {
  id: string;
  title: string;
  wipLimit: number | null;
  order: number;
}

export interface CreateColumnInput {
  title: string;
  wipLimit: number | null;
}

export interface UpdateColumnInput {
  id: string;
  title: string;
  wipLimit?: number | null;
}
