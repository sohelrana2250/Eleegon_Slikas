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
  RefreshControl
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AllElectronic = ({ navigation }) => {
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
  const [electronicItems,setElectronicItem]=useState(0);


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
  const fetchProducts = async (pageNum = 1, refresh = false,limit=150) => {
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

  // Initial data loading
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  AsyncStorage.getItem("cartElectronics").then((data)=>{
     if(data){
  setElectronicItem(JSON.parse(data).length);
     }
  }).catch((error)=>{
     console.error(error?.message);
  });

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
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          (selectedCategory ? item.category === selectedCategory : true)
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, allElectronic, selectedCategory]);

  // Pull to refresh handler
  const onRefresh = () => {
    setPage(1);
    fetchProducts(1, true,150);
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

  // Render product item
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Eleegon</Text>
          <Text style={styles.subTitleText}>Electronics</Text>
        </View>
        <TouchableOpacity style={styles.cartButton}>
        <Ionicons name="cart-outline" size={20} color="#333" >


        <Text style={{fontSize: 22}}> {electronicItems}</Text>
          </Ionicons>
        
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search electronics..."
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

      {/* Product Grid */}
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
  cartButton: {
    padding: 8,
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
  },
  ratingText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  footerLoader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    height: 300,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#0073f0",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default AllElectronic;