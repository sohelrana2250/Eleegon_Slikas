import React, {  useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  Platform,
  StatusBar,
  ActivityIndicator,
  ImageBackground,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";

import {
  useFonts,
  Inter_400Regular,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

const { width } = Dimensions.get("window");

// Helper function to determine greeting based on time
function getGreeting(hour) {
  if (hour < 12) return "GOOD MORNING";
  if (hour < 18) return "GOOD AFTERNOON";
  return "GOOD EVENING";
}

export default function Home() {
 
  const [showMore, setShowMore] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });



  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  const now = new Date();
  const currentHour = now.getHours();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.ceil((now - startOfYear) / (1000 * 60 * 60 * 24));
  const dayOfWeek = now.getDay();
  const weekNumber = Math.ceil((dayOfYear + startOfYear.getDay()) / 7);

  const RowView = ({ label, value }) => {
    return (
      <View style={styles.rowContainer}>
        <View>
          <Text style={styles.label}>{label}</Text>
        </View>
        <View>
          <Text style={styles.value}>{value}</Text>
        </View>
      </View>
    );
  };

  return (
    <>
      <View style={styles.container}>
        <ImageBackground
          source={require("../../assets/light-bg.png")}
          style={styles.backgroundImage}>
          <View style={styles.mainContent}>
            {!showMore && (
              <View style={styles.quoteContainer}>
                <View style={styles.quoteTextContainer}>
                  <Text style={styles.quoteText}>
                    "The science of operations, as derived from mathematics more
                    especially, is a science of itself, and has its own abstract
                    truth and value."
                  </Text>
                  <Text style={styles.quoteAuthor}>- A M SOHEL RANA</Text>
                </View>
                <Image source={require("../../assets/refresh.png")} />
              </View>
            )}

            <View style={styles.bottomContent}>
              <View style={styles.greetingContainer}>
                <Image source={require("../../assets/sun.png")} />
                <Text style={styles.greetingText}>{getGreeting(currentHour)}</Text>
              </View>

              <View>
                <Text>
                  <Text style={styles.timeText}>
                    {new Date().toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </Text>
                  <Text style={styles.timezoneText}>BST</Text>
                </Text>
              </View>

              <View style={styles.locationContainer}>
                <Text style={styles.locationText}>IN BANGLADESH</Text>
              </View>

              <TouchableOpacity
                onPress={() => setShowMore(!showMore)}
                style={styles.toggleButton}>
                <Text style={styles.toggleButtonText}>
                  {showMore ? "Less" : "More"}
                </Text>
                <Image
                  source={
                    showMore
                      ? require("../../assets/arrow-down.png")
                      : require("../../assets/arrow-up.png")
                  }
                />
              </TouchableOpacity>
            </View>
          </View>

          {showMore && (
            <View style={styles.expandedView}>
              <RowView label={"Current Timezone"} value={timezone} />
              <RowView label={"Day of the year"} value={dayOfYear.toString()} />
              <RowView label={"Day of the week"} value={dayOfWeek.toString()} />
              <RowView label={"Week number"} value={weekNumber.toString()} />
            </View>
          )}
        </ImageBackground>
        {/* <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.productsGrid}>
            {productCategorie?.map(
              ({ id, title, price, description, category, image }) => (
                <View key={id} style={styles.productCard}>
                  <Image source={{ uri: image }} style={styles.productImage} />
                  <View style={styles.productInfo}>
                    <Text style={styles.productCategory}>
                      {category.toUpperCase()}
                    </Text>
                    <Text numberOfLines={2} style={styles.productTitle}>
                      {title}
                    </Text>
                    <Text style={styles.productPrice}>${price}</Text>
                    <Text numberOfLines={3} style={styles.productDescription}>
                      {description}
                    </Text>
                  </View>
                </View>
              )
            )}
          </View>
        </ScrollView>
      </SafeAreaView> */}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    justifyContent: "space-between",
    marginTop: 32,
    paddingHorizontal: 26,
  },
  quoteContainer: {
    flexDirection: "row",
    marginTop: 16,
  },
  quoteTextContainer: {
    flex: 1,
  },
  quoteText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "#fff",
  },
  quoteAuthor: {
    fontFamily: "Inter_700Bold",
    color: "#fff",
    fontSize: 12,
    marginTop: 8,
  },
  bottomContent: {
    marginBottom: 16,
  },
  greetingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  greetingText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "white",
    marginLeft: 8,
    letterSpacing: 3,
  },
  timeText: {
    fontSize: 50,
    color: "white",
    fontFamily: "Inter_700Bold",
  },
  timezoneText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "white",
  },
  locationContainer: {
    marginTop: 16,
  },
  locationText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "white",
    letterSpacing: 3,
  },
  toggleButton: {
    flexDirection: "row",
    height: 40,
    width: 115,
    backgroundColor: "#fff",
    borderRadius: 30,
    marginTop: 50,
    justifyContent: "space-between",
    paddingLeft: 16,
    paddingRight: 4,
    alignItems: "center",
  },
  toggleButtonText: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    color: "#000",
    letterSpacing: 3,
  },
  expandedView: {
    backgroundColor: "#fff",
    opacity: 0.8,
    paddingVertical: 48,
    paddingHorizontal: 26,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  label: {
    fontFamily: "Inter_400Regular",
    color: "#303030",
    fontSize: 10,
    letterSpacing: 2,
  },
  value: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: "#303030",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});