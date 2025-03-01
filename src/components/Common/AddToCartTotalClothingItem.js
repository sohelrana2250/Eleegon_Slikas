import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const AddToCartTotalClothingItem = () => {
  const [cartTotals, setCartTotals] = useState({ clothing: 0, electronics: 0 });

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const [clothingData, electronicsData] = await Promise.all([
          AsyncStorage.getItem("cartItems"),
          AsyncStorage.getItem("cartElectronics"),
        ]);

        setCartTotals({
          clothing: clothingData ? JSON.parse(clothingData).length : 0,
          electronics: electronicsData ? JSON.parse(electronicsData).length : 0,
        });
      } catch (error) {
        console.error("Error fetching cart data:", error);
      }
    };

    fetchCartItems();
  }, []);

  return {
    totalProducts: cartTotals.clothing + cartTotals.electronics,
  };
};

export default AddToCartTotalClothingItem;


