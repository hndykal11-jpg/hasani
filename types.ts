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