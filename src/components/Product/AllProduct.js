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

export default function AllProduct({ navigation }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [totalClothingItem, setTotalClothingItem] = useState(0);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  AsyncStorage.getItem("cartItems")
    .then((data) => {
      if (data) {
        setTotalClothingItem(JSON.parse(data).length);
      }
    })
    .catch((error) => {
      console.error(error);
    });

  useEffect(() => {
    // Fetch products
    fetch("https://fakestoreapi.com/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);

        // Extract unique categories
        const uniqueCategories = [
          "all",
          ...new Set(data.map((item) => item.category)),
        ];
        setCategories(uniqueCategories);

        setLoading(false);
      })
      .catch((error) => {
        console.log(error?.message);
        setLoading(false);
      });
  }, []);

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5D3FD3" />
        <Text style={styles.loadingText}>Loading Eleegon Store...</Text>
      </View>
    );
  }

  // Filter products based on both category and search query
  const filteredProducts = products
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
        product.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  const now = new Date();
  const greeting = getGreeting(now.getHours());

  const handleSearch = () => {
    setSearchActive(true);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchActive(false);
  };

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

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate("ClothingDetail", { product: item })}
    >
      <View style={styles.productImageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        {item.rating && (
          <View style={styles.ratingContainer}>
            <Image
              source={require("../../assets/rating.png")}
              style={styles.starIcon}
            />
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
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Image source={require("../../assets/sun.png")} style={styles.logo} />
          <Text style={styles.appName}>ELEEGON</Text>
          <TouchableOpacity style={styles.cartButton}>
            <Image
              source={require("../../assets/refresh.png")}
              style={styles.cartIcon}
            />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalClothingItem}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.greetingContainer}>
          <Text style={styles.greetingSubText}>{greeting}</Text>
          <Text style={styles.greetingMainText}>
            Find your perfect products
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <Image
            source={require("../../assets/refresh.png")}
            style={styles.searchIcon}
          />
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
              name={searchActive ? "close-outline" : "search-outline"}
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

      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productsGrid}
        columnWrapperStyle={styles.productRow}
        ListHeaderComponent={
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
        }
        ListEmptyComponent={
          <View style={styles.emptyResultContainer}>
            <Ionicons name="search-outline" size={48} color="#CCCCCC" />
            <Text style={styles.emptyResultText}>No products found</Text>
            <Text style={styles.emptyResultSubText}>
              Try a different search term
            </Text>
          </View>
        }
        ListFooterComponent={<View style={styles.productListFooter} />}
      />
    </SafeAreaView>
  );
}

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
  logo: {
    width: 32,
    height: 32,
  },
  appName: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#FFFFFF",
    letterSpacing: 2,
  },
  cartButton: {
    position: "relative",
  },
  cartIcon: {
    width: 24,
    height: 24,
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
  searchIcon: {
    width: 18,
    height: 18,
    marginRight: 12,
  },
  searchButton: {
    flex: 1,
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
  },
  filterButton: {
    width: 36,
    height: 36,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
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
  starIcon: {
    width: 12,
    height: 12,
    marginRight: 4,
  },
  ratingText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    color: "#FFFFFF",
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
});
