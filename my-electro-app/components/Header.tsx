import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const Header = ({ 
  title = "ElectroShop", 
  showProfile = true, 
  showNotifications = true,
  onProfilePress = () => {},
  onNotificationPress = () => {},
  onSearchResults = (results: any[]) => {},
  onClearSearch = () => {},
  onFilterPress = () => {}
}) => {
  const insets = useSafeAreaInsets()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [userName, setUserName] = useState('')
  
  const baseUrl = "http://192.168.100.54:5000"

  useEffect(() => {
    const getUserName = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const response = await axios.get(`${baseUrl}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUserName(response.data.user?.name || '');
        }
      } catch (error) {
        console.log('Error getting user name:', error);
      }
    };
    getUserName();
  }, []);

  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim()) {
      onSearchResults([])
      return
    }

    setIsSearching(true)
    try {
         const response = await axios.get(`${baseUrl}/products/search?query=${encodeURIComponent(query.trim())}&limit=20`)
         onSearchResults(response.data.products || [])
    } catch (error) {
      console.log('Search error:', error)
      onSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [onSearchResults])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts(searchQuery)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, searchProducts])

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      searchProducts(searchQuery)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    onSearchResults([])
    if (onClearSearch) {
      onClearSearch()
    }
  }

  return (
    <LinearGradient
      colors={['#000000', '#1a1a1a']}
      style={[styles.container, { paddingTop: insets.top + 10 }]}
    >
      {/* Top Section - Title and Actions */}
      <View style={styles.topSection}>
        <View style={styles.titleContainer}>
          <Text style={styles.greeting}>
            {userName ? `Welcome back, ${userName.split(' ')[0]} 👋` : 'Welcome back 👋'}
          </Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        
        <View style={styles.actionsContainer}>
          {showNotifications && (
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={onNotificationPress}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={24} color="#fff" />
            </TouchableOpacity>
          )}
          
          {showProfile && (
            <TouchableOpacity 
              style={styles.profileButton} 
              onPress={onProfilePress}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#666', '#444']}
                style={styles.profileGradient}
              >
                <Ionicons name="person" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Bar Section */}
      <View style={styles.searchSection}>
        <View style={[
          styles.searchContainer, 
          isSearchFocused && styles.searchContainerFocused
        ]}>
          {isSearching ? (
            <Ionicons name="hourglass-outline" size={20} color="#666" style={styles.searchIcon} />
          ) : (
            <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
          )}
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, brands..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.filterButton} 
            activeOpacity={0.7}
            onPress={onFilterPress}
          >
            <Ionicons name="options-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingTop: 16,
  },
  titleContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#333',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  profileGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    gap: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchContainerFocused: {
    borderColor: '#555',
    backgroundColor: '#333',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    paddingVertical: 12,
  },
  clearButton: {
    padding: 4,
    marginRight: 8,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Header