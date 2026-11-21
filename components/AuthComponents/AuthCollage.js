import React, { useEffect } from 'react'
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated'
import { useAppTheme } from '../../hooks/useAppTheme'

// Bundled photos only: the auth screens are shown before sign-in and must not depend on Firebase Storage.
const PHOTOS = {
  burger: require('../../assets/auth/food-burger.webp'),
  tacos: require('../../assets/auth/food-tacos.webp'),
  sushi: require('../../assets/auth/food-sushi.webp'),
  curry: require('../../assets/auth/food-curry.webp'),
  pizza: require('../../assets/auth/food-pizza.webp'),
  dumplings: require('../../assets/auth/food-dumplings.webp'),
}

const COLUMNS = [
  { photos: ['pizza', 'tacos', 'dumplings', 'burger'], offset: -0.35, drift: 18 },
  { photos: ['burger', 'sushi', 'curry', 'tacos'], offset: -0.7, drift: -22 },
  { photos: ['curry', 'dumplings', 'pizza', 'sushi'], offset: -0.2, drift: 20 },
  { photos: ['sushi', 'pizza', 'tacos', 'curry'], offset: -0.55, drift: -16 },
]
const GAP = 12

// One column of photos that drifts slowly up or down. Static when the user asked for reduced motion.
function Column({ photos, tile, offset, drift, animate }) {
  const y = useSharedValue(0)

  useEffect(() => {
    if (!animate) {
      y.value = 0
      return undefined
    }
    y.value = withRepeat(withTiming(drift, { duration: 9000, easing: Easing.inOut(Easing.sin) }), -1, true)
    return () => cancelAnimation(y)
  }, [animate, drift, y])

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }))

  return (
    <Animated.View style={[{ width: tile, marginTop: offset * tile, gap: GAP }, style]}>
      {photos.map((name, index) => (
        <Image
          key={`${name}-${index}`}
          source={PHOTOS[name]}
          style={{ width: tile, height: tile, borderRadius: 26 }}
          resizeMode="cover"
          fadeDuration={0}
        />
      ))}
    </Animated.View>
  )
}

// Full-bleed hero background: a tilted grid of food photos under a brand-teal scrim. It fills its parent.
export default function AuthCollage() {
  const { width } = useWindowDimensions()
  const { isDark } = useAppTheme()
  const reduceMotion = useReducedMotion()
  const tile = Math.round(Math.min(Math.max(width * 0.3, 112), 150))
  const gridWidth = COLUMNS.length * tile + (COLUMNS.length - 1) * GAP

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" className="overflow-hidden bg-brand">
      <View
        style={{
          position: 'absolute',
          top: -tile * 0.4,
          left: (width - gridWidth) / 2,
          width: gridWidth,
          flexDirection: 'row',
          gap: GAP,
          transform: [{ rotate: '-9deg' }, { scale: 1.12 }],
        }}
      >
        {COLUMNS.map((column, index) => (
          <Column key={index} tile={tile} animate={!reduceMotion} {...column} />
        ))}
      </View>
      <LinearGradient
        colors={
          isDark
            ? ['rgba(2,40,43,0.66)', 'rgba(6,52,56,0.86)', 'rgba(13,17,20,0.98)']
            : ['rgba(0,122,128,0.50)', 'rgba(0,160,168,0.80)', 'rgba(0,176,184,0.95)']
        }
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  )
}
