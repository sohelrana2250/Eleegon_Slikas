import React from "react";
import { Text, View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import Home from "../Home/Home";
import AllProduct from "../Product/AllProduct";
import AllElectronic from "../Product/AllElectronic";
import ProductDetail from "../Product/ProductDetail";
import ClothingDetail from "../Product/ClothingDetail";
import AddToCart from "../AddToCart/AddToCart";
import AddToCartTotalClothingItem from "../Common/AddToCartTotalClothingItem";
import AddToProduct from "../AddToProduct/AddToProduct";
import UserProfile from "../Users/UserProfile";
import AllUsers from "../Users/AllUsers";
import Login from "../Login/Login";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PrivateRoutes from "../Routes/PrivateRoutes";
import AllClothing from "../Admin/AllClothing";
import All_Eelectronic_Product from "../Admin/All_Eelectronic_Product";
import Register from "../Register/Register";

const Drawer = createDrawerNavigator();

// Fixed handelLogout function
const handelLogout = async (navigation) => {
  try {
    await AsyncStorage.removeItem("eleegon_user_data");
    navigation.navigate("Login");
  } catch (error) {
    console.error("Error logging out:", error);
  }
};

const CustomDrawerContent = (props) => {
  return (
    <View style={styles.drawerContainer}>
      {/* Logo and Brand Header */}
      <View style={styles.drawerHeader}>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.storeName}>Your Store Eleegon</Text>
        <Text style={styles.tagline}>Shop the best deals</Text>
      </View>

      {/* Drawer Items */}
      <View style={styles.drawerItemsContainer}>
        {props.state.routes.map((route, index) => {
          if (
            route.name === "ProductDetail" ||
            route.name === "ClothingDetail" ||
            route.name === "AddToCart" ||
            route.name === "Login" ||
            route.name === "Register"
          ) {
            return null;
          }

          const { options } = props.descriptors[route.key];
          const label = options.drawerLabel || options.title || route.name;
          const isFocused = props.state.index === index;

          let iconName;
          switch (route.name) {
            case "Home":
              iconName = "home-outline";
              break;
            case "Products":
              iconName = "grid-outline";
              break;
            case "Products jhfja":
              iconName = "hardware-chip-outline";
              break;
            case "Profile":
              iconName = "person-outline";
              break;
            case "Cart":
              iconName = "cart-outline";
              break;
            case "AddProduct":
              iconName = "list-outline";
              break;
            case "ALL_USER":
              iconName = "information-circle";
              break;
            case "My_Clothing":
              iconName = "bag-outline";
              break;
            case "My_Eelectronic":
              iconName = "hardware-chip-outline";
              break;
            default:
              console.log("");
              break;
          }

          return (
            <TouchableOpacity
              key={route.key}
              style={[styles.drawerItem, isFocused && styles.drawerItemFocused]}
              onPress={() => props.navigation.navigate(route.name)}
            >
              <Ionicons
                name={iconName}
                size={24}
                color={isFocused ? "#FF4500" : "#555"}
              />
              <Text
                style={[
                  styles.drawerItemLabel,
                  isFocused && styles.drawerItemLabelFocused,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.drawerFooter}>
        <TouchableOpacity style={styles.footerButton}>
          <Ionicons name="settings-outline" size={20} color="#555" />
          <Text style={styles.footerButtonText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => handelLogout(props.navigation)}
        >
          <Ionicons name="log-out-outline" size={20} color="#555" />
          <Text style={styles.footerButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const DrawerNavigation = () => {
  const totoalproduct = AddToCartTotalClothingItem().totalProducts || 0;

  const ProtectedAllProduct = (props) => (
    <PrivateRoutes component={AllProduct} {...props} />
  );

  const ProtectedAllElectronic = (props) => (
    <PrivateRoutes component={AllElectronic} {...props} />
  );

  const ProtectedAllClothing = (props) => (
    <PrivateRoutes component={AllClothing} {...props} />
  );

  const ProtectedProductDetail = (props) => (
    <PrivateRoutes component={ProductDetail} {...props} />
  );

  const ProtectedClothingDetail = (props) => (
    <PrivateRoutes component={ClothingDetail} {...props} />
  );

  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Home"
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={({ navigation }) => ({
          headerStyle: {
            backgroundColor: "#FF4500",
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 18,
          },
          headerRight: () => (
            <View style={styles.headerIconsContainer}>
              <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="search-outline" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="heart-outline" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => navigation.navigate("Login")}
              >
                <Ionicons name="key-outline" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => navigation.navigate("AddToCart")}
              >
                <View style={styles.cartIconContainer}>
                  <Ionicons name="cart-outline" size={24} color="#fff" />
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{totoalproduct}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ),
          drawerStyle: {
            backgroundColor: "#fff",
            width: 280,
            borderTopRightRadius: 20,
            borderBottomRightRadius: 20,
          },
        })}
      >
        <Drawer.Screen
          name="Home"
          component={Home}
          options={{
            title: "Home",
            drawerLabel: "Home",
          }}
        />
        <Drawer.Screen
          name="Products"
          component={ProtectedAllProduct}
          options={{
            title: "Products",
            drawerLabel: "All Clothing ",
          }}
        />
        <Drawer.Screen
          name="ProductDetail"
          component={ProtectedProductDetail}
          options={{
            drawerItemStyle: { display: "none" },
          }}
        />
        <Drawer.Screen
          name="ClothingDetail"
          component={ProtectedClothingDetail}
          options={{
            drawerItemStyle: { display: "none" },
          }}
        />
        <Drawer.Screen
          name="AddToCart"
          component={AddToCart}
          options={{
            drawerItemStyle: { display: "none" },
          }}
        />
        <Drawer.Screen
          name="Products jhfja"
          component={ProtectedAllElectronic}
          options={{
            title: "Electronic",
            drawerLabel: "Electronics Product  ",
          }}
        />
        <Drawer.Screen
          name="Cart"
          component={AddToCart}
          options={{
            drawerLabel: "Shopping Cart",
          }}
        />
        <Drawer.Screen
          name="AddProduct"
          component={AddToProduct}
          options={{
            drawerLabel: "Add Product",
          }}
        />
        <Drawer.Screen
          name="Profile"
          component={UserProfile}
          options={{
            drawerLabel: "My Profile",
          }}
        />
        <Drawer.Screen
          name="ALL_USER"
          component={AllUsers}
          options={{
            drawerLabel: "All User",
          }}
        />
        <Drawer.Screen
          name="Login"
          component={Login}
          options={{
            drawerLabel: "Login",
          }}
        />
        <Drawer.Screen
          name="Register"
          component={Register}
          options={{
            drawerLabel: "Register",
          }}
        />
        <Drawer.Screen
          name="My_Clothing"
          component={ProtectedAllClothing}
          options={{
            title: "My_Clothing",
            drawerLabel: "My_Clothing",
          }}
        />
        <Drawer.Screen
          name="My_Eelectronic"
          component={All_Eelectronic_Product}
          options={{
            title: "My_Eelectronic",
            drawerLabel: "My_Eelectronic",
          }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  screenText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerIconsContainer: {
    flexDirection: "row",
    marginRight: 10,
  },
  headerButton: {
    marginHorizontal: 8,
  },
  cartIconContainer: {
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    right: -6,
    top: -6,
    backgroundColor: "#FFC107",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  drawerContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  drawerHeader: {
    padding: 20,
    backgroundColor: "#FF4500",
    alignItems: "center",
    justifyContent: "center",
    borderBottomRightRadius: 30,
    paddingBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  storeName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  tagline: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.8,
  },
  drawerItemsContainer: {
    flex: 1,
    paddingTop: 20,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 4,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  drawerItemFocused: {
    backgroundColor: "rgba(255, 69, 0, 0.1)",
  },
  drawerItemLabel: {
    marginLeft: 15,
    fontSize: 16,
    color: "#555",
  },
  drawerItemLabelFocused: {
    color: "#FF4500",
    fontWeight: "600",
  },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  footerButtonText: {
    marginLeft: 15,
    fontSize: 16,
    color: "#555",
  },
});

export default DrawerNavigation;
