// /server/src/models/Product.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string; // for SEO and clean URLs
  description: string;
  price: number;
  category: string; 
  stockQuantity: number;
  imageUrls: string[];
  // Educational/Scientific Fields
  scientificName: string; 
  keyBenefits: string[];
  suggestedDosage: string;
  contraindications: string; 
  averageRating: number;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, index: true }, // Index for fast filtering
    stockQuantity: { type: Number, required: true, min: 0 },
    imageUrls: [{ type: String }],
    
    scientificName: { type: String, default: '' },
    keyBenefits: [{ type: String }],
    suggestedDosage: { type: String, default: 'See label' },
    contraindications: { type: String, default: 'None known' },
    
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
  },
  { timestamps: true }
);

const Product = mongoose.model<IProduct>('Product', ProductSchema);
export default Product;