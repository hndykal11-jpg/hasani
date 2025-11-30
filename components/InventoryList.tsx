import React, { useMemo, useState } from 'react';
import { Product, StockLog, Category } from '../types';
import { supabase } from '../services/supabaseClient';
import { Search, PackageOpen, Filter, LayoutGrid, List, X, Tag, Building2, Barcode as BarcodeIcon, TrendingUp, Save, Check, Clock, ArrowUp, ArrowDown, History, Loader2, PlusCircle, ScanLine, Pencil, Trash2 } from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';
import EditProductModal from './EditProductModal';

interface InventoryListProps {
  products: Product[];
  categories?: Category[];
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onAddSampleProducts: () => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (id: string) => void;
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
  React.useEffect(() => {
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
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <button 
        className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 active:scale-95"
        onClick={(e) => {
          e.stopPropagation();
          const newVal = Math.max(0, parseInt(value || '0') - 1);
          setValue(newVal.toString());
          setIsChanged(newVal !== initialQuantity);
        }}
      >
        -
      </button>
      <input
        type="number"
        min="0"
        value={value}
        onChange={handleChange}
        className={`w-14 text-center py-1.5 text-base font-semibold rounded-lg focus:outline-none focus:ring-2 transition-all bg-white text-gray-900 ${
          isChanged ? 'ring-2 ring-orange-400 text-orange-700' : 'bg-gray-50 border border-gray-200'
        }`}
      />
      <button 
        className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 active:scale-95"
        onClick={(e) => {
          e.stopPropagation();
          const newVal = parseInt(value || '0') + 1;
          setValue(newVal.toString());
          setIsChanged(newVal !== initialQuantity);
        }}
      >
        +
      </button>
      
      {isChanged && (
        <button
          onClick={handleSave}
          className="ml-1 p-2 rounded-lg bg-orange-600 text-white shadow-md hover:bg-orange-700 active:scale-95 transition-all"
        >
          <Save size={16} />
        </button>
      )}
      {justSaved && (
        <span className="ml-1 text-green-600 animate-fade-in"><Check size={20} /></span>
      )}
    </div>
  );
};

const ProductDetailModal = ({ 
    product, 
    onClose, 
    onEdit, 
    onDelete 
}: { 
    product: Product; 
    onClose: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}) => {
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  React.useEffect(() => {
    const fetchHistory = async () => {
      setLoadingLogs(true);
      const { data, error } = await supabase
        .from('product_history')
        .select('*')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false });
      
      if (data) {
        setLogs(data as StockLog[]);
      }
      setLoadingLogs(false);
    };

    fetchHistory();
  }, [product.id]);

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/80 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 line-clamp-1">{product.name}</h2>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
              <span className="font-mono bg-gray-200 px-2 py-0.5 rounded text-gray-700">ID: {product.id}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
                <button 
                onClick={onEdit} 
                className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                title="Düzenle"
                >
                <Pencil size={20} />
                </button>
            )}
            {onDelete && (
                <button 
                onClick={() => {
                    if(window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
                        onDelete();
                        onClose();
                    }
                }} 
                className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
                title="Sil"
                >
                <Trash2 size={20} />
                </button>
            )}
            <button 
                onClick={onClose} 
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors text-gray-600"
            >
                <X size={24} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-5 lg:p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Column: Image & Quick Stats */}
            <div className="w-full lg:w-1/3 space-y-6">
              <div className="aspect-square bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center p-6 relative overflow-hidden group">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <PackageOpen className="w-32 h-32 text-gray-300" />
                )}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm backdrop-blur-md ${
                    product.quantity < 10 
                      ? 'bg-red-100 text-red-700 border border-red-200' 
                      : 'bg-green-100 text-green-700 border border-green-200'
                  }`}>
                    {product.quantity < 10 ? 'Kritik Stok' : 'Stokta Var'}
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-5 border border-orange-100 shadow-sm">
                <h4 className="text-sm font-semibold text-orange-800 mb-4 flex items-center gap-2">
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
                  <div className="h-px bg-orange-200/50 my-2"></div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-orange-700 font-medium">Kâr Marjı:</span>
                    <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                      % {(((product.sellingPrice - product.purchasePrice) / product.purchasePrice) * 100).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-1">
                    <span className="text-orange-700 font-medium">Toplam Stok Değeri:</span>
                    <span className="font-bold text-gray-900 text-lg">
                      {(product.quantity * product.sellingPrice).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Detailed Info */}
            <div className="w-full lg:w-2/3 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag size={14} /> Kategori
                  </label>
                  <p className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">{product.category || 'Belirtilmemiş'}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 size={14} /> Tedarikçi Firma
                  </label>
                  <p className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">{product.company}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BarcodeIcon size={14} /> Barkod
                  </label>
                  <p className="text-lg font-medium text-gray-900 font-mono tracking-wide border-b border-gray-100 pb-2">{product.barcode}</p>
                </div>

                <div className="space-y-1">
                   <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={14} /> Ekleme Tarihi
                  </label>
                  <p className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">
                    {new Date(parseInt(product.id)).toLocaleDateString('tr-TR') !== 'Invalid Date' 
                      ? new Date(parseInt(product.id)).toLocaleDateString('tr-TR') 
                      : 'Bilinmiyor'}
                  </p>
                </div>
              </div>

              {/* Stock History Log */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <History size={18} className="text-orange-600" />
                    Ürün Stok Geçmişi
                  </h3>
                </div>
                
                <div className="p-6 max-h-[300px] overflow-y-auto">
                  {loadingLogs ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="animate-spin text-orange-500" />
                    </div>
                  ) : logs.length > 0 ? (
                    <div className="space-y-0 relative">
                      {/* Vertical Line */}
                      <div className="absolute left-[19px] top-2 bottom-4 w-px bg-gray-200"></div>
                      
                      {logs.map((log) => {
                        const isIncrease = log.new_quantity > log.old_quantity;
                        const isInitial = log.change_type === 'INITIAL';
                        const diff = log.new_quantity - log.old_quantity;
                        
                        return (
                          <div key={log.id} className="relative flex items-start gap-4 pb-6 last:pb-0 group">
                            <div className={`relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center bg-white flex-shrink-0 shadow-sm ${
                              isInitial 
                                ? 'border-blue-100 text-blue-600' 
                                : isIncrease 
                                  ? 'border-green-100 text-green-600' 
                                  : 'border-red-100 text-red-600'
                            }`}>
                              {isInitial ? <PackageOpen size={18} /> : isIncrease ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                            </div>
                            
                            <div className="flex-1 pt-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-gray-900 text-sm sm:text-base">
                                    {isInitial ? 'Ürün Oluşturuldu' : isIncrease ? 'Stok Eklendi' : 'Stok Düştü'}
                                  </p>
                                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                    <Clock size={12} />
                                    {new Date(log.created_at).toLocaleDateString('tr-TR')} • {new Date(log.created_at).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                                  </p>
                                </div>
                                <div className={`text-sm font-bold ${isInitial ? 'text-blue-600' : isIncrease ? 'text-green-600' : 'text-red-600'}`}>
                                  {isInitial ? log.new_quantity : (diff > 0 ? `+${diff}` : diff)}
                                </div>
                              </div>
                              <div className="mt-2 text-xs bg-gray-50 p-2 rounded-lg border border-gray-100 inline-flex items-center gap-2">
                                <span className="text-gray-500">Önce:</span> 
                                <span className="font-mono font-medium">{log.old_quantity}</span>
                                <span className="text-gray-300">→</span>
                                <span className="text-gray-900 font-bold">Sonra:</span> 
                                <span className="font-mono font-bold text-gray-900">{log.new_quantity}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      Henüz kayıtlı bir stok geçmişi bulunmamaktadır.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InventoryList: React.FC<InventoryListProps> = ({ 
  products, 
  categories: propCategories = [],
  onUpdateQuantity, 
  onAddSampleProducts,
  selectedCategory,
  onSelectCategory,
  onEditProduct,
  onDeleteProduct
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  // viewMode changed to simple default 'table'
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table'); 
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  // Extract unique categories from products to mix with propCategories if needed,
  // or just use propCategories for filtering if provided.
  const displayCategories = useMemo(() => {
     if (propCategories.length > 0) return propCategories.map(c => c.name);
     const cats = new Set(products.map((p) => p.category).filter(Boolean));
     return Array.from(cats) as string[];
  }, [products, propCategories]);

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

  const handleScanSuccess = (decodedText: string) => {
    setSearchTerm(decodedText);
    // Beep or visual feedback could go here
  };

  const handleEditClick = (e: React.MouseEvent, product: Product) => {
      e.stopPropagation();
      setEditingProduct(product);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (onDeleteProduct && window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
          onDeleteProduct(id);
      }
  };

  return (
    <div className="space-y-6 animate-fade-in relative pb-20">
      {/* Modals */}
      {selectedProduct && (
        <ProductDetailModal 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
            onEdit={onEditProduct ? () => {
                setEditingProduct(selectedProduct);
                setSelectedProduct(null); // Close detail modal when opening edit
            } : undefined}
            onDelete={onDeleteProduct ? () => {
                 onDeleteProduct(selectedProduct.id);
            } : undefined}
        />
      )}

      {editingProduct && onEditProduct && (
          <EditProductModal 
            product={editingProduct} 
            categories={propCategories}
            onClose={() => setEditingProduct(null)}
            onSave={onEditProduct}
          />
      )}

      {showScanner && (
        <BarcodeScanner 
          onScanSuccess={handleScanSuccess} 
          onClose={() => setShowScanner(false)} 
        />
      )}

      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="col-span-2 md:col-span-2">
          <h2 className="text-2xl font-bold text-gray-900">
             {selectedCategory ? `${selectedCategory} Stokları` : 'Depo Envanteri'}
          </h2>
          <p className="text-sm text-gray-500">Stok durumunu canlı takip edin.</p>
        </div>
        
        <div className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Ürün Çeşidi</p>
          <p className="text-2xl font-bold text-gray-900">{filteredProducts.length}</p>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
           <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Toplam Stok</p>
           <p className="text-2xl font-bold text-orange-600">{filteredProducts.reduce((acc, curr) => acc + curr.quantity, 0)}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 sticky top-20 z-30">
        <div className="flex flex-col lg:flex-row gap-4">
          
          {/* Search & Scanner */}
          <div className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button 
              onClick={() => setShowScanner(true)}
              className="bg-gray-900 text-white p-3 rounded-xl hover:bg-gray-800 transition-colors shadow-sm active:scale-95"
              title="Barkod ile Ara"
            >
              <ScanLine size={24} />
            </button>
          </div>

          {/* Filters & View Toggle */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <div className="relative min-w-[150px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => onSelectCategory(e.target.value)}
                className="block w-full pl-9 pr-8 py-3 text-sm border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-xl bg-gray-50 text-gray-700 appearance-none"
              >
                <option value="">Tüm Kategoriler</option>
                {displayCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <List size={20} />
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'card'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <LayoutGrid size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {products.length === 0 && !searchTerm && !selectedCategory ? (
        // Empty State
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl shadow-sm border border-gray-100 border-dashed">
          <div className="bg-orange-50 p-6 rounded-full mb-6">
            <PackageOpen className="h-16 w-16 text-orange-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Envanteriniz Boş</h3>
          <p className="text-gray-500 max-w-md mb-8">
            Deponuzda hiç ürün yok. Hızlı başlangıç için örnek ürünleri ekleyebilir veya yeni ürün girişi yapabilirsiniz.
          </p>
          <button 
            onClick={onAddSampleProducts}
            className="flex items-center gap-3 px-8 py-4 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all font-bold shadow-lg shadow-orange-200 hover:shadow-orange-300 active:scale-95"
          >
            <PlusCircle size={24} />
            Örnek 5 Ürün Ekle
          </button>
        </div>
      ) : filteredProducts.length > 0 ? (
        viewMode === 'table' ? (
          /* Table View */
          <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ürün</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kategori</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Barkod</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Miktar</th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Satış</th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">İşlem</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredProducts.map((product) => (
                    <tr 
                      key={product.id} 
                      onClick={() => setSelectedProduct(product)}
                      className="hover:bg-orange-50/50 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 group-hover:border-orange-300 transition-colors p-1">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="h-full w-full object-contain" />
                            ) : (
                              <PackageOpen className="text-gray-300 group-hover:text-orange-400" size={24} />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900 group-hover:text-orange-700">{product.name}</div>
                            <div className="text-xs text-gray-500">{product.company}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                          {product.category || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                          {product.barcode}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <QuantityEditor 
                          initialQuantity={product.quantity} 
                          onSave={(newQty) => onUpdateQuantity(product.id, newQty)} 
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold text-right">
                        {product.sellingPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center gap-2">
                            {onEditProduct && (
                                <button 
                                    onClick={(e) => handleEditClick(e, product)}
                                    className="p-1.5 text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
                                    title="Düzenle"
                                >
                                    <Pencil size={16} />
                                </button>
                            )}
                            {onDeleteProduct && (
                                <button 
                                    onClick={(e) => handleDeleteClick(e, product.id)}
                                    className="p-1.5 text-red-600 bg-red-50 rounded hover:bg-red-100"
                                    title="Sil"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Mobile-Optimized Card View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                onClick={() => setSelectedProduct(product)}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:border-orange-300 transition-all cursor-pointer flex flex-col group relative"
              >
                <div className="h-48 w-full bg-white flex items-center justify-center relative border-b border-gray-100 p-4 group-hover:bg-orange-50/10 transition-colors">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <PackageOpen className="text-gray-200 w-20 h-20 group-hover:text-orange-300 transition-colors" />
                  )}
                  
                  {/* Category Badge - Clean White */}
                  {product.category && (
                     <div className="absolute top-3 left-3">
                      <span className="bg-white text-gray-600 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm border border-gray-100">
                        {product.category}
                      </span>
                    </div>
                  )}
                  
                   {/* Action Buttons Overlay */}
                   <div className="absolute top-3 right-3 flex gap-1">
                      {onEditProduct && (
                        <button 
                            onClick={(e) => handleEditClick(e, product)}
                            className="p-1.5 bg-white text-blue-600 rounded-full shadow-sm border border-gray-100 hover:bg-blue-50"
                        >
                            <Pencil size={14} />
                        </button>
                      )}
                      {onDeleteProduct && (
                        <button 
                            onClick={(e) => handleDeleteClick(e, product.id)}
                            className="p-1.5 bg-white text-red-600 rounded-full shadow-sm border border-gray-100 hover:bg-red-50"
                        >
                            <Trash2 size={14} />
                        </button>
                      )}
                   </div>

                  {/* Stock Badge - moved down slightly */}
                  <div className="absolute bottom-3 right-3">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-md shadow-sm border ${
                      product.quantity < 10 
                        ? 'bg-red-50 text-red-600 border-red-100' 
                        : 'bg-green-50 text-green-600 border-green-100'
                    }`}>
                      {product.quantity} Adet
                    </span>
                  </div>
                </div>
                
                <div className="p-4 flex flex-col flex-1">
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">{product.company}</p>
                  </div>

                  <div className="mt-auto space-y-3">
                     <div className="flex justify-between items-center bg-gray-50 p-2 rounded-xl border border-gray-100">
                       <span className="text-xs font-semibold text-gray-500 ml-1">Stok:</span>
                       <QuantityEditor 
                          initialQuantity={product.quantity} 
                          onSave={(newQty) => onUpdateQuantity(product.id, newQty)} 
                        />
                     </div>
                  
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-400 font-mono">{product.barcode.slice(-4)}...</span>
                      <p className="text-xl font-extrabold text-gray-900">
                        {product.sellingPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} <span className="text-xs font-normal text-gray-500">₺</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-gray-100 p-6 rounded-full mb-4">
            <Search className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Sonuç Bulunamadı</h3>
          <p className="mt-1 text-gray-500 max-w-xs mx-auto">
            {searchTerm 
              ? `"${searchTerm}" ile eşleşen ürün yok.` 
              : selectedCategory 
                ? `"${selectedCategory}" kategorisinde ürün bulunmuyor.`
                : "Ürün bulunmuyor."}
          </p>
          {(searchTerm || selectedCategory) && (
            <button 
              onClick={() => { setSearchTerm(''); onSelectCategory(''); }}
              className="mt-4 text-orange-600 font-medium hover:underline"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default InventoryList;