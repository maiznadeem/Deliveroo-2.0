import React from 'react'
import { ArrowLeft } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import IconButton from '../ui/IconButton'
import { useAppTheme } from '../../hooks/useAppTheme'

export default function BackButton({ goBack }) {
  const insets = useSafeAreaInsets()
  const { colors } = useAppTheme()
  return (
    <IconButton
      accessibilityLabel="Go back"
      onPress={goBack}
      className="absolute left-2 z-10"
      style={{ top: insets.top + 8 }}
    >
      <ArrowLeft size={24} strokeWidth={2} color={colors.text} />
    </IconButton>
  )
}
