import React, { useEffect } from 'react'
import { getAuth } from '@react-native-firebase/auth'
import Background from '../components/AuthComponents/Background'
import Logo from '../components/AuthComponents/Logo'
import Header from '../components/AuthComponents/Header'
import Button from '../components/AuthComponents/Button'
import Paragraph from '../components/AuthComponents/Paragraph'
import DemoButton from '../components/AuthComponents/DemoButton'

export default function StartScreen({ navigation }) {
  // A saved session (including a demo session) goes straight to the app.
  useEffect(() => {
    if (getAuth().currentUser) navigation.reset({ index: 0, routes: [{ name: 'DashboardDrawer' }] })
  }, [])

  return (
    <Background>
      <Logo size={224} />
      <Header>On Board...</Header>
      <Paragraph>
        Delicious food, delivered fast!
      </Paragraph>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('LoginScreen')}
      >
        Login
      </Button>
      <Button
        mode="outlined"
        onPress={() => navigation.navigate('RegisterScreen')}
      >
        Sign Up
      </Button>
      <DemoButton navigation={navigation} />
    </Background>
  )
}