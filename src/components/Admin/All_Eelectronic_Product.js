//All_Eelectronic_Product 

import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Alert,
  Modal
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const All_Eelectronic_Product = ({ navigation }) => {
  // States
  const [category, setCategory] = useState([]);
  const [allElectronic, setElectronic] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [electronicItems, setElectronicItem] = useState(0);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "table"
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedProduct, setEditedProduct] = useState({
    title: "",
    brand: "",
    price: "",
    discount: "",
    category: ""
  });

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://fakestoreapi.in/api/products/category`,
        { method: "GET" }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      if (data.status) {
        setCategory(data?.categories);
      }
    } catch (error) {
      console.error(error);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  // Fetch products with pagination
  const fetchProducts = async (pageNum = 1, refresh = false, limit =150) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await fetch(
        `https://fakestoreapi.in/api/products?page=${pageNum}&limit=${limit}`,
        { method: "GET" }
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      
      const data = await response.json();
      
      if (data?.status) {
        if (refresh || pageNum === 1) {
          setElectronic(data?.products);
        } else {
          setElectronic(prev => [...prev, ...data?.products]);
        }
        
        setFilteredProducts(
          selectedCategory
            ? data?.products.filter(
                (item) => item.category === selectedCategory
              )
            : data?.products
        );
        
        // Assuming the API returns total pages info
        if (data.totalPages) {
          setTotalPages(data.totalPages);
        }
      }
    } catch (error) {
      console.error(error);
      setError("Failed to load products");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Delete product
  const deleteProduct = async (productId) => {
    try {
      setLoading(true);
      // In a real app, you'd call an API here:
      // const response = await fetch(`https://fakestoreapi.in/api/products/${productId}`, { method: "DELETE" });
      
      // Since we're working with mock data, simulate deletion locally:
      const updatedProducts = allElectronic.filter(product => product.id !== productId);
      setElectronic(updatedProducts);
      setFilteredProducts(updatedProducts.filter(item => 
        selectedCategory ? item.category === selectedCategory : true
      ));
      
      Alert.alert("Success", "Product deleted successfully");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  // Update product
  const updateProduct = async () => {
    try {
      if (!selectedProduct) return;
      
      setLoading(true);
      // Validate input
      if (!editedProduct.title || !editedProduct.price) {
        Alert.alert("Error", "Title and price are required");
        setLoading(false);
        return;
      }
      
      // In a real app, you'd call an API here:
      // const response = await fetch(`https://fakestoreapi.in/api/products/${selectedProduct.id}`, { 
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(editedProduct)
      // });
      
      // Since we're working with mock data, update locally:
      const updatedPrice = parseFloat(editedProduct.price);
      const updatedDiscount = parseFloat(editedProduct.discount);
      
      const updatedProducts = allElectronic.map(product => {
        if (product.id === selectedProduct.id) {
          return {
            ...product,
            title: editedProduct.title,
            brand: editedProduct.brand,
            price: isNaN(updatedPrice) ? product.price : updatedPrice,
            discount: isNaN(updatedDiscount) ? product.discount : updatedDiscount,
            category: editedProduct.category || product.category
          };
        }
        return product;
      });
      
      setElectronic(updatedProducts);
      setFilteredProducts(updatedProducts.filter(item => 
        selectedCategory ? item.category === selectedCategory : true
      ));
      
      setEditModalVisible(false);
      Alert.alert("Success", "Product updated successfully");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    fetchCategories();
    fetchProducts();
    
    // Get cart items count
    AsyncStorage.getItem("cartElectronics").then((data) => {
      if (data) {
        setElectronicItem(JSON.parse(data).length);
      }
    }).catch((error) => {
      console.error(error?.message);
    });
  }, []);

  // Handle category filter change
  useEffect(() => {
    if (selectedCategory) {
      setFilteredProducts(
        allElectronic.filter((item) => item.category === selectedCategory)
      );
    } else {
      setFilteredProducts(allElectronic);
    }
  }, [selectedCategory, allElectronic]);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      if (selectedCategory) {
        setFilteredProducts(
          allElectronic.filter((item) => item.category === selectedCategory)
        );
      } else {
        setFilteredProducts(allElectronic);
      }
    } else {
      const filtered = allElectronic.filter(
        (item) =>
          (item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
           item.category.toLowerCase().includes(searchQuery.toLowerCase())) &&
          (selectedCategory ? item.category === selectedCategory : true)
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, allElectronic, selectedCategory]);

  // Pull to refresh handler
  const onRefresh = () => {
    setPage(1);
    fetchProducts(1, true, 50);
  };

  // Load more products on reaching end of list
  const loadMoreProducts = () => {
    if (page < totalPages && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage);
    }
  };

  // Calculate discount price
  const getDiscountedPrice = (price, discount) => {
    if (!discount) return price;
    return price - (price * discount) / 100;
  };

  // Open edit modal
  const handleEdit = (product) => {
    setSelectedProduct(product);
    setEditedProduct({
      title: product.title,
      brand: product.brand || "",
      price: product.price.toString(),
      discount: product.discount?.toString() || "0",
      category: product.category
    });
    setEditModalVisible(true);
  };

  // Confirm delete
  const handleDelete = (product) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete "${product.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => deleteProduct(product.id), style: "destructive" }
      ]
    );
  };

  // Render product item in grid view
  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate("ProductDetail", { product: item })}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image || "https://via.placeholder.com/150" }}
          style={styles.productImage}
          resizeMode="cover"
        />
        {item.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{item.discount}% OFF</Text>
          </View>
        )}
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.brandText}>{item.brand}</Text>
        <Text style={styles.titleText} numberOfLines={2}>
          {item.title}
        </Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>
            ${getDiscountedPrice(item.price, item.discount).toFixed(2)}
          </Text>
          {item.discount > 0 && (
            <Text style={styles.originalPriceText}>${item.price.toFixed(2)}</Text>
          )}
        </View>
        
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>
            {(item.rating?.rate || 4.5).toFixed(1)}
          </Text>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEdit(item)}
          >
            <Ionicons name="pencil" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Table header for list view
  const TableHeader = () => (
    <View style={styles.tableRow}>
      <View style={styles.tableCell}>
        <Text style={styles.tableHeaderText}>Image</Text>
      </View>
      <View style={[styles.tableCell, { flex: 2 }]}>
        <Text style={styles.tableHeaderText}>Product</Text>
      </View>
      <View style={styles.tableCell}>
        <Text style={styles.tableHeaderText}>Price</Text>
      </View>
      <View style={styles.tableCell}>
        <Text style={styles.tableHeaderText}>Category</Text>
      </View>
      <View style={[styles.tableCell, { flex: 1.5 }]}>
        <Text style={styles.tableHeaderText}>Actions</Text>
      </View>
    </View>
  );

  // Render product item in table view
  const renderTableItem = ({ item }) => (
    <TouchableOpacity
      style={styles.tableRow}
      onPress={() => navigation.navigate("ProductDetail", { product: item })}
    >
      <View style={styles.tableCell}>
        <Image
          source={{ uri: item.image || "https://via.placeholder.com/150" }}
          style={styles.tableImage}
          resizeMode="cover"
        />
      </View>
      <View style={[styles.tableCell, { flex: 2 }]}>
        <Text style={styles.tableTitleText} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.tableBrandText}>{item.brand}</Text>
      </View>
      <View style={styles.tableCell}>
        <Text style={styles.tablePriceText}>
          ${getDiscountedPrice(item.price, item.discount).toFixed(2)}
        </Text>
        {item.discount > 0 && (
          <Text style={styles.tableOriginalPrice}>${item.price.toFixed(2)}</Text>
        )}
      </View>
      <View style={styles.tableCell}>
        <Text style={styles.tableCategoryText}>{item.category}</Text>
      </View>
      <View style={[styles.tableCell, { flex: 1.5 }]}>
        <View style={styles.tableActions}>
          <TouchableOpacity 
            style={[styles.tableActionButton, styles.editButton]}
            onPress={() => handleEdit(item)}
          >
            <Ionicons name="pencil" size={14} color="#fff" />
            <Text style={styles.tableActionText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tableActionButton, styles.deleteButton]}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash" size={14} color="#fff" />
            <Text style={styles.tableActionText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render footer (loading indicator for pagination)
  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#0073f0" />
        <Text style={styles.loadingText}>Loading more products...</Text>
      </View>
    );
  };

  // Render empty state
  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      {loading ? (
        <ActivityIndicator size="large" color="#0073f0" />
      ) : (
        <>
          <Ionicons name="search-outline" size={50} color="#ccc" />
          <Text style={styles.emptyText}>
            {error || "No products found. Try a different search or category."}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  // Edit Product Modal
  const EditProductModal = () => (
    <Modal
      visible={editModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setEditModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Product</Text>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalForm}>
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.input}
              value={editedProduct.title}
              onChangeText={(text) => setEditedProduct({...editedProduct, title: text})}
              placeholder="Product title"
            />
            
            <Text style={styles.inputLabel}>Brand</Text>
            <TextInput
              style={styles.input}
              value={editedProduct.brand}
              onChangeText={(text) => setEditedProduct({...editedProduct, brand: text})}
              placeholder="Brand name"
            />
            
            <Text style={styles.inputLabel}>Price ($)</Text>
            <TextInput
              style={styles.input}
              value={editedProduct.price}
              onChangeText={(text) => setEditedProduct({...editedProduct, price: text})}
              placeholder="Product price"
              keyboardType="numeric"
            />
            
            <Text style={styles.inputLabel}>Discount (%)</Text>
            <TextInput
              style={styles.input}
              value={editedProduct.discount}
              onChangeText={(text) => setEditedProduct({...editedProduct, discount: text})}
              placeholder="Discount percentage"
              keyboardType="numeric"
            />
            
            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categoryPicker}>
              {category.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryOption,
                    editedProduct.category === cat && styles.selectedCategoryOption
                  ]}
                  onPress={() => setEditedProduct({...editedProduct, category: cat})}
                >
                  <Text style={[
                    styles.categoryOptionText,
                    editedProduct.category === cat && styles.selectedCategoryOptionText
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={updateProduct}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Eleegon</Text>
          <Text style={styles.subTitleText}>Electronics</Text>
        </View>
        
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.viewModeButton}
            onPress={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
          >
            <Ionicons 
              name={viewMode === 'grid' ? 'list' : 'grid'} 
              size={20} 
              color="#333" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate("Cart")}>
            <Ionicons name="cart-outline" size={20} color="#333" />
            {electronicItems > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{electronicItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, brand or category..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories Horizontal Scroll */}
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContainer}
        >
          <TouchableOpacity
            style={[
              styles.categoryItem,
              selectedCategory === null && styles.selectedCategoryItem,
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === null && styles.selectedCategoryText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          
          {category.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryItem,
                selectedCategory === cat && styles.selectedCategoryItem,
              ]}
              onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.selectedCategoryText,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
        </Text>
      </View>

      {/* Products View (Grid or Table) */}
      {viewMode === 'grid' ? (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.productGrid}
          onEndReached={loadMoreProducts}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmptyComponent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderTableItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.tableContainer}
          onEndReached={loadMoreProducts}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={TableHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmptyComponent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          stickyHeaderIndices={[0]}
        />
      )}

      {/* Edit Product Modal */}
      <EditProductModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  logoContainer: {
    flexDirection: "column",
  },
  logoText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0073f0",
  },
  subTitleText: {
    fontSize: 14,
    color: "#666",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewModeButton: {
    padding: 8,
    marginRight: 12,
  },
  cartButton: {
    padding: 8,
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#ff3b30",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  categoryContainer: {
    marginBottom: 8,
  },
  categoryScrollContainer: {
    paddingHorizontal: 12,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f0f2f5",
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCategoryItem: {
    backgroundColor: "#0073f0",
  },
  categoryText: {
    fontSize: 14,
    color: "#333",
  },
  selectedCategoryText: {
    color: "#fff",
    fontWeight: "500",
  },
  resultsContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  resultsText: {
    color: "#666",
    fontSize: 14,
  },
  productGrid: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  productCard: {
    flex: 1,
    margin: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  imageContainer: {
    position: "relative",
    height: 160,
  },
  productImage: {
    height: "100%",
    width: "100%",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#ff3b30",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  productInfo: {
    padding: 12,
  },
  brandText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  titleText: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    height: 40,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0073f0",
  },
  originalPriceText: {
    fontSize: 14,
    color: "#999",
    textDecorationLine: "line-through",
    marginLeft: 6,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 2,
  },
  editButton: {
    backgroundColor: "#4caf50",
  },
  deleteButton: {
    backgroundColor: "#f44336",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  
  // Table view styles
  tableContainer: {
    paddingBottom: 20,
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 4,
  },
  tableHeaderText: {
    fontWeight: "bold",
    color: "#333",
    fontSize: 14,
  },
  tableImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  tableTitleText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  tableBrandText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  tablePriceText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0073f0",
  },
  tableOriginalPrice: {
    fontSize: 12,
    color: "#999",
    textDecorationLine: "line-through",
  },
  tableCategoryText: {
    fontSize: 13,
    color: "#666",
    backgroundColor: "#f0f2f5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    textAlign: "center",
  },
  tableActions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  tableActionButton: {
     flexDirection: "row",
     alignItems: "center",
     justifyContent: "center",
     paddingVertical: 5,
     paddingHorizontal: 8,
     borderRadius: 4,
     marginHorizontal: 2,
   },
   tableActionText: {
     color: "#fff",
     fontSize: 12,
     marginLeft: 2,
   },
   
   // Empty state
   emptyContainer: {
     flex: 1,
     alignItems: "center",
     justifyContent: "center",
     padding: 20,
     marginTop: 40,
   },
   emptyText: {
     fontSize: 16,
     color: "#666",
     textAlign: "center",
     marginTop: 10,
     marginBottom: 20,
   },
   retryButton: {
     backgroundColor: "#0073f0",
     paddingHorizontal: 20,
     paddingVertical: 10,
     borderRadius: 4,
   },
   retryButtonText: {
     color: "#fff",
     fontWeight: "500",
   },
   
   // Footer loader
   footerLoader: {
     flexDirection: "row",
     justifyContent: "center",
     alignItems: "center",
     padding: 16,
   },
   loadingText: {
     marginLeft: 8,
     color: "#666",
   },
   
   // Modal styles
   modalContainer: {
     flex: 1,
     justifyContent: "center",
     alignItems: "center",
     backgroundColor: "rgba(0,0,0,0.5)",
   },
   modalContent: {
     width: "90%",
     maxHeight: "80%",
     backgroundColor: "#fff",
     borderRadius: 12,
     overflow: "hidden",
   },
   modalHeader: {
     flexDirection: "row",
     justifyContent: "space-between",
     alignItems: "center",
     padding: 16,
     borderBottomWidth: 1,
     borderBottomColor: "#eee",
   },
   modalTitle: {
     fontSize: 18,
     fontWeight: "bold",
     color: "#333",
   },
   modalForm: {
     padding: 16,
   },
   inputLabel: {
     fontSize: 14,
     fontWeight: "500",
     color: "#333",
     marginBottom: 4,
   },
   input: {
     backgroundColor: "#f8f9fa",
     borderWidth: 1,
     borderColor: "#e1e4e8",
     borderRadius: 6,
     padding: 10,
     fontSize: 16,
     marginBottom: 16,
   },
   categoryPicker: {
     flexDirection: "row",
     flexWrap: "wrap",
     marginBottom: 16,
   },
   categoryOption: {
     paddingHorizontal: 16,
     paddingVertical: 8,
     backgroundColor: "#f0f2f5",
     borderRadius: 20,
     marginRight: 8,
     marginBottom: 8,
   },
   selectedCategoryOption: {
     backgroundColor: "#0073f0",
   },
   categoryOptionText: {
     fontSize: 14,
     color: "#333",
   },
   selectedCategoryOptionText: {
     color: "#fff",
   },
   modalFooter: {
     flexDirection: "row",
     justifyContent: "flex-end",
     padding: 16,
     borderTopWidth: 1,
     borderTopColor: "#eee",
   },
   cancelButton: {
     paddingVertical: 10,
     paddingHorizontal: 16,
     borderRadius: 4,
     marginRight: 8,
   },
   cancelButtonText: {
     color: "#666",
     fontWeight: "500",
   },
   saveButton: {
     backgroundColor: "#0073f0",
     paddingVertical: 10,
     paddingHorizontal: 16,
     borderRadius: 4,
   },
   saveButtonText: {
     color: "#fff",
     fontWeight: "500",
   }
 });
 
 export default All_Eelectronic_Product;