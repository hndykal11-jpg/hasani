import React, { useMemo, useState, useEffect } from 'react';
import { Product } from '../types';
import { Search, PackageOpen, Filter, LayoutGrid, List, X, Tag, Building2, Barcode as BarcodeIcon, DollarSign, Calendar, TrendingUp, Save, Check } from 'lucide-react';

interface InventoryListProps {
  products: Product[];
  onUpdateQuantity: (id: string, newQuantity: number) => void;
}

// Helper component for inline quantity editing
const QuantityEditor = ({ 
  initialQuantity, 
  onSave 
}: { 
  initialQuantity: number; 
  onSave: (val: number) => void;
}) => {
  const [value, setValue] = useState(initialQuantity.toString());
  const [isChanged, setIsChanged] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Sync with prop updates if they happen externally
  useEffect(() => {
    setValue(initialQuantity.toString());
    setIsChanged(false);
  }, [initialQuantity]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setIsChanged(parseInt(e.target.value) !== initialQuantity);
    setJustSaved(false);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    const num = parseInt(value);
    if (!isNaN(num) && num >= 0) {
      onSave(num);
      setIsChanged(false);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <input
        type="number"
        min="0"
        value={value}
        onChange={handleChange}
        className={`w-16 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 transition-colors bg-white text-gray-900 ${
          isChanged ? 'border-orange-400 focus:ring-orange-500' : 'border-gray-300 focus:ring-gray-400'
        }`}
      />
      <button
        onClick={handleSave}
        disabled={!isChanged}
        className={`p-1.5 rounded transition-all ${
          justSaved 
            ? 'bg-green-100 text-green-600' 
            : isChanged 
              ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
        title="Stok Güncelle"
      >
        {justSaved ? <Check size={14} /> : <Save size={14} />}
      </button>
    </div>
  );
};

const ProductDetailModal = ({ product, onClose }: { product: Product; onClose: () => void }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <span className="font-mono bg-gray-200 px-2 py-0.5 rounded text-gray-700">{product.id}</span>
              <span>•</span>
              <span>Envanter Detayı</span>
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Column: Image & Quick Stats */}
            <div className="w-full lg:w-1/3 space-y-6">
              <div className="aspect-square bg-white rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center p-4 relative overflow-hidden group">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <PackageOpen className="w-32 h-32 text-gray-300" />
                )}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 text-sm font-bold rounded-full shadow-sm backdrop-blur-md ${
                    product.quantity < 10 
                      ? 'bg-red-100 text-red-700 border border-red-200' 
                      : 'bg-green-100 text-green-700 border border-green-200'
                  }`}>
                    {product.quantity < 10 ? 'Kritik Stok' : 'Stokta Var'}
                  </span>
                </div>
              </div>

              <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                <h4 className="text-sm font-semibold text-orange-800 mb-3 flex items-center gap-2">
                  <TrendingUp size={16} /> Finansal Özet
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Alış Birim:</span>
                    <span className="font-medium text-gray-900">{product.purchasePrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                  </div>
                   <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Satış Birim:</span>
                    <span className="font-medium text-gray-900">{product.sellingPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                  </div>
                  <div className="h-px bg-orange-200 my-2"></div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-orange-700 font-medium">Kâr Marjı:</span>
                    <span className="font-bold text-green-600">
                      % {(((product.sellingPrice - product.purchasePrice) / product.purchasePrice) * 100).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-orange-700 font-medium">Toplam Stok Değeri:</span>
                    <span className="font-bold text-gray-900">
                      {(product.quantity * product.sellingPrice).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Detailed Info */}
            <div className="w-full lg:w-2/3 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag size={14} /> Kategori
                  </label>
                  <p className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">{product.category || 'Belirtilmemiş'}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 size={14} /> Tedarikçi Firma
                  </label>
                  <p className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">{product.company}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <BarcodeIcon size={14} /> Barkod
                  </label>
                  <p className="text-lg font-medium text-gray-900 font-mono tracking-wide border-b border-gray-100 pb-2">{product.barcode}</p>
                </div>

                <div className="space-y-1">
                   <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={14} /> Ekleme Tarihi
                  </label>
                  <p className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">
                    {new Date(parseInt(product.id)).toLocaleDateString('tr-TR') !== 'Invalid Date' 
                      ? new Date(parseInt(product.id)).toLocaleDateString('tr-TR') 
                      : 'Bilinmiyor'}
                  </p>
                </div>

                 <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign size={14} /> Alış Fiyatı
                  </label>
                  <p className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">
                    {product.purchasePrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign size={14} /> Satış Fiyatı
                  </label>
                  <p className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">
                     {product.sellingPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                  </p>
                </div>
              </div>

              {/* Description / Extra Data Placeholder */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Ürün Stok Geçmişi</h3>
                <div className="space-y-3">
                   {/* Mock History Items */}
                   <div className="flex items-start gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                      <div>
                        <p className="font-medium text-gray-900">Stok Güncelleme</p>
                        <p className="text-xs text-gray-500">Bugün, 14:30 • {product.quantity} adet mevcut</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                      <div>
                        <p className="font-medium text-gray-900">Ürün Oluşturuldu</p>
                        <p className="text-xs text-gray-500">Sistem yöneticisi tarafından eklendi.</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
            >
              Kapat
            </button>
        </div>
      </div>
    </div>
  );
};

const InventoryList: React.FC<InventoryListProps> = ({ products, onUpdateQuantity }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Extract unique categories from products
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return products.filter((p) => {
      const matchesSearch = 
        p.name.toLowerCase().includes(term) ||
        p.company.toLowerCase().includes(term) ||
        p.barcode.includes(searchTerm);
      
      const matchesCategory = selectedCategory ? p.category === selectedCategory : true;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const totalStock = products.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Modal */}
      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Depo Envanteri</h2>
          <p className="text-sm text-gray-500">Mevcut stok durumunu görüntüleyin ve yönetin.</p>
        </div>
        
        {/* Stats Cards */}
        <div className="flex gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-orange-500 min-w-[140px]">
            <p className="text-xs text-gray-500 uppercase font-semibold">Toplam Ürün</p>
            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-orange-600 min-w-[140px]">
             <p className="text-xs text-gray-500 uppercase font-semibold">Toplam Stok</p>
             <p className="text-2xl font-bold text-gray-900">{totalStock}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div className="flex flex-col md:flex-row gap-4 flex-1 w-full lg:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              placeholder="Ürün, barkod veya şirket ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md bg-white text-gray-700"
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              viewMode === 'table'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <List size={18} />
            <span className="hidden sm:inline">Liste</span>
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              viewMode === 'card'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <LayoutGrid size={18} />
            <span className="hidden sm:inline">Kart</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      {filteredProducts.length > 0 ? (
        viewMode === 'table' ? (
          /* Table View */
          <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün Bilgisi</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barkod</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Şirket</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Miktar</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Alış (TL)</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Satış (TL)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr 
                      key={product.id} 
                      onClick={() => setSelectedProduct(product)}
                      className="hover:bg-orange-50 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200 group-hover:border-orange-300 transition-colors">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                              <PackageOpen className="text-gray-400 group-hover:text-orange-500" size={20} />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 group-hover:text-orange-700">{product.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-100">
                          {product.category || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 border border-gray-300 font-mono">
                          {product.barcode}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.company}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <QuantityEditor 
                          initialQuantity={product.quantity} 
                          onSave={(newQty) => onUpdateQuantity(product.id, newQty)} 
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {product.purchasePrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium text-right">
                        {product.sellingPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Card View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                onClick={() => setSelectedProduct(product)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-orange-300 transition-all cursor-pointer flex flex-col group"
              >
                <div className="h-48 w-full bg-gray-100 flex items-center justify-center relative border-b border-gray-100 group-hover:bg-orange-50/30 transition-colors">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <PackageOpen className="text-gray-300 w-16 h-16 group-hover:text-orange-400 transition-colors" />
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs font-bold rounded shadow-sm backdrop-blur-md ${
                      product.quantity < 10 
                        ? 'bg-red-100/90 text-red-700' 
                        : 'bg-white/90 text-gray-700'
                    }`}>
                      {product.quantity} Adet
                    </span>
                  </div>
                  {product.category && (
                    <div className="absolute bottom-2 left-2">
                      <span className="bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
                        {product.category}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-4 flex flex-col flex-1">
                  <div className="mb-2">
                    <h3 className="font-bold text-gray-900 line-clamp-1 text-lg group-hover:text-orange-600 transition-colors" title={product.name}>
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500">{product.company}</p>
                  </div>

                  <div className="mb-3">
                     <div className="text-xs text-gray-500 mb-1">Hızlı Stok Güncelleme:</div>
                     <QuantityEditor 
                        initialQuantity={product.quantity} 
                        onSave={(newQty) => onUpdateQuantity(product.id, newQty)} 
                      />
                  </div>
                  
                  <div className="mt-auto pt-3 border-t border-gray-100 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Satış Fiyatı</p>
                      <p className="text-xl font-bold text-orange-600">
                        {product.sellingPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-mono tracking-wide">{product.barcode}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Ürün Bulunamadı</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm 
              ? `"${searchTerm}" aramasına uygun ürün yok.` 
              : "Arama kriterlerinize uygun ürün yok veya stok boş."}
          </p>
        </div>
      )}
    </div>
  );
};

export default InventoryList;