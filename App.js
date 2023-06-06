import React, { useEffect, useRef, useState } from 'react';
import { View, Text, AppState } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as LocalAuthentication from 'expo-local-authentication';
import BackgroundTimer from 'react-native-background-timer';

import LoginScreen from './src/Login';
import Home from './src/Home';
import AsyncStorage from '@react-native-async-storage/async-storage';


const Stack = createNativeStackNavigator();

function App() {

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [countTimeBackground, setCountTimeBackground] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // BackgroundTimer.clearTimeout(timeOutTimer);
        BackgroundTimer.runBackgroundTimer(() => { 
          setCountTimeBackground((prev) => prev + 1);
          console.log('coubnt');
        }, 1000);
        // const timeOutTimer = BackgroundTimer.setTimeout(() => {
        //   BackgroundTimer.stopBackgroundTimer();
        //   console.log('stop');
        // }, 35000)
      }

      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('timeBackGround', countTimeBackground);
        if (countTimeBackground > 10) {
          handleBiometricAuth()
        }
        BackgroundTimer.stopBackgroundTimer();
        setCountTimeBackground(0);
      }
      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });
    return () => {
      subscription.remove();
    };
  }, [countTimeBackground]);

  useEffect(() => {
    if (countTimeBackground > 11) BackgroundTimer.stopBackgroundTimer();
  }, [countTimeBackground])

  useEffect(() => {
    handleBiometricAuth()
  }, [])

  const handleBiometricAuth = async () => {  
    setIsLoading(true);
    try {
      const biometricAuth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login with Biometrics',
        disableDeviceFallback: true,
        cancelLabel: 'Cancel'
      });
      console.log('biometricAuth', biometricAuth)
      if (biometricAuth.success) {
        alert('Success' );
      } else {
        alert('Failed to authenticate, reason: ' + result.error);
      }
    } finally {
        setIsLoading(false)
    }
    
  }
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={Home} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;