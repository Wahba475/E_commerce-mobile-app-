  import { 
      View, 
      Text, 
      StyleSheet, 
      FlatList, 
      Image, 
      TouchableOpacity, 
      ActivityIndicator 
    } from 'react-native';
    import React, { useState, useEffect } from 'react';
    import { Stack, useRouter } from 'expo-router';
    import Header from '@/components/Header';
    import { useCart } from '../../context/CartContext';
    import axios from 'axios';
  
  const baseUrl = "http://192.168.100.54:5000";
  
  const ProductItem = ({ product }: { product: any }) => {
    const [imageError, setImageError] = useState(false);
    const [currentImageUri, setCurrentImageUri] = useState('');
    const router = useRouter();
    const { addToCart } = useCart();

    // Determine initial image URI
    useEffect(() => {
      if (product.image && product.image.startsWith('http')) {
        // Try direct URL first
        setCurrentImageUri(product.image);
      } else if (product.image) {
        setCurrentImageUri(`${baseUrl}/uploads/${product.image}`);
      } else {
        setCurrentImageUri('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==');
      }
    }, [product.image]);

    const handleImageError = () => {
      if (!imageError && product.image && product.image.startsWith('http')) {
        // If direct URL fails, try proxy
        console.log('Direct URL failed, trying proxy for:', product.title);
        setImageError(true);
        setCurrentImageUri(`${baseUrl}/proxy-image?url=${encodeURIComponent(product.image)}`);
      } else {
        // If proxy also fails, use placeholder
        console.log('All image URLs failed for:', product.title);
        setCurrentImageUri('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==');
      }
    };

    const handleQuickAddToCart = async (e: any) => {
      e.stopPropagation();
      const success = await addToCart(product);
      if (success) {
        // Optional: Show a brief success feedback
        console.log('Product added to cart successfully');
      }
    };

    return (
      <TouchableOpacity 
        style={styles.productItem} 
        onPress={() => router.push(`/product/${product._id}` as any)}
      >
         <Image 
           source={{ uri: currentImageUri }} 
           style={styles.productImage}
           resizeMode="cover"
           onError={handleImageError}
           onLoad={() => {
             console.log('Image loaded successfully for:', product.title);
           }}
         />
        <View style={styles.productInfo}>
          <Text style={styles.productTitle}>{product.title}</Text>
          <Text style={styles.productPrice}>${product.price}</Text>
          <Text style={styles.productDescription} numberOfLines={2}>
            {product.description}
          </Text>
          <TouchableOpacity 
            style={styles.quickAddButton}
            onPress={handleQuickAddToCart}
          >
            <Text style={styles.quickAddText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };
  
  const HomeScreen = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<any>(null);
  
    useEffect(() => {
      const fetchProducts = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`${baseUrl}/products/list?page=${currentPage}&limit=10`);
          setProducts(response.data.products || []);
          setPagination(response.data.pagination);
          setLoading(false);
        } catch (error) {
          console.log(error);
          setLoading(false);
        }
      };
      fetchProducts();
    }, [currentPage]);
  
    const handleSearchResults = (results: any[]) => {
      setSearchResults(results);
      setIsSearching(results.length > 0);
    };
  
    const handleClearSearch = () => {
      setSearchResults([]);
      setIsSearching(false);
    };

    const handlePageChange = (page: number) => {
      setCurrentPage(page);
    };
  
    const displayProducts = isSearching ? searchResults : products;
  
    return (
      <>
        <Stack.Screen 
          options={{ 
            header: () => (
              <Header 
                onSearchResults={handleSearchResults}
                onClearSearch={handleClearSearch}
              />
            ) 
          }} 
        />
         <View style={styles.container}>
           {loading ? (
             <ActivityIndicator size="large" color="#fff" style={styles.loader} />
           ) : (
             <>
               <FlatList 
                 data={displayProducts} 
                 keyExtractor={(item) => item._id.toString()} 
                 renderItem={({item}) => <ProductItem product={item} />}
                 ListEmptyComponent={() => (
                   <View style={styles.emptyContainer}>
                     <Text style={styles.emptyText}>
                       {isSearching ? 'No products found' : 'No products available'}
                     </Text>
                   </View>
                 )}
                 contentContainerStyle={{ paddingVertical: 8 }}
               />
               
               {!isSearching && pagination && (
                 <View style={styles.paginationContainer}>
                   <TouchableOpacity 
                     style={[styles.paginationButton, !pagination.hasPrevPage && styles.paginationButtonDisabled]}
                     onPress={() => handlePageChange(currentPage - 1)}
                     disabled={!pagination.hasPrevPage}
                   >
                     <Text style={[styles.paginationButtonText, !pagination.hasPrevPage && styles.paginationButtonTextDisabled]}>
                       Previous
                     </Text>
                   </TouchableOpacity>
                   
                   <Text style={styles.paginationInfo}>
                     Page {pagination.currentPage} of {pagination.totalPages}
                   </Text>
                   
                   <TouchableOpacity 
                     style={[styles.paginationButton, !pagination.hasNextPage && styles.paginationButtonDisabled]}
                     onPress={() => handlePageChange(currentPage + 1)}
                     disabled={!pagination.hasNextPage}
                   >
                     <Text style={[styles.paginationButtonText, !pagination.hasNextPage && styles.paginationButtonTextDisabled]}>
                       Next
                     </Text>
                   </TouchableOpacity>
                 </View>
               )}
             </>
           )}
         </View>
      </>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#1a1a1a',
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 100,
    },
    emptyText: {
      fontSize: 16,
      color: '#ccc',
      textAlign: 'center',
    },
    productItem: {
      flexDirection: 'row',
      padding: 16,
      marginHorizontal: 16,
      marginVertical: 8,
      backgroundColor: '#2a2a2a',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#333',
    },
     productImage: {
       width: 100,
       height: 100,
       borderRadius: 12,
       marginRight: 16,
     },
    productInfo: {
      flex: 1,
      justifyContent: 'space-between',
    },
    productTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#fff',
      marginBottom: 4,
    },
     productPrice: {
       fontSize: 16,
       fontWeight: '600',
       color: '#fff',
       marginBottom: 8,
     },
     productDescription: {
       fontSize: 14,
       color: '#ccc',
       lineHeight: 20,
       marginBottom: 8,
     },
     quickAddButton: {
       backgroundColor: '#333',
       paddingHorizontal: 12,
       paddingVertical: 6,
       borderRadius: 6,
       alignSelf: 'flex-start',
     },
     quickAddText: {
       fontSize: 12,
       color: '#fff',
       fontWeight: '500',
     },
     paginationContainer: {
       flexDirection: 'row',
       justifyContent: 'space-between',
       alignItems: 'center',
       paddingHorizontal: 20,
       paddingVertical: 16,
       backgroundColor: '#2a2a2a',
       borderTopWidth: 1,
       borderTopColor: '#333',
     },
     paginationButton: {
       backgroundColor: '#333',
       paddingHorizontal: 20,
       paddingVertical: 10,
       borderRadius: 8,
       minWidth: 80,
       alignItems: 'center',
     },
     paginationButtonDisabled: {
       backgroundColor: '#444',
     },
     paginationButtonText: {
       color: '#fff',
       fontWeight: '600',
       fontSize: 14,
     },
     paginationButtonTextDisabled: {
       color: '#666',
     },
     paginationInfo: {
       fontSize: 14,
       color: '#ccc',
       fontWeight: '500',
     },
   });
  
  export default HomeScreen;

  