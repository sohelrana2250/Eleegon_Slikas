import React, { useEffect, useState } from "react";
import { Text, View, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";

const API_BASE_URL = "https://fakestoreapi.in/api";

const AddToProduct = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [product, setProduct] = useState({
    title: "",
    brand: "",
    model: "",
    color: "",
    category: "",
    discount: 1
  });
  const [error, setError] = useState(null);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/products/category`, {
        method: "GET"
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data?.status) {
        setCategories(data.categories || []);
      } else {
        setError("Invalid data format received");
      }
    } catch (error) {
      setError(`Failed to fetch categories: ${error.message}`);
      console.error("Category fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name, value) => {
    setProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const selectCategory = (category) => {
    setSelectedCategory(category);
    handleInputChange("category", category);
  };

  const submitProduct = async () => {
    // Validate form
    if (!product.title || !product.brand || !product.category) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);
    
    // Convert discount to number to ensure correct format
    const productToSubmit = {
      ...product,
      discount: Number(product.discount)
    };
    
    try {
      // Log the payload for debugging
      console.log("Submitting product data:", JSON.stringify(productToSubmit));
      
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
     
        },
        body: JSON.stringify({
          title: "Apple Vision Pro",
          brand: "Apple",
          model: "Apple vision pro First Gen",
           color: "Black",
          category: "appliances",
          discount: 1
        })
      });
      
      // Log full response for debugging
      console.log("Response status:", response.status);
      const responseText = await response.text();
      console.log("Response body:", responseText);
      
      // Try to parse as JSON if possible
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.log("Response is not valid JSON");
      }
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${data?.message || responseText || 'Unknown error'}`);
      }
      
      if (data?.status) {
        Alert.alert("Success", "Product added successfully");
        // Reset form
        setProduct({
          title: "",
          brand: "",
          model: "",
          color: "",
          category: "",
          discount: 1
        });
        setSelectedCategory("");
      } else {
        setError("Failed to add product: " + (data?.message || "Unknown error"));
      }
    } catch (error) {
      setError(`Failed to add product: ${error.message}`);
      console.error("Product submit error:", error);
      Alert.alert("Error", `Failed to add product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Add New Product</Text>
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.formContainer}>
        <Text style={styles.label}>Title*</Text>
        <TextInput
          style={styles.input}
          value={product.title}
          onChangeText={(text) => handleInputChange("title", text)}
          placeholder="Product title"
        />

        <Text style={styles.label}>Brand*</Text>
        <TextInput
          style={styles.input}
          value={product.brand}
          onChangeText={(text) => handleInputChange("brand", text)}
          placeholder="Brand name"
        />

        <Text style={styles.label}>Model</Text>
        <TextInput
          style={styles.input}
          value={product.model}
          onChangeText={(text) => handleInputChange("model", text)}
          placeholder="Model number/name"
        />
        
        <Text style={styles.label}>Color</Text>
        <TextInput
          style={styles.input}
          value={product.color}
          onChangeText={(text) => handleInputChange("color", text)}
          placeholder="Product color"
        />
        
        <Text style={styles.label}>Discount</Text>
        <TextInput
          style={styles.input}
          value={product.discount.toString()}
          onChangeText={(text) => handleInputChange("discount", text === "" ? "" : Number(text) || 1)}
          placeholder="Discount percentage"
          keyboardType="numeric"
        />
        
        <Text style={styles.label}>Category*</Text>
        {loading ? (
          <Text style={styles.loadingText}>Loading categories...</Text>
        ) : (
          <View style={styles.categoryContainer}>
            {categories.length > 0 ? (
              categories.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.categoryItem,
                    selectedCategory === category && styles.selectedCategory
                  ]}
                  onPress={() => selectCategory(category)}
                >
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category && styles.selectedCategoryText
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <TouchableOpacity style={styles.retryButton} onPress={fetchCategories}>
                <Text style={styles.retryText}>No categories found. Tap to retry</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.debugSection}>
          <Text style={styles.debugTitle}>Debug Information (Data to be sent):</Text>
          <Text style={styles.debugText}>{JSON.stringify(product, null, 2)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={submitProduct}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "Submitting..." : "Add Product"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 16,
    backgroundColor: "#581845",
    marginBottom: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  categoryItem: {
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 4,
  },
  categoryText: {
    fontSize: 14,
  },
  selectedCategory: {
    backgroundColor: "#3498db",
  },
  selectedCategoryText: {
    color: "#fff",
  },
  submitButton: {
    backgroundColor: "#2ecc71",
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.7,
  },
  errorContainer: {
    backgroundColor: "#ffecec",
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#ff5252",
  },
  errorText: {
    color: "#ff5252",
  },
  loadingText: {
    fontStyle: "italic",
    color: "#777",
    marginTop: 8,
  },
  retryButton: {
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  retryText: {
    color: "#3498db",
  },
  debugSection: {
    marginTop: 24,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  debugTitle: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  debugText: {
    fontFamily: "monospace",
    fontSize: 12,
  }
});

export default AddToProduct;