import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';

const {width, height} = Dimensions.get('window');

const SplashScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>💰</Text>
          <Text style={styles.appName}>EarnQuest</Text>
          <Text style={styles.tagline}>Earn Real Money with Surveys</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Made for Kenya 🇰🇪</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#6c757d',
  },
  footer: {
    paddingBottom: 30,
  },
  footerText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
});

export default SplashScreen;
