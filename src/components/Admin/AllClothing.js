import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  TextInput,
  Alert
} from "react-native";

import {
  useFonts,
  Inter_400Regular,
  Inter_700Bold,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const AllClothing = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [totalClothingItems, setTotalClothingItems] = useState(0);
  const [tableView, setTableView] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Load cart items
  useEffect(() => {
    const loadCartItems = async () => {
      try {
        const data = await AsyncStorage.getItem("cartItems");
        if (data) {
          setTotalClothingItems(JSON.parse(data).length);
        }
      } catch (error) {
        console.error("Error loading cart items:", error);
      }
    };
    
    loadCartItems();
  }, []);

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products whenever search query or category changes
  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory, searchActive]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("https://fakestoreapi.com/products");
      const data = await response.json();
      
      setProducts(data);
      
      // Extract unique categories
      const uniqueCategories = [
        "all",
        ...new Set(data.map((item) => item.category)),
      ];
      setCategories(uniqueCategories);
      
      setLoading(false);
    } catch (error) {
      console.log("Error fetching products:", error?.message);
      setLoading(false);
      Alert.alert("Error", "Failed to load products. Please try again.");
    }
  };

  const filterProducts = () => {
    const filtered = products
      .filter(
        (product) =>
          // Category filter
          selectedCategory === "all" || product.category === selectedCategory
      )
      .filter(
        (product) =>
          // Search filter (if search is active)
          !searchActive ||
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    setFilteredProducts(filtered);
  };

  const handleSearch = () => {
    setSearchActive(true);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchActive(false);
  };

  const handleDeleteProduct = (productId) => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            // In a real app, you would call an API to delete the product
            // For this example, we'll just remove it from the local state
            setProducts(products.filter(item => item.id !== productId));
            Alert.alert("Success", "Product deleted successfully");
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleUpdateProduct = (product) => {
    // In a real app, you would navigate to an edit form
    // For this example, we'll just show an alert
    Alert.alert(
      "Update Product",
      "This would navigate to an edit form for product: " + product.title,
      [{ text: "OK" }]
    );
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5D3FD3" />
        <Text style={styles.loadingText}>Loading Products...</Text>
      </View>
    );
  }

  const now = new Date();
  const greeting = getGreeting(now.getHours());

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item && styles.categoryButtonActive,
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text
        style={[
          styles.categoryButtonText,
          selectedCategory === item && styles.categoryButtonTextActive,
        ]}
      >
        {item === "all"
          ? "All Products"
          : item.charAt(0).toUpperCase() + item.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.tableHeaderCell, { flex: 3 }]}>Product</Text>
      <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Price</Text>
      <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Category</Text>
      <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Actions</Text>
    </View>
  );

  const renderTableRow = ({ item }) => (
    <View style={styles.tableRow}>
      <View style={[styles.tableCell, { flex: 3 }]}>
        <Image source={{ uri: item.image }} style={styles.tableImage} />
        <Text numberOfLines={2} style={styles.tableCellText}>
          {item.title}
        </Text>
      </View>
      <Text style={[styles.tableCell, { flex: 1 }]}>
        ${parseFloat(item.price).toFixed(2)}
      </Text>
      <Text style={[styles.tableCell, { flex: 1.5 }]}>
        {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
      </Text>
      <View style={[styles.tableCell, { flex: 2, flexDirection: 'row' }]}>
        <TouchableOpacity
          style={[styles.actionButton, styles.updateButton]}
          onPress={() => handleUpdateProduct(item)}
        >
          <Ionicons name="create-outline" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteProduct(item.id)}
        >
          <Ionicons name="trash-outline" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate("ClothingDetail", { product: item })}
    >
      <View style={styles.productImageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        {item.rating && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating.rate}</Text>
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productCategory}>
          {item.category.toUpperCase()}
        </Text>
        <Text numberOfLines={1} style={styles.productTitle}>
          {item.title}
        </Text>
        <Text style={styles.productPrice}>
          ${parseFloat(item.price).toFixed(2)}
        </Text>
      </View>
      <View style={styles.productActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.updateButton]}
          onPress={() => handleUpdateProduct(item)}
        >
          <Ionicons name="create-outline" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteProduct(item.id)}
        >
          <Ionicons name="trash-outline" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyResult = () => (
    <View style={styles.emptyResultContainer}>
      <Ionicons name="search-outline" size={48} color="#CCCCCC" />
      <Text style={styles.emptyResultText}>No products found</Text>
      <Text style={styles.emptyResultSubText}>
        Try a different search term or category
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoContainer}>
            <Ionicons name="shirt-outline" size={24} color="#fff" />
            <Text style={styles.appName}>ELEEGON</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.viewToggleButton}
              onPress={() => setTableView(!tableView)}
            >
              <Ionicons 
                name={tableView ? "grid-outline" : "list-outline"} 
                size={24} 
                color="#fff" 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={fetchProducts}
            >
              <Ionicons name="refresh-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cartButton}>
              <Ionicons name="cart-outline" size={24} color="#fff" />
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalClothingItems}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.greetingContainer}>
          <Text style={styles.greetingSubText}>{greeting}</Text>
          <Text style={styles.greetingMainText}>
            Find your perfect products
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#fff" />
          {searchActive ? (
            <TextInput
              style={styles.searchInput}
              placeholder="Search Products..."
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          ) : (
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => setSearchActive(true)}
            >
              <Text style={styles.searchText}>Search Products...</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.filterIcon}
            onPress={searchActive ? clearSearch : handleSearch}
          >
            <Ionicons
              name={searchActive ? "close-outline" : "filter-outline"}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <View style={styles.productsHeader}>
        <Text style={styles.productsHeaderText}>
          {searchActive
            ? `Search results: "${searchQuery}"`
            : selectedCategory === "all"
            ? "All Products"
            : selectedCategory.charAt(0).toUpperCase() +
              selectedCategory.slice(1)}
        </Text>
        <Text style={styles.productsCountText}>
          {filteredProducts.length} items
        </Text>
      </View>

      {tableView ? (
        <View style={styles.tableContainer}>
          {renderTableHeader()}
          <FlatList
            data={filteredProducts}
            renderItem={renderTableRow}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyResult}
            ListFooterComponent={<View style={styles.productListFooter} />}
          />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.productsGrid}
          columnWrapperStyle={styles.productRow}
          ListEmptyComponent={renderEmptyResult}
          ListFooterComponent={<View style={styles.productListFooter} />}
        />
      )}
    </SafeAreaView>
  );
};

// Helper function to determine greeting based on time
function getGreeting(hour) {
  if (hour < 12) return "GOOD MORNING";
  if (hour < 18) return "GOOD AFTERNOON";
  return "GOOD EVENING";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    marginTop: 12,
    color: "#5D3FD3",
  },
  header: {
    backgroundColor: "#5D3FD3",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewToggleButton: {
    marginRight: 16,
  },
  refreshButton: {
    marginRight: 16,
  },
  appName: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#FFFFFF",
    letterSpacing: 2,
    marginLeft: 8,
  },
  cartButton: {
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#FF4757",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    color: "#FFFFFF",
  },
  greetingContainer: {
    marginBottom: 20,
  },
  greetingSubText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  greetingMainText: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: "#FFFFFF",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
  },
  searchButton: {
    flex: 1,
    marginLeft: 12,
  },
  searchText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#FFFFFF",
    padding: 0,
    marginLeft: 12,
  },
  filterIcon: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  categoriesContainer: {
    marginTop: 20,
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    marginRight: 12,
  },
  categoryButtonActive: {
    backgroundColor: "#5D3FD3",
  },
  categoryButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: "#303030",
  },
  categoryButtonTextActive: {
    color: "#FFFFFF",
  },
  productsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 24,
  },
  productsHeaderText: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#303030",
  },
  productsCountText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#808080",
  },
  productsGrid: {
    paddingHorizontal: 12,
  },
  productRow: {
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  productCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: (width - 64) / 2,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    overflow: "hidden",
  },
  productImageContainer: {
    height: 150,
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    backgroundColor: "#F8F9FA",
  },
  ratingContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    color: "#FFFFFF",
    marginLeft: 4,
  },
  productInfo: {
    padding: 12,
  },
  productCategory: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    color: "#5D3FD3",
    marginBottom: 4,
  },
  productTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#303030",
    marginBottom: 8,
  },
  productPrice: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#303030",
  },
  productActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    justifyContent: "center",
  },
  updateButton: {
    backgroundColor: "#5D3FD3",
    marginRight: 6,
  },
  deleteButton: {
    backgroundColor: "#FF4757",
  },
  actionButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    color: "#FFFFFF",
    marginLeft: 4,
  },
  productListFooter: {
    height: 40,
  },
  emptyResultContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyResultText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: "#303030",
    marginTop: 16,
  },
  emptyResultSubText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#808080",
    marginTop: 8,
  },
  
  // Table view styles
  tableContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#5D3FD3",
    padding: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginBottom: 1,
  },
  tableHeaderCell: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: "#FFFFFF",
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 12,
    marginBottom: 1,
    borderRadius: 4,
  },
  tableCell: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#303030",
    flexDirection: "row",
    alignItems: "center",
  },
  tableCellText: {
    flex: 1,
  },
  tableImage: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    marginRight: 8,
  },
});

export default AllClothing;