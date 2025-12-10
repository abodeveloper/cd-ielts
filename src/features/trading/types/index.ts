// Trading system types

export interface Branch {
  id: number;
  name: string;
  code: string;
  address?: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface Trade {
  id: number;
  customer: Customer;
  branch: Branch;
  trade_type: 'DOLLAR' | 'SOM';
  amount: number;
  status: 'PAID' | 'DEBT' | 'PENDING' | 'CANCELLED';
  created_at: string;
  updated_at: string;
  description?: string;
}

export interface Payment {
  id: number;
  trade: Trade;
  amount: number;
  currency: 'DOLLAR' | 'SOM';
  payment_date: string;
  note?: string;
}

export interface TradeStatistics {
  total_trades_count: number;
  paid_trades_count: number;
  debt_trades_count: number;
  total_som_amount: number;
  total_dollar_amount: number;
  som_trades_count: number;
  dollar_trades_count: number;
}

export interface TradeFilter {
  branch_id?: number;
  trade_type?: 'DOLLAR' | 'SOM';
  status?: 'PAID' | 'DEBT' | 'PENDING' | 'CANCELLED';
  date_from?: string;
  date_to?: string;
  customer_name?: string;
}

export interface CreateTradeData {
  customer_id: number;
  branch_id: number;
  trade_type: 'DOLLAR' | 'SOM';
  amount: number;
  description?: string;
}

export interface CreatePaymentData {
  trade_id: number;
  amount: number;
  note?: string;
}

