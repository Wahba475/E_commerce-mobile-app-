import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native'
import React from 'react'
import { Stack, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Header from '@/components/Header'

const explore = () => {
  const router = useRouter();

  const categories = [
    {
      id: 'smartphones',
      title: 'Smartphones',
      icon: 'phone-portrait-outline',
      description: 'Latest mobile phones',
      color: '#333',
      image: '📱'
    },
    {
      id: 'laptops',
      title: 'Laptops',
      icon: 'laptop-outline',
      description: 'High-performance laptops',
      color: '#333',
      image: '💻'
    },
    {
      id: 'headphones',
      title: 'Headphones',
      icon: 'headset-outline',
      description: 'Audio & wireless headphones',
      color: '#333',
      image: '🎧'
    },
    {
      id: 'tvs',
      title: 'TVs',
      icon: 'tv-outline',
      description: 'Smart TVs & displays',
      color: '#333',
      image: '📺'
    },
    {
      id: 'tablets',
      title: 'Tablets',
      icon: 'tablet-landscape-outline',
      description: 'Tablets & iPads',
      color: '#333',
      image: '📱'
    },
    {
      id: 'cameras',
      title: 'Cameras',
      icon: 'camera-outline',
      description: 'DSLR & mirrorless cameras',
      color: '#333',
      image: '📷'
    },
    {
      id: 'gaming',
      title: 'Gaming',
      icon: 'game-controller-outline',
      description: 'Gaming consoles & accessories',
      color: '#333',
      image: '🎮'
    },
    {
      id: 'smart-home',
      title: 'Smart Home',
      icon: 'home-outline',
      description: 'Smart home devices',
      color: '#333',
      image: '🏠'
    },
    {
      id: 'accessories',
      title: 'Accessories',
      icon: 'extension-puzzle-outline',
      description: 'Chargers, cases & more',
      color: '#333',
      image: '🔌'
    }
  ];

  const handleCategoryPress = (categoryId: string) => {
    // Navigate to category-specific product list
    router.push(`/category/${categoryId}` as any);
  };

  const renderCategoryCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <Text style={styles.emojiIcon}>{item.image}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.categoryTitle}>{item.title}</Text>
          <Text style={styles.categoryDescription}>{item.description}</Text>
        </View>
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen 
        options={{ 
          header: () => (
            <Header 
              title="Explore Categories"
              showNotifications={false}
              showProfile={false}
            />
          ) 
        }} 
      />
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Browse by Category</Text>
          <Text style={styles.headerSubtitle}>Discover electronics by category</Text>
        </View>
        
        <FlatList
          data={categories}
          renderItem={renderCategoryCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#2a2a2a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ccc',
  },
  listContainer: {
    padding: 16,
  },
  categoryCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  emojiIcon: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#ccc',
  },
  arrowContainer: {
    marginLeft: 12,
  },
});

export default explore