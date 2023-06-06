import React, { useEffect, useState } from "react";
import { Switch, Text, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const Home = () => {
  const navigation = useNavigation()
  const [saveBio, setSaveBio] = useState(false);
  const [item, setItem] = useState('')
  const toggleSwitch = async () => {
    setSaveBio(previousState => !previousState);
    if (!saveBio) {
      try {
        await AsyncStorage.setItem('bioActive', 'true');
      } catch (e) {
        console.log('save token erro', e)
      }
    } else {
      await AsyncStorage.removeItem('bioActive')
    }
  }
  useEffect(() => {
    const getItem = async () => {
      const value = await AsyncStorage.getItem('bioActive');
      console.log('value bioActive', value)
      if (value) {
        setSaveBio(true);
      }
    }
    getItem().then(console.log('saveBio', saveBio)).catch(console.error);
  }, [])

  return (
    <View style={{padding: 24}}>
      <Text>Hello Phuong Le</Text>
      <View style={{flexDirection: 'row', marginVertical: 24}}>
        <Switch
          onValueChange={toggleSwitch}
          value={saveBio}
        />
        <Text>Enabled biometric</Text>
      </View>
    
      <TouchableOpacity style={{ backgroundColor: 'green', padding: 20 }} onPress={() => navigation.navigate('Login')}>
        <Text style={{color: '#FFF'}}>Logout</Text>
      </TouchableOpacity>
    </View>
  )
}

export default Home;