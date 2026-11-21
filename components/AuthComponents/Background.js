import React from 'react'
import { ImageBackground, KeyboardAvoidingView, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import BackButton from './BackButton'
import { useAppTheme } from '../../hooks/useAppTheme'

// Shared shell of the auth screens: themed background, safe-area padding, centered 400px column that
// scrolls when the keyboard leaves too little room.
export default function Background({ children, onBack }) {
  const insets = useSafeAreaInsets()
  const { isDark } = useAppTheme()

  const content = (
    <View className="flex-1">
    {onBack ? <BackButton goBack={onBack} /> : null}
    <KeyboardAvoidingView className="flex-1" behavior="padding">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingTop: insets.top + 56, paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-md items-center self-center px-6">{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
    </View>
  )

  if (isDark) return <View className="flex-1 bg-background-dark">{content}</View>

  return (
    <ImageBackground
      source={require('../../assets/background_dot.png')}
      resizeMode="repeat"
      className="flex-1 bg-surface"
    >
      {content}
    </ImageBackground>
  )
}
