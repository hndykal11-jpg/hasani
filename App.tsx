import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import InventoryList from './components/InventoryList';
import ProductForm from './components/ProductForm';
import ChatBot from './components/ChatBot';
import { ViewState, Product } from './types';
import { supabase } from './services/supabaseClient';
import { Loader2, AlertCircle, Settings, Database } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.INVENTORY);
  const [products, setProducts] = useState<Product[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTableMissing, setIsTableMissing] = useState(false);

  // Fetch products from Supabase on load
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setIsTableMissing(false);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;

      // Map Supabase data to our Product type (ensuring numbers are numbers)
      const mappedProducts: Product[] = (data || []).map((item: any) => ({
        ...item,
        id: item.id.toString(), // Convert ID to string for consistency with frontend types
      }));

      setProducts(mappedProducts);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      
      // Check for specific Supabase errors
      if (err.code === '42P01') { // undefined_table
        setError('Veritabanı tablosu bulunamadı.');
        setIsTableMissing(true);
      } else if (err.message && (err.message.includes('fetch') || err.message.includes('URL'))) {
        setError('Supabase bağlantısı kurulamadı. URL veya API Anahtarı hatalı olabilir.');
      } else {
        setError('Veriler yüklenirken bir hata oluştu: ' + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async (product: Product) => {
    try {
      // Remove ID as Supabase will generate it
      const { id, ...productData } = product;

      const { data, error } = await supabase
        .from('products')
        .insert([{ 
          name: productData.name,
          company: productData.company,
          quantity: productData.quantity,
          purchasePrice: productData.purchasePrice,
          sellingPrice: productData.sellingPrice,
          barcode: productData.barcode,
          category: productData.category,
          image: productData.image
        }])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        const newProduct = { ...data[0], id: data[0].id.toString() };
        setProducts((prev) => [newProduct, ...prev]);
        
        // Log Initial History
        await supabase.from('product_history').insert([{
          product_id: data[0].id,
          old_quantity: 0,
          new_quantity: productData.quantity,
          change_type: 'INITIAL'
        }]);

        setCurrentView(ViewState.INVENTORY);
      }
    } catch (err) {
      console.error('Error adding product:', err);
      alert('Ürün eklenirken bir hata oluştu. Veritabanı bağlantınızı kontrol edin.');
    }
  };

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    const product = products.find(p => p.id === id);
    const oldQuantity = product ? product.quantity : 0;

    // Optimistic update
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === id ? { ...product, quantity: newQuantity } : product
      )
    );

    try {
      const { error } = await supabase
        .from('products')
        .update({ quantity: newQuantity })
        .eq('id', id);

      if (error) throw error;

      // Log History
      await supabase.from('product_history').insert([{
        product_id: id,
        old_quantity: oldQuantity,
        new_quantity: newQuantity,
        change_type: 'UPDATE'
      }]);

    } catch (err) {
      console.error('Error updating quantity:', err);
      alert('Stok güncellenemedi, değişiklikler geri alınıyor.');
      fetchProducts(); // Revert changes by re-fetching
    }
  };

  const handleAddSampleProducts = async () => {
    if (!window.confirm('Veritabanına 5 adet örnek ürün eklenecek. Onaylıyor musunuz?')) return;
    
    setIsLoading(true);
    const sampleProducts = [
      { name: 'Çaykur Rize Turist Çayı 1000gr', company: 'Çaykur', category: 'Gıda', quantity: 50, purchasePrice: 115.50, sellingPrice: 145.00, barcode: '8690105000001' },
      { name: 'Torku Tam Yağlı Süt 1L', company: 'Torku', category: 'İçecek', quantity: 120, purchasePrice: 24.00, sellingPrice: 32.50, barcode: '8690123456789' },
      { name: 'Ülker Çikolatalı Gofret 36gr', company: 'Ülker', category: 'Atıştırmalık', quantity: 240, purchasePrice: 6.50, sellingPrice: 10.00, barcode: '8690504030201' },
      { name: 'Nescafé Gold 100gr', company: 'Nestle', category: 'İçecek', quantity: 45, purchasePrice: 85.00, sellingPrice: 115.00, barcode: '8690632145874' },
      { name: 'Domestos Çamaşır Suyu 750ml', company: 'Unilever', category: 'Temizlik', quantity: 30, purchasePrice: 45.00, sellingPrice: 65.00, barcode: '8690637112233' }
    ];

    try {
      for (const p of sampleProducts) {
         const { data, error } = await supabase.from('products').insert([p]).select();
         if (error) throw error;
         if (data && data[0]) {
             await supabase.from('product_history').insert([{
                 product_id: data[0].id,
                 old_quantity: 0,
                 new_quantity: p.quantity,
                 change_type: 'INITIAL'
             }]);
         }
      }
      await fetchProducts();
    } catch (err) {
      console.error("Error adding samples", err);
      alert("Örnek ürünler eklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (isLoading && products.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-orange-600 mb-4" />
          <p className="text-gray-500">Veriler yükleniyor...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
          <div className={`p-4 rounded-full mb-4 ${isTableMissing ? 'bg-orange-50' : 'bg-red-50'}`}>
            {isTableMissing ? <Database className="w-12 h-12 text-orange-500" /> : <Settings className="w-12 h-12 text-red-500" />}
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {isTableMissing ? 'Veritabanı Tablosu Eksik' : 'Bağlantı Hatası'}
          </h3>
          
          <p className="text-gray-600 mb-6 max-w-lg mx-auto">
            {isTableMissing 
              ? 'Supabase projenizde gerekli tablolar henüz oluşturulmamış. Aşağıdaki SQL kodunu kullanarak tabloları oluşturun.'
              : error}
          </p>
          
          {isTableMissing && (
            <div className="w-full max-w-2xl text-left bg-gray-100 border border-gray-200 rounded-lg overflow-hidden shadow-sm mb-6">
              <div className="bg-gray-200 px-4 py-2 flex justify-between items-center border-b border-gray-300">
                <span className="text-gray-600 text-xs font-mono">SQL Editor</span>
                <span className="text-gray-500 text-xs">schema.sql</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-gray-800 text-sm font-mono">
{`create table if not exists products (
  id bigint generated by default as identity primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text,
  company text,
  category text,
  quantity integer,
  "purchasePrice" numeric,
  "sellingPrice" numeric,
  barcode text,
  image text
);

create table if not exists product_history (
  id bigint generated by default as identity primary key,
  product_id bigint references products(id) on delete cascade,
  old_quantity integer,
  new_quantity integer,
  change_type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);`}
                </pre>
              </div>
              <div className="bg-gray-50 px-4 py-2 text-right border-t border-gray-200">
                <span className="text-xs text-gray-500">Bu kodu kopyalayıp Supabase SQL Editöründe çalıştırın.</span>
              </div>
            </div>
          )}

          <button 
            onClick={fetchProducts}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-md font-medium"
          >
            Tekrar Dene
          </button>
        </div>
      );
    }

    switch (currentView) {
      case ViewState.INVENTORY:
        return (
          <InventoryList 
            products={products} 
            onUpdateQuantity={handleUpdateQuantity} 
            onAddSampleProducts={handleAddSampleProducts}
          />
        );
      case ViewState.ADD_PRODUCT:
        return <ProductForm onAddProduct={handleAddProduct} />;
      case ViewState.CHAT_BOT:
        return <ChatBot />;
      default:
        return (
          <InventoryList 
            products={products} 
            onUpdateQuantity={handleUpdateQuantity} 
            onAddSampleProducts={handleAddSampleProducts}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navigation 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-500">© 2024 ASLAN AVM. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;