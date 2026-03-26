import type { Timestamp } from 'firebase/firestore';

export interface Product {
  id: string;
  nombre: string;
  marca?: string;
  descripcion: string;
  precio: number;
  imagen: string;
  stock: number;
  categoria?: string;
  creadoEn?: Timestamp;
}
