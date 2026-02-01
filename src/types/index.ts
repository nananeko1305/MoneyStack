export interface Transaction {
  id: string;
  amount: number;
  type: 'add' | 'subtract';
  timestamp: number;
  note?: string;
}

export interface Category {
  id: string;
  name: string;
  balance: number;
  transactions: Transaction[];
  createdAt: number;
}

export interface ExchangeRate {
  rate: number;
  timestamp: number;
}

export type RootStackParamList = {
  Home: undefined;
  AddCategory: undefined;
};
