
import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
// import Home from "./src/components/Home/Home";
import DrawerNavigation from "./src/components/Navigation/DrawerNavigation";

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
      <DrawerNavigation/>
    </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  
   
  }
});
