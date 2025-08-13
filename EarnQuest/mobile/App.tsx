import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FlashMessage from 'react-native-flash-message';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import HomeScreen from './src/screens/main/HomeScreen';
import SurveysScreen from './src/screens/main/SurveysScreen';
import RewardsScreen from './src/screens/main/RewardsScreen';
import ProfileScreen from './src/screens/main/ProfileScreen';
import SurveyDetailScreen from './src/screens/surveys/SurveyDetailScreen';
import WithdrawScreen from './src/screens/payments/WithdrawScreen';

// Context
import {AuthProvider, useAuth} from './src/context/AuthContext';

// Types
type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
  SurveyDetail: {survey: any};
  Withdraw: undefined;
};

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

type MainTabParamList = {
  Home: undefined;
  Surveys: undefined;
  Rewards: undefined;
  Profile: undefined;
};

const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

// Auth Stack Navigator
function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: '#f8f9fa'},
      }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

// Main Tab Navigator
function MainNavigator() {
  return (
    <MainTab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Surveys':
              iconName = 'assignment';
              break;
            case 'Rewards':
              iconName = 'card-giftcard';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: '#6c757d',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e9ecef',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#007bff',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}>
      <MainTab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{title: 'EarnQuest'}}
      />
      <MainTab.Screen 
        name="Surveys" 
        component={SurveysScreen}
        options={{title: 'Available Surveys'}}
      />
      <MainTab.Screen 
        name="Rewards" 
        component={RewardsScreen}
        options={{title: 'My Rewards'}}
      />
      <MainTab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{title: 'Profile'}}
      />
    </MainTab.Navigator>
  );
}

// App Navigator
function AppNavigator() {
  const {isAuthenticated, isLoading} = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{headerShown: false}}>
        {!isAuthenticated ? (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <RootStack.Screen name="Main" component={MainNavigator} />
            <RootStack.Screen 
              name="SurveyDetail" 
              component={SurveyDetailScreen}
              options={{
                headerShown: true,
                title: 'Survey Details',
                headerStyle: {backgroundColor: '#007bff'},
                headerTintColor: '#ffffff',
              }}
            />
            <RootStack.Screen 
              name="Withdraw" 
              component={WithdrawScreen}
              options={{
                headerShown: true,
                title: 'Withdraw Funds',
                headerStyle: {backgroundColor: '#007bff'},
                headerTintColor: '#ffffff',
              }}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

// Main App Component
export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
      <FlashMessage position="top" />
    </AuthProvider>
  );
}
