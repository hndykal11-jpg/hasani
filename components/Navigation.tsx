import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, PlusCircle, MessageSquare, Menu, X } from 'lucide-react';

interface NavigationProps {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setCurrentView, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const menuItems = [
    { id: ViewState.INVENTORY, label: 'Depo & Envanter', icon: <LayoutDashboard size={20} /> },
    { id: ViewState.ADD_PRODUCT, label: 'Ürün Ekle', icon: <PlusCircle size={20} /> },
    { id: ViewState.CHAT_BOT, label: 'Asistan (AI)', icon: <MessageSquare size={20} /> },
  ];

  const handleNavClick = (view: ViewState) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Navbar for Mobile/Desktop */}
      <nav className="bg-orange-600 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-white px-2 py-1 rounded">
                <span className="font-bold text-2xl text-orange-600 tracking-wider">ASLAN AVM</span>
              </div>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                      currentView === item.id
                        ? 'bg-white text-orange-600 shadow-sm'
                        : 'text-orange-100 hover:bg-orange-700 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-orange-600 focus:ring-white"
              >
                <span className="sr-only">Menüyü aç</span>
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-orange-700 border-t border-orange-600">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left flex items-center gap-3 ${
                    currentView === item.id
                      ? 'bg-white text-orange-600'
                      : 'text-orange-100 hover:bg-orange-800 hover:text-white'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navigation;