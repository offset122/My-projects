import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {showMessage} from 'react-native-flash-message';
import {useAuth} from '../../context/AuthContext';

interface RegisterScreenProps {
  navigation: any;
}

const KENYAN_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi',
  'Kitale', 'Garissa', 'Kakamega', 'Machakos', 'Meru', 'Nyeri', 'Kericho',
  'Embu', 'Migori', 'Homa Bay', 'Naivasha', 'Voi', 'Kilifi', 'Lamu',
  'Mandera', 'Wajir', 'Marsabit', 'Isiolo', 'Moyale', 'Lodwar', 'Kapenguria',
  'Bungoma', 'Busia', 'Siaya', 'Kisii', 'Nyamira', 'Bomet', 'Narok',
  'Kajiado', 'Makueni', 'Kitui', 'Mwingi', 'Garsen', 'Maralal', 'Rumuruti',
  'Nanyuki', 'Murang\'a', 'Kerugoya', 'Kiambu', 'Limuru'
];

const RegisterScreen: React.FC<RegisterScreenProps> = ({navigation}) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    date_of_birth: '',
    gender: '',
    county: '',
    occupation: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const {register} = useAuth();

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const validateForm = () => {
    const {first_name, last_name, email, phone, password, confirm_password} = formData;

    if (!first_name || !last_name || !email || !phone || !password) {
      showMessage({
        message: 'Error',
        description: 'Please fill in all required fields',
        type: 'danger',
      });
      return false;
    }

    if (password !== confirm_password) {
      showMessage({
        message: 'Error',
        description: 'Passwords do not match',
        type: 'danger',
      });
      return false;
    }

    if (password.length < 6) {
      showMessage({
        message: 'Error',
        description: 'Password must be at least 6 characters long',
        type: 'danger',
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage({
        message: 'Error',
        description: 'Please enter a valid email address',
        type: 'danger',
      });
      return false;
    }

    const phoneRegex = /^(\+254|254|0)[17]\d{8}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      showMessage({
        message: 'Error',
        description: 'Please enter a valid Kenyan phone number',
        type: 'danger',
      });
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const registrationData = {
        ...formData,
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.replace(/\s/g, ''),
      };
      delete registrationData.confirm_password;

      const success = await register(registrationData);
      if (success) {
        showMessage({
          message: 'Success',
          description: 'Welcome to EarnQuest! Start earning today.',
          type: 'success',
        });
      } else {
        showMessage({
          message: 'Registration Failed',
          description: 'Please check your information and try again',
          type: 'danger',
        });
      }
    } catch (error) {
      showMessage({
        message: 'Error',
        description: 'Something went wrong. Please try again.',
        type: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.logo}>💰</Text>
        <Text style={styles.title}>Join EarnQuest</Text>
        <Text style={styles.subtitle}>Start earning money with surveys</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.row}>
          <View style={[styles.inputContainer, styles.halfWidth]}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.first_name}
              onChangeText={(value) => updateFormData('first_name', value)}
              placeholder="First name"
            />
          </View>
          <View style={[styles.inputContainer, styles.halfWidth]}>
            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.last_name}
              onChangeText={(value) => updateFormData('last_name', value)}
              placeholder="Last name"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address *</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            placeholder="your.email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(value) => updateFormData('phone', value)}
            placeholder="0712345678 or +254712345678"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password *</Text>
          <TextInput
            style={styles.input}
            value={formData.password}
            onChangeText={(value) => updateFormData('password', value)}
            placeholder="At least 6 characters"
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password *</Text>
          <TextInput
            style={styles.input}
            value={formData.confirm_password}
            onChangeText={(value) => updateFormData('confirm_password', value)}
            placeholder="Confirm your password"
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date of Birth</Text>
          <TextInput
            style={styles.input}
            value={formData.date_of_birth}
            onChangeText={(value) => updateFormData('date_of_birth', value)}
            placeholder="YYYY-MM-DD"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.gender}
              onValueChange={(value) => updateFormData('gender', value)}
              style={styles.picker}>
              <Picker.Item label="Select Gender" value="" />
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
              <Picker.Item label="Other" value="other" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>County</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.county}
              onValueChange={(value) => updateFormData('county', value)}
              style={styles.picker}>
              <Picker.Item label="Select County" value="" />
              {KENYAN_COUNTIES.map((county) => (
                <Picker.Item key={county} label={county} value={county} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Occupation</Text>
          <TextInput
            style={styles.input}
            value={formData.occupation}
            onChangeText={(value) => updateFormData('occupation', value)}
            placeholder="Your occupation"
          />
        </View>

        <TouchableOpacity
          style={[styles.registerButton, isLoading && styles.disabledButton]}
          onPress={handleRegister}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.registerButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginButtonText}>
            Already have an account? <Text style={styles.loginLink}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    fontSize: 50,
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    marginBottom: 16,
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#ffffff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  picker: {
    height: 40,
  },
  registerButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: '#6c757d',
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 14,
    color: '#6c757d',
  },
  loginLink: {
    color: '#007bff',
    fontWeight: '600',
  },
});

export default RegisterScreen;
