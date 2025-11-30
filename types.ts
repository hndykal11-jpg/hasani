export interface Product {
  id: string;
  name: string;
  company: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  barcode: string;
  image?: string; // Base64 string
  category?: string;
}

export interface Category {
  id: string;
  name: string;
}

export enum ViewState {
  INVENTORY = 'INVENTORY',
  ADD_PRODUCT = 'ADD_PRODUCT',
  CHAT_BOT = 'CHAT_BOT',
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface StockLog {
  id: string;
  product_id: string;
  old_quantity: number;
  new_quantity: number;
  change_type: 'INITIAL' | 'UPDATE' | 'SALE';
  created_at: string;
}