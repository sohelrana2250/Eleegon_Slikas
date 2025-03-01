import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Text, View, FlatList, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const AddToCart = () => {
  // Single state for all cart items
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchAllCartItems();
  }, []);
  
  // Fetch all cart items from different storage keys
  const fetchAllCartItems = async () => {
    setLoading(true);
    try {
      const clothingItemsJson = await AsyncStorage.getItem("cartItems");
      const electronicsItemsJson = await AsyncStorage.getItem("cartElectronics");
      
      const clothingItems = clothingItemsJson ? JSON.parse(clothingItemsJson) : [];
      const electronicsItems = electronicsItemsJson ? JSON.parse(electronicsItemsJson) : [];
      
      // Combine all items with a source identifier to help with deletion
      const allItems = [
        ...clothingItems.map(item => ({ ...item, source: 'clothing' })),
        ...electronicsItems.map(item => ({ ...item, source: 'electronics' }))
      ];
      
      setCartItems(allItems);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      Alert.alert("Error", "Failed to load cart items");
    } finally {
      setLoading(false);
    }
  };
  
  // Remove item from cart
  const removeItem = async (itemId, source) => {
    try {
      // Remove from state
      const updatedCartItems = cartItems.filter(item => !(item.id === itemId && item.source === source));
      setCartItems(updatedCartItems);
      
      // Remove from storage based on source
      const storageKey = source === 'clothing' ? 'cartItems' : 'cartElectronics';
      const itemsJson = await AsyncStorage.getItem(storageKey);
      const items = itemsJson ? JSON.parse(itemsJson) : [];
      const updatedItems = items.filter(item => item.id !== itemId);
      
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedItems));
      
      Alert.alert("Success", "Item removed from cart");
    } catch (error) {
      console.error("Error removing item:", error);
      Alert.alert("Error", "Failed to remove item");
      // Refresh cart items to ensure UI consistency
      fetchAllCartItems();
    }
  };
  
  // Update item quantity
  const updateQuantity = async (itemId, source, newQuantity) => {
    if (newQuantity < 1) {
      Alert.alert(
        "Remove Item", 
        "Do you want to remove this item from cart?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Remove", onPress: () => removeItem(itemId, source) }
        ]
      );
      return;
    }
    
    try {
      // Update in state
      const updatedCartItems = cartItems.map(item => {
        if (item.id === itemId && item.source === source) {
          const updatedItem = { 
            ...item, 
            quantity: newQuantity,
            totalPrice: (item.unitPrice || 0) * newQuantity
          };
          return updatedItem;
        }
        return item;
      });
      
      setCartItems(updatedCartItems);
      
      // Update in storage
      const storageKey = source === 'clothing' ? 'cartItems' : 'cartElectronics';
      const itemsJson = await AsyncStorage.getItem(storageKey);
      const items = itemsJson ? JSON.parse(itemsJson) : [];
      
      const updatedItems = items.map(item => {
        if (item.id === itemId) {
          return { 
            ...item, 
            quantity: newQuantity,
            totalPrice: (item.unitPrice || 0) * newQuantity
          };
        }
        return item;
      });
      
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedItems));
    } catch (error) {
      console.error("Error updating quantity:", error);
      Alert.alert("Error", "Failed to update quantity");
      fetchAllCartItems();
    }
  };
  
  // Calculate total price of all items in cart
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.totalPrice || 0), 0).toFixed(2);
  };
  
  // Render each cart item
  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image 
        source={{ uri: item.image || 'https://via.placeholder.com/150' }} 
        style={styles.itemImage} 
        defaultSource={require('../../assets/sun.png')} // Make sure to have a placeholder image in your assets
      />
      
      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.itemPrice}>
          ${(item.unitPrice || (item.totalPrice / item.quantity)).toFixed(2)} × {item.quantity}
        </Text>
        <Text style={styles.itemTotal}>Total: ${item.totalPrice?.toFixed(2) || '0.00'}</Text>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.source, item.quantity - 1)}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{item.quantity}</Text>
          
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.source, item.quantity + 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => {
          Alert.alert(
            "Remove Item",
            "Are you sure you want to remove this item from your cart?",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Remove", onPress: () => removeItem(item.id, item.source) }
            ]
          );
        }}
      >
        <MaterialIcons name="delete" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart</Text>
        <Text style={styles.itemCount}>{cartItems.length} items</Text>
      </View>
      
      {loading ? (
        <View style={styles.centerContainer}>
          <Text>Loading cart items...</Text>
        </View>
      ) : cartItems.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyCartText}>Your cart is empty</Text>
          <TouchableOpacity style={styles.shopButton}>
            <Text style={styles.shopButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderItem}
            keyExtractor={(item) => `${item.id}-${item.source}`}
            contentContainerStyle={styles.listContainer}
          />
          
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>${calculateTotal()}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutButton}>
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  itemCount: {
    fontSize: 16,
    color: '#666666',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    fontSize: 18,
    marginBottom: 20,
  },
  shopButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  shopButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 100, // Space for summary container
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666666',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 14,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    marginHorizontal: 12,
    fontSize: 16,
  },
  removeButton: {
    justifyContent: 'center',
    paddingLeft: 8,
  },
  summaryContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666666',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkoutButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddToCart;