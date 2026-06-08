/** Product row shape returned by GET /api/admin/products */
export interface Product {
  productid: number;
  title: string;
  price: string | number;
  category: string;
  maincategory?: string;
  discount?: string | number;
  stars?: string | number;
  image?: string;
  link?: string;
  review_count?: number;
}

export type ProductStatus = 'Active' | 'Out of Stock';

export type ModalMode = 'add' | 'edit';

export interface ProductFormData {
  title: string;
  price: string;
  category: string;
  status: ProductStatus;
}

export const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/admin`;

export const CATEGORY_OPTIONS = ['Tech', 'Fashion', 'Home', 'Sports', 'Beauty', 'Books'];

export const STATUS_OPTIONS: ProductStatus[] = ['Active', 'Out of Stock'];

/** Derive display status from review_count (no status column in DB). */
export function getProductStatus(product: Product): ProductStatus {
  return (product.review_count ?? 0) > 0 ? 'Active' : 'Out of Stock';
}

/** Generate a readable SKU for the table UI. */
export function generateSku(product: Product): string {
  const prefix = product.title
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 4) || 'PRD';
  return `${prefix}-${product.productid}`;
}
