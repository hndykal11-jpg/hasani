import React, { useState } from 'react';
import { Product, Category } from '../types';
import { Barcode, Upload, CheckCircle, ScanLine, PlusCircle, ChevronDown } from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';

interface ProductFormProps {
  onAddProduct: (product: Product) => void;
  categories: Category[];
}

const ProductForm: React.FC<ProductFormProps> = ({ onAddProduct, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    category: '',
    quantity: '',
    purchasePrice: '',
    sellingPrice: '',
    barcode: '',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
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
    // Optional: Play a beep sound here
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.company || !formData.quantity || !formData.purchasePrice || !formData.sellingPrice || !formData.barcode) {
      alert("Lütfen tüm zorunlu alanları ve barkodu doldurun.");
      return;
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      name: formData.name,
      company: formData.company,
      category: formData.category || undefined,
      quantity: parseInt(formData.quantity),
      purchasePrice: parseFloat(formData.purchasePrice),
      sellingPrice: parseFloat(formData.sellingPrice),
      barcode: formData.barcode,
      image: imagePreview || undefined,
    };

    onAddProduct(newProduct);
    
    // Reset form
    setFormData({
      name: '',
      company: '',
      category: '',
      quantity: '',
      purchasePrice: '',
      sellingPrice: '',
      barcode: '',
    });
    setImagePreview(null);
    setSuccessMessage('Ürün başarıyla eklendi!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
      {showScanner && (
        <BarcodeScanner 
          onScanSuccess={handleScanSuccess} 
          onClose={() => setShowScanner(false)} 
        />
      )}

      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="px-4 py-4 md:px-6 md:py-5 bg-gradient-to-r from-orange-600 to-orange-500 border-b border-orange-400">
          <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
            <PlusCircle className="text-orange-100" /> Yeni Ürün Girişi
          </h2>
          <p className="text-xs md:text-sm text-orange-100 mt-1 opacity-90">Stok sistemine yeni ürün eklemek için formu doldurun.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 flex items-center gap-3 animate-fade-in shadow-sm">
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <span className="font-medium text-sm md:text-base">{successMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Product Name */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">Ürün Adı</label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                className="block w-full bg-white text-gray-900 rounded-xl border-gray-200 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-3 border placeholder-gray-400 transition-all hover:border-gray-300"
                placeholder="Örn: Süt 1L"
                required
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-1.5">Kategori</label>
              <div className="relative">
                <select
                  name="category"
                  id="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="block w-full bg-white text-gray-900 rounded-xl border-gray-200 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-3 border appearance-none cursor-pointer hover:border-gray-300"
                >
                  <option value="">Kategori Seçin...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                  <ChevronDown size={20} />
                </div>
              </div>
              {categories.length === 0 && (
                <p className="text-xs text-orange-600 mt-1">
                  * Henüz kategori yok. Menüden ekleyebilirsiniz.
                </p>
              )}
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="company" className="block text-sm font-semibold text-gray-700 mb-1.5">Şirket Adı</label>
              <input
                type="text"
                name="company"
                id="company"
                value={formData.company}
                onChange={handleInputChange}
                className="block w-full bg-white text-gray-900 rounded-xl border-gray-200 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-3 border placeholder-gray-400 transition-all hover:border-gray-300"
                placeholder="Örn: Sütaş"
                required
              />
            </div>

            {/* Quantity */}
            <div>
              <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700 mb-1.5">Miktar</label>
              <input
                type="number"
                name="quantity"
                id="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                className="block w-full bg-white text-gray-900 rounded-xl border-gray-200 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-3 border placeholder-gray-400 transition-all hover:border-gray-300"
                placeholder="0"
                min="0"
                required
              />
            </div>

            {/* Pricing Section - Grouped - Stacked on mobile */}
            <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
               {/* Purchase Price */}
              <div>
                <label htmlFor="purchasePrice" className="block text-sm font-semibold text-gray-700 mb-1.5">Alış Fiyatı (TL)</label>
                <div className="relative">
                  <input
                    type="number"
                    name="purchasePrice"
                    id="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handleInputChange}
                    className="block w-full bg-white text-gray-900 rounded-xl border-gray-200 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-3 border placeholder-gray-400 transition-all hover:border-gray-300"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Selling Price */}
              <div>
                <label htmlFor="sellingPrice" className="block text-sm font-semibold text-gray-700 mb-1.5">Satış Fiyatı (TL)</label>
                <div className="relative">
                  <input
                    type="number"
                    name="sellingPrice"
                    id="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={handleInputChange}
                    className="block w-full bg-white text-gray-900 rounded-xl border-gray-200 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-3 border placeholder-gray-400 transition-all hover:border-gray-300 font-medium"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 md:pt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Barkod</label>
            <div className="flex flex-wrap xs:flex-nowrap gap-2">
              <div className="relative flex-grow min-w-[150px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Barcode className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="barcode"
                  id="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  className="block w-full bg-white text-gray-900 pl-10 sm:text-lg border-gray-200 rounded-xl py-3 font-mono tracking-widest placeholder-gray-400 shadow-sm focus:border-orange-500 focus:ring-orange-500 border"
                  placeholder="Barkod"
                  required
                />
              </div>
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-md active:scale-95 transform duration-150 flex-shrink-0"
              >
                <ScanLine size={20} />
                <span className="inline">Tara</span>
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 md:pt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Ürün Görseli</label>
            <div className="flex items-center justify-center w-full">
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 md:h-40 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-orange-50 hover:border-orange-300 transition-all group">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-full object-contain p-2" />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="bg-white p-2 md:p-3 rounded-full shadow-sm mb-2 md:mb-3 group-hover:scale-110 transition-transform">
                       <Upload className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-orange-500" />
                    </div>
                    <p className="mb-1 text-sm text-gray-600 font-medium">Fotoğraf Yükle</p>
                    <p className="text-xs text-gray-400">PNG, JPG</p>
                  </div>
                )}
                <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
            {imagePreview && (
               <button
                 type="button"
                 onClick={() => setImagePreview(null)}
                 className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium flex items-center justify-center w-full"
               >
                 Görseli Kaldır
               </button>
            )}
          </div>

          <div className="pt-2 md:pt-4">
            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-3 md:py-4 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all active:scale-[0.98]"
            >
              <CheckCircle size={20} />
              Ürünü Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;