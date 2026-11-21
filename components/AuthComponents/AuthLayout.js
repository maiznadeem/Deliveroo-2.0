import React, { useEffect } from 'react'
import { Image, Keyboard, KeyboardAvoidingView, ScrollView, View, useWindowDimensions } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { Easing, FadeIn, ReduceMotion, SlideInDown, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated'
import AuthCollage from './AuthCollage'
import BackButton from './BackButton'
import Text from '../ui/Text'

const logoWhite = require('../../assets/auth/logo-white.webp')
const LOGO_ASPECT = 640 / 607

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

// Shared shell of the auth screens (Start, Login, Register, Reset password): a full-bleed food-photo hero with the
// logo, and a rounded sheet holding the title and the form. The sheet scrolls over the hero; when the keyboard
// opens the hero collapses so the fields and buttons stay visible.
//   variant: 'tall' (Start screen) or 'compact' (forms)
export default function AuthLayout({ children, onBack, variant = 'compact', title, subtitle }) {
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()
  const reduceMotion = useReducedMotion()

  const tall = variant === 'tall'
  const expanded = Math.round(tall ? clamp(height * 0.4, 300, 420) : clamp(height * 0.26, 210, 270))
  const collapsed = insets.top + 64
  const logoWidth = tall ? 200 : 132

  const spacerHeight = useSharedValue(expanded)
  const logoOpacity = useSharedValue(1)
  const spacerStyle = useAnimatedStyle(() => ({ height: spacerHeight.value }))
  const logoStyle = useAnimatedStyle(() => ({ opacity: logoOpacity.value }))

  useEffect(() => {
    const duration = reduceMotion ? 0 : 220
    const easing = Easing.out(Easing.cubic)
    const show = Keyboard.addListener('keyboardDidShow', () => {
      spacerHeight.value = withTiming(collapsed, { duration, easing })
      logoOpacity.value = withTiming(0, { duration: duration / 2 })
    })
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      spacerHeight.value = withTiming(expanded, { duration, easing })
      logoOpacity.value = withTiming(1, { duration })
    })
    return () => {
      show.remove()
      hide.remove()
    }
  }, [collapsed, expanded, reduceMotion, spacerHeight, logoOpacity])

  return (
    <View className="flex-1 bg-brand">
      {/* The hero is always dark/teal, so the status bar icons stay light in both themes. */}
      <StatusBar style="light" />
      <AuthCollage />

      <KeyboardAvoidingView className="flex-1" behavior="padding">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
        >
          <Animated.View style={[{ justifyContent: 'center', alignItems: 'center', paddingTop: insets.top }, spacerStyle]}>
            <Animated.View style={logoStyle} entering={FadeIn.duration(500).delay(120).reduceMotion(ReduceMotion.System)}>
              <Image
                accessibilityLabel="Deliveroo"
                source={logoWhite}
                style={{ width: logoWidth, height: logoWidth / LOGO_ASPECT }}
                resizeMode="contain"
              />
            </Animated.View>
          </Animated.View>

          <Animated.View
            entering={SlideInDown.duration(480).easing(Easing.out(Easing.cubic)).reduceMotion(ReduceMotion.System)}
            className="flex-1 rounded-t-[32px] bg-surface px-6 pt-8 dark:bg-surface-dark"
            style={{ paddingBottom: insets.bottom + 24 }}
          >
            <View className="w-full max-w-md self-center">
              <Text accessibilityRole="header" className="text-[28px] font-extrabold leading-9">
                {title}
              </Text>
              {subtitle ? <Text className="mb-6 mt-1.5 text-[15px] leading-5 text-muted dark:text-muted-dark">{subtitle}</Text> : <View className="mb-6" />}
              {children}
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {onBack ? <BackButton goBack={onBack} /> : null}
    </View>
  )
}
