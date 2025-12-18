// /client/src/types/Product.ts

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  stockQuantity: number;
  imageUrls: string[];
  scientificName: string;
  keyBenefits: string[];
  suggestedDosage: string;
  contraindications: string;
  averageRating: number;
  createdAt: string;
  updatedAt: string;
  audience?: 'Women' | 'Men' | 'Kids' | 'General';
  brand?: string;
}