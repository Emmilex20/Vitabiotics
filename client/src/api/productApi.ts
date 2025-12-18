// /client/src/api/productApi.ts
import axios from 'axios';
import type { Product } from '../types/Product';

const API_URL = 'http://localhost:5000/api/products';

export const productApi = {
  // Fetch all products with optional filters/search
  getProducts: async (params?: { category?: string; search?: string }): Promise<Product[]> => {
    const response = await axios.get(API_URL, { params });
    return response.data;
  },

  // Fetch a single product by slug (or ID)
  getProductBySlug: async (slug: string): Promise<Product> => {
    const response = await axios.get(`${API_URL}/${slug}`);
    return response.data;
  },
  
  // Future: Admin functions (create, update, delete) will go here
};