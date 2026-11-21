import React, { useState } from 'react'
import { getAuth, signInAnonymously } from '@react-native-firebase/auth'
import Button from './Button'

// One-tap demo: signs in as a Firebase anonymous user, so no shared credentials ship in the app.
// Anonymous users count as signed in for the Firestore/Storage rules; signing out deletes them
// (see screens/ProfileScreen.js) so they don't pile up.
export default function DemoButton({ navigation }) {
  const [loading, setLoading] = useState(false)

  const startDemo = () => {
    setLoading(true)
    signInAnonymously(getAuth())
      .then(() => navigation.reset({ index: 0, routes: [{ name: 'DashboardDrawer' }] }))
      .catch((error) => alert(error.message))
      .finally(() => setLoading(false))
  }

  return (
    <Button mode="text" onPress={startDemo} loading={loading} disabled={loading}>
      Try the demo
    </Button>
  )
}
