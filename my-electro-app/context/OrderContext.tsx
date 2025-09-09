import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const baseUrl = "http://192.168.100.54:5000";

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  amount: number;
  status: string;
  paymentMethod: string;
  date: string;
  address: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;
  };
}

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  addOrder: (order: Order) => void;
  setError: (error: string | null) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrdersFromStorage();
  }, []);

  const loadOrdersFromStorage = async () => {
    try {
      const savedOrders = await AsyncStorage.getItem('orders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
        console.log('Orders loaded from AsyncStorage');
      }
    } catch (error) {
      console.log('Error loading orders from storage:', error);
      setError('Failed to load orders from storage');
    }
  };

  const saveOrdersToStorage = async (ordersToSave: Order[]) => {
    try {
      await AsyncStorage.setItem('orders', JSON.stringify(ordersToSave));
      console.log('Orders saved to AsyncStorage');
    } catch (error) {
      console.log('Error saving orders to storage:', error);
      setError('Failed to save orders to storage');
    }
  };

  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      return token;
    } catch (error) {
      console.log('Error getting auth token:', error);
      return null;
    }
  };

  const fetchOrders = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const token = await getAuthToken();
      if (token) {
        try {
          const response = await axios.get(`${baseUrl}/order/list-user`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data && response.data.orders) {
            const backendOrders = response.data.orders;
            setOrders(backendOrders);
            await saveOrdersToStorage(backendOrders);
            console.log('Orders fetched from backend and saved to storage');
          }
        } catch (backendError) {
          console.log('Backend fetch failed, using local storage:', backendError);
          // Keep using local storage if backend fails
        }
      }

      setLoading(false);
    } catch (error) {
      console.log('Error fetching orders:', error);
      setError('Failed to load orders');
      setLoading(false);
    }
  };

  const addOrder = (order: Order) => {
    const updatedOrders = [order, ...orders];
    setOrders(updatedOrders);
    saveOrdersToStorage(updatedOrders);
    console.log('New order added to context and storage');
  };

  const value: OrderContextType = {
    orders,
    loading,
    error,
    fetchOrders,
    addOrder,
    setError
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};
