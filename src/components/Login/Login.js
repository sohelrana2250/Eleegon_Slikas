import React, { useState, useEffect } from 'react';
import { 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import CommonActions instead of directly using navigation.replace
import { useNavigation, CommonActions } from '@react-navigation/native';

const Login = () => {
  const [email, setEmail] = useState('michael@simpson.com');
  const [password, setPassword] = useState('@K(5UejhL&');
  const [isLoading, setIsLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    // Check if user is already logged in
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const userData = await AsyncStorage.getItem('eleegon_user_data');
      if (userData) {
        // User is already logged in, redirect to Products using CommonActions
        navigateToProducts();
      }
    } catch (error) {
      console.log('Error checking login status:', error);
    }
  };

  // Create a separate function for navigation to handle errors gracefully
  const navigateToProducts = () => {
    try {
      // First check if replace is available
      if (navigation && typeof navigation.replace === 'function') {
        navigation.replace('Products');
      } 
      // Fallback to dispatch if replace isn't available
      else if (navigation && typeof navigation.dispatch === 'function') {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Products' }]
          })
        );
      } 
      // Final fallback to navigate
      else if (navigation && typeof navigation.navigate === 'function') {
        navigation.navigate('Products');
      } else {
        console.log('Navigation object is not properly configured');
        Alert.alert('Navigation Error', 'Could not navigate to Products screen');
      }
    } catch (error) {
      console.log('Navigation error:', error);
      Alert.alert('Navigation Error', 'Could not navigate to Products screen');
    }
  };

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);

    fetch('https://fakestoreapi.in/api/users', {
      method: 'GET'
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('API ERROR');
        }
        return res.json();
      })
      .then((data) => {
        if (data?.status) {
          const logindata = data?.users?.find((login) => {
            return login.email === email && login.password === password;
          });

          if (logindata) {
            // Store user data in AsyncStorage
            const userData = {
              id: logindata.id,
              email: logindata.email
            };
            
            AsyncStorage.setItem('eleegon_user_data', JSON.stringify(userData))
              .then(() => {
               //  console.log("Login successful");
               //  console.log(userData);
                // Redirect to Products page using the safe navigation function
                navigateToProducts();
              })
              .catch((error) => {
                console.log('Error storing user data:', error);
                Alert.alert('Error', 'Failed to store login information');
              });
          } else {
            Alert.alert('Error', 'Invalid email or password');
          }
        } else {
          Alert.alert('Error', 'Login failed. Please try again.');
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        Alert.alert('Error', 'Connection error. Please check your internet connection.');
        setIsLoading(false);
      });
  };

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/sun.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
        <Text style={styles.title}>Eleegon</Text>
        <Text style={styles.subtitle}>Premium Ecommerce Experience</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry={secureTextEntry}
          />
          <TouchableOpacity onPress={toggleSecureEntry} style={styles.eyeIcon}>
            <Text>{secureTextEntry ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity  onPress={() => navigation.navigate("Register")}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 15,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#1e88e5',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#1e88e5',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    color: '#1e88e5',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Login;