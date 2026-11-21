import React from 'react'
import { View } from 'react-native'
import { TextInput as Input } from 'react-native-paper'
import Text from '../ui/Text'
import { useAppTheme } from '../../hooks/useAppTheme'

export default function TextInput({ errorText, description, ...props }) {
  const { colors } = useAppTheme()
  return (
    <View className="mb-3 w-full">
      <Input
        style={{ backgroundColor: colors.surface }}
        selectionColor={colors.brand}
        activeOutlineColor={colors.brand}
        textColor={colors.text}
        underlineColor="transparent"
        mode="outlined"
        {...props}
      />
      {description && !errorText ? (
        <Text className="pt-2 text-xs text-muted dark:text-muted-dark">{description}</Text>
      ) : null}
      {errorText ? <Text className="pt-2 text-xs text-danger">{errorText}</Text> : null}
    </View>
  )
}
