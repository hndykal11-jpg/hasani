import React, { useState } from 'react';
import Navigation from './components/Navigation';
import InventoryList from './components/InventoryList';
import ProductForm from './components/ProductForm';
import ChatBot from './components/ChatBot';
import { ViewState, Product } from './types';

// Mock initial data to populate the inventory for demonstration
const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Tam Yağlı Süt 1L',
    company: 'Sütaş',
    quantity: 45,
    purchasePrice: 22.50,
    sellingPrice: 35.00,
    barcode: '869012345678',
    category: 'Süt & Kahvaltılık'
  },
  {
    id: '2',
    name: 'Çaykur Rize Turist Çayı 1kg',
    company: 'Çaykur',
    quantity: 12,
    purchasePrice: 110.00,
    sellingPrice: 145.90,
    barcode: '869055544433',
    category: 'İçecek'
  },
  {
    id: '3',
    name: 'Beypazarı Maden Suyu 6\'lı',
    company: 'Beypazarı',
    quantity: 8,
    purchasePrice: 28.00,
    sellingPrice: 42.50,
    barcode: '869099988877',
    category: 'İçecek'
  },
  {
    id: '4',
    name: 'Osmancık Pirinç 2.5kg',
    company: 'Yayla',
    quantity: 20,
    purchasePrice: 85.00,
    sellingPrice: 115.00,
    barcode: '869011122233',
    category: 'Bakliyat'
  },
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.INVENTORY);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleAddProduct = (product: Product) => {
    setProducts((prev) => [product, ...prev]);
    // Optionally switch back to inventory view after adding
    setCurrentView(ViewState.INVENTORY);
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === id ? { ...product, quantity: newQuantity } : product
      )
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.INVENTORY:
        return (
          <InventoryList 
            products={products} 
            onUpdateQuantity={handleUpdateQuantity} 
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