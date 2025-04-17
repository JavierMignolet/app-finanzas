export interface Transaction {
  id: string;
  fecha: string;
  tipo: string;
  descripcion: string;
  monto: number;
}

export type View = "home" | "cost" | "income" | "summary";

export type FilterType =
  | "all"
  | "costo fijo"
  | "costo variable"
  | "ingreso bruto"
  | "ingreso neto";
