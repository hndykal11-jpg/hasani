import React, { useState } from 'react';
import { ViewState, Category } from '../types';
import { LayoutDashboard, PlusCircle, MessageSquare, Menu, X, ShoppingBag, FolderOpen, Plus, Tag, Layers } from 'lucide-react';

interface NavigationProps {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  categories: Category[];
  onAddCategory: (name: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
  currentView, 
  setCurrentView, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen,
  categories,
  onAddCategory,
  selectedCategory,
  onSelectCategory
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const menuItems = [
    { id: ViewState.INVENTORY, label: 'Depo & Envanter', icon: <LayoutDashboard size={20} /> },
    { id: ViewState.ADD_PRODUCT, label: 'Ürün Ekle', icon: <PlusCircle size={20} /> },
    { id: ViewState.CHAT_BOT, label: 'Asistan (AI)', icon: <MessageSquare size={20} /> },
  ];

  const handleNavClick = (view: ViewState) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  return (
    <>
      <nav className="bg-orange-600 text-white sticky top-0 z-50 shadow-lg shadow-orange-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo Area */}
            <div className="flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-lg shadow-sm">
                <ShoppingBag className="text-orange-600 w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-xl tracking-tight leading-none block">ASLAN AVM</span>
                <span className="text-[10px] text-orange-100 font-medium tracking-wider opacity-80 uppercase block">Yönetim Paneli</span>
              </div>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex flex-1 items-center">
              <div className="ml-10 flex items-center space-x-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      currentView === item.id
                        ? 'bg-white text-orange-600 shadow-md transform scale-105'
                        : 'text-orange-50 hover:bg-orange-500 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-orange-50 hover:text-white hover:bg-orange-500 transition-colors focus:outline-none"
              >
                <span className="sr-only">Menüyü aç</span>
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown & Sidebar Logic */}
        <div 
          className={`md:hidden fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          {/* Drawer */}
          <div 
            className={`fixed inset-y-0 left-0 w-72 bg-orange-700 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
             <div className="p-4 flex items-center justify-between border-b border-orange-600/50">
               <div className="flex items-center gap-2">
                  <div className="bg-white p-1 rounded-md">
                    <ShoppingBag className="text-orange-700 w-5 h-5" />
                  </div>
                  <span className="font-bold text-lg">ASLAN AVM</span>
               </div>
               <button onClick={() => setIsMobileMenuOpen(false)} className="text-orange-200 hover:text-white">
                 <X size={24} />
               </button>
             </div>

             <div className="px-3 py-4 space-y-2 overflow-y-auto">
               <div className="mb-6 space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                      currentView === item.id
                        ? 'bg-white text-orange-600 shadow-sm'
                        : 'text-orange-100 hover:bg-orange-600 hover:text-white'
                    }`}
                  >
                    <div className={`${currentView === item.id ? 'bg-orange-100' : 'bg-orange-800'} p-2 rounded-lg`}>
                      {item.icon}
                    </div>
                    {item.label}
                  </button>
                ))}
               </div>

               {/* Categories Section in Sidebar */}
               <div className="pt-4 border-t border-orange-600/50">
                  <div className="flex items-center justify-between px-2 mb-3">
                    <h3 className="text-xs font-bold text-orange-200 uppercase tracking-wider flex items-center gap-2">
                      <FolderOpen size={14} /> Kategoriler
                    </h3>
                    <button 
                      onClick={() => setIsAddingCategory(!isAddingCategory)}
                      className="text-orange-200 hover:text-white hover:bg-orange-600 p-1 rounded"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {isAddingCategory && (
                    <form onSubmit={handleAddCategorySubmit} className="mb-3 px-2 flex gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Kategori adı..."
                        className="w-full text-xs p-2 rounded text-gray-900 border-0 focus:ring-2 focus:ring-orange-400"
                        autoFocus
                      />
                      <button type="submit" className="bg-white text-orange-700 p-2 rounded font-bold text-xs">
                        OK
                      </button>
                    </form>
                  )}

                  <div className="space-y-1">
                    {/* All Products Option */}
                    <button
                      onClick={() => onSelectCategory('')}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                        selectedCategory === '' 
                          ? 'bg-orange-600 text-white font-bold' 
                          : 'text-orange-100 hover:bg-orange-600'
                      }`}
                    >
                      <Layers size={14} className="opacity-70" />
                      Tüm Ürünler
                    </button>

                    {categories.length === 0 ? (
                      <div className="text-orange-200/60 text-xs px-4 italic">Kategori bulunamadı</div>
                    ) : (
                      categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => onSelectCategory(cat.name)}
                          className={`w-full flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-colors cursor-pointer text-left ${
                            selectedCategory === cat.name 
                              ? 'bg-orange-600 text-white font-bold' 
                              : 'text-orange-100 hover:bg-orange-600'
                          }`}
                        >
                          <Tag size={14} className="opacity-70" />
                          {cat.name}
                        </button>
                      ))
                    )}
                  </div>
               </div>
             </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;