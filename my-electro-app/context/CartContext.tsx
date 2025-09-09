import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const baseUrl = "http://192.168.100.54:5000";

interface CartItem {
  _id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  category?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  error: string | null;
  addToCart: (product: any) => Promise<boolean>;
  removeFromCart: (productId: string) => Promise<boolean>;
  updateQuantity: (productId: string, quantity: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  setError: (error: string | null) => void;
  fetchCartData: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCartFromStorage();
  }, []);

  useEffect(() => {
    saveCartToStorage();
  }, [cartItems]);

  const loadCartFromStorage = async () => {
    try {
      const savedCart = await AsyncStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.log('Error loading cart from storage:', error);
      setError('Failed to load cart data');
    }
  };

  const saveCartToStorage = async () => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (error) {
      console.log('Error saving cart to storage:', error);
      setError('Failed to save cart data');
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

  const addToCart = async (product: any): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Update local state immediately for better UX
      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item._id === product._id);
        
        if (existingItem) {
          return prevItems.map(item =>
            item._id === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          return [...prevItems, {
            _id: product._id,
            title: product.title,
            price: product.price,
            image: product.image,
            quantity: 1,
            category: product.category
          }];
        }
      });

      // Try to sync with backend if user is logged in
      const token = await getAuthToken();
      if (token) {
        try {
          await axios.post(`${baseUrl}/cart/add`, {
            productId: product._id,
            quantity: 1
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (backendError) {
          console.log('Backend sync failed, using local storage only:', backendError);
        }
      }

      setLoading(false);
      return true;
    } catch (error) {
      console.log('Error adding to cart:', error);
      setError('Failed to add item to cart');
      setLoading(false);
      return false;
    }
  };

  const removeFromCart = async (productId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Update local state immediately
      setCartItems(prevItems => prevItems.filter(item => item._id !== productId));

      // Try to sync with backend if user is logged in
      const token = await getAuthToken();
      if (token) {
        try {
          await axios.delete(`${baseUrl}/cart/remove/${productId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (backendError) {
          console.log('Backend sync failed, using local storage only:', backendError);
        }
      }

      setLoading(false);
      return true;
    } catch (error) {
      console.log('Error removing from cart:', error);
      setError('Failed to remove item from cart');
      setLoading(false);
      return false;
    }
  };

  const updateQuantity = async (productId: string, quantity: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      if (quantity <= 0) {
        return await removeFromCart(productId);
      }

      // Update local state immediately
      setCartItems(prevItems =>
        prevItems.map(item =>
          item._id === productId
            ? { ...item, quantity }
            : item
        )
      );

      // Try to sync with backend if user is logged in
      const token = await getAuthToken();
      if (token) {
        try {
          await axios.put(`${baseUrl}/cart/update`, {
            productId,
            quantity
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (backendError) {
          console.log('Backend sync failed, using local storage only:', backendError);
        }
      }

      setLoading(false);
      return true;
    } catch (error) {
      console.log('Error updating quantity:', error);
      setError('Failed to update quantity');
      setLoading(false);
      return false;
    }
  };

  const clearCart = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Update local state immediately
      setCartItems([]);

      // Clear from AsyncStorage immediately
      try {
        await AsyncStorage.removeItem('cart');
        console.log('Cart cleared from AsyncStorage');
      } catch (storageError) {
        console.log('Error clearing cart from storage:', storageError);
      }

      // Try to sync with backend if user is logged in
      const token = await getAuthToken();
      if (token) {
        try {
          await axios.delete(`${baseUrl}/cart/clear`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('Cart cleared from backend');
        } catch (backendError) {
          console.log('Backend sync failed, using local storage only:', backendError);
        }
      }

      setLoading(false);
      return true;
    } catch (error) {
      console.log('Error clearing cart:', error);
      setError('Failed to clear cart');
      setLoading(false);
      return false;
    }
  };

  const fetchCartData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const token = await getAuthToken();
      if (token) {
        try {
          const response = await axios.get(`${baseUrl}/cart`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data && response.data.products) {
            const backendCartItems = response.data.products.map((item: any) => ({
              _id: item.product._id || item.product,
              title: item.product.title || item.product.name,
              price: item.product.price,
              image: item.product.image,
              quantity: item.quantity,
              category: item.product.category
            }));
            setCartItems(backendCartItems);
          }
        } catch (backendError) {
          console.log('Backend fetch failed, using local storage:', backendError);
          // Keep using local storage if backend fails
        }
      }

      setLoading(false);
    } catch (error) {
      console.log('Error fetching cart data:', error);
      setError('Failed to load cart data');
      setLoading(false);
    }
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const value: CartContextType = {
    cartItems,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    setError,
    fetchCartData
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
