import api from "@/lib/axios";
import { 
  Branch, 
  Trade, 
  Payment, 
  TradeStatistics, 
  TradeFilter, 
  CreateTradeData, 
  CreatePaymentData,
  Customer
} from "../types";

// Branches API
export const getBranches = async (): Promise<Branch[]> => {
  const response = await api.get("/api/branches/");
  return response.data;
};

export const getBranchFilters = async (branchId: number) => {
  const response = await api.get(`/api/branches/${branchId}/filters/`);
  return response.data;
};

// Customers API
export const getCustomers = async (): Promise<Customer[]> => {
  const response = await api.get("/api/customers/");
  return response.data;
};

export const createCustomer = async (customerData: Omit<Customer, 'id'>): Promise<Customer> => {
  const response = await api.post("/api/customers/", customerData);
  return response.data;
};

// Trades API
export const getTrades = async (
  page: number = 1, 
  filters?: TradeFilter
): Promise<{
  results: Trade[];
  count: number;
  total_pages: number;
}> => {
  const params = new URLSearchParams({
    page: page.toString(),
    ...Object.fromEntries(
      Object.entries(filters || {}).filter(([_, value]) => value !== undefined && value !== '')
    )
  });
  
  const response = await api.get(`/api/trades/?${params}`);
  return response.data;
};

export const createTrade = async (tradeData: CreateTradeData): Promise<Trade> => {
  const response = await api.post("/api/trades/", tradeData);
  return response.data;
};

export const getTradeById = async (id: number): Promise<Trade> => {
  const response = await api.get(`/api/trades/${id}/`);
  return response.data;
};

export const updateTrade = async (id: number, data: Partial<Trade>): Promise<Trade> => {
  const response = await api.put(`/api/trades/${id}/`, data);
  return response.data;
};

export const deleteTrade = async (id: number): Promise<void> => {
  await api.delete(`/api/trades/${id}/`);
};

// Payments API
export const getTradePayments = async (tradeId: number): Promise<Payment[]> => {
  const response = await api.get(`/api/trades/${tradeId}/payments/`);
  return response.data;
};

export const createPayment = async (paymentData: CreatePaymentData): Promise<Payment> => {
  const response = await api.post("/api/payments/", paymentData);
  return response.data;
};

// Statistics API
export const getTradeStatistics = async (filters?: TradeFilter): Promise<TradeStatistics> => {
  const params = new URLSearchParams(
    Object.fromEntries(
      Object.entries(filters || {}).filter(([_, value]) => value !== undefined && value !== '')
    )
  );
  
  const response = await api.get(`/api/trades/statistics/?${params}`);
  return response.data;
};

// SMS & Call API
export const sendSMSToCustomer = async (customerId: number, message: string) => {
  const response = await api.post(`/api/customers/${customerId}/sms/`, { message });
  return response.data;
};

export const initiateCallToCustomer = async (customerId: number) => {
  const response = await api.post(`/api/customers/${customerId}/call/`);
  return response.data;
};

