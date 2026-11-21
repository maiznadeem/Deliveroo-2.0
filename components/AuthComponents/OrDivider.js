import React from 'react'
import { View } from 'react-native'
import Text from '../ui/Text'

// Hairline divider with a centred "or", between the account actions and the demo.
export default function OrDivider() {
  return (
    <View className="my-3 w-full flex-row items-center gap-3" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View className="h-px flex-1 bg-border dark:bg-border-dark" />
      <Text className="text-xs text-muted dark:text-muted-dark">or</Text>
      <View className="h-px flex-1 bg-border dark:bg-border-dark" />
    </View>
  )
}
