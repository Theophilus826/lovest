import type { Category } from "./category";

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string | Category;
  image: string;
  imagePublicId: string;
  featured: boolean;
  active: boolean;
  stock: number;
  createdAt: string;
  updatedAt: string;
}