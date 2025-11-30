import React, { useState } from 'react';
import { Product } from '../types';
import { Barcode, Upload, CheckCircle } from 'lucide-react';

interface ProductFormProps {
  onAddProduct: (product: Product) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ onAddProduct }) => {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden border-t-4 border-orange-600">
        <div className="px-6 py-4 bg-white border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-orange-600">+</span> Yeni Ürün Girişi
          </h2>
          <p className="text-sm text-gray-500 mt-1">Stok sistemine yeni ürün eklemek için formu doldurun.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 flex items-center gap-2">
              <CheckCircle size={20} />
              {successMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-600">Ürün Adı</label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full bg-white text-gray-900 rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-3 border placeholder-gray-400"
                placeholder="Örn: Süt 1L"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-600">Kategori</label>
              <input
                type="text"
                name="category"
                id="category"
                value={formData.category}
                onChange={handleInputChange}
                className="mt-1 block w-full bg-white text-gray-900 rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-3 border placeholder-gray-400"
                placeholder="Örn: İçecek"
              />
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-600">Şirket Adı</label>
              <input
                type="text"
                name="company"
                id="company"
                value={formData.company}
                onChange={handleInputChange}
                className="mt-1 block w-full bg-white text-gray-900 rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-3 border placeholder-gray-400"
                placeholder="Örn: Sütaş"
                required
              />
            </div>

            {/* Quantity */}
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-600">Miktar</label>
              <input
                type="number"
                name="quantity"
                id="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                className="mt-1 block w-full bg-white text-gray-900 rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-3 border placeholder-gray-400"
                placeholder="0"
                min="0"
                required
              />
            </div>

            {/* Purchase Price */}
            <div>
              <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-600">Alış Fiyatı (TL)</label>
              <input
                type="number"
                name="purchasePrice"
                id="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleInputChange}
                className="mt-1 block w-full bg-white text-gray-900 rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-3 border placeholder-gray-400"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>

            {/* Selling Price */}
            <div>
              <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-600">Satış Fiyatı (TL)</label>
              <input
                type="number"
                name="sellingPrice"
                id="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleInputChange}
                className="mt-1 block w-full bg-white text-gray-900 rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-3 border placeholder-gray-400"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">Barkod</label>
            <div className="flex flex-col md:flex-row gap-4 items-center p-4 bg-white rounded-lg border border-gray-200">
              <div className="relative rounded-md shadow-sm w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Barcode className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="barcode"
                  id="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  className="focus:ring-orange-500 focus:border-orange-500 block w-full bg-white text-gray-900 pl-10 sm:text-xl border-gray-300 rounded-md py-3 font-mono tracking-widest placeholder-gray-400"
                  placeholder="Barkod Numarası"
                  required
                />
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500 pl-1">Barkod numarasını okuyucu ile taratın veya manuel girin.</p>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">Ürün Görseli (İsteğe Bağlı)</label>
            <div className="flex items-center justify-center w-full">
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-full object-contain p-2" />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Yüklemek için tıklayın</span></p>
                    <p className="text-xs text-gray-500">PNG, JPG (Maks. 5MB)</p>
                  </div>
                )}
                <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
            {imagePreview && (
               <button
                 type="button"
                 onClick={() => setImagePreview(null)}
                 className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
               >
                 Görseli Kaldır
               </button>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
            >
              Ürünü Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;