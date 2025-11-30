import React, { useState, useEffect } from 'react';
import { Product, Category } from '../types';
import { Save, X, Upload, Barcode, ScanLine, ChevronDown, CheckCircle } from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';

interface EditProductModalProps {
  product: Product;
  categories: Category[];
  onClose: () => void;
  onSave: (updatedProduct: Product) => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, categories, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: product.name,
    company: product.company,
    category: product.category || '',
    quantity: product.quantity.toString(),
    purchasePrice: product.purchasePrice.toString(),
    sellingPrice: product.sellingPrice.toString(),
    barcode: product.barcode,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(product.image || null);
  const [showScanner, setShowScanner] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    setFormData(prev => ({ ...prev, barcode: decodedText }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedProduct: Product = {
      ...product,
      name: formData.name,
      company: formData.company,
      category: formData.category || undefined,
      quantity: parseInt(formData.quantity) || 0,
      purchasePrice: parseFloat(formData.purchasePrice) || 0,
      sellingPrice: parseFloat(formData.sellingPrice) || 0,
      barcode: formData.barcode,
      image: imagePreview || undefined,
    };

    onSave(updatedProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        
        {showScanner && (
            <BarcodeScanner 
            onScanSuccess={handleScanSuccess} 
            onClose={() => setShowScanner(false)} 
            />
        )}

        <div className="flex justify-between items-center p-4 bg-orange-600 text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
             Ürün Düzenle
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-orange-700 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
            
            {/* Image Upload */}
            <div className="flex justify-center mb-4">
                 <label className="relative cursor-pointer group">
                    <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 hover:border-orange-400 transition-colors">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                        ) : (
                            <Upload className="text-gray-400 group-hover:text-orange-500" />
                        )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-orange-600 text-white p-1.5 rounded-full shadow-md">
                        <Upload size={14} />
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                 </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Ürün Adı</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Kategori</label>
                    <div className="relative">
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg p-2 appearance-none focus:ring-2 focus:ring-orange-500 outline-none"
                        >
                            <option value="">Seçiniz...</option>
                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Firma</label>
                    <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Stok Miktarı</label>
                    <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Alış Fiyatı (₺)</label>
                    <input
                        type="number"
                        name="purchasePrice"
                        step="0.01"
                        value={formData.purchasePrice}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Satış Fiyatı (₺)</label>
                    <input
                        type="number"
                        name="sellingPrice"
                        step="0.01"
                        value={formData.sellingPrice}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none font-bold text-gray-900"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Barkod</label>
                <div className="flex gap-2">
                    <div className="relative flex-grow">
                        <Barcode className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            name="barcode"
                            value={formData.barcode}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-2 font-mono tracking-widest focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                    </div>
                    <button 
                        type="button"
                        onClick={() => setShowScanner(true)}
                        className="bg-gray-800 text-white p-2 rounded-lg hover:bg-gray-900"
                    >
                        <ScanLine size={20} />
                    </button>
                </div>
            </div>

            <div className="pt-4 flex gap-3">
                <button 
                    type="button" 
                    onClick={onClose}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                    İptal
                </button>
                <button 
                    type="submit"
                    className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-700 transition-colors flex justify-center items-center gap-2"
                >
                    <CheckCircle size={18} /> Kaydet
                </button>
            </div>

        </form>
      </div>
    </div>
  );
};

export default EditProductModal;