import React, { forwardRef, useState } from 'react'
import { Pressable, TextInput as RNTextInput, View } from 'react-native'
import { CircleAlert, Eye, EyeOff } from 'lucide-react-native'
import Text from '../ui/Text'
import { useAppTheme } from '../../hooks/useAppTheme'
import { fontFamilies } from '../../core/theme'

// Auth-screen input: label above, a leading lucide icon, and a show/hide toggle for passwords.
// Error state is driven by `error` (boolean) and explained by `errorText`.
const AuthTextInput = forwardRef(function AuthTextInput(
  { label, icon: Icon, error, errorText, description, secureTextEntry, onFocus, onBlur, ...props },
  ref
) {
  const { colors } = useAppTheme()
  const [focused, setFocused] = useState(false)
  const [hidden, setHidden] = useState(true)
  const isPassword = !!secureTextEntry

  const border = error ? 'border-danger' : focused ? 'border-brand' : 'border-transparent'
  const fill = focused ? 'bg-surface dark:bg-surface-dark' : 'bg-surface-alt dark:bg-surface-alt-dark'
  const iconColor = error ? colors.danger : focused ? colors.brand : colors.muted

  return (
    <View className="mb-3.5 w-full">
      <Text className="mb-1.5 text-[13px] font-semibold text-text dark:text-text-dark">{label}</Text>
      <View className={`h-[52px] flex-row items-center rounded-2xl border-[1.5px] px-3.5 ${fill} ${border}`}>
        {Icon ? <Icon size={20} strokeWidth={2} color={iconColor} /> : null}
        <RNTextInput
          ref={ref}
          accessibilityLabel={label}
          className="ml-2.5 h-full flex-1 text-[15px] text-text dark:text-text-dark"
          style={{ fontFamily: fontFamilies.regular, paddingVertical: 0 }}
          placeholderTextColor={colors.muted}
          selectionColor={colors.brand}
          cursorColor={colors.brand}
          secureTextEntry={isPassword && hidden}
          autoCorrect={false}
          onFocus={(event) => {
            setFocused(true)
            onFocus?.(event)
          }}
          onBlur={(event) => {
            setFocused(false)
            onBlur?.(event)
          }}
          {...props}
        />
        {isPassword ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            hitSlop={10}
            onPress={() => setHidden((value) => !value)}
            className="-mr-1 h-9 w-9 items-center justify-center"
          >
            {hidden ? <Eye size={20} strokeWidth={2} color={colors.muted} /> : <EyeOff size={20} strokeWidth={2} color={colors.muted} />}
          </Pressable>
        ) : null}
      </View>
      {errorText ? (
        <View className="mt-1.5 flex-row items-center gap-1.5">
          <CircleAlert size={14} strokeWidth={2.25} color={colors.danger} />
          <Text className="flex-1 text-xs text-danger">{errorText}</Text>
        </View>
      ) : description ? (
        <Text className="mt-1.5 text-xs text-muted dark:text-muted-dark">{description}</Text>
      ) : null}
    </View>
  )
})

export default AuthTextInput
