import { Stack } from 'expo-router'
import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { CartProvider } from '../context/CartContext'
import { OrderProvider } from '../context/OrderContext'

const _layout = () => {
  return (
    <CartProvider>
      <OrderProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <StatusBar style="auto" />
        </Stack>
      </OrderProvider>
    </CartProvider>
  )
}

export default _layout