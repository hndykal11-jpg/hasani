import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import InventoryList from './components/InventoryList';
import ProductForm from './components/ProductForm';
import ChatBot from './components/ChatBot';
import { ViewState, Product, Category } from './types';
import { supabase } from './services/supabaseClient';
import { Loader2, AlertCircle, Settings, Database, Copy, Check } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.INVENTORY);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(''); // Lifted state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTableMissing, setIsTableMissing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch products and categories from Supabase on load
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setIsTableMissing(false);

      // Fetch Products
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });

      if (productError) throw productError;

      const mappedProducts: Product[] = (productData || []).map((item: any) => ({
        ...item,
        id: item.id.toString(),
      }));

      setProducts(mappedProducts);

      // Fetch Categories
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      
      if (catError) {
        // If table is missing (42P01), throw it to show the setup screen
        if (catError.code === '42P01') {
          throw catError;
        } else {
          // Log other errors but don't crash the app, just log clearly
          console.error("Error fetching categories:", catError.message || catError);
        }
      }
      
      if (catData) {
        setCategories(catData.map((c: any) => ({ ...c, id: c.id.toString() })));
      }

    } catch (err: any) {
      console.error('Error fetching data:', err);
      
      const msg = err.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));

      if (err.code === '42P01') { // undefined_table
        setError('Veritabanı tabloları eksik (products veya categories). Lütfen SQL kurulumunu yapın.');
        setIsTableMissing(true);
      } else if (msg.includes('fetch') || msg.includes('URL')) {
        setError('Supabase bağlantısı kurulamadı. URL veya API Anahtarı hatalı olabilir.');
      } else {
        setError('Veriler yüklenirken bir hata oluştu: ' + msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async (product: Product) => {
    try {
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
        
        await supabase.from('product_history').insert([{
          product_id: data[0].id,
          old_quantity: 0,
          new_quantity: productData.quantity,
          change_type: 'INITIAL'
        }]);

        setCurrentView(ViewState.INVENTORY);
        // If the product has a category, switch to that category view or keep all? 
        // Let's keep the current category view unless it's filtering something else.
        if (productData.category && selectedCategory && selectedCategory !== productData.category) {
            setSelectedCategory(''); // Reset filter to see the new product if it doesn't match current filter
        }
      }
    } catch (err: any) {
      console.error('Error adding product:', err);
      const msg = err.message || JSON.stringify(err);
      if (err.code === '42P01') {
         alert('Hata: Veritabanı tabloları bulunamadı. Lütfen SQL kurulumunu yapın.');
         setError('Veritabanı tabloları eksik.');
         setIsTableMissing(true);
      } else {
         alert('Ürün eklenirken bir hata oluştu: ' + msg);
      }
    }
  };

  const handleEditProduct = async (updatedProduct: Product) => {
    try {
      const { id, ...productData } = updatedProduct;
      
      const { error } = await supabase
        .from('products')
        .update({
          name: productData.name,
          company: productData.company,
          category: productData.category,
          quantity: productData.quantity,
          purchasePrice: productData.purchasePrice,
          sellingPrice: productData.sellingPrice,
          barcode: productData.barcode,
          image: productData.image
        })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      
    } catch (err: any) {
      console.error("Error editing product:", err);
      alert("Ürün güncellenirken bir hata oluştu: " + err.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      console.error("Error deleting product:", err);
      alert("Ürün silinirken bir hata oluştu: " + err.message);
    }
  };

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    const product = products.find(p => p.id === id);
    const oldQuantity = product ? product.quantity : 0;

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

      await supabase.from('product_history').insert([{
        product_id: id,
        old_quantity: oldQuantity,
        new_quantity: newQuantity,
        change_type: 'UPDATE'
      }]);

    } catch (err) {
      console.error('Error updating quantity:', err);
      alert('Stok güncellenemedi, değişiklikler geri alınıyor.');
      fetchData();
    }
  };

  const handleAddCategory = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name }])
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        setCategories(prev => [...prev, { ...data[0], id: data[0].id.toString() }]);
      }
    } catch (err: any) {
      console.error("Error adding category:", err);
      
      let msg = err.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      
      if (err.code === '42P01') {
        alert("Hata: 'categories' tablosu bulunamadı. Lütfen veritabanı kurulumunu yapın.");
        setError('Veritabanı tabloları eksik (categories).');
        setIsTableMissing(true);
      } else {
        alert("Kategori eklenirken hata oluştu: " + msg);
      }
    }
  };

  // Handler for sidebar category clicks
  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setCurrentView(ViewState.INVENTORY);
    setIsMobileMenuOpen(false);
  };

  const handleAddSampleProducts = async () => {
    if (!window.confirm('Veritabanına 5 adet örnek ürün eklenecek. Onaylıyor musunuz?')) return;
    
    setIsLoading(true);
    // Ensure categories exist first for samples
    const sampleCategories = ['Gıda', 'İçecek', 'Atıştırmalık', 'Temizlik'];
    
    try {
      // 1. Add Categories if they don't exist
      for (const cat of sampleCategories) {
          const { error } = await supabase.from('categories').insert([{ name: cat }]).select();
          // Ignore duplicate error (code 23505) or table missing error (will be caught later)
          if (error && error.code !== '23505' && error.code !== '42P01') {
             console.warn("Error adding sample category:", error);
          }
      }
      
      // Refresh categories
      const { data: catData, error: catError } = await supabase.from('categories').select('*');
      if (catError && catError.code === '42P01') throw catError;
      
      if (catData) setCategories(catData.map((c: any) => ({...c, id: c.id.toString()})));

      const sampleProducts = [
        { name: 'Çaykur Rize Turist Çayı 1000gr', company: 'Çaykur', category: 'Gıda', quantity: 50, purchasePrice: 115.50, sellingPrice: 145.00, barcode: '8690105000001' },
        { name: 'Torku Tam Yağlı Süt 1L', company: 'Torku', category: 'İçecek', quantity: 120, purchasePrice: 24.00, sellingPrice: 32.50, barcode: '8690123456789' },
        { name: 'Ülker Çikolatalı Gofret 36gr', company: 'Ülker', category: 'Atıştırmalık', quantity: 240, purchasePrice: 6.50, sellingPrice: 10.00, barcode: '8690504030201' },
        { name: 'Nescafé Gold 100gr', company: 'Nestle', category: 'İçecek', quantity: 45, purchasePrice: 85.00, sellingPrice: 115.00, barcode: '8690632145874' },
        { name: 'Domestos Çamaşır Suyu 750ml', company: 'Unilever', category: 'Temizlik', quantity: 30, purchasePrice: 45.00, sellingPrice: 65.00, barcode: '8690637112233' }
      ];

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
      await fetchData();
    } catch (err: any) {
      console.error("Error adding samples", err);
      const msg = err.message || JSON.stringify(err);
      if (err.code === '42P01') {
        setError('Veritabanı tabloları eksik. Lütfen SQL kodunu çalıştırın.');
        setIsTableMissing(true);
      } else {
        alert("Örnek ürünler eklenirken hata: " + msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sqlCode = `create table if not exists products (
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
);

create table if not exists categories (
  id bigint generated by default as identity primary key,
  name text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              ? 'Supabase projenizde gerekli tablolar (products, categories, history) henüz oluşturulmamış.'
              : error}
          </p>
          
          {isTableMissing && (
            <div className="w-full max-w-2xl text-left bg-gray-100 border border-gray-200 rounded-lg overflow-hidden shadow-sm mb-6 relative group">
              <div className="bg-gray-200 px-4 py-2 flex justify-between items-center border-b border-gray-300">
                <span className="text-gray-600 text-xs font-mono">SQL Editor</span>
                <button 
                  onClick={copySql}
                  className="flex items-center gap-1 text-xs font-medium text-orange-700 hover:text-orange-900 transition-colors"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Kopyalandı' : 'Kodu Kopyala'}
                </button>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-gray-800 text-sm font-mono select-all">
                  {sqlCode}
                </pre>
              </div>
              <div className="bg-gray-50 px-4 py-2 text-right border-t border-gray-200">
                <span className="text-xs text-gray-500">Supabase SQL Editörüne yapıştırıp çalıştırın.</span>
              </div>
            </div>
          )}

          <button 
            onClick={fetchData}
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
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onUpdateQuantity={handleUpdateQuantity} 
            onAddSampleProducts={handleAddSampleProducts}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        );
      case ViewState.ADD_PRODUCT:
        return <ProductForm onAddProduct={handleAddProduct} categories={categories} />;
      case ViewState.CHAT_BOT:
        return <ChatBot />;
      default:
        return (
          <InventoryList 
            products={products} 
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onUpdateQuantity={handleUpdateQuantity} 
            onAddSampleProducts={handleAddSampleProducts}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
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
        categories={categories}
        onAddCategory={handleAddCategory}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
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