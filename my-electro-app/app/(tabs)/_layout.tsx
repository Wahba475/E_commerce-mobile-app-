import { Tabs } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../../context/CartContext';

export default function tabsLayout() {
  const insets = useSafeAreaInsets();
  const { getTotalItems } = useCart();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopWidth: 1,
          borderTopColor: '#333',
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 32 : 12,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: '#000',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#333',
          height: 60 + insets.top,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              color={color} 
              size={24} 
            />
          ),
          headerTitle: "Home",
        }} 
      />
      
      <Tabs.Screen 
        name="explore" 
        options={{
          title: "Explore",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "search" : "search-outline"} 
              color={color} 
              size={24} 
            />
          ),
          headerTitle: "Explore",
        }} 
      />
      
      <Tabs.Screen 
        name="orders" 
        options={{
          title: "Orders",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "receipt" : "receipt-outline"} 
              color={color} 
              size={24} 
            />
          ),
          headerTitle: "Order History",
        }} 
      />
      
      <Tabs.Screen 
        name="cart" 
        options={{
          title: "Cart",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "cart" : "cart-outline"} 
              color={color} 
              size={24} 
            />
          ),
          headerTitle: "Shopping Cart",
          tabBarBadge: getTotalItems() > 0 ? getTotalItems() : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#fff',
            color: '#000',
            fontSize: 12,
            fontWeight: '700',
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            borderWidth: 2,
            borderColor: '#000',
          },
        }} 
      />
      
    </Tabs>
  )
}