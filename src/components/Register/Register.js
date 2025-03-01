import React, { useState } from 'react';
import { 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  ScrollView,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Register = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "Mahendra Singh",
    lastname: "Dhoni",
    username: "MSDhoni",
    email: "Thala@seven.com",
    password: "@2011WC",
    confirmPassword: "@2011WC",
    phone: "777777777",
    city: "Rachi",
    street: "Local Boy",
    zipcode: "7777",
    number: "7777777"
  });
  
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let isValid = true;
    let newErrors = {};
    
    // Check required fields
    if (!formData.firstname.trim()) {
      newErrors.firstname = 'First name is required';
      isValid = false;
    }
    
    if (!formData.lastname.trim()) {
      newErrors.lastname = 'Last name is required';
      isValid = false;
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    }
    
    // Validate email format
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch("https://fakestoreapi.in/api/users", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          name: {
            firstname: formData.firstname,
            lastname: formData.lastname
          },
          address: {
            city: formData.city,
            street: formData.street,
            number: formData.number,
            zipcode: formData.zipcode,
            geolocation: {
              lat: 77.77777,
              long: 77.77777
            }
          },
          phone: formData.phone
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        Alert.alert(
          "Registration Successful",
          "Your account has been created successfully!",
          [{ text: "OK", onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert("Registration Failed", data.message || "Something went wrong");
      }
    } catch (error) {
      Alert.alert("Network Error", "Please check your internet connection");
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../../assets/sun.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.headerText}>Eleegon</Text>
        <Text style={styles.subHeaderText}>Create your account</Text>
      </View>
      
      <View style={styles.formContainer}>
        {/* Personal Information Section */}
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.inputRow}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={[styles.input, errors.firstname && styles.inputError]}
              placeholder="First Name"
              value={formData.firstname}
              onChangeText={(text) => handleInputChange('firstname', text)}
            />
            {errors.firstname ? <Text style={styles.errorText}>{errors.firstname}</Text> : null}
          </View>
          
          <View style={styles.halfInput}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={[styles.input, errors.lastname && styles.inputError]}
              placeholder="Last Name"
              value={formData.lastname}
              onChangeText={(text) => handleInputChange('lastname', text)}
            />
            {errors.lastname ? <Text style={styles.errorText}>{errors.lastname}</Text> : null}
          </View>
        </View>

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={[styles.input, errors.username && styles.inputError]}
          placeholder="Username"
          value={formData.username}
          onChangeText={(text) => handleInputChange('username', text)}
        />
        {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}
        
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="Email Address"
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.email}
          onChangeText={(text) => handleInputChange('email', text)}
        />
        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
        
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={[styles.input, errors.phone && styles.inputError]}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          value={formData.phone}
          onChangeText={(text) => handleInputChange('phone', text)}
        />
        {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}

        {/* Address Section */}
        <Text style={styles.sectionTitle}>Address</Text>
        
        <Text style={styles.label}>City</Text>
        <TextInput
          style={styles.input}
          placeholder="City"
          value={formData.city}
          onChangeText={(text) => handleInputChange('city', text)}
        />
        
        <Text style={styles.label}>Street</Text>
        <TextInput
          style={styles.input}
          placeholder="Street"
          value={formData.street}
          onChangeText={(text) => handleInputChange('street', text)}
        />
        
        <Text style={styles.label}>Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Number"
          value={formData.number}
          onChangeText={(text) => handleInputChange('number', text)}
        />
        
        <Text style={styles.label}>Zip Code</Text>
        <TextInput
          style={styles.input}
          placeholder="Zip Code"
          keyboardType="numeric"
          value={formData.zipcode}
          onChangeText={(text) => handleInputChange('zipcode', text)}
        />

        {/* Password Section */}
        <Text style={styles.sectionTitle}>Security</Text>
        
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          placeholder="Password"
          secureTextEntry
          value={formData.password}
          onChangeText={(text) => handleInputChange('password', text)}
        />
        {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
        
        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={[styles.input, errors.confirmPassword && styles.inputError]}
          placeholder="Confirm Password"
          secureTextEntry
          value={formData.confirmPassword}
          onChangeText={(text) => handleInputChange('confirmPassword', text)}
        />
        {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
        
        <TouchableOpacity 
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating Account...' : 'Register'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E4057',
    marginTop: 10,
  },
  subHeaderText: {
    fontSize: 18,
    color: '#666',
    marginTop: 5,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E4057',
    marginTop: 20,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#2E4057',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#666',
    fontSize: 16,
  },
  loginLink: {
    color: '#2E4057',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 5,
  },
});

export default Register;