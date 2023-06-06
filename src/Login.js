import React, { useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Alert, AppState, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useEffect } from 'react';
import * as Keychain from 'react-native-keychain';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const AUTH_TYPE = {
  TOUCH_ID: 1,
  FACE_ID: 2,
}

const dataTest = {
  userName: 'test',
  pwd: '123456'
}
export default function LoginScreen() {
  const appState = useRef(AppState.currentState);
  const navigation = useNavigation();
  const [token, setToken] = useState('');
  const [isLoginByBio, setIsLoginByBio] = useState(false);
  const [isSaveBiometric, setIsSaveBiometric] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [isLoading, setIsLoading] = useState(false);
  const [errMess, setErrMess] = useState('');
  const [formData, setFormData] = useState({
    userName: '',
    pwd: ''
  });

  useEffect(() => {
    const unsbuscribe = navigation.addListener("focus", () => {
      (async() => {
        try {
          const bioActive = await AsyncStorage.getItem('bioActive');
          if (bioActive != null) {
            setIsLoginByBio(true);
          } else {
            setIsLoginByBio(false)
          }
        } catch(e) {
          console.log('e', e)
        }
      })()
    })
    return unsbuscribe;
  }, [navigation])

  useEffect(() => {
    const biometrichTrack =  async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const savedBiometrics = await LocalAuthentication.isEnrolledAsync();
      const supportAuthType = await LocalAuthentication.supportedAuthenticationTypesAsync();
      setIsBiometricSupported(compatible);
      setIsSaveBiometric(savedBiometrics);
      console.log('supportAuthType', supportAuthType)
      console.log('isSaveBiometric', isSaveBiometric)
    }
    biometrichTrack();
  }, []);

  const getCredentials = async () => {
    try {
      // Retrieve the credentials
      const credentials = await Keychain.getGenericPassword();
      if (credentials) {
        console.log(
          "Credentials successfully loaded for user " + credentials.username
        );
        // Set the state
        setFormData(prev => ({...prev, userName: credentials.username, pwd: credentials.password}))
        navigation.navigate("Home");
        setTimeout(() => {
          setFormData(prev => ({...prev, userName: '', pwd: ''}))
        }, 1000)
      } else {
        console.log("No credentials stored");
      }
    } catch (error) {
      console.log("Keychain couldn't be accessed!", error);
    }
  };

  const saveCredentials = async () => {
    // Store the credentials
    await Keychain.setGenericPassword(formData.userName, formData.pwd);
    console.log("Credentials saved successfully!");
  };

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
        getCredentials();
        // navigation.navigate("Home")
      } else {
        alert('Failed to authenticate, reason: ' + result.error);
      }
    } finally {
        setIsLoading(false)
    }
    
  }

  const handleLogin = async () => {
    console.log(formData)
    if (formData.userName == dataTest.userName && formData.pwd == dataTest.pwd) {
      saveCredentials();
      navigation.navigate("Home");
      setFormData(prev => ({...prev, userName: '', pwd: ''}))
    } else {
      setErrMess('Invalid form')
    }
  }

  const handleOnchange = (text, input) => {
    setFormData(prevState => ({...prevState, [input]: text}));
  };

  return (
    <View style={styles.container}>
      <View>
        <Text>user: {dataTest.userName}</Text>
        <Text>Pwd: {dataTest.pwd}</Text>
      </View>
      <TextInput style={styles.input} placeholder='user name' value={formData.userName} onChangeText={text => handleOnchange(text, 'userName')}/>
      <TextInput style={styles.input} secureTextEntry={true} placeholder='Password' value={formData.pwd} onChangeText={text => handleOnchange(text, 'pwd')}/>
      {errMess && <Text>{errMess}</Text>}
      {/* <Text>isSaveBiometric: {isSaveBiometric ? 'isSaveBiometric' : 'isSaveBiometric false'}</Text>
        <Text>isLoginByBio: {isLoginByBio ? 'isLoginByBio' : 'isLoginByBio false'}</Text> */}
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity style={{marginRight: 16, backgroundColor: 'green', padding: 16}} onPress={handleLogin}>
          <Text style={{color: '#FFFFFF'}}>Login</Text>
        </TouchableOpacity>
       
        {
          isSaveBiometric && isLoginByBio &&
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
    justifyContent: 'center',
    padding: 24
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16
  }
});
