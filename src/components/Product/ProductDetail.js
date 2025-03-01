import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Share,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProductDetail = ({ route, navigation }) => {
  // Extract the product data from navigation parameters
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [cartElectronics, setCartItems] = useState([]);

  // Load cart items from storage on component mount
  useEffect(() => {
    loadCartItems();
  }, []);

  // Load cart items from AsyncStorage
  const loadCartItems = async () => {
    try {
      const storedItems = await AsyncStorage.getItem("cartElectronics");
     
      if (storedItems) {
        setCartItems(JSON.parse(storedItems));
      }
    } catch (error) {
      console.error("Error loading cart items:", error);
    }
  };

  // Save cart items to AsyncStorage
  const saveCartItems = async (items) => {
    const jsonData = JSON.stringify(items);

    console.log(jsonData);

    // Parse back into an array
    const parsedData = JSON.parse(jsonData);
    
    const itemsData=parsedData.map((item) => {
         return {id:item.id,category:item.category,description:item.description,image:item.image,quantity:item.quantity,title:item.title,totalPrice:item.totalPrice,unitPrice:item?.unitPrice}
    });

    try {
      await AsyncStorage.setItem("cartElectronics", JSON.stringify(itemsData));
      setCartItems(items);
    } catch (error) {
      console.error("Error saving cart items:", error);
    }
  };

  // Calculate discounted price
  const getDiscountedPrice = (price, discount) => {
    if (!discount) return price;
    return price - (price * discount) / 100;
  };

  // Calculate total price based on quantity
  const getTotalPrice = () => {
    const unitPrice = getDiscountedPrice(product.price, product.discount);
    return unitPrice * quantity;
  };

  // Increase quantity
  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  // Decrease quantity
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Share product
  const shareProduct = async () => {
    try {
      await Share.share({
        message: `Check out this ${product.title} for $${getDiscountedPrice(
          product.price,
          product.discount
        ).toFixed(2)}!`,
        url: product.image,
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Add product to cart
  const addToCart = async () => {
    // Create the cart item object
    const cartItem = {
      id: product.id,
      brand: product.brand,
      title: product.title,
      category:product.category,
      description: product.description,
      price: getDiscountedPrice(product.price, product.discount),
      quantity: quantity,
      totalPrice: getTotalPrice(),
      image: product.image,
      unitPrice:getDiscountedPrice(product.price, product.discount)
    };

    // Check if product already exists in cart
    const existingItemIndex = cartElectronics.findIndex(
      (item) => item.id === product.id
    );
    let updatedCartItems = [];

    if (existingItemIndex !== -1) {
      // Update existing item
      updatedCartItems = [...cartElectronics];
      updatedCartItems[existingItemIndex] = {
        ...updatedCartItems[existingItemIndex],
        quantity: updatedCartItems[existingItemIndex].quantity + quantity,
        totalPrice:
          updatedCartItems[existingItemIndex].totalPrice + getTotalPrice(),
      };
    } else {
      // Add new item
      updatedCartItems = [...cartElectronics, cartItem];
    }

    // Save to AsyncStorage
    await saveCartItems(updatedCartItems);

    // Show confirmation
    Alert.alert(
      "Added to Cart",
      `${quantity} ${product.title} added to your cart.`,
      [{ text: "OK" }]
    );
  };

  // Buy now
  const buyNow = () => {
    // Add to cart first
    addToCart();
    // Then navigate to checkout
    navigation.navigate("Checkout");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <TouchableOpacity onPress={shareProduct} style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image || "https://via.placeholder.com/400" }}
            style={styles.productImage}
            resizeMode="contain"
          />
          {product.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{product.discount}% OFF</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.brandText}>{product.brand}</Text>
          <Text style={styles.titleText}>{product.title}</Text>

          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={18} color="#FFD700" />
            <Text style={styles.ratingText}>
              {(product.rating?.rate || 4.5).toFixed(1)}
            </Text>
            <Text style={styles.reviewsText}>
              ({product.rating?.count || 120} reviews)
            </Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>${getTotalPrice().toFixed(2)}</Text>
            {product.discount > 0 && (
              <Text style={styles.originalPriceText}>
                ${(product.price * quantity).toFixed(2)}
              </Text>
            )}
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Quantity:</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                onPress={decreaseQuantity}
                style={styles.quantityButton}
              >
                <Ionicons name="remove" size={20} color="#333" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                onPress={increaseQuantity}
                style={styles.quantityButton}
              >
                <Ionicons name="add" size={20} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {product.description ||
                "This premium electronic device combines cutting-edge technology with sleek design. " +
                  "Engineered for performance and reliability, it's perfect for both everyday use and professional applications."}
            </Text>
          </View>

          {/* Specifications */}
          <View style={styles.specificationsContainer}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            <View style={styles.specificationItem}>
              <Text style={styles.specLabel}>Category:</Text>
              <Text style={styles.specValue}>{product.category}</Text>
            </View>
            <View style={styles.specificationItem}>
              <Text style={styles.specLabel}>Brand:</Text>
              <Text style={styles.specValue}>{product.brand}</Text>
            </View>
            <View style={styles.specificationItem}>
              <Text style={styles.specLabel}>Warranty:</Text>
              <Text style={styles.specValue}>1 Year Manufacturer Warranty</Text>
            </View>
            <View style={styles.specificationItem}>
              <Text style={styles.specLabel}>In Stock:</Text>
              <Text style={styles.specValue}>Yes</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.wishlistButton}>
          <Ionicons name="heart-outline" size={24} color="#0073f0" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addToCartButton} onPress={addToCart}>
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyNowButton} onPress={buyNow}>
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  shareButton: {
    padding: 8,
  },
  imageContainer: {
    height: 300,
    backgroundColor: "#fff",
    position: "relative",
  },
  productImage: {
    height: "100%",
    width: "100%",
  },
  discountBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#ff3b30",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  discountText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  infoContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    padding: 20,
  },
  brandText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  titleText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  ratingText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 4,
    fontWeight: "500",
  },
  reviewsText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  priceText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0073f0",
  },
  originalPriceText: {
    fontSize: 18,
    color: "#999",
    textDecorationLine: "line-through",
    marginLeft: 12,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 16,
    color: "#333",
    marginRight: 12,
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  quantityButton: {
    padding: 8,
    width: 36,
    alignItems: "center",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "500",
    paddingHorizontal: 12,
    minWidth: 40,
    textAlign: "center",
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
  },
  specificationsContainer: {
    marginBottom: 24,
  },
  specificationItem: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  specLabel: {
    fontSize: 15,
    color: "#666",
    width: 100,
  },
  specValue: {
    fontSize: 15,
    color: "#333",
    flex: 1,
  },
  actionBar: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  wishlistButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0073f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  addToCartButton: {
    flex: 1,
    height: 48,
    backgroundColor: "#e6f0ff",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0073f0",
  },
  buyNowButton: {
    flex: 1,
    height: 48,
    backgroundColor: "#0073f0",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buyNowText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

export default ProductDetail;
