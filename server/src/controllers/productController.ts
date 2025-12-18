// /server/src/controllers/productController.ts
import { Request, Response } from 'express';
import Product, { IProduct } from '../models/Product';
import slugify from 'slugify'; // You may need to install this: npm install slugify
import mongoose from 'mongoose';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: Request, res: Response) => {
  try {
    // Basic search/filtering based on query parameters (e.g., /api/products?category=Vitamins)
    const { category, search } = req.query;
    const query: any = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      // Case-insensitive search on name or description
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);

  } catch (error) {
    res.status(500).json({ message: 'Server error fetching products' });
  }
};

// @desc    Get a single product by slug or ID
// @route   GET /api/products/:idOrSlug
// @access  Public
export const getProductByIdOrSlug = async (req: Request, res: Response) => {
  try {
    const { idOrSlug } = req.params;
    
    // Check if the parameter is a MongoDB ObjectId or a slug
    const product = mongoose.Types.ObjectId.isValid(idOrSlug)
      ? await Product.findById(idOrSlug)
      : await Product.findOne({ slug: idOrSlug });

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching product' });
  }
};


// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req: Request, res: Response) => {
  const { name, description, price, category, stockQuantity, imageUrls, scientificName, keyBenefits, suggestedDosage, contraindications } = req.body;

  try {
    const slug = slugify(name, { lower: true, strict: true });
    
    const product = new Product({
      name,
      slug,
      description: description || 'No description provided.',
      price: price || 0,
      category: category || 'General',
      stockQuantity: stockQuantity || 0,
      imageUrls: imageUrls || [],
      scientificName,
      keyBenefits: keyBenefits || [],
      suggestedDosage,
      contraindications
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error: any) {
    res.status(400).json({ message: 'Invalid product data', details: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    
    try {
      const product = await Product.findById(id);

      if (product) {
        // Automatically update slug if name changes
        if (updates.name) {
            updates.slug = slugify(updates.name, { lower: true, strict: true });
        }
        
        // Use findByIdAndUpdate for simplicity and update properties
        const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
        
        res.json(updatedProduct);
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    } catch (error: any) {
      res.status(400).json({ message: 'Error updating product', details: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (product) {
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting product' });
  }
};