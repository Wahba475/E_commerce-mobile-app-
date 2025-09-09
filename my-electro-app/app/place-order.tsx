import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const baseUrl = "http://192.168.100.54:5000";

const PlaceOrderScreen = () => {
  const { cartItems, getTotalItems, getTotalPrice, clearCart } = useCart();
  const { addOrder } = useOrders();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: '',
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [selectedPayment, setSelectedPayment] = useState('cod');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors: any = {};
    
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.street.trim()) errors.street = 'Street address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.zipcode.trim()) errors.zipcode = 'Zipcode is required';
    if (!formData.country.trim()) errors.country = 'Country is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!selectedPayment) errors.payment = 'Please select a payment method';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill out all required fields');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty. Please add items before placing an order.');
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Authentication Required', 'Please log in to place an order');
        router.push('/signin');
        return;
      }

      // Prepare order items
      const orderItems = cartItems.map(item => ({
        productId: item._id,
        productName: item.title,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      }));

      // Calculate totals
      const subtotal = getTotalPrice();
      const shippingFee = 10.00;
      const total = subtotal + shippingFee;

      // Prepare order data
      const orderData = {
        items: orderItems,
        amount: total,
        address: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipcode: formData.zipcode,
          country: formData.country
        }
      };

      // Process order based on payment method
      switch (selectedPayment) {
        case 'stripe':
          try {
            const response = await axios.post(`${baseUrl}/order/stripe`, orderData, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data && response.data.session && response.data.session.url) {
              // Create order object for local storage
              const newOrder = {
                _id: response.data.orderId || `order_${Date.now()}`,
                items: orderItems,
                amount: total,
                status: 'pending',
                paymentMethod: 'stripe',
                date: new Date().toISOString(),
                address: orderData.address
              };
              
              // Add order to context and AsyncStorage
              addOrder(newOrder);
              
              // For React Native, we'll need to use a WebView or Linking to handle Stripe checkout
              // For now, we'll show a success message and clear the cart
              Alert.alert(
                'Payment Initiated',
                'Your payment has been initiated. Please complete the payment process.',
                [
                  {
                    text: 'View Orders',
                    onPress: () => {
                      clearCart();
                      router.push('/(tabs)/orders');
                    }
                  }
                ]
              );
            } else {
              Alert.alert('Error', 'Failed to initialize payment. Please try again.');
            }
          } catch (error) {
            console.error('Error placing Stripe order:', error);
            Alert.alert('Error', 'Failed to place order. Please try again.');
          }
          break;

        case 'cod':
          try {
            const response = await axios.post(`${baseUrl}/order/place-order`, orderData, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data) {
              // Create order object for local storage
              const newOrder = {
                _id: response.data.orderId || response.data._id || `order_${Date.now()}`,
                items: orderItems,
                amount: total,
                status: 'pending',
                paymentMethod: 'cod',
                date: new Date().toISOString(),
                address: orderData.address
              };
              
              // Add order to context and AsyncStorage
              addOrder(newOrder);
              
              Alert.alert(
                'Order Placed Successfully!',
                'Your order has been placed. You will receive a confirmation email shortly.',
                [
                  {
                    text: 'View Orders',
                    onPress: () => {
                      clearCart();
                      router.push('/(tabs)/orders');
                    }
                  }
                ]
              );
            }
          } catch (error) {
            console.error('Error placing COD order:', error);
            Alert.alert('Error', 'Failed to place order. Please try again.');
          }
          break;
          
        default:
          Alert.alert('Error', 'Please select a payment method');
      }

    } catch (error) {
      console.log('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Place Order</Text>
            <View style={styles.placeholder} />
          </View>
          
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="cart-outline" size={64} color="#666" />
            </View>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>Please add items to your cart before placing an order.</Text>
            <TouchableOpacity
              style={styles.continueShoppingButton}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={styles.continueShoppingText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Place Order</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            
            {/* Delivery Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>DELIVERY INFORMATION</Text>
              
              <View style={styles.formRow}>
                <View style={styles.halfInput}>
                  <TextInput
                    style={[styles.input, formErrors.firstName && styles.inputError]}
                    placeholder="First name"
                    placeholderTextColor="#666"
                    value={formData.firstName}
                    onChangeText={(value) => handleInputChange('firstName', value)}
                  />
                  {formErrors.firstName && <Text style={styles.errorText}>{formErrors.firstName}</Text>}
                </View>
                <View style={styles.halfInput}>
                  <TextInput
                    style={[styles.input, formErrors.lastName && styles.inputError]}
                    placeholder="Last name"
                    placeholderTextColor="#666"
                    value={formData.lastName}
                    onChangeText={(value) => handleInputChange('lastName', value)}
                  />
                  {formErrors.lastName && <Text style={styles.errorText}>{formErrors.lastName}</Text>}
                </View>
              </View>

              <TextInput
                style={[styles.input, formErrors.email && styles.inputError]}
                placeholder="Email address"
                placeholderTextColor="#666"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {formErrors.email && <Text style={styles.errorText}>{formErrors.email}</Text>}

              <TextInput
                style={[styles.input, formErrors.street && styles.inputError]}
                placeholder="Street address"
                placeholderTextColor="#666"
                value={formData.street}
                onChangeText={(value) => handleInputChange('street', value)}
              />
              {formErrors.street && <Text style={styles.errorText}>{formErrors.street}</Text>}

              <View style={styles.formRow}>
                <View style={styles.halfInput}>
                  <TextInput
                    style={[styles.input, formErrors.city && styles.inputError]}
                    placeholder="City"
                    placeholderTextColor="#666"
                    value={formData.city}
                    onChangeText={(value) => handleInputChange('city', value)}
                  />
                  {formErrors.city && <Text style={styles.errorText}>{formErrors.city}</Text>}
                </View>
                <View style={styles.halfInput}>
                  <TextInput
                    style={[styles.input, formErrors.state && styles.inputError]}
                    placeholder="State"
                    placeholderTextColor="#666"
                    value={formData.state}
                    onChangeText={(value) => handleInputChange('state', value)}
                  />
                  {formErrors.state && <Text style={styles.errorText}>{formErrors.state}</Text>}
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.halfInput}>
                  <TextInput
                    style={[styles.input, formErrors.zipcode && styles.inputError]}
                    placeholder="Zipcode"
                    placeholderTextColor="#666"
                    value={formData.zipcode}
                    onChangeText={(value) => handleInputChange('zipcode', value)}
                    keyboardType="numeric"
                  />
                  {formErrors.zipcode && <Text style={styles.errorText}>{formErrors.zipcode}</Text>}
                </View>
                <View style={styles.halfInput}>
                  <TextInput
                    style={[styles.input, formErrors.country && styles.inputError]}
                    placeholder="Country"
                    placeholderTextColor="#666"
                    value={formData.country}
                    onChangeText={(value) => handleInputChange('country', value)}
                  />
                  {formErrors.country && <Text style={styles.errorText}>{formErrors.country}</Text>}
                </View>
              </View>

              <TextInput
                style={[styles.input, formErrors.phone && styles.inputError]}
                placeholder="Phone number"
                placeholderTextColor="#666"
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                keyboardType="phone-pad"
              />
              {formErrors.phone && <Text style={styles.errorText}>{formErrors.phone}</Text>}
            </View>

            {/* Payment Method */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>PAYMENT METHOD</Text>
              
              {formErrors.payment && (
                <View style={styles.paymentErrorContainer}>
                  <Text style={styles.paymentErrorText}>{formErrors.payment}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.paymentOption, selectedPayment === 'cod' && styles.paymentOptionSelected]}
                onPress={() => {
                  setSelectedPayment('cod');
                  if (formErrors.payment) {
                    setFormErrors(prev => ({ ...prev, payment: '' }));
                  }
                }}
              >
                <View style={styles.paymentContent}>
                  <View style={styles.paymentIcon}>
                    <Ionicons name="cash-outline" size={24} color="#fff" />
                  </View>
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentTitle}>Cash on Delivery</Text>
                    <Text style={styles.paymentSubtitle}>Pay when you receive</Text>
                  </View>
                  <View style={[styles.radioButton, selectedPayment === 'cod' && styles.radioButtonSelected]}>
                    {selectedPayment === 'cod' && <View style={styles.radioButtonInner} />}
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.paymentOption, selectedPayment === 'stripe' && styles.paymentOptionSelected]}
                onPress={() => {
                  setSelectedPayment('stripe');
                  if (formErrors.payment) {
                    setFormErrors(prev => ({ ...prev, payment: '' }));
                  }
                }}
              >
                <View style={styles.paymentContent}>
                  <View style={[styles.paymentIcon, { backgroundColor: '#6366f1' }]}>
                    <Ionicons name="card-outline" size={24} color="#fff" />
                  </View>
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentTitle}>Stripe</Text>
                    <Text style={styles.paymentSubtitle}>Credit & Debit Cards</Text>
                  </View>
                  <View style={[styles.radioButton, selectedPayment === 'stripe' && styles.radioButtonSelected]}>
                    {selectedPayment === 'stripe' && <View style={styles.radioButtonInner} />}
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Order Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ORDER SUMMARY</Text>
              
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal ({getTotalItems()} items)</Text>
                  <Text style={styles.summaryValue}>${getTotalPrice().toFixed(2)}</Text>
                </View>
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Shipping Fee</Text>
                  <Text style={styles.summaryValue}>$10.00</Text>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>${(getTotalPrice() + 10.00).toFixed(2)}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.placeOrderButton, loading && styles.placeOrderButtonDisabled]}
                onPress={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.placeOrderButtonText}>PLACE ORDER</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#2a2a2a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginBottom: 8,
  },
  paymentErrorContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  paymentErrorText: {
    color: '#ff4444',
    fontSize: 14,
  },
  paymentOption: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  paymentOptionSelected: {
    borderColor: '#4ade80',
    backgroundColor: '#1f2937',
  },
  paymentContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#4ade80',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  paymentSubtitle: {
    fontSize: 14,
    color: '#ccc',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#4ade80',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4ade80',
  },
  summaryCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#ccc',
  },
  summaryValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  placeOrderButton: {
    backgroundColor: '#333',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeOrderButtonDisabled: {
    opacity: 0.6,
  },
  placeOrderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  continueShoppingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  continueShoppingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ccc',
  },
});

export default PlaceOrderScreen;
