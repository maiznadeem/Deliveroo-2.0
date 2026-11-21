import React, { useState } from 'react'
import { ActivityIndicator, Pressable, View } from 'react-native'
import { ChevronRight, Sparkles } from 'lucide-react-native'
import { getAuth, signInAnonymously } from '@react-native-firebase/auth'
import Text from '../ui/Text'
import { useAppTheme } from '../../hooks/useAppTheme'

// One-tap demo: signs in as a Firebase anonymous user, so no shared credentials ship in the app.
// Anonymous users count as signed in for the Firestore/Storage rules; signing out deletes them
// (see screens/ProfileScreen.js) so they don't pile up.
export default function DemoButton({ navigation }) {
  const [loading, setLoading] = useState(false)
  const { colors } = useAppTheme()

  const startDemo = () => {
    setLoading(true)
    signInAnonymously(getAuth())
      .then(() => navigation.reset({ index: 0, routes: [{ name: 'DashboardDrawer' }] }))
      .catch((error) => alert(error.message))
      .finally(() => setLoading(false))
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Try the demo, no account needed"
      accessibilityState={{ disabled: loading, busy: loading }}
      disabled={loading}
      onPress={startDemo}
      android_ripple={{ color: 'rgba(0,184,192,0.2)' }}
      style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.985 : 1 }] })}
      className="my-1.5 min-h-[60px] w-full flex-row items-center gap-3 overflow-hidden rounded-2xl border-[1.5px] border-brand/40 bg-brand-soft px-3.5 py-2 dark:bg-brand-soft-dark"
    >
      <View className="h-9 w-9 items-center justify-center rounded-full bg-brand">
        {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Sparkles size={18} strokeWidth={2.25} color="#FFFFFF" />}
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-link dark:text-link-dark">Try the demo</Text>
        <Text className="text-xs text-muted dark:text-muted-dark">No account needed</Text>
      </View>
      <ChevronRight size={20} strokeWidth={2.25} color={colors.link} />
    </Pressable>
  )
}
