import React, { useEffect } from 'react'
import { View } from 'react-native'
import { getAuth } from '@react-native-firebase/auth'
import AuthLayout from '../components/AuthComponents/AuthLayout'
import Button from '../components/AuthComponents/Button'
import DemoButton from '../components/AuthComponents/DemoButton'
import OrDivider from '../components/AuthComponents/OrDivider'
import { hideSplash } from '../helpers/splash'

export default function StartScreen({ navigation }) {
  // A saved session (including a demo session) goes straight to the app. App.js already opens the app on the
  // right screen; this covers a session that is restored late.
  useEffect(() => {
    if (getAuth().currentUser) navigation.reset({ index: 0, routes: [{ name: 'DashboardDrawer' }] })
  }, [])

  return (
    // The native splash hands over to this screen once it has been laid out.
    <View className="flex-1" onLayout={hideSplash}>
      <AuthLayout
        variant="tall"
        title="Great food, delivered fast."
        subtitle="Order from restaurants near you and follow your rider to the door."
      >
        <Button mode="contained" onPress={() => navigation.navigate('LoginScreen')}>
          Log in
        </Button>
        <Button mode="outlined" onPress={() => navigation.navigate('RegisterScreen')}>
          Create account
        </Button>
        <OrDivider />
        <DemoButton navigation={navigation} />
      </AuthLayout>
    </View>
  )
}
