import React, { useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Alert, AppState, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';


const AUTH_TYPE = {
  TOUCH_ID: 1,
  FACE_ID: 2,
}
export default function LoginScreen() {
  const appState = useRef(AppState.currentState);
  const navigation = useNavigation();
  const [isSaveBiometric, setIsSaveBiometric] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const savedBiometrics = await LocalAuthentication.isEnrolledAsync();
      const supportAuthType = await LocalAuthentication.supportedAuthenticationTypesAsync();
      setIsBiometricSupported(compatible);
      setIsSaveBiometric(savedBiometrics);
    })();
  }, []);


  const handleBiometricAuth = async () => {  
    setIsLoading(true);
    try {
      const biometricAuth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login with Biometrics',
      });
      console.log('biometricAuth', biometricAuth)
      if (biometricAuth.success) {
        navigation.navigate("Home")
      } else {
        alert('Failed to authenticate, reason: ' + result.error);
      }
    } finally {
        setIsLoading(false)
    }
    
  }

  return (
    <View style={styles.container}>
      <TextInput placeholder='Email' sty/>
      <TextInput placeholder='Pass word'/>
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity style={{marginRight: 16, backgroundColor: 'green', padding: 16}} onPress={() => navigation.navigate("Home")}>
          <Text style={{color: '#FFFFFF'}}>Login</Text>
        </TouchableOpacity>
        {
          isBiometricSupported && 
          <TouchableOpacity style={{marginLeft: 16, backgroundColor: 'green', padding: 16}} onPress={handleBiometricAuth}>
            <Text style={{color: '#FFFFFF'}}>Login with FaceId/TouchId</Text>
            {isLoading && <ActivityIndicator/>}
          </TouchableOpacity>
        }
   
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
