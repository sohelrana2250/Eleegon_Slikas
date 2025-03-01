import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PrivateRoutes = ({ component: Component, navigation, ...rest }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const checkAuth = async () => {
      try {
        const userData = await AsyncStorage.getItem('eleegon_user_data');
        
        if (userData) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          navigation.navigate('Login');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigation]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF4500" />
      </View>
    );
  }


  if (isAuthenticated) {
    return <Component {...rest} navigation={navigation} />;
  }

  return null;
};

export default PrivateRoutes;