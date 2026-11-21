import React from 'react'
import { ActivityIndicator, Pressable, View } from 'react-native'
import Text from '../ui/Text'
import { useAppTheme } from '../../hooks/useAppTheme'

// Auth-screen button. mode: 'contained' (brand fill), 'outlined' (brand outline), 'tonal' (soft brand fill)
// or 'text'. `icon` is a lucide component; `loading` shows a spinner and blocks presses.
const CONTAINER = {
  contained: 'bg-brand',
  outlined: 'border-[1.5px] border-brand',
  tonal: 'bg-brand-soft dark:bg-brand-soft-dark',
  text: '',
}
const LABEL = {
  contained: 'text-white',
  outlined: 'text-link dark:text-link-dark',
  tonal: 'text-link dark:text-link-dark',
  text: 'text-link dark:text-link-dark',
}

export default function Button({ mode = 'contained', icon: Icon, loading = false, disabled = false, onPress, children, className = '', accessibilityLabel }) {
  const { colors } = useAppTheme()
  const iconColor = mode === 'contained' ? '#FFFFFF' : colors.link
  const inactive = disabled || loading

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      android_ripple={{ color: mode === 'contained' ? 'rgba(255,255,255,0.28)' : 'rgba(0,184,192,0.18)' }}
      style={({ pressed }) => ({ opacity: inactive && !loading ? 0.55 : pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] })}
      className={`my-1.5 h-[52px] w-full overflow-hidden rounded-2xl ${CONTAINER[mode]} ${className}`}
    >
      <View className="h-full flex-row items-center justify-center gap-2 px-4">
        {loading ? (
          <ActivityIndicator size="small" color={iconColor} />
        ) : Icon ? (
          <Icon size={20} strokeWidth={2.25} color={iconColor} />
        ) : null}
        <Text className={`text-base font-bold ${LABEL[mode]}`}>{children}</Text>
      </View>
    </Pressable>
  )
}
