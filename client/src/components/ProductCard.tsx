// /client/src/components/ProductCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types/Product';
import { formatNaira } from '../utils/currency';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-emerald-50/40 hover:border-amber-100/60">
      
      {/* Product Image Container */}
      <Link to={`/product/${product.slug}`} className="overflow-hidden bg-gradient-to-br from-neutral-50 to-emerald-50/20 h-72 flex items-center justify-center">
        <img 
          src={product.imageUrls[0] || 'https://via.placeholder.com/400x500.png?text=Vitabiotics+Product'} 
          alt={product.name} 
          className="w-full h-full object-contain object-center group-hover:scale-110 transition-transform duration-500 p-4"
        />
      </Link>

      <div className="p-5">
        {/* Product Category */}
        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">{product.category}</p>
        
        {/* Product Name */}
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-lg font-bold text-emerald-900 hover:text-amber-700 transition-colors mt-2 line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        {/* Rating */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm font-semibold text-amber-600">★ {product.averageRating || 4.8}</span>
          <span className="text-xs text-emerald-700/60">(Reviews)</span>
        </div>
        
        {/* Price */}
        <p className="mt-3 text-2xl font-extrabold text-emerald-900">
          {formatNaira(product.price)}
        </p>

        {/* CTA Button */}
        <Link to={`/product/${product.slug}`} className="mt-4 w-full block py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-900 font-semibold rounded-lg hover:shadow-md hover:scale-105 transition-all duration-300 text-center">
          View Product
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;