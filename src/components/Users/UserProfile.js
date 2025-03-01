import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const UserProfile = () => {
  const [myProfile, setMyProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('https://fakestoreapi.in/api/users/7', { method: 'GET' });
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }
      
      const data = await response.json();
      
      if (data.status) {
        setMyProfile(data?.user);
      } else {
        // Fallback to mock data if API fails
        setMyProfile({
          "address": {
            "city": "East Mary",
            "geolocation": {
              "lat": -0.870534,
              "long": -98.235893
            },
            "number": "107",
            "street": "Tracey Trace",
            "zipcode": "16482"
          },
          "email": "tracy@frey.com",
          "id": 7,
          "name": {
            "firstname": "Tracy",
            "lastname": "Frey"
          },
          "phone": "493.409.0584",
          "username": "tracyfrey"
        });
      }
    } catch (error) {
      console.error(error);
      setError('Unable to load profile. Please try again later.');
      
      // Fallback to mock data if API fails
      setMyProfile({
        "address": {
          "city": "East Mary",
          "geolocation": {
            "lat": -0.870534,
            "long": -98.235893
          },
          "number": "107",
          "street": "Tracey Trace",
          "zipcode": "16482"
        },
        "email": "tracy@frey.com",
        "id": 7,
        "name": {
          "firstname": "Tracy",
          "lastname": "Frey"
        },
        "phone": "493.409.0584",
        "username": "tracyfrey"
      });
    } finally {
      setLoading(false);
    }
  };

  const ProfileSection = ({ icon, title, value }) => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={20} color="#555" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Text style={styles.sectionValue}>{value}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={50} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {myProfile?.name?.firstname?.charAt(0)}{myProfile?.name?.lastname?.charAt(0)}
          </Text>
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.userName}>
            {myProfile?.name?.firstname} {myProfile?.name?.lastname}
          </Text>
          <Text style={styles.userHandle}>@{myProfile?.username}</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <ProfileSection
          icon="mail"
          title="Email"
          value={myProfile?.email}
        />
        
        <ProfileSection
          icon="call"
          title="Phone"
          value={myProfile?.phone}
        />
        
        <ProfileSection
          icon="home"
          title="Address"
          value={`${myProfile?.address?.number} ${myProfile?.address?.street}, ${myProfile?.address?.city}, ${myProfile?.address?.zipcode}`}
        />
        
        <ProfileSection
          icon="location"
          title="Coordinates"
          value={`Lat: ${myProfile?.address?.geolocation?.lat}, Long: ${myProfile?.address?.geolocation?.long}`}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerTextContainer: {
    marginLeft: 15,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  userHandle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  infoContainer: {
    padding: 15,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginLeft: 10,
  },
  sectionValue: {
    fontSize: 16,
    color: '#333',
    marginLeft: 30,
  },
});

export default UserProfile;