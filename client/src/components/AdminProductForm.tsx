// /client/src/components/AdminProductForm.tsx
import React, { useState, type FormEvent, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import type { Product } from '../types/Product';

const initialProductState: Partial<Product> = {
  name: '',
  description: '',
  price: 0,
  category: 'Vitamins',
  stockQuantity: 0,
  scientificName: '',
  suggestedDosage: '1 capsule daily',
  contraindications: 'None known',
  keyBenefits: [],
  imageUrls: [],
};

const productCategories = ['Vitamins', 'Minerals', 'Herbal', 'Digestion', 'Immunity', 'Energy'];
const benefitOptions = ['Energy', 'Immunity', 'Joint Health', 'Sleep', 'Digestion', 'Stress', 'Cognitive'];

const AdminProductForm: React.FC<{ initialData?: Product, onProductSaved: () => void }> = ({ initialData, onProductSaved }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(initialData || initialProductState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    if (initialData) {
        setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'price' || name === 'stockQuantity' ? Number(value) : value });
  };
  
  const handleBenefitToggle = (benefit: string) => {
    const currentBenefits = formData.keyBenefits || [];
    setFormData({
        ...formData,
        keyBenefits: currentBenefits.includes(benefit) 
            ? currentBenefits.filter(b => b !== benefit) 
            : [...currentBenefits, benefit],
    });
  };

  const handleImageFile = async (file?: File) => {
    if (!file) return;
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      setError('Cloudinary not configured. Please provide image URLs instead.');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const form = new FormData();
      form.append('file', file);
      form.append('upload_preset', UPLOAD_PRESET);

      const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

      const response = await axios.post(url, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        },
      });

      const secureUrl = response.data?.secure_url;
      if (secureUrl) {
        const current = formData.imageUrls || [];
        setFormData({ ...formData, imageUrls: [...current, secureUrl] });
        setSuccess('Image uploaded successfully');
      } else {
        setError('Upload failed: no URL returned');
      }
    } catch (err: any) {
      console.error('Cloudinary upload error', err);
      setError(err?.response?.data?.error?.message || 'Image upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
        setError("User not authenticated.");
        return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    
    // Ensure keyBenefits is an array even if empty
    const payload = {
        ...formData,
        keyBenefits: formData.keyBenefits || [],
        imageUrls: formData.imageUrls?.filter(url => url.trim() !== '') || [],
    };

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      if (initialData?._id) {
          // Update existing product (PUT)
          await axios.put(`http://localhost:5000/api/products/${initialData._id}`, payload, config);
          setSuccess('Product updated successfully!');
      } else {
          // Create new product (POST)
          await axios.post('http://localhost:5000/api/products', payload, config);
          setSuccess('Product created successfully!');
          setFormData(initialProductState); // Clear form on creation
      }
      onProductSaved(); // Notify parent component (if needed for list refresh)
      
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Product operation failed.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-xl shadow-2xl space-y-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-vita-text border-b pb-4">
        {initialData ? 'Edit Product' : 'Add New Product'}
      </h2>
      
      {success && <div className="p-3 text-sm font-medium text-green-700 bg-green-100 rounded-lg">{success}</div>}
      {error && <div className="p-3 text-sm font-medium text-red-700 bg-red-100 rounded-lg">{error}</div>}

      {/* --- Basic Product Details --- */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Name</label>
          <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required className="w-full mt-1 p-3 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select name="category" value={formData.category || productCategories[0]} onChange={handleChange} required className="w-full mt-1 p-3 border rounded-lg">
            {productCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" value={formData.description || ''} onChange={handleChange} required rows={4} className="w-full mt-1 p-3 border rounded-lg" />
        </div>
      </div>

      {/* --- Pricing and Stock --- */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Price (₦ Naira)</label>
          <input type="number" name="price" value={formData.price || 0} onChange={handleChange} min="0" step="0.01" required className="w-full mt-1 p-3 border rounded-lg" />
          <p className="text-xs text-gray-500 mt-1">Enter price in Naira (₦)</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
          <input type="number" name="stockQuantity" value={formData.stockQuantity || 0} onChange={handleChange} min="0" required className="w-full mt-1 p-3 border rounded-lg" />
        </div>
      </div>

      {/* --- Educational/Scientific Details --- */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="text-xl font-bold text-vita-primary">Educational Content</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Scientific Name</label>
          <input type="text" name="scientificName" value={formData.scientificName || ''} onChange={handleChange} className="w-full mt-1 p-3 border rounded-lg" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Suggested Dosage</label>
              <input type="text" name="suggestedDosage" value={formData.suggestedDosage || ''} onChange={handleChange} className="w-full mt-1 p-3 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contraindications</label>
              <input type="text" name="contraindications" value={formData.contraindications || ''} onChange={handleChange} className="w-full mt-1 p-3 border rounded-lg" />
            </div>
        </div>
        
        {/* Key Benefits Selector */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Key Benefits (Select all that apply)</label>
            <div className="flex flex-wrap gap-2">
                {benefitOptions.map(benefit => (
                    <button
                        key={benefit}
                        type="button"
                        onClick={() => handleBenefitToggle(benefit)}
                        className={`py-2 px-4 rounded-full border transition-colors text-sm ${
                            formData.keyBenefits?.includes(benefit) 
                                ? 'bg-vita-secondary text-vita-text border-vita-secondary font-semibold' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {benefit}
                    </button>
                ))}
            </div>
        </div>
      </div>
      
      {/* --- Images (Cloudinary upload + URL fallback) --- */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="text-xl font-bold text-vita-primary">Images</h3>
        <p className="text-sm text-gray-500">Upload image files or provide image URLs (one per line). First image is primary.</p>

        <div className="flex items-center gap-4">
          <input type="file" accept="image/*" onChange={handleFileInputChange} disabled={uploading} />
          {uploading && <div className="text-sm text-gray-600">Uploading... {uploadProgress}%</div>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Uploaded Images</label>
          <div className="flex flex-wrap gap-3">
            {(formData.imageUrls || []).map((url, idx) => (
              <div key={url} className="w-28 h-28 bg-gray-50 rounded overflow-hidden relative border">
                <img src={url} alt={`img-${idx}`} className="object-cover w-full h-full" />
                <button type="button" onClick={() => setFormData({ ...formData, imageUrls: (formData.imageUrls || []).filter(u => u !== url) })} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 text-xs">×</button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Or enter image URLs (one per line)</label>
          <textarea
            name="imageUrls"
            value={formData.imageUrls?.join('\n') || ''}
            onChange={(e) => setFormData({ ...formData, imageUrls: e.target.value.split('\n') })}
            rows={3}
            className="w-full mt-1 p-3 border rounded-lg"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 text-lg font-bold text-white rounded-lg transition-colors shadow-md ${
          loading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-vita-primary hover:bg-[#004a44]'
        }`}
      >
        {loading ? 'Saving...' : initialData ? 'Update Product' : 'Create Product'}
      </button>
    </form>
  );
};

export default AdminProductForm;