import React, { useEffect, useState } from "react";
import { 
  Text, 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  Alert,
  TextInput,
  SafeAreaView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const AllUsers = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, allUsers]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("https://fakestoreapi.in/api/users", { method: "GET" });
      
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      
      const data = await response.json();
      
      if (data?.status) {
        setAllUsers(data?.users);
        setFilteredUsers(data?.users);
      } else {
        // Fallback to mock data if API fails
        const mockData = [
          {
            "id": 1,
            "email": "michael@simpson.com",
            "username": "michaelsimpson",
            "password": "@K(5UejhL&",
            "name": {
              "firstname": "Michael",
              "lastname": "Simpson"
            },
            "address": {
              "city": "Joelton",
              "street": "Angela Spring",
              "number": "868",
              "zipcode": "75070",
              "geolocation": {
                "lat": 19.7091875,
                "long": -14.782061
              }
            },
            "phone": "562.548.9768x73853"
          }
        ];
        setAllUsers(mockData);
        setFilteredUsers(mockData);
      }
    } catch (error) {
      console.error(error);
      setError("Unable to load users. Please try again later.");
      
      // Fallback to mock data
      const mockData = [
        {
          "id": 1,
          "email": "michael@simpson.com",
          "username": "michaelsimpson",
          "password": "@K(5UejhL&",
          "name": {
            "firstname": "Michael",
            "lastname": "Simpson"
          },
          "address": {
            "city": "Joelton",
            "street": "Angela Spring",
            "number": "868",
            "zipcode": "75070",
            "geolocation": {
              "lat": 19.7091875,
              "long": -14.782061
            }
          },
          "phone": "562.548.9768x73853"
        }
      ];
      setAllUsers(mockData);
      setFilteredUsers(mockData);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    const lowercaseQuery = query.toLowerCase();
    
    if (lowercaseQuery) {
      const filtered = allUsers.filter(user => 
        user.name.firstname.toLowerCase().includes(lowercaseQuery) ||
        user.name.lastname.toLowerCase().includes(lowercaseQuery) ||
        user.email.toLowerCase().includes(lowercaseQuery)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(allUsers);
    }
  };

  const handleEdit = (user) => {
    Alert.alert(
      "Edit User",
      `Editing ${user.name.firstname} ${user.name.lastname}`,
      [{ text: "OK" }]
    );
  };

  const handleDelete = (userId) => {
    Alert.alert(
      "Delete User",
      "Are you sure you want to delete this user?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Remove user from both arrays
            const updatedUsers = allUsers.filter(user => user.id !== userId);
            setAllUsers(updatedUsers);
            setFilteredUsers(updatedUsers.filter(user => 
              user.name.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
              user.name.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
              user.email.toLowerCase().includes(searchQuery.toLowerCase())
            ));
          }
        }
      ]
    );
  };

  const renderUserCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {item.name.firstname[0]}{item.name.lastname[0]}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.userName}>{item.name.firstname} {item.name.lastname}</Text>
          <Text style={styles.userUsername}>@{item.username}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={() => handleEdit(item)}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={() => handleDelete(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="mail-outline" size={18} color="#555" />
          </View>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{item.email}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="call-outline" size={18} color="#555" />
          </View>
          <Text style={styles.infoLabel}>Phone:</Text>
          <Text style={styles.infoValue}>{item.phone}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="home-outline" size={18} color="#555" />
          </View>
          <Text style={styles.infoLabel}>Address:</Text>
          <Text style={styles.infoValue}>
            {item.address.number} {item.address.street}, {item.address.city}, {item.address.zipcode}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="location-outline" size={18} color="#555" />
          </View>
          <Text style={styles.infoLabel}>Coordinates:</Text>
          <Text style={styles.infoValue}>
            Lat: {item.address.geolocation.lat}, Long: {item.address.geolocation.long}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle" size={50} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUsers}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>All Users</Text>
        <Text style={styles.headerSubtitle}>
          {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or email..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setSearchQuery("")}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUserCard}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={50} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery 
                ? "No users match your search criteria" 
                : "No users found"}
            </Text>
          </View>
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
  headerContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
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
    borderColor: "#ddd",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 46,
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    padding: 4,
  },
  listContainer: {
    padding: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f0f8ff",
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#0066CC",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  userUsername: {
    fontSize: 14,
    color: "#666",
  },
  actionButtons: {
    flexDirection: "row",
  },
  editButton: {
    backgroundColor: "#4CAF50",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: "#F44336",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  infoIcon: {
    width: 24,
    alignItems: "center",
    marginRight: 8,
  },
  infoLabel: {
    width: 100,
    fontSize: 15,
    fontWeight: "600",
    color: "#555",
  },
  infoValue: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: "#0066CC",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

export default AllUsers;